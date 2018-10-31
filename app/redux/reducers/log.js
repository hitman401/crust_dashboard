import Action from '../ActionType';
import { ConnectionResult, OS, NatType } from './../FilterTypes';
import { daysInMilliseconds } from '../utils';

const now = new Date().getTime();

const initialState = {
    isReady: false,
    isFetching: false,
    error: undefined,
    logs: [],
    filteredLogs: {
        logs: [],
        successfulConnections: [],
        failedConnections: [],
        osList: Object.values(OS),
        natTypes: Object.values(NatType),
        osCount: {},
        countriesCount: {},
        peerIds: []
    },
    paging: {
        done: 0,
        completed: false
    },
    filteredConnectionResults: [],
    connectionResultFilter: ConnectionResult.NONE,
    dateRange: {
        allTime: {
            from: now - daysInMilliseconds(30),
            to: now
        },
        custom: {
            from: now - daysInMilliseconds(30),
            to: now
        }
    }
};

// const filterByConnectionResult = (preparedLogs, filter) => {
//     (filter === ConnectionResult.NONE) ? preparedLogs.logs :
//         ((filter === ConnectionResult.SUCCESS) ? preparedLogs.successfulConnections : preparedLogs.failedConnections);
// };

const logReducer = (state = initialState, action) => {
    switch (action.type) {
        case Action.ERROR:
            state = {
                ...state,
                error: action.payload
            };
            break;
        case Action.UPDATE_PROGRESS:
            state = {
                ...state,
                paging: {
                    done: action.payload.done,
                    completed: false
                }
            };
            break;
        case `${Action.FETCH_LOGS}_PENDING`:
            state = {
                ...state,
                isFetching: true,
                paging: {
                    done: 0,
                    completed: false
                }
            };
            break;
        case `${Action.FETCH_LOGS}_FULFILLED`:
            const hasFailed = action.payload instanceof Error;
            if (hasFailed) {
                state = {
                    ...state,
                    isFetching: false,
                    error: action.payload,
                };
            } else {
                const preparedLogs = action.payload;
                const filteredLogs = {
                    logs: preparedLogs.logs,
                    successfulConnections: preparedLogs.successfulConnections,
                    failedConnections: preparedLogs.failedConnections,
                    osList: Object.values(OS),
                    natTypes: Object.values(NatType),
                    osCount: preparedLogs.osCount,
                    countriesCount: preparedLogs.countriesCount,
                    peerIds: preparedLogs.peerIds
                };
                state = {
                    ...initialState,
                    isReady: true,
                    isFetching: false,
                    error: undefined,
                    logs: preparedLogs.logs,
                    filteredLogs,
                    filteredConnectionResults: filteredLogs.logs,
                    dateRange: {
                        allTime: preparedLogs.dateRange,
                        custom: preparedLogs.dateRange
                    },
                    paging: {
                        done: action.payload.done,
                        completed: false
                    }
                };
            }
            break;
            case Action.PROGRESS_COMPLETED:
            state = {
                ...state,
                paging: {
                    done: state.paging.done,
                    completed: true
                }
            }
            break;
            // case Action.NEW_LOG:
            // const logs = state.logs.concat(action.payload);
            // let logsByRange = [];
            // if (state.connectionResultFilter === ConnectionResult.NONE) {
            //     logsByRange = action.payload;
            // } else {
            //     logsByRange = filterLogs(action.payload, state.dateRange.custom.from, state.dateRange.custom.to);
            // }
            // const logsFiltered = {
            //     ...state.filteredLogs,
            //     logs: state.logs.concat(logsByRange)
            // };
            // logsByRange.forEach(log => {
            //     (log.isSuccessful ? filteredLogs.successfulConnections : logsFiltered.failedConnections).push(log);
            //     if (!logsFiltered.osCount[log.peer_requester.os]) {
            //         logsFiltered.osCount[log.peer_requester.os] = 0;
            //     }
            //     if (!logsFiltered.osCount[log.peer_responder.os]) {
            //         logsFiltered.osCount[log.peer_responder.os] = 0;
            //     }
            //     if (!logsFiltered.countriesCount[log.peer_requester.geo_info.country_name]) {
            //         logsFiltered.countriesCount[log.peer_requester.geo_info.country_name] = 0;
            //     }
            //     if (!logsFiltered.countriesCount[log.peer_responder.geo_info.country_name]) {
            //         logsFiltered.countriesCount[log.peer_responder.geo_info.country_name] = 0;
            //     }
            //     logsFiltered.countriesCount[log.peer_requester.geo_info.country_name] = logsFiltered.countriesCount[log.peer_requester.geo_info.country_name] + 1;
            //     logsFiltered.countriesCount[log.peer_responder.geo_info.country_name] = logsFiltered.countriesCount[log.peer_responder.geo_info.country_name] + 1;
            // });
            // state = {
            //     ...state,
            //     logs,
            //     filteredLogs: logsFiltered,
            //     filteredConnectionResults: state.connectionResultFilter === ConnectionResult.NONE ? logsFiltered.logs :
            //         state.connectionResultFilter === ConnectionResult.SUCCESS ? logsFiltered.successfulConnections : logsFiltered.failedConnections
            // };
            // break;
        
        // case Action.FILTER_BY_RANGE:
        //     const logsByrange = action.payload.from === -1 ? state.logs : filterLogs(state.logs, action.payload.from, action.payload.to);
        //     const filteredLogs = {
        //         logs: logsByrange.logs,
        //         successfulConnections: logsByrange.successfulConnections,
        //         failedConnections: logsByrange.failedConnections,
        //         osList: Object.values(OS),
        //         natTypes: Object.values(NatType),
        //         osCount: logsByrange.osCountMap,
        //         countriesCount: logsByrange.countryCountMap
        //     };
        //     state = {
        //         ...state,
        //         dateRange: {
        //             ...state.dateRange,
        //             custom: { from: action.payload.from, to: action.payload.to }
        //         },
        //         filteredLogs: filteredLogs,
        //         filteredConnectionResults: filterByConnectionResult(filteredLogs, state.connectionResultFilter)
        //     };
        //     break;
        // case Action.FILTER_NONE:
        //     state = {
        //         ...state,
        //         connectionResultFilter: ConnectionResult.NONE,
        //         filteredConnectionResults: state.filteredLogs.logs
        //     };
        //     break;
        // case Action.FILTER_SUCCESS:
        //     state = {
        //         ...state,
        //         connectionResultFilter: ConnectionResult.SUCCESS,
        //         filteredConnectionResults: state.filteredLogs.successfulConnections
        //     };
        //     break;
        // case Action.FILTER_FAILURE:
        //     state = {
        //         ...state,
        //         connectionResultFilter: ConnectionResult.FAILURE,
        //         filteredConnectionResults: state.filteredLogs.failedConnections
        //     };
        //     break;
    }
    return state;
};

export default logReducer;
