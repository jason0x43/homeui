import { StoreThunk } from './types';
import { Config, DevicePayload, Event } from '../types';
import { getDevices, getDeviceState, getDeviceStates } from '../reducers';
import { setConfig } from './config';
import { updateDeviceState } from './devices';

export * from './config';
export * from './devices';
export * from './error';

export function setLastUpdateTime(time: number) {
  return {
    type: SET_LAST_UPDATE_TIME as typeof SET_LAST_UPDATE_TIME,
    payload: { time }
  };
}
export const SET_LAST_UPDATE_TIME = 'SET_LAST_UPDATE_TIME';
export type SetLastUpdateTime = ReturnType<typeof setLastUpdateTime>;

export function setScrollPosition(componentName: string, position: number) {
  return {
    type: SET_SCROLL_POSITION as typeof SET_SCROLL_POSITION,
    payload: { componentName, position }
  };
}
export const SET_SCROLL_POSITION = 'SET_SCROLL_POSITION';
export type SetScrollPosition = ReturnType<typeof setScrollPosition>;

export function handleEvent(event: Event): StoreThunk {
  return (dispatch, getState) => {
    if (isDeviceEvent(event)) {
      const state = getState();
      if (getDevices(state) && getDeviceStates(state)) {
        const { deviceId, attribute, value } = event.payload;
        const currentState = getDeviceState(state, deviceId);
        const realValue = isNaN(Number(value)) ? value : Number(value);

        if (currentState) {
          // Construct the new state by copying the old state and updating the
          // changed attribute in any affected capabilities.
          const newState = {
            ...currentState,
            [attribute]: realValue
          };

          dispatch(updateDeviceState(newState));
        } else {
          dispatch(updateDeviceState({ id: deviceId, [attribute]: realValue }));
        }
      }
    } else if (isConfigEvent(event)) {
      dispatch(setConfig(event.payload));
    }
  };
}

function isDeviceEvent(value: Event): value is Event<DevicePayload> {
  return value.type === 'device';
}

function isConfigEvent(value: Event): value is Event<Config> {
  return value.type === 'config';
}
