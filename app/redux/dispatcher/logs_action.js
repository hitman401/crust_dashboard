import Action from '../ActionType';
import PromiseWorker from 'promise-worker';

import CacheHandler from './CacheHandler';

const worker = new Worker('./worker.js');
const promiseWorker = new PromiseWorker(worker);

let cacheName;
let cache;

const fetchAllLogs = async (dispatcher, from, limit, oldLogs=[], filter) => {
    let result = [];
    if (!cache) {
        const response = await fetch('/cacheConfig', {cache: 'no-cache'});
        const cacheConfig = await response.json();
        cache = new CacheHandler(cacheConfig.name);
        cache.clearOld();
        cacheName = cacheConfig.name;
    }
    const cachedTotal = window.localStorage.getItem(cacheName) || 0;
    const fetchData = (from, limit, oldLogs, total=0) => {
        return new Promise(async (resolve, reject) => {
            try {
                const fromNetwork = (from !== 0 && !total) || 
                    ((total - result.length) < limit) || (total === result.length);
                const dataFetched = await cache.fetch(`/api/stats?offset=${from}&size=${limit}`, {
                    cache: fromNetwork ? 'reload' : 'default'
                });
                const jsonData = await dataFetched.json();
                const fetchedLogs = jsonData.logs;
                result = fetchedLogs.reverse().concat(result);
                const fetchedLength = result.length + oldLogs.logs.length;
                const maxSize = (cachedTotal > jsonData.total ? cachedTotal : jsonData.total);
                const donePercentage = Math.ceil((fetchedLength / maxSize) * 100);
                dispatcher({
                    type: Action.UPDATE_PROGRESS,
                    payload: {
                        done: donePercentage
                    }
                });
                if (fetchedLength !== maxSize) {
                    return resolve(await fetchData(fetchedLength, limit, oldLogs, maxSize));
                }
                if (result.length === 0) {
                    return resolve(oldLogs)
                } else {
                    result = result.concat(oldLogs.logs);
                    window.localStorage.setItem(cacheName, result.length);
                    const preparedLogs = await promiseWorker.postMessage({
                        type: 'PREPARE_LOGS',
                        payload: {
                            logs: result,
                            filter: filter
                        }                    
                    });
                    return resolve(preparedLogs);
                }
            } catch (err) {
                return reject(err);
            }
        });
    };

    return new Promise(async (resolve, reject) => {
        try {
            const logs = await fetchData(from, limit, oldLogs);
            dispatcher({
                type: Action.PROGRESS_COMPLETED
            });
            return resolve(logs);
        } catch (e) {
            dispatcher({
                type: Action.ERROR,
                payload: 'Failed to get initial data from Server'
            });
            reject(e);
        }
    });
}

export const fetchLogs = (from, limit) => {
    return (dispatcher, getState) => {
        dispatcher({
            type: Action.FETCH_LOGS,
            payload: fetchAllLogs(dispatcher, from, limit, getState().logReducer.filteredLogs, 
                getState().connectionAttemptActivity.filter)
        });
    }
}

export const filterPieChart = (mod, action, logs, filter = {tcpHp: true, udpHp: true, direct: true}) => {
    return {
        type: `${mod}_${action}`,
        payload: promiseWorker.postMessage({
            type: 'FILTER_PIE_CHART',
            payload: {
                logs,
                filter
            }
        })
    }
}

export const revalidate = (logs, filter) => {
    return {
        type: Action.REVALIDATE,
        payload: promiseWorker.postMessage({
            type: Action.REVALIDATE,
            payload: {
                filter,
                logs
            }
        })
    }
}

export const filterChange = (mod, action, value) => {
    return {
        type: `${mod}_${action}`,
        payload: value
    }
}

// export const filterByConnectionResult = (action) => {
//     return {
//         type: action
//     }
// }
