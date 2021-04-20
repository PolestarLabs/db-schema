const redis = require("redis");
const mongoose = require("mongoose");
const { promisify } = require("bluebird");

const init = (host, port, options = {time:600}) => {

    const redisClient = redis.createClient({
        host,port,
        retry_strategy: () => 1000,
    });

    redisClient.aget =  promisify(redisClient.get);
    mongoose.Query.prototype.noCache = function () {
        this.ignoreCache = true;
        return this;
    };

  

    const original_exec = mongoose.Query.prototype.exec;
    mongoose.Query.prototype.exec = async function () {
        let queryFilter = this.getFilter();
        let filterKeys = Object.keys(queryFilter);
        
        let queryKey = `${this.mongooseCollection.name}.${this.op}.${JSON.stringify(queryFilter)}` 
        if ( filterKeys.length === 1 && filterKeys[0] === 'id' ){
            queryKey - `${this.mongooseCollection.name}.${this.op}.${queryFilter.id}`
        }

        if ( this.ignoreCache ||  ["update","updateOne","updateMany"].includes(this.op) ) {
            redisClient.expire(queryKey,1);
            return await original_exec.apply(this, arguments);
        }
        
        const cacheValue = await redisClient.aget(queryKey);

        if (cacheValue) {            
            const doc = JSON.parse(cacheValue);
            console.log("•".green, "Cache hit", queryKey.slice(0,50).gray );
            doc._cache = true;
            //return doc;
            return Array.isArray(doc) ?
                doc.map((d) => this.model(d)) :
                this.model(doc);
        }

        const result = await original_exec.apply(this, arguments);
        console.log("•".red,"Uncached", queryKey.slice(0,50).gray );
        let restring = JSON.stringify(result);

        this.ignoreCache = false;

        if(!result) return null;
        redisClient.set(queryKey, restring);
        redisClient.expire(queryKey, 60);
        return result;
    };
    
    PLX.redis=redisClient;
    return redisClient;
}

module.exports = init;