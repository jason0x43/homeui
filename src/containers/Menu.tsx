import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import autobind from 'autobind-decorator';

import Menu, { Selector } from '../components/Menu';
import DeviceControl from '../containers/DeviceControl';
import { addRoom } from '../actions';
import { Config, Device, State } from '../types';
import {
  getConfig,
  getDevices,
  getDeviceFilter,
  getDeviceType
} from '../reducers';
import history from '../history';
import { ReactComponent as House } from '../images/house.svg';
import { ReactComponent as Room } from '../images/room.svg';
import { ReactComponent as LightIcon } from '../images/lightbulb.svg';

export class MenuContainer extends React.Component<
  MenuContainerProps,
  MenuContainerState
> {
  constructor(props: MenuContainerProps) {
    super(props);
    this.state = { activeSelector: undefined };
  }

  render() {
    const { hasLights, isFiltered, config = {} as Config } = this.props;
    const { activeSelector } = this.state;
    const selectors: Selector[] = [
      { name: 'home', Icon: House },
      { name: 'rooms', Icon: Room }
    ];

    if (isFiltered && hasLights) {
      selectors.push({ name: 'lights', Icon: LightIcon });
    }

    let options:
      | { value: string; label?: string }[]
      | React.ReactNode
      | undefined;

    if (activeSelector === 'rooms') {
      const rooms = config.rooms || {};
      options = Object.keys(rooms)
        .sort((idA, idB) => {
          const nameA = rooms[idA].name;
          const nameB = rooms[idB].name;
          if (nameA < nameB) {
            return -1;
          } else if (nameB < nameA) {
            return 1;
          } else {
            return 0;
          }
        })
        .map<{ value: string; label?: string }>(id => ({
          value: id,
          label: rooms[id].name,
          edit: this.editRoom
        }))
        .concat({
          value: '<add>',
          label: 'Add a room...'
        });
    } else if (activeSelector === 'lights') {
      options = <DeviceControl />;
    }

    return (
      <Menu
        selectors={selectors}
        options={options}
        activeSelector={this.state.activeSelector}
        clickSelector={this.toggleSelector}
        onSelect={this.setFilter}
      />
    );
  }

  @autobind
  toggleSelector(event: React.SyntheticEvent<HTMLElement>) {
    const name = event.currentTarget.getAttribute('name') || undefined;
    if (name === 'home') {
      history.push('/');
      this.setState({ activeSelector: undefined });
    } else {
      const { activeSelector } = this.state;
      if (activeSelector === name) {
        this.setState({ activeSelector: undefined });
      } else {
        this.setState({
          activeSelector: name as 'rooms' | 'lights'
        });
      }
    }
  }

  @autobind
  setFilter(event: React.SyntheticEvent<HTMLElement>) {
    const value: string = event.currentTarget.getAttribute('data-value')!;
    const { activeSelector } = this.state;

    if (activeSelector === 'rooms') {
      if (value === '<add>') {
        this.addRoom().then(roomId => {
          if (roomId) {
            history.push(`/room/${roomId}/edit`);
          }
        });
      } else {
        history.push(`/room/${value}`);
        // this.props.setFilter({ type: 'room', value });
      }
    } else {
      history.push(`/attribute/${value}`);
      // this.props.setFilter({ type: 'attribute', value });
    }

    this.setState({ activeSelector: undefined });
  }

  @autobind
  editRoom(event: React.SyntheticEvent<HTMLElement>) {
    const roomId: string = event.currentTarget.getAttribute('data-value')!;
    history.push(`/room/${roomId}/edit`);
  }

  @autobind
  addRoom() {
    return this.props.addRoom();
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuContainer);

export interface MenuContainerProps {
  config?: Config;
  attributes?: string[];
  isFiltered: boolean;
  hasLights: boolean;
  addRoom(): Promise<string>;
}

export interface MenuContainerState {
  activeSelector?: 'rooms' | 'lights';
}

// Cache the computed props so new ones won't be provided unless source data
// has changed
const propsCache: {
  attributes?: string[];
  devices?: { [id: string]: Device };
} = {};

function mapStateToProps(
  state: State
): Pick<
  MenuContainerProps,
  'config' | 'attributes' | 'isFiltered' | 'hasLights'
> {
  const devices = getDevices(state);
  const filter = getDeviceFilter(state);
  let hasLights = false;

  if (devices && devices !== propsCache.devices) {
    const attributes = new Set<string>();
    Object.keys(devices).forEach(id => {
      const device = devices[id];
      Object.keys(device.attributes).forEach(attr => {
        attributes.add(attr);
      });

      if (getDeviceType(state, id) === 'bulb') {
        hasLights = true;
      }
    });
    propsCache.attributes = Array.from(attributes);
  }

  propsCache.devices = devices;

  return {
    attributes: propsCache.attributes,
    config: getConfig(state),
    isFiltered: filter != null,
    hasLights
  };
}

function mapDispatchToProps(
  dispatch: Dispatch<State>
): Pick<MenuContainerProps, 'addRoom'> {
  return {
    addRoom() {
      return dispatch(addRoom());
    }
  };
}
