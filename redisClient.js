const redis = require("redis");
const mongoose = require("mongoose");
const { promisify } = require("util"); // native — no bluebird needed

// ─── Guard: prevent double-init from overwriting prototype methods ───
let _initialized = false;
let _redisClient = null;

const init = (host, port, options = { time: 600 }) => {

    // If already initialized, return the existing client.
    // This prevents the vanilla-DB connection (redis:null → stubs) from
    // clobbering the real .cache()/.noCache() methods when index.js is
    // called a second time.
    if (_initialized && _redisClient) {
        return _redisClient;
    }

    const redisClient = redis.createClient({
        host, port,
        retry_strategy: () => 1000,
    });
    redisClient.verbose = false;

    // Backwards-compatible async getter (was bluebird-promisified before)
    redisClient.aget = promisify(redisClient.get).bind(redisClient);

    // ─── Safe Redis helpers — never throw, never crash the query pipeline ───
    const _asyncGet = promisify(redisClient.get).bind(redisClient);

    const safeGet = async (key) => {
        try { return await _asyncGet(key); }
        catch (err) {
            if (redisClient.verbose) console.warn("[Cache] GET error:", err.message);
            return null;
        }
    };

    const safeSet = (key, value, ttl) => {
        try {
            redisClient.set(key, value);
            if (ttl > 0) redisClient.expire(key, ttl);
        } catch (err) {
            if (redisClient.verbose) console.warn("[Cache] SET error:", err.message);
        }
    };

    const safeExpire = (key, ttl) => {
        try { redisClient.expire(key, ttl); }
        catch (err) {
            if (redisClient.verbose) console.warn("[Cache] EXPIRE error:", err.message);
        }
    };

    // ─── Mongoose Query prototype augmentation ───
    // .cache(ttl) — opt-in to read+write through Redis
    // .noCache()  — bypass cache and invalidate stale entry
    mongoose.Query.prototype.noCache = function () {
        this.ignoreCache = true;
        return this;
    };
    mongoose.Query.prototype.cache = function (time = 60) {
        this.ignoreCache = false;
        this.skipCache = false;
        this.cacheTime = time;
        return this;
    };

    // ─── Preserve the *true* originals only on first init ───
    // (prevents infinite recursion if init() were ever called again)
    if (!mongoose.Query.prototype.__origPopulate) {
        mongoose.Query.prototype.__origPopulate = mongoose.Query.prototype.populate;
    }
    if (!mongoose.Query.prototype.__origExec) {
        mongoose.Query.prototype.__origExec = mongoose.Query.prototype.exec;
    }
    const _origPopulate = mongoose.Query.prototype.__origPopulate;
    const _origExec     = mongoose.Query.prototype.__origExec;

    mongoose.Query.prototype.populate = function () {
        this.ignoreCache = true;
        this.skipCache = true;
        return _origPopulate.apply(this, arguments);
    };

    // ─── Write operations that must bypass + invalidate cache ───
    const WRITE_OPS = new Set([
        "update", "updateOne", "updateMany",
        "deleteOne", "deleteMany", "remove",
        "findOneAndUpdate", "findOneAndDelete", "findOneAndRemove",
        "replaceOne", "insertMany",
    ]);

    mongoose.Query.prototype.exec = async function () {

        // ── Build cache key ──
        let queryKey;
        try {
            const queryFilter = this.getFilter();
            const filterKeys  = Object.keys(queryFilter);
            const prefix = `${this.mongooseCollection.conn.name}.${this.mongooseCollection.name}`;

            // FIX: was `queryKey - ...` (subtraction) — now correctly assigns
            if (filterKeys.length === 1 && filterKeys[0] === 'id') {
                queryKey = `${prefix}.${this.op}.${queryFilter.id}`;
            } else {
                queryKey = `${prefix}.${this.op}.${JSON.stringify(queryFilter)}`;
            }
        } catch (_) {
            // Can't build key (e.g. aggregate) — run raw query
            return await _origExec.apply(this, arguments);
        }

        // ── Write operations: execute then best-effort invalidate related reads ──
        if (WRITE_OPS.has(this.op)) {
            const result = await _origExec.apply(this, arguments);
            try {
                const queryFilter = this.getFilter();
                if (queryFilter.id) {
                    const prefix = `${this.mongooseCollection.conn.name}.${this.mongooseCollection.name}`;
                    // Invalidate both key formats (stringified-id and bare-id)
                    safeExpire(`${prefix}.findOne.${queryFilter.id}`, 1);
                    safeExpire(`${prefix}.findOne.${JSON.stringify({ id: queryFilter.id })}`, 1);
                    safeExpire(`${prefix}.find.${JSON.stringify(queryFilter)}`, 1);
                }
            } catch (_) { /* invalidation is best-effort */ }
            return result;
        }

        // ── Explicit bypass via .noCache() ──
        if (this.ignoreCache === true) {
            if (this.skipCache !== true) {
                // .noCache() — also expire the stale cached entry
                safeExpire(queryKey, 1);
            }
            // .populate() sets skipCache=true so we don't wipe potentially
            // useful read-cache entries on populate-only queries.
            return await _origExec.apply(this, arguments);
        }

        // Effective TTL: honour .cache(time), fall back to init options, then 600s
        const ttl    = this.cacheTime || options.time || 600;
        const isLean = !!(this._mongooseOptions && this._mongooseOptions.lean);

        // ── Cache READ (only when .cache() was explicitly called) ──
        if (this.ignoreCache === false) {
            const cacheValue = await safeGet(queryKey);

            if (cacheValue !== null) {
                // Sentinel for cached null/empty results
                if (cacheValue === "__null__") {
                    if (redisClient.verbose) console.log("\x1b[32m•\x1b[0m", "Cache hit (null)", queryKey.slice(0, 60));
                    return null;
                }

                try {
                    const doc = JSON.parse(cacheValue);
                    if (redisClient.verbose) console.log("\x1b[32m•\x1b[0m", "Cache hit", queryKey.slice(0, 60));

                    // Respect .lean() — return plain JS, skip hydration
                    if (isLean) {
                        if (Array.isArray(doc)) {
                            doc._cache = true;
                        } else if (doc) {
                            doc._cache = true;
                        }
                        return doc;
                    }

                    // Hydrate into Mongoose documents
                    const hydrated = Array.isArray(doc)
                        ? doc.map(d => this.model.hydrate(d))
                        : this.model.hydrate(doc);

                    if (hydrated) hydrated._cache = true;
                    return hydrated;

                } catch (parseErr) {
                    // Corrupted entry — expire it and fall through to DB
                    if (redisClient.verbose) console.warn("[Cache] Parse error, invalidating:", queryKey.slice(0, 60));
                    safeExpire(queryKey, 1);
                }
            }
        }

        // ── DB query ──
        const result = await _origExec.apply(this, arguments);
        if (redisClient.verbose) console.log("\x1b[31m•\x1b[0m", "Uncached", queryKey.slice(0, 60));

        // ── Cache WRITE — always warm regardless of .cache()/.noCache() ──
        if (result === null || result === undefined) {
            // Cache null results with a short TTL to prevent repeated DB misses
            safeSet(queryKey, "__null__", Math.min(ttl, 30));
        } else {
            try {
                safeSet(queryKey, JSON.stringify(result), ttl);
            } catch (serErr) {
                if (redisClient.verbose) console.warn("[Cache] Serialize error:", serErr.message);
            }
        }

        return result;
    };

    _initialized = true;
    _redisClient = redisClient;

    // Backwards-compatible global assignment
    if (typeof PLX !== 'undefined') PLX.redis = redisClient;

    return redisClient;
}

// Allow index.js / consumers to check init state
init.isInitialized = () => _initialized;
init.getClient     = () => _redisClient;

module.exports = init;