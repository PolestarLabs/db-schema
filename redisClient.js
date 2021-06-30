const redis = require("redis");
const mongoose = require("mongoose");
const { promisify } = require("bluebird");

const init = (host, port, options = {time:600}) => {

    const redisClient = redis.createClient({
        host,port,
        retry_strategy: () => 1000,
    });
    redisClient.verbose = false;

    redisClient.aget =  promisify(redisClient.get);
    mongoose.Query.prototype.noCache = function () {
        this.ignoreCache = true;
        return this;
    };
    mongoose.Query.prototype.cache = function (time=60) {
        this.ignoreCache = false;
        this.skipCache = false;
        this.cacheTime = time;
        return this;
    };

    const original_populate = mongoose.Query.prototype.populate;
    mongoose.Query.prototype.populate = function () {
        this.ignoreCache = true;
        this.skipCache = true;
        return original_populate.apply(this, arguments);
    };
    
    const original_exec = mongoose.Query.prototype.exec;
    mongoose.Query.prototype.exec = async function () {
        let queryFilter = this.getFilter();
        let filterKeys = Object.keys(queryFilter);
        
        let queryKey = `${this.mongooseCollection.db.name}.${this.mongooseCollection.name}.${this.op}.${JSON.stringify(queryFilter)}` 
        if ( filterKeys.length === 1 && filterKeys[0] === 'id' ){
            queryKey - `${this.mongooseCollection.db.name}.${this.mongooseCollection.name}.${this.op}.${queryFilter.id}`
        }

        if ( this.ignoreCache === true ||  ["update","updateOne","updateMany"].includes(this.op) ) {
            if (this.skipCache === false) redisClient.expire(queryKey,1);
            return await original_exec.apply(this, arguments);
        }
        
        const cacheValue = await redisClient.aget(queryKey);

        if (this.ignoreCache === false && cacheValue) {            
            const doc = JSON.parse(cacheValue);
            if (redisClient.verbose) console.log("•".green, "Cache hit", queryKey.slice(0,50).gray );
            doc._cache = true;
            let mod = this;
            return Array.isArray(doc) ? doc.map(d=> mod.model.hydrate(d) ) : this.model.hydrate(doc);
        }

        const result = await original_exec.apply(this, arguments);
        if (redisClient.verbose) console.log("•".red,"Uncached", queryKey.slice(0,50).gray );
        let restring = JSON.stringify(result);

        this.ignoreCache = false;

        if(!result) return null;
        redisClient.set(queryKey, restring);
        redisClient.expire(queryKey, 60 * 60 * 1);
        return result;
    };

    PLX.redis=redisClient;
    return redisClient;
}

module.exports = init;