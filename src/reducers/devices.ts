import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { Reducer } from 'redux';
import { LOCATION_CHANGE, LocationChangeAction } from 'react-router-redux';
import { parse } from 'query-string';

import {
  ADD_DEVICE,
  AddDevice,
  SET_DEVICES,
  SetDevices,
  SET_DEVICE_FILTER,
  SetFilter,
  SET_DEVICE_STATES,
  SetStates,
  SET_DEVICE_STATE,
  SetState,
  UPDATE_DEVICE_STATE,
  UpdateState
} from '../actions';
import { getDeviceType as hubGetDeviceType } from '../hub';
import { Device, DeviceFilter, State } from '../types';
import { getConfig } from './config';

// reducers ------------------------------------------------------------------

export default {
  devices: <Reducer<State['devices']>>((
    state,
    action: SetDevices | AddDevice
  ) => {
    switch (action.type) {
      case ADD_DEVICE:
        const { device } = action.payload;
        return {
          ...state,
          [device.id]: device
        };
      case SET_DEVICES:
        return action.payload.devices.reduce(
          (devices, dev) => ({ ...devices, [dev.id]: dev }),
          {}
        );
      default:
        return state || null;
    }
  }),

  deviceFilter: <Reducer<State['deviceFilter']>>((
    state,
    action: SetFilter | LocationChangeAction
  ) => {
    switch (action.type) {
      case SET_DEVICE_FILTER:
        return action.payload.filter;

      case LOCATION_CHANGE:
        // Extract filters from the current path
        const { pathname, search } = action.payload;
        let filter: DeviceFilter | undefined;

        const pathDeviceFilter = /\/device\/([^/]+)/.exec(pathname);
        if (pathDeviceFilter) {
          filter = {
            ...filter,
            device: pathDeviceFilter[1]
          };
        }

        const pathRoomFilter = /\/room\/([^/]+)/.exec(pathname);
        if (pathRoomFilter) {
          filter = {
            ...filter,
            room: pathRoomFilter[1]
          };
        }

        const pathAttrFilter = /\/attribute\/([^/]+)/.exec(pathname);
        if (pathAttrFilter) {
          filter = {
            ...filter,
            attribute: pathAttrFilter[1]
          };
        }

        if (search) {
          const params = parse(search);
          if (params.room) {
            filter = { ...filter, room: params.room };
          }
          if (params.attribute) {
            filter = { ...filter, attribute: params.attribute };
          }
        }

        return filter || null;
      default:
        return state || null;
    }
  }),

  deviceStates: <Reducer<State['deviceStates']>>((
    state,
    action: SetStates | SetState | UpdateState
  ) => {
    switch (action.type) {
      case SET_DEVICE_STATES:
        return action.payload.states.reduce(
          (allStates, st) => ({
            ...allStates,
            [st.id]: st
          }),
          {}
        );
      case SET_DEVICE_STATE:
        return { ...state, [action.payload.state.id]: action.payload.state };
      case UPDATE_DEVICE_STATE:
        return {
          ...state,
          [action.payload.state.id]: {
            ...(state ? state[action.payload.state.id] : undefined),
            ...action.payload.state
          }
        };
      default:
        return state || null;
    }
  })
};

// selectors -----------------------------------------------------------------

/**
 * Get all devices
 */
export function getAllDevices(state: State) {
  return state.devices;
}

/**
 * Get all device states
 */
export function getAllDeviceStates(state: State) {
  return state.deviceStates;
}

/**
 * Get devices matching the current filter
 */
export const getDevices = createSelector(
  getAllDevices,
  getDeviceFilter,
  getConfig,
  (devices, filter, config) => {
    if (!devices) {
      return undefined;
    }

    // filter functions will return true if a device should be filtered
    // (excluded)
    const filterFuncs: ((dev: Device) => boolean)[] = [];
    if (filter) {
      if (filter.room) {
        const ids = config!.rooms[filter.room].deviceIds || [];
        filterFuncs.push(dev => ids.indexOf(dev.id) === -1);
      }

      if (filter.attribute) {
        const attr = filter.attribute;
        filterFuncs.push(dev => dev.attributes[attr] == null);
      }

      if (filter.device) {
        const id = filter.device;
        filterFuncs.push(dev => dev.id !== id);
      }
    }

    const filteredDevices = Object.keys(devices)
      .filter(id => {
        const dev = devices[id];
        return !filterFuncs.some(func => func(dev));
      })
      .reduce(
        (devs, id) => ({ ...devs, [id]: devices[id] }),
        {} as State['devices']
      );

    return filteredDevices;
  }
);

/**
 * Get a specific device
 */
export const getDevice = createCachedSelector(
  // selectors
  getDevices,

  // argument selector
  (_state: State, deviceId: string) => deviceId,

  // selector computation
  (devices, deviceId) => {
    return devices ? devices[deviceId] : undefined;
  }
)(
  // cache key generator
  (_state, deviceId) => deviceId
);

/**
 * Return the current device filter
 */
export function getDeviceFilter(state: State) {
  return state.deviceFilter;
}

/**
 * Get a list of all device IDs
 */
export const getDeviceIds = createSelector(
  getDevices,
  devices => (devices ? Object.keys(devices) : undefined)
);

/**
 * Get states for all devices matching the current filter
 */
export const getDeviceStates = createSelector(
  getAllDeviceStates,
  getDevices,
  (states, devices) => {
    if (!states || !devices) {
      return undefined;
    }

    return Object.keys(devices).reduce(
      (fs, id) => ({
        ...fs,
        [id]: states[id]
      }),
      {}
    );
  }
);

/**
 * Get the state of a specific device
 */
export const getDeviceState = createCachedSelector(
  getAllDeviceStates,

  (_state: State, deviceId: string) => deviceId,

  (states, deviceId) => (states ? states[deviceId] : undefined)
)((_state, deviceId) => deviceId);

/**
 * Get the type of a specific device
 */
export const getDeviceType = createCachedSelector(
  getAllDevices,
  getConfig,

  (_state: State, deviceId: string) => deviceId,

  (devices, config, deviceId) => {
    if (!devices) {
      return;
    }

    const device = devices[deviceId];
    const type = device ? hubGetDeviceType(device) : undefined;
    let configType: string | undefined;

    if (config) {
      configType =
        config.devices && config.devices[deviceId]
          ? config.devices[deviceId].type
          : undefined;
    }

    return configType || type;
  }
)((_state, deviceId) => deviceId);
