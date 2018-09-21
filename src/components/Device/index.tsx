import * as React from 'react';
import autobind from 'autobind-decorator';

import * as styles from './index.module.css';
import Loader from '../Loader';
import {
  getAttributeString,
  getMainAttribute,
  isAttributeActive
} from '../../hub';
import { Device as DeviceType, DeviceState } from '../../types';
import { ReactComponent as SensorIcon } from '../../images/sensor.svg';
import { ReactComponent as LightbulbIcon } from '../../images/lightbulb.svg';
import { ReactComponent as DoorOpenIcon } from '../../images/door_open.svg';
import { ReactComponent as DoorClosedIcon } from '../../images/door_closed.svg';
import { ReactComponent as ButtonIcon } from '../../images/button.svg';
import { ReactComponent as GarageDoorOpenIcon } from '../../images/garage_door_open.svg';
import { ReactComponent as GarageDoorOpeningIcon } from '../../images/garage_door_opening.svg';
import { ReactComponent as GarageDoorClosingIcon } from '../../images/garage_door_closing.svg';
import { ReactComponent as GarageDoorClosedIcon } from '../../images/garage_door_closed.svg';
import { ReactComponent as HubIcon } from '../../images/hub.svg';
import { ReactComponent as MotionActiveIcon } from '../../images/motion_active.svg';
import { ReactComponent as MotionInactiveIcon } from '../../images/motion_inactive.svg';
import { ReactComponent as TemperatureSensorIcon } from '../../images/temperature_sensor.svg';
import { ReactComponent as SwitchOnIcon } from '../../images/switch_on.svg';
import { ReactComponent as SwitchOffIcon } from '../../images/switch_off.svg';
import { ReactComponent as PresenceIcon } from '../../images/presence.svg';
import { ReactComponent as WetIcon } from '../../images/wet.svg';
import { ReactComponent as DryIcon } from '../../images/dry.svg';
import { ReactComponent as UnknownIcon } from '../../images/unknown.svg';
import { ReactComponent as PlayIcon } from '../../images/play.svg';
import { ReactComponent as PauseIcon } from '../../images/pause.svg';
import { ReactComponent as ThermostatIcon } from '../../images/thermostat.svg';

const clickDelay = 500;

export default class Device extends React.Component<DeviceProps> {
  private clickTimer: number | undefined;
  private pressed = false;
  private ref: React.RefObject<HTMLDivElement>;
  private position: { x: number; y: number } | undefined;

  constructor(props: DeviceProps) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('contextmenu', this.handleContextMenu);
  }

  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.handleContextMenu);
  }

  render() {
    const { device, deviceType, state, switching } = this.props;
    const attribute = getMainAttribute(state);
    const Icon = getIcon(deviceType, state, attribute);
    const active =
      attribute && state ? isAttributeActive(state, attribute) : undefined;
    const value =
      attribute && state
        ? getAttributeString(device, state, attribute)
        : undefined;
    const classes = [styles.root];

    if (active) {
      classes.push(styles.active);
    }

    return (
      <div
        className={classes.join(' ')}
        onMouseDown={this.handlePress}
        onTouchStart={this.handlePress}
        onMouseUp={this.handleRelease}
        onTouchEnd={this.handleRelease}
        onTouchMove={this.handleMove}
        ref={this.ref}
      >
        <div className={styles.header}>
          <div className={styles.icon}>
            <Icon />
          </div>
        </div>
        <div className={styles.name}>{device.label}</div>
        <div className={styles.state}>
          {switching || !state ? <Loader inline={true} /> : value}
        </div>
      </div>
    );
  }

  @autobind
  handlePress(
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
  ) {
    if (this.props.switching) {
      event.preventDefault();
      return;
    }

    this.position = this.getEventPosition(event);

    if (this.clickTimer) {
      window.clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
    }

    this.pressed = true;

    this.clickTimer = window.setTimeout(() => {
      if (this.props.onLongClick) {
        this.props.onLongClick();
      }
    }, clickDelay);
  }

  @autobind
  handleRelease() {
    if (this.clickTimer) {
      this.clearTimer();
      if (this.pressed && this.props.onClick) {
        this.props.onClick();
      }
    }
    this.pressed = false;
    this.position = undefined;
  }

  @autobind
  handleMove(
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
  ) {
    const newPosition = this.getEventPosition(event);
    const distance = this.getDistance(newPosition);

    if (distance > 20) {
      this.clearTimer();
      this.pressed = false;
    }
  }

  @autobind
  handleContextMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (this.ref.current && this.ref.current.contains(target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  clearTimer() {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
    }
  }

  getEventPosition(
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
  ) {
    if (isTouchEvent(event)) {
      const touch = event.touches[0];
      return { x: touch.clientX, y: touch.clientY };
    } else {
      return { x: event.clientX, y: event.clientY };
    }
  }

  getDistance(position: { x: number; y: number }) {
    return Math.sqrt(
      Math.pow(position.x - this.position!.x, 2) +
        Math.pow(position.y - this.position!.y, 2)
    );
  }
}

export interface DeviceProps {
  device: DeviceType;
  deviceType: string;
  state?: DeviceState;
  switching?: boolean;
  onClick?: () => void;
  onLongClick?: () => void;
  infoClicked?: () => void;
  iconClicked?: () => void;
}

function getIcon(
  type: string,
  state: DeviceState | undefined,
  attribute: string | null
) {
  let deviceType = type;

  switch (deviceType) {
    case 'dimmer':
    case 'bulb':
      return LightbulbIcon;
    case 'contact':
      return state && isAttributeActive(state, 'contact')
        ? DoorOpenIcon
        : DoorClosedIcon;
    case 'door':
      if (state && state.door) {
        return state.door === 'open'
          ? GarageDoorOpenIcon
          : state.door === 'opening'
            ? GarageDoorOpeningIcon
            : state.door === 'closing'
              ? GarageDoorClosingIcon
              : GarageDoorClosedIcon;
      }
      return GarageDoorClosedIcon;
    case 'generic':
      return HubIcon;
    case 'momentary':
      return ButtonIcon;
    case 'motion':
      return state && isAttributeActive(state, 'motion')
        ? MotionActiveIcon
        : MotionInactiveIcon;
    case 'multi':
      return SensorIcon;
    case 'switch':
      return state && isAttributeActive(state, 'switch')
        ? SwitchOnIcon
        : SwitchOffIcon;
    case 'temperature':
      return TemperatureSensorIcon;
    case 'bridge':
      return HubIcon;
    case 'presence':
      return PresenceIcon;
    case 'sensor':
      return SensorIcon;
    case 'speaker':
      return state && isAttributeActive(state, 'status') ? PlayIcon : PauseIcon;
    case 'thermostat':
      return ThermostatIcon;
    case 'water':
      return state && isAttributeActive(state, 'water') ? WetIcon : DryIcon;
    default:
      return UnknownIcon;
  }
}

// tslint:disable-next-line:no-any
function isTouchEvent(event: any): event is React.TouchEvent<{}> {
  return event.touches != null;
}
