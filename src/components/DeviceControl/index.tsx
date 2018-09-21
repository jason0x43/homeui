import * as React from 'react';

import * as styles from './index.module.css';
import { Device, DeviceState } from '../../types';
import Loading from '../Loading';
import Control from '../Control';
import Slider from '../Slider';
import Toggle from '../Toggle';

export default function DeviceControl(props: DeviceControlProps) {
  const { devices, states, value, onChange } = props;
  return (
    <div className={styles.root}>
      {devices && states ? (
        <form className={styles.controls}>
          {getControls(devices, states, onChange, value)}
        </form>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export interface DeviceControlProps {
  devices?: { [id: string]: Device };
  states?: { [id: string]: DeviceState };
  back?: (event: React.SyntheticEvent<HTMLElement>) => void;
  value?: DeviceState;
  onChange?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
}

function getControls(
  devices: { [id: string]: Device },
  states: { [id: string]: DeviceState },
  onChange:
    | ((event: React.SyntheticEvent<HTMLInputElement>) => void)
    | undefined,
  value?: DeviceState
) {
  const controls: React.ReactNode[] = [];

  if (supports(devices, 'setColorTemperature')) {
    const val =
      value && value.colorTemperature != null
        ? value.colorTemperature
        : getDeviceValue<number>(states, 'colorTemperature');
    controls.push(
      <Control key="color temp" label="Color Temp">
        <Slider
          name="colorTemperature"
          min={2200}
          max={6500}
          value={val || 0}
          onChange={onChange}
          label={String(val)}
        />
      </Control>
    );
  }

  if (supports(devices, 'setLevel')) {
    const val =
      value && value.level != null
        ? value.level
        : getDeviceValue<number>(states, 'level');
    const slider = (
      <Slider
        name="level"
        max={100}
        value={val || 0}
        onChange={onChange}
        label={String(val)}
      />
    );

    if (supports(devices, 'play')) {
      controls.push(
        <Control key="volume" label="Volume">
          {slider}
        </Control>
      );
    } else {
      controls.push(
        <Control key="brightness" label="Brightness">
          {slider}
        </Control>
      );
    }
  }

  if (supports(devices, 'on')) {
    const val =
      value && value.switch != null
        ? value.switch
        : getDeviceValue<string>(states, 'switch');
    controls.push(
      <Control key="switch" label="Switch">
        <Toggle
          name="switch"
          label={val}
          checked={val === 'on'}
          onChange={onChange}
        />
      </Control>
    );
  }

  return controls;
}

function getDeviceValue<T extends string | number>(
  states: { [id: string]: DeviceState },
  attribute: string
): T {
  const values: T[] = Object.keys(states)
    .filter(id => states[id][attribute] != null)
    .map(id => states[id][attribute] as T);

  let value: T;

  if (typeof values[0] === 'string') {
    value = values[0];
  } else {
    const numValues = values as number[];
    const sum = numValues.reduce((total, val) => total + val, 0);
    value = Math.round(sum / numValues.length) as T;
  }

  return value;
}

function supports(devices: { [id: string]: Device }, command: string) {
  return Object.keys(devices).some(id => devices[id].commands[command] != null);
}
