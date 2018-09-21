import { OpPatch } from 'json-patch';
import * as uuid from 'uuid/v4';

import { Config, Room } from '../types';
import { StoreThunk } from './types';
import { setError } from './error';
import { fetchConfig, patchConfig } from '../hub';
import { getConfig } from '../reducers';

export function setConfig(config: Config) {
  return {
    type: SET_CONFIG as typeof SET_CONFIG,
    config
  };
}
export const SET_CONFIG = 'SET_CONFIG';
export type SetConfig = ReturnType<typeof setConfig>;

// thunks --------------------------------------------------------------------

export function loadConfig(): StoreThunk<Promise<boolean>> {
  return async dispatch => {
    try {
      const config = await fetchConfig();
      dispatch(setConfig(config));
      return true;
    } catch (error) {
      dispatch(setError(error));
      return false;
    }
  };
}

export function updateConfig(patch: OpPatch): StoreThunk<Promise<boolean>> {
  return async dispatch => {
    try {
      const config = await patchConfig(patch);
      dispatch(setConfig(config));
      return true;
    } catch (error) {
      dispatch(setError(error));
      return false;
    }
  };
}

export function updateDeviceType(
  deviceId: string,
  type: string
): StoreThunk<Promise<boolean>> {
  return async (dispatch, getState) => {
    try {
      const config = getConfig(getState());
      let newConfig: Config;
      if (config && !config.devices[deviceId]) {
        newConfig = await patchConfig({
          op: 'add',
          path: `/devices/${deviceId}`,
          value: { type, id: deviceId }
        });
      } else {
        newConfig = await patchConfig({
          op: 'replace',
          path: `/devices/${deviceId}/type`,
          value: type
        });
      }

      dispatch(setConfig(newConfig));
      return true;
    } catch (error) {
      dispatch(setError(error));
      return false;
    }
  };
}

export function updateRoom(room: Room): StoreThunk<Promise<boolean>> {
  return dispatch => {
    return patchConfig({
      op: 'replace',
      path: `/rooms/${room.id}`,
      value: room
    })
      .then(config => {
        dispatch(setConfig(config));
        return true;
      })
      .catch(error => {
        dispatch(setError(error));
        return false;
      });
  };
}

export function addRoom(): StoreThunk<Promise<string>> {
  const newRoomId = uuid();
  return dispatch => {
    return patchConfig({
      op: 'add',
      path: `/rooms/${newRoomId}`,
      value: { id: newRoomId, name: 'New Room', deviceIds: [] }
    })
      .then(config => {
        dispatch(setConfig(config));
        return newRoomId;
      })
      .catch(error => {
        dispatch(setError(error));
        return '';
      });
  };
}

export function deleteRoom(roomId: string): StoreThunk<Promise<boolean>> {
  return dispatch => {
    return patchConfig({
      op: 'remove',
      path: `/rooms/${roomId}`
    })
      .then(config => {
        dispatch(setConfig(config));
        return true;
      })
      .catch(error => {
        dispatch(setError(error));
        return false;
      });
  };
}
