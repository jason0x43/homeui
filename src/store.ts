import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { routerReducer, routerMiddleware } from 'react-router-redux';

import history from './history';
import { State } from './types';
import reducers from './reducers';

export default createStore<State>(
  combineReducers({
    ...reducers,
    router: routerReducer
  }),
  applyMiddleware(thunk, routerMiddleware(history))
);
