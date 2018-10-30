
const CACHE_KEY = ['default', 'force-cache'];

export default class CacheHandler {
    constructor(cacheName) {
        this.cacheName = cacheName;
        this._cache = undefined;
    }

    get cache() {
        return (async () => {
            if (!this._cache) {
                this._cache = await caches.open(this.cacheName)
            }
            return this._cache;
        })();
    }

    async clearOld() {
        const cacheNames = await caches.keys();
        cacheNames.forEach(async (cacheName) => {
            if (cacheName === this.cacheName) {
                return;
            }   
            await caches.delete(cacheName);
        });
    }

    /**
     * 
     * @param {*} uri 
     * @param {*} options 
     */
    fetch(uri, options = {cache: 'default'}) {
        return new Promise(async (resolve, reject) => {
            try {
                const request = new Request(uri, options);
                const loadFromCache = CACHE_KEY.indexOf(options.cache || 'default') > -1;
                let response;
                const cache = await this.cache;
                if (loadFromCache) {
                    response = await cache.match(request);
                }
                if (response) {
                    console.info('responding from cache for ', uri);
                    return resolve(response);
                }
                response = await window.fetch(uri, options);
                await cache.put(request.clone(), response.clone());
                resolve(response);
            } catch(e) {
                reject(e);
            } 
        });
    }
}
