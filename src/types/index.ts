import { Device, DeviceState, DeviceFilter } from './devices';
import { Config } from './config';

export * from './config';
export * from './devices';

export interface State {
  config: Config;
  devices: { [deviceId: string]: Device };
  deviceFilter?: DeviceFilter;
  deviceStates: { [deviceId: string]: DeviceState };
  error?: Error;
  lastUpdate?: number;
  scrollPositions: {
    [componentName: string]: number;
  };
}
