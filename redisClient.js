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
        const queryKey = this.mongooseCollection.name + JSON.stringify( {...this.getQuery()}   );
        console.log((this.op+"----------------").blue + queryKey.slice(0,50).gray )

        if ( this.ignoreCache ||  ["update","updateOne","updateMany"].includes(this.op) ) {
            redisClient.expire(queryKey,1);
            return await original_exec.apply(this, arguments);
        }
        
        const cacheValue = await redisClient.aget(queryKey);

        if (cacheValue) {
            
            const doc = JSON.parse(cacheValue);
            console.log("cache redis ok".green);
            return doc;
            return Array.isArray(doc) ?
                doc.map((d) => this.model(d)) :
                this.model(doc);
        }

        const result = await original_exec.apply(this, arguments);
        console.log("db res".red, queryKey.slice(0,50));
        let restring = JSON.stringify(result);
        console.log(restring?.length)
        if(!result) return result;
        redisClient.set(queryKey, restring);
        redisClient.expire(queryKey, 60 * 2);   
        this.ignoreCache = false;
        return result;
    };
    PLX.redis=redisClient;
    return redisClient;
}

module.exports = init;