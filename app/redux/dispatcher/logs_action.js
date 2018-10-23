import Action from '../ActionType';
import PromiseWorker from 'promise-worker';
const worker = new Worker('./../worker.js');
const promiseWorker = new PromiseWorker(worker);

const PROGRESS_COMPLETED_TIMEOUT = 1000;

const fetchAllLogs = (dispatcher, from, limit, oldLogs) => {
    let result = [];
    const fetchData = (from, limit) => {
        return new Promise(async (resolve, reject) => {
            try {
                const dataFetched = await fetch(`http://localhost:8080/api/stats?pageNo=${from}&size=${limit}`);
                const jsonData = await dataFetched.json();
                result = result.concat(jsonData.logs);
                const donePercentage = Math.ceil(from / (jsonData.totalPages) * 100)
                if (from < jsonData.totalPages) {
                    return resolve(await fetchData(from + 1, limit));
                }
                result = oldLogs.concat(result);
                for (var i=0;i<5;i++) {
                    result = result.concat(result);
                }
                const logs = await promiseWorker.postMessage({type: 'PREPARE_LOGS', payload: result});
                dispatcher({
                    type: `${Action.FETCH_LOGS}_FULFILLED`,
                    payload: {
                        logs,
                        done: donePercentage
                    }
                });
                return resolve();
            } catch (err) {
                return reject(err);
            }
        });
    };
     return new Promise(async (resolve, reject) => {
        dispatcher({
            type: `${Action.FETCH_LOGS}_PENDING`
        });
        try {
            await fetchData(from, limit, oldLogs);
            const timeout = setTimeout(() => {
                dispatcher({
                    type: Action.PROGRESS_COMPLETED
                });
                clearTimeout(timeout);
            }, PROGRESS_COMPLETED_TIMEOUT);
            return resolve(result);
        } catch(e) {
            dispatcher({
                type: Action.ERROR,
                payload: 'Failed to get initial data from Server'
            });
            reject(e);
        }
    });
}

 export const fetchLogs = (from, limit) => {
    return (dispatcher,getState) => fetchAllLogs(dispatcher, from, limit, getState().logReducer.logs);
}

export const filterByConnectionResult = (action) => {
    return {
        type: action
    }
}

export const revalidate = (logs, filter) => {
    return {
        type: Action.REVALIDATE,
        payload: promiseWorker.postMessage({
            type: 'APPLY_FILTER',
            payload: {logs: logs, filter}
        })
    }
}

export const filterChange = (data, mod, action, value) => {
    return {
        type:  `${mod}_${action}`,
        payload: value,
        data: data
    }
}
