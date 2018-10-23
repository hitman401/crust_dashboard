import Action from '../../ActionType';
import { Filter } from '../../FilterTypes';
import { applyFilter, prepareLogs } from '../../utils';

export const MOD_NAME = 'CON_ACT';

const initialState = {
    filteredLogs: [],
    isComputing: false,
    failedConnections: [],
    successfulConnections: [],
    tcpHpCount: 0,
    udpHpCount: 0,
    directCount: 0,
    filter: { ...Filter }
};

const activityReducer = (state = initialState, action) => {
    let filter;
    switch (action.type) {
        // case Action.NEW_LOG:
        // const logs = state.filteredLogs.concat(action.payload)
        // state = {
        //     ...state,
        //     filteredLogs: applyFilter(logs, state.filter)
        // };
        // break;
        case `${Action.REVALIDATE}_PENDING`:
            state = {
                ...state,
                isComputing: true,
                filteredLogs: []
            };
            break;
        case `${Action.REVALIDATE}_FULFILLED`:
        const preparedLogs = prepareLogs(action.payload);
            state = {
                ...state,
                isComputing: false,
                filteredLogs: preparedLogs.logs ,
                failedConnections: preparedLogs.failedConnections,
                successfulConnections: preparedLogs.successfulConnections,
                tcpHpCount: preparedLogs.tcpHpCount,
                udpHpCount: preparedLogs.udpHpCount,
                directCount: preparedLogs.directCount            
            };
            break;

        case `${MOD_NAME}_${Action.FILTER_NAT_TYPE1}`:
            filter = {
                ...state.filter,
                NatType1: action.payload
            };
            state = {
                ...state,
                filter,
                // filteredLogs: applyFilter(action.data, filter)
            };
            break;

        case `${MOD_NAME}_${Action.FILTER_NAT_TYPE2}`:
            filter = {
                ...state.filter,
                NatType2: action.payload
            };
            state = {
                ...state,
                filter,
                // filteredLogs: applyFilter(action.data, filter)
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_OS_TYPE1}`:
            filter = {
                ...state.filter,
                OSType1: action.payload
            };
            state = {
                ...state,
                filter,
                // filteredLogs: applyFilter(action.data, filter)
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_OS_TYPE2}`:
            filter = {
                ...state.filter,
                OSType2: action.payload
            };
            state = {
                ...state,
                filter,
                // filteredLogs: applyFilter(action.data, filter)
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_COUNTRY_TYPE1}`:
            filter = {
                ...state.filter,
                CountryType1: action.payload
            };
            state = {
                ...state,
                filter,
                // filteredLogs: applyFilter(action.data, filter)
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_COUNTRY_TYPE2}`:
            filter = {
                ...state.filter,
                CountryType2: action.payload
            };
            state = {
                ...state,
                filter,
                // filteredLogs: applyFilter(action.data, filter)
            };
            break;
        case `${MOD_NAME}_${Action.FILTER_BY_PROTOCOL}`:
            filter = {
                ...state.filter,
                Protocol: action.payload
            };
            state = {
                ...state,
                filter,
                // filteredLogs: applyFilter(action.data, filter)
            };
            break;
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
    }
    return state;
};

export default activityReducer;