import { Reducer } from 'redux';

import { SET_CONFIG, SetConfig } from '../actions';
import { State } from '../types';

// reducers ------------------------------------------------------------------

export default {
  config: <Reducer<State['config']>>((state, action: SetConfig) => {
    switch (action.type) {
      case SET_CONFIG:
        return action.config ? JSON.parse(JSON.stringify(action.config)) : null;
      default:
        return state || null;
    }
  })
};

// selectors -----------------------------------------------------------------

export function getConfig(state: State) {
  return state ? state.config : undefined;
}
