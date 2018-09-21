import { Device, DeviceState } from '../types';

export * from './hubitat';

export function getAttributeString(
  device: Device,
  state: DeviceState,
  attribute: string
) {
  const attr = device.attributes[attribute];
  const value = state[attribute];
  return `${value}${attr.unit ? attr.unit : ''}`;
}

export function getMainAttribute(state?: DeviceState) {
  if (!state) {
    return null;
  }

  if (state.status) {
    return 'status';
  }

  if (state.switch) {
    return 'switch';
  }

  if (state.heatingSetpoint != null && state.thermostatMode === 'heat') {
    return 'heatingSetpoint';
  }

  if (state.coolingSetpoint != null && state.thermostatMode === 'cool') {
    return 'heatingSetpoint';
  }

  if (state.contact) {
    return 'contact';
  }

  if (state.presence) {
    return 'presence';
  }

  if (state.motion) {
    return 'motion';
  }

  if (state.water) {
    return 'water';
  }

  const attrNames = Object.keys(state);
  return attrNames[0] === 'id' ? attrNames[1] : attrNames[0];
}

/**
 * Return the 'active' values for an enum attribute
 */
export function getActiveValues(attribute: string) {
  switch (attribute) {
    case 'status':
      return ['playing'];
    case 'switch':
      return ['on'];
    case 'contact':
      return ['open'];
    case 'door':
      return ['open', 'opening', 'closing'];
    case 'water':
      return ['wet'];
    case 'motion':
      return ['active'];
    case 'presence':
      return ['present'];
    default:
      return null;
  }
}

export function getDeviceType(device: Device) {
  if (device.type === 'bulb') {
    if (device.attributes.status) {
      return 'speaker';
    }
  }

  if (device.attributes.thermostatMode) {
    return 'thermostat';
  }

  return device.type;
}

/**
 * Return true if the given attribute's value is 'active' in the given state
 * object.
 */
export function isAttributeActive(state: DeviceState, attribute: string) {
  const value = state[attribute];
  if (value == null || typeof value !== 'string') {
    return false;
  }

  const values = getActiveValues(attribute);
  if (!values) {
    return false;
  }

  return values.indexOf(value) !== -1;
}
