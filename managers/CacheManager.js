class CacheManager {

    cache = {};

    constructor() {}

    GetCachedValue(sCacheKey) {
        var cachedObject = this.cache[sCacheKey];
        if(cachedObject) {
            var timeLeft = cachedObject.expireTime - new Date();
            //if we still have time before it expires, return the data
            if(timeLeft > 0) {
                return cachedObject.data;
            } else {
                this.RemoveFromCache(sCacheKey);
            }
        }
        return null;
    }

    AddToCache(sKey, oObject, nExpireInSeconds) {
        var expTime = (new Date() - new Date(0)) + (nExpireInSeconds * 1000);
        var cacheObject = {
            expireTime: expTime,
            data: oObject
        };
        this.cache[sKey] = cacheObject;
    }

    RemoveFromCache(sKey) {
        var oVal = this.cache[sKey];
        if(oVal) {
            delete this.cache[sKey];
        }
    }
}

module.exports = CacheManager;