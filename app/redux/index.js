// import logger from 'redux-logger';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { createStore, combineReducers, applyMiddleware } from 'redux';

import logReducer from './reducers/log';
import connectionAttemptActivity from './reducers/ConnectionAttempt/activity';
// import connectionAttemptCountry from './reducers/ConnectionAttempt/country';
// import connectionAttemptOS from './reducers/ConnectionAttempt/os';

const store = createStore(combineReducers({
    logReducer,
    connectionAttemptActivity,
    // connectionAttemptCountry,
    // connectionAttemptOS
}), applyMiddleware(thunk, promiseMiddleware()));

// window.store = store;

export default store;
