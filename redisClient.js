const redis = require("redis");
const mongoose = require("mongoose");

const init = (host, port, options = {time:600}) => {

    const redisClient = redis.createClient({
        host,port,
        retry_strategy: () => 1000,
    });

    mongoose.Query.noCache = function () {
        this.noCache = true;
        return this;
    };

    const original_update = mongoose.Query.prototype.update;
    mongoose.Query.protorype.update = async function (...args){
        const queryKey = JSON.stringify({...this.getQuery()});
        redisClient.del(queryKey);
        return await original_update.apply(this, ...args);
    }   

    const original_exec = mongoose.Query.prototype.exec;
    mongoose.Query.prototype.exec = async function (...args) {

        if (this.noCache) {
            return await original_exec.apply(this, ...args);
        }
        const queryKey = JSON.stringify({...this.getQuery()});        
        const cacheValue = await client.get(queryKey);

        if (cacheValue) {
            const doc = JSON.parse(cacheValue);
            console.log("cache redis ok");

            return Array.isArray(doc) ?
                doc.map((d) => new this.model(d)) :
                new this.model(doc);
        }

        const result = await original_exec.apply(this, arguments);
        console.log("db res");
        redisClient.set(queryKey, JSON.stringify(result));
        redisClient.expire(queryKey, 6000);

        return result;
    };
    
    return redisClient;
}

module.exports = init;