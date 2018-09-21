import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import autobind from 'autobind-decorator';

import DeviceControl, { DeviceControlProps } from '../components/DeviceControl';
import { Command, Device, DeviceState, State } from '../types';
import { getDevices, getDeviceStates, getDeviceType } from '../reducers';
import history from '../history';
import { sendCommand } from '../actions';
import { deepEqual, clone } from '../util';

export class DeviceControlContainer extends React.Component<
  DeviceControlContainerProps,
  DeviceControlContainerState
> {
  changeTimer: NodeJS.Timer | undefined;

  constructor(props: DeviceControlContainerProps) {
    super(props);
    this.state = { value: {} as DeviceState };
  }

  shouldComponentUpdate(
    newProps: DeviceControlContainerProps,
    newState: DeviceControlContainerState
  ) {
    return !deepEqual(this.state, newState) || !deepEqual(this.props, newProps);
  }

  render() {
    return (
      <DeviceControl
        {...this.props}
        back={this.handleBack}
        onChange={this.handleChange}
        value={this.state.value}
      />
    );
  }

  @autobind
  handleBack() {
    history.goBack();
  }

  @autobind
  handleChange(event: React.SyntheticEvent<HTMLInputElement>) {
    const target = event.currentTarget;
    const { name } = target;

    switch (name) {
      case 'level':
      case 'colorTemperature':
        this.setState({
          value: updateAttribute(this.state.value!, name, Number(target.value))
        });
        break;
      case 'switch':
        this.setState({
          value: updateAttribute(
            this.state.value!,
            name,
            target.checked ? 'on' : 'off'
          )
        });
        break;
      default:
        break;
    }

    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
    }

    this.changeTimer = setTimeout(() => {
      const devices = this.props.devices!;

      switch (name) {
        case 'level':
          const level = this.state.value!.level!;
          this.props.sendCommand(devices, {
            name: 'setLevel',
            args: [level]
          });
          break;

        case 'colorTemperature':
          const temp = this.state.value!.colorTemperature!;
          this.props.sendCommand(devices, {
            name: 'setColorTemperature',
            args: [temp]
          });
          break;

        case 'switch':
          const sw = this.state.value!.switch!;
          if (sw === 'on') {
            this.props.sendCommand(devices, { name: 'on' });
          } else {
            this.props.sendCommand(devices, { name: 'off' });
          }
          break;

        default:
          break;
      }

      this.changeTimer = undefined;
    }, 100);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  DeviceControlContainer
);

export interface DeviceControlContainerProps extends DeviceControlProps {
  devices?: { [id: string]: Device };
  states?: { [id: string]: DeviceState };
  sendCommand(
    devices: { [id: string]: Device },
    command: Command
  ): Promise<boolean>;
}

export interface DeviceControlContainerState {
  value?: DeviceState;
}

function mapStateToProps(
  state: State
): Pick<DeviceControlContainerProps, 'devices' | 'states'> {
  const devices = getDevices(state);
  const states = getDeviceStates(state);
  let lightDevices = devices;

  if (devices && Object.keys(devices).length > 1) {
    lightDevices = Object.keys(devices)
      .filter(id => {
        return getDeviceType(state, id) === 'bulb';
      })
      .reduce(
        (lights, id) => ({
          ...lights,
          [id]: devices[id]
        }),
        {}
      );
  }

  return {
    devices: lightDevices,
    states
  };
}

function mapDispatchToProps(
  dispatch: Dispatch<State>
): Pick<DeviceControlContainerProps, 'sendCommand'> {
  return {
    sendCommand(devices: { [id: string]: Device }, command: Command) {
      const deviceIds = Object.keys(devices).filter(
        id => devices[id].commands[command.name] != null
      );
      return dispatch(sendCommand(deviceIds, command));
    }
  };
}

function updateAttribute(
  state: DeviceState,
  attribute: string,
  value: string | number
) {
  state = clone(state);
  state[attribute] = value;
  return state;
}
