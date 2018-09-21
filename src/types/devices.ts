import { Config } from './config';

export interface Command {
  name: string;
  args?: (string | number)[];
}

export interface CommandArg {
  name: string;
  type: string;
  values?: string[];
}

export interface Device {
  id: string;
  link?: string;
  label: string;
  type: string;
  attributes: {
    [name: string]: { type: string; unit?: string };
  };
  commands: {
    [name: string]: CommandArg[];
  };
}

export interface DeviceFilter {
  room?: string;
  device?: string;
  attribute?: string;
}

export interface DeviceState {
  id: string;
  colorTemperature?: number;
  switch?: string;
  level?: number;
  [attribute: string]: string | number | undefined;
}

export interface EventHandler {
  (event: Event<DevicePayload | Config>): void;
}

export interface Event<T = object> {
  type: string;
  payload: T;
}

export interface DevicePayload {
  deviceId: string;
  attribute: string;
  value: string | number;
}
