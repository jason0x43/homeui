import { StoreThunk } from './types';
import { setError } from './error';
import { fetchDevices, runCommand } from '../hub';
import { Command, Device, DeviceFilter, DeviceState } from '../types';

export function addDevice(device: Device) {
  return {
    type: ADD_DEVICE as typeof ADD_DEVICE,
    payload: { device }
  };
}
export const ADD_DEVICE = 'ADD_DEVICE';
export type AddDevice = ReturnType<typeof addDevice>;

export const setDevices = (devices: Device[]) => ({
  type: SET_DEVICES as typeof SET_DEVICES,
  payload: { devices }
});
export const SET_DEVICES = 'SET_DEVICES';
export type SetDevices = ReturnType<typeof setDevices>;

export function setDeviceFilter(filter: DeviceFilter[]) {
  return {
    type: SET_DEVICE_FILTER as typeof SET_DEVICE_FILTER,
    payload: { filter }
  };
}
export type SetFilter = ReturnType<typeof setDeviceFilter>;
export const SET_DEVICE_FILTER = 'SET_DEVICE_FILTER';

export function setDeviceStates(states: DeviceState[]) {
  return {
    type: SET_DEVICE_STATES as typeof SET_DEVICE_STATES,
    payload: { states }
  };
}
export type SetStates = ReturnType<typeof setDeviceStates>;
export const SET_DEVICE_STATES = 'SET_DEVICE_STATES';

export function setDeviceState(state: DeviceState) {
  return {
    type: SET_DEVICE_STATE as typeof SET_DEVICE_STATE,
    payload: { state }
  };
}
export type SetState = ReturnType<typeof setDeviceState>;
export const SET_DEVICE_STATE = 'SET_DEVICE_STATE';

export function updateDeviceState(state: DeviceState) {
  return {
    type: UPDATE_DEVICE_STATE as typeof UPDATE_DEVICE_STATE,
    payload: { state }
  };
}
export const UPDATE_DEVICE_STATE = 'UPDATE_DEVICE_STATE';
export type UpdateState = ReturnType<typeof updateDeviceState>;

// ------------------------------------------------------------------

export function loadDevices(): StoreThunk<Promise<boolean>> {
  return async dispatch => {
    try {
      const devices = await fetchDevices();
      dispatch(setDevices(devices.map(item => item.device)));
      dispatch(setDeviceStates(devices.map(item => item.state)));
      return true;
    } catch (error) {
      dispatch(setError(error));
      dispatch(setDevices([]));
      return false;
    }
  };
}

export function sendCommand(
  deviceIds: string | string[],
  command: Command
): StoreThunk<Promise<boolean>> {
  return async (dispatch, getState) => {
    try {
      if (Array.isArray(deviceIds)) {
        await Promise.all(
          deviceIds.map(id => runCommand(id, command.name, command.args))
        );
      } else {
        await runCommand(deviceIds, command.name, command.args);
      }
      return true;
    } catch (error) {
      dispatch(setError(error));
      return false;
    }
  };
}
