import Action from '../../ActionType';
import { Filter } from '../../FilterTypes';

export const MOD_NAME = 'CON_ACT';

const initialState = {
    filteredLogs: [],
    isComputing: true,
    successfulConnections: [],
    failedConnections: [],
    tcpHpCount: 0,
    directCount: 0,
    pieChart: {
        total: 0,
        success: 0,
        isComputing: false
    },
    filter: { ...Filter },
};

const activityReducer = (state = initialState, action) => {
    let filter;
    switch (action.type) {
        case `${Action.FETCH_LOGS}_PENDING`:
            state = {
                ...state,
                isComputing: true,
                filteredLogs: [],
                pieChart: {
                    total: 0,
                    success: 0,
                    isComputing: true
                }
            };
            break;
        
        case `${Action.REVALIDATE}_FULFILLED`:
        case `${Action.FETCH_LOGS}_FULFILLED`:
            console.log(action.payload);
            const activityTab = action.payload.activityTab;
            state = {
                ...state,
                isComputing: false,
                filteredLogs: activityTab.logs,
                tcpHpCount: activityTab.tcpHpCount,
                udpHpCount: activityTab.udpHpCount,
                directCount: activityTab.directCount,
                successfulConnections: activityTab.successfulConnections,
                failedConnections: activityTab.failedConnections,
                pieChart: {
                    total: activityTab.logs.length,
                    success: activityTab.pieChartSuccessCount,
                    isComputing: false
                }
            };
            break;
        case `${Action.REVALIDATE}_PENDING`:
            state = {
                ...state,
                isComputing: true,
                filteredLogs: [],
                pieChart: {
                    total: 0,
                    success: 0,
                    isComputing: true
                }
            };
            break;
        // case `${Action.REVALIDATE}_FULFILLED`:
        //     state = {
        //         ...state,
        //         isComputing: false,
        //         filteredLogs: action.payload.logs,
        //         tcpHpCount: action.payload.tcpHpCount,
        //         udpHpCount: action.payload.udpHpCount,
        //         directCount: action.payload.directCount,
        //         successfulConnections: action.payload.successfulConnections,
        //         failedConnections: action.payload.failedConnections,
        //         pieChart: {
        //             total: action.payload.logs.length,
        //             success: action.payload.successfulConnections.length,
        //             isComputing: false
        //         }
        //     };
        //     break;

        case `${MOD_NAME}_${Action.FILTER_NAT_TYPE1}`:
            filter = {
                ...state.filter,
                NatType1: action.payload
            };
            state = {
                ...state,
                filter
            };
            break;

        case `${MOD_NAME}_${Action.FILTER_NAT_TYPE2}`:
            filter = {
                ...state.filter,
                NatType2: action.payload
            };
            state = {
                ...state,
                filter
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_OS_TYPE1}`:
            filter = {
                ...state.filter,
                OSType1: action.payload
            };
            state = {
                ...state,
                filter
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_OS_TYPE2}`:
            filter = {
                ...state.filter,
                OSType2: action.payload
            };
            state = {
                ...state,
                filter
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_COUNTRY_TYPE1}`:
            filter = {
                ...state.filter,
                CountryType1: action.payload
            };
            state = {
                ...state,
                filter
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_COUNTRY_TYPE2}`:
            filter = {
                ...state.filter,
                CountryType2: action.payload
            };
            state = {
                ...state,
                filter
            };
            break;
        // case `${MOD_NAME}_${Action.FILTER_BY_PROTOCOL}`:
        //     filter = {
        //         ...state.filter,
        //         Protocol: action.payload
        //     };
        //     state = {
        //         ...state,
        //         filter
        //     };
        //     break;
        case `${MOD_NAME}_${Action.FILTER_INCLUDE_PEER_ID}`:
            filter = {
                ...state.filter,
                IncludePeerId: action.payload
            };
            state = {
                ...state,
                filter,
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_EXCLUDE_PEER_ID}`:
            filter = {
                ...state.filter,
                ExcludePeerId: action.payload
            };
            state = {
                ...state,
                filter,
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_BY_PROTOCOL}_PENDING`:
            filter = {
                ...state.filter,
                Protocol: action.payload
            };
            state = {
                ...state,
                pieChart: {
                    ...state.pieChart,
                    isComputing: true
                }
            };
            break;
            case `${MOD_NAME}_${Action.FILTER_BY_PROTOCOL}_FULFILLED`:
            state = {
                ...state,
                pieChart: {
                    ...action.payload.data,
                    isComputing: false
                },
                filter: {
                    ...state.filter,
                    Protocol: action.payload.filter
                }
            }
            break;
    }
    return state;
};

export default activityReducer;
