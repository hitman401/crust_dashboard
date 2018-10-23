import logger from 'redux-logger';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { createStore, combineReducers, applyMiddleware } from 'redux';

import logReducer from './reducers/log';
import connectionAttemptActivity from './reducers/ConnectionAttempt/activity';
// import connectionAttemptCountry from './reducers/ConnectionAttempt/country';
// import connectionAttemptOS from './reducers/ConnectionAttempt/os';

import DataSet from "@antv/data-set";

const store = createStore(combineReducers({
    logReducer,
    connectionAttemptActivity,
    // connectionAttemptCountry,
    // connectionAttemptOS
}), applyMiddleware(logger, thunk, promiseMiddleware()));

window.store = store;
window.DataSet = DataSet;
export default store;
