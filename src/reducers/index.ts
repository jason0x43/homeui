import { Reducer } from 'redux';
import createCachedSelector from 're-reselect';

import {
  SET_ERROR,
  SetError,
  SET_LAST_UPDATE_TIME,
  SetLastUpdateTime,
  SET_SCROLL_POSITION,
  SetScrollPosition
} from '../actions';
import { State } from '../types';
import config from './config';
import devices from './devices';

export * from './config';
export * from './devices';

export default {
  ...config,
  ...devices,

  error: <Reducer<State['error']>>((state, action: SetError) => {
    switch (action.type) {
      case SET_ERROR:
        return action.error || null;
      default:
        return state || null;
    }
  }),

  lastUpdateTime: <Reducer<State['lastUpdate']>>((
    state,
    action: SetLastUpdateTime
  ) => {
    switch (action.type) {
      case SET_LAST_UPDATE_TIME:
        return action.payload.time || null;
      default:
        return state || null;
    }
  }),

  scrollPositions: <Reducer<State['scrollPositions']>>((
    state,
    action: SetScrollPosition
  ) => {
    switch (action.type) {
      case SET_SCROLL_POSITION:
        return {
          ...state,
          [action.payload.componentName]: action.payload.position
        };
      default:
        return state || null;
    }
  })
};

// selectors -----------------------------------------------------------------

export function getError(state: State) {
  return state.error;
}

export function getLastUpdateTime(state: State) {
  return state.lastUpdate;
}

export function getScrollPositions(state: State) {
  return state.scrollPositions;
}

export const getScrollPosition = createCachedSelector(
  getScrollPositions,

  // argument selector
  (_state: State, componentName: string) => componentName,

  // selector computation
  (scrollPositions, componentName) => {
    return scrollPositions ? scrollPositions[componentName] : undefined;
  }
)((_state, componentName) => componentName);
