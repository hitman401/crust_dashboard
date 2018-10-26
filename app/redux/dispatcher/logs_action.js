import Action from '../ActionType';
import PromiseWorker from 'promise-worker';

const worker = new Worker('./worker.js');
const promiseWorker = new PromiseWorker(worker);

const PROGRESS_COMPLETED_TIMEOUT = 1000;

const fetchAllLogs = (dispatcher, from, limit, oldLogs=[]) => {
    let result = [];
    const fetchData = (from, limit, oldLogs) => {
        return new Promise(async (resolve, reject) => {
            try {
                const dataFetched = await fetch(`/api/stats?offset=${from}&size=${limit}`);
                const jsonData = await dataFetched.json();
                const fetchedLogs = jsonData.logs;
                result = fetchedLogs.reverse().concat(result);
                const fetchedLength = result.length + oldLogs.length;
                const donePercentage = Math.ceil(fetchedLength / (jsonData.total) * 100);
                dispatcher({
                    type: Action.UPDATE_PROGRESS,
                    payload: {
                        done: donePercentage
                    }
                });
                if (fetchedLength !== jsonData.total) {
                    return resolve(await fetchData(fetchedLength, limit, oldLogs));
                }
                result = result.concat(oldLogs)
                const preparedLogs = await promiseWorker.postMessage({
                    type: 'PREPARE_LOGS',
                    payload: result
                });
                return resolve(preparedLogs);
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
            return resolve({logs});
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
            payload: fetchAllLogs(dispatcher, from, limit, getState().logReducer.logs)
        })
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
