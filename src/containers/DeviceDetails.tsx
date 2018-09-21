import * as React from 'react';
import { connect, Dispatch } from 'react-redux';

import { State } from '../types';
import DeviceDetails, { DeviceDetailsProps } from '../components/DeviceDetails';
import { getDevice, getDeviceState, getDeviceType } from '../reducers';
import { updateDeviceType } from '../actions';

export function DeviceDetailsContainer(props: DeviceDetailsProps) {
  return <DeviceDetails {...props} />;
}

export default connect(mapStateToProps, mapDeviceToProps)(
  DeviceDetailsContainer
);

type OwnProps = { deviceId: string };

function mapStateToProps(
  state: State,
  props: OwnProps
): Pick<DeviceDetailsProps, 'device' | 'deviceType' | 'state'> {
  const { deviceId } = props;

  return {
    device: getDevice(state, deviceId),
    deviceType: getDeviceType(state, deviceId),
    state: getDeviceState(state, deviceId)
  };
}

function mapDeviceToProps(
  dispatch: Dispatch<State>,
  props: OwnProps
): Pick<DeviceDetailsProps, 'onTypeChange'> {
  return {
    onTypeChange(type: string) {
      return dispatch(updateDeviceType(props.deviceId, type));
    }
  };
}
