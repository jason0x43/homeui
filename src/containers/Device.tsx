import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import autobind from 'autobind-decorator';

import Device from '../components/Device';
import { Device as DeviceType, DeviceState, State } from '../types';
import { sendCommand } from '../actions';
import { getDevice, getDeviceState, getDeviceType } from '../reducers';
import { deepEqual } from '../util';
import history from '../history';

export class DeviceContainer extends React.Component<
  DeviceContainerProps,
  DeviceContainerState
> {
  constructor(props: DeviceContainerProps) {
    super(props);
    this.state = {};
  }

  shouldComponentUpdate(
    newProps: DeviceContainerProps,
    newState: DeviceContainerState
  ) {
    return (
      this.state !== newState || !deepEqual(this.props.state, newProps.state)
    );
  }

  componentWillReceiveProps(nextProps: DeviceContainerProps) {
    const { state: nextState } = nextProps;
    const { state: currentState } = this.props;
    const { updatingProperty } = this.state;
    if (
      updatingProperty &&
      nextState &&
      currentState &&
      nextState[updatingProperty] !== currentState[updatingProperty]
    ) {
      this.setState({ updatingProperty: undefined });
    }
  }

  render() {
    const canToggle = this.canToggle();
    const { device, deviceType, state } = this.props;
    return (
      <Device
        device={device}
        deviceType={deviceType}
        state={state}
        switching={this.state.updatingProperty != null}
        onClick={canToggle ? this.toggleDevice : undefined}
        onLongClick={this.showDetails}
      />
    );
  }

  canToggle() {
    const { device, state } = this.props;
    if (device.attributes.switch || device.attributes.door) {
      return true;
    }
    if (
      device.attributes.status &&
      state &&
      (state.status === 'paused' || state.status === 'playing')
    ) {
      return true;
    }
    return false;
  }

  @autobind
  showDetails() {
    history.push(`/device/${this.props.device.id}`);
  }

  @autobind
  toggleDevice() {
    const property = this.props.toggleDevice(
      this.props.device,
      this.props.state!
    );
    if (property) {
      this.setState({ updatingProperty: property });
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceContainer);

export interface DeviceContainerProps {
  deviceId: string;
  device: DeviceType;
  deviceType: string;
  state?: DeviceState;
  toggleDevice(device: DeviceType, state: DeviceState): string | undefined;
}

export interface DeviceContainerState {
  updatingProperty?: string;
}

type OwnProps = Pick<DeviceContainerProps, 'deviceId'>;

function mapStateToProps(
  state: State,
  ownProps: OwnProps
): Pick<DeviceContainerProps, 'device' | 'deviceType' | 'state'> {
  const { deviceId } = ownProps;
  return {
    device: getDevice(state, deviceId)!,
    deviceType: getDeviceType(state, deviceId)!,
    state: getDeviceState(state, deviceId)
  };
}

function mapDispatchToProps(
  dispatch: Dispatch<State>
): Pick<DeviceContainerProps, 'toggleDevice'> {
  return {
    toggleDevice(device: DeviceType, state: DeviceState) {
      if (device.attributes.switch) {
        const currentValue = state.switch;
        const newValue = currentValue === 'on' ? 'off' : 'on';
        dispatch(sendCommand(device.id, { name: newValue }));
        return 'switch';
      } else if (device.attributes.door) {
        const currentValue = state.door;
        const newValue = currentValue === 'open' ? 'close' : 'open';
        dispatch(sendCommand(device.id, { name: newValue }));
        return 'door';
      } else if (device.attributes.status) {
        const currentValue = state.status;
        const newValue = currentValue === 'paused' ? 'play' : 'pause';
        dispatch(sendCommand(device.id, { name: newValue }));
        return 'status';
      }
      return;
    }
  };
}
