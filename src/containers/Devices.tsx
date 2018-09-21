import * as React from 'react';
import { connect, Dispatch } from 'react-redux';

import history from '../history';
import { Config, Device, DeviceState, State } from '../types';
import {
  getConfig,
  getDevices,
  getDeviceStates,
  getDeviceIds,
  getScrollPosition
} from '../reducers';
import { setScrollPosition } from '../actions';
import Devices from '../components/Devices';
import { deepEqual } from '../util';

export default connect(mapStateToProps, mapDispatchToProps)(
  class DevicesContainer extends React.Component<DevicesContainerProps> {
    constructor(props: DevicesContainerProps) {
      super(props);
      this.state = {};
    }

    shouldComponentUpdate(newProps: DevicesContainerProps) {
      return !deepEqual(this.props, newProps);
    }

    render() {
      return <Devices {...this.props} />;
    }

    select = (device: Device) => {
      history.push(`/device/${device.id}`);
    };
  }
);

export interface DevicesContainerProps {
  config?: Config;
  devices?: { [deviceId: string]: Device };
  deviceStates?: { [deviceId: string]: DeviceState };
  deviceIds?: string[];
  scrollPosition?: number;
  onScroll(position: number): void;
}

function mapStateToProps(
  state: State
): Pick<
  DevicesContainerProps,
  'deviceStates' | 'devices' | 'deviceIds' | 'config' | 'scrollPosition'
> {
  return {
    config: getConfig(state),
    deviceStates: getDeviceStates(state),
    devices: getDevices(state)!,
    deviceIds: getDeviceIds(state),
    scrollPosition: getScrollPosition(state, 'devices')
  };
}

function mapDispatchToProps(
  dispatch: Dispatch<State>
): Pick<DevicesContainerProps, 'onScroll'> {
  return {
    onScroll(position: number) {
      dispatch(setScrollPosition('devices', position));
    }
  };
}
