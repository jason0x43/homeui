import { OpPatch } from 'json-patch';

import { Device, DevicePayload, EventHandler } from '../../types';
import { deepEqual } from '../../util';
import { connect } from '../../socket';

const port = process.env.REACT_APP_HOMEUI_PORT;
const host = `${location.hostname}:${port}`;
const hubitatHost = process.env.REACT_APP_HUBITAT_HOST;

export async function fetchDevices() {
  const response = await fetch(`http://${host}/device/list`);
  const data = <DeviceResponse[]>await response.json();

  // Filter out items with id 0 to remove Modes and Dashboard entries
  const devices = data.filter(item => item.id > 0).map(item => {
    const id = String(item.id);
    const attrs = item.attr.reduce(
      (allAttrs, attrInfo) => {
        let name!: string;
        let value!: string | number;
        let unit: string | undefined;
        let type!: string;
        Object.keys(attrInfo).forEach(key => {
          if (key === 'unit') {
            unit = attrInfo[key] === 'null' ? undefined : attrInfo[key];
          } else {
            name = key;
            type = isNaN(Number(attrInfo[key])) ? 'string' : 'number';
            value = type === 'number' ? Number(attrInfo[key]) : attrInfo[key];
          }
        });
        return {
          ...allAttrs,
          [name]: {
            type,
            unit,
            value
          }
        };
      },
      <{
        [name: string]: { type: string; unit?: string; value: string | number };
      }>{}
    );

    const attributes = Object.keys(attrs).reduce(
      (allAttrs, name) => ({
        ...allAttrs,
        [name]: {
          type: attrs[name].type,
          unit: attrs[name].unit
        }
      }),
      {}
    );

    return {
      device: {
        id,
        link: `http://${hubitatHost}/device/edit/${id}`,
        label: item.label,
        type: item.template,
        attributes,
        commands: getCommands(attributes)
      },
      state: {
        id: String(item.id),
        ...Object.keys(attrs).reduce(
          (allAttrs, name) => ({
            ...allAttrs,
            [name]: attrs[name].value
          }),
          {}
        )
      }
    };
  });

  return devices;
}

export async function fetchConfig() {
  const response = await fetch(`http://${host}/config`);
  return response.json();
}

export async function patchConfig(patch: OpPatch) {
  const response = await fetch(
    new Request(`http://${host}/config`, {
      method: 'PATCH',
      body: JSON.stringify([patch]),
      headers: { 'content-type': 'application/json' }
    })
  );
  return response.json();
}

export async function runCommand(
  deviceId: string,
  command: string,
  args?: (string | number)[]
) {
  const body: { [name: string]: string } = {
    id: deviceId,
    method: command
  };
  if (args) {
    args.forEach((arg, i) => {
      body[`arg[${i + 1}]`] = String(arg);
      if (typeof arg === 'number') {
        body[`argType.${i + 1}`] = 'NUMBER';
      }
    });
  }

  const response = await fetch(`http://${host}/device/runmethod`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: simpleEncode(body)
  });

  if (response.status !== 200) {
    throw new Error(`Error running command: ${response.statusText}`);
  }
}

/**
 * Subscribe to device and config events
 */
export function subscribe(callback: EventHandler) {
  let lastDeviceEvent: DevicePayload;

  connect(WebSocket, `ws://${host}/eventsocket`, socket => {
    console.log('Connected to HomeUI server');

    socket.addEventListener('message', event => {
      const { data } = event;
      const message = JSON.parse(data);

      if (message.type === 'device') {
        const { payload } = message;
        if (!deepEqual(lastDeviceEvent, payload)) {
          callback(message);
        }
        lastDeviceEvent = payload;
      } else if (message.type === 'config') {
        callback(message);
      }
    });
  });
}

function getCommands(attrs: { [name: string]: { type: string } }) {
  const commands: Device['commands'] = {};
  Object.keys(attrs).forEach(attr => {
    if (attr === 'switch') {
      commands.on = [];
      commands.off = [];
    }

    if (attr === 'level') {
      commands.setLevel = [
        { name: 'level', type: 'number' },
        { name: 'time', type: 'number' }
      ];
    }

    if (attr === 'status') {
      commands.play = [];
      commands.pause = [];
      commands.stop = [];
    }

    if (attr === 'colorTemperature') {
      commands.setColorTemperature = [
        { name: 'colorTemperature', type: 'number' }
      ];
    }

    if (attr === 'thermostatMode') {
      commands.auto = [];
      commands.away = [];
      commands.cool = [];
      commands.eco = [];
      commands.fanAuto = [];
      commands.fanCirculate = [];
      commands.fanOn = [];
      commands.heat = [];
      commands.home = [];
      commands.off = [];
      commands.setCoolingSetpoint = [
        { name: 'coolingSetpoint', type: 'number' }
      ];
      commands.setHeatingSetpoint = [
        { name: 'heatingSetpoint', type: 'number' }
      ];
      commands.setScale = [{ name: 'scale', type: 'enum', values: ['F', 'C'] }];
      commands.setThermostatFanMode = [
        {
          name: 'thermostatFanMode',
          type: 'enum',
          values: ['circulate', 'auto', 'on', 'off']
        }
      ];
      commands.setThermostatMode = [
        {
          name: 'thermostatMode',
          type: 'enum',
          values: ['heat', 'cool', 'heat-cool', 'off', 'eco']
        }
      ];
      commands.sunblockOn = [];
      commands.sunblockOff = [];
    }
  });

  return commands;
}

type encodableType = { [key: string]: encodableType } | string;

function simpleEncode(value: encodableType, key?: string, list?: string[]) {
  list = list || [];
  if (typeof value === 'object') {
    Object.keys(value).forEach(k => {
      simpleEncode(value[k], key ? `${key}[${k}]` : k, list);
    });
  } else {
    list.push(`${key}=${encodeURIComponent(value)}`);
  }
  return list.join('&');
}

interface DeviceResponse {
  id: number;
  label: string;
  template: string;
  attr: {
    [name: string]: string;
    unit: string;
  }[];
}
