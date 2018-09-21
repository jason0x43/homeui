import * as React from 'react';
import { connect, Dispatch } from 'react-redux';

import { Config, Device, State, Room as RoomData } from '../types';
import { getConfig, getAllDevices } from '../reducers';
import Room from '../components/Room';
import { deleteRoom, updateRoom } from '../actions';
import { clone } from '../util';
import history from '../history';

export default connect(mapStateToProps, mapDispatchToProps)(
  class RoomContainer extends React.Component<
    RoomContainerProps,
    RoomContainerState
  > {
    constructor(props: RoomContainerProps) {
      super(props);
      this.state = { deleting: false, editingName: false };
    }

    componentWillReceiveProps(newProps: RoomContainerProps) {
      if (newProps.config && newProps.roomId) {
        const room = newProps.config.rooms[newProps.roomId];
        if (room && room.name !== this.state.roomName) {
          this.setState({ roomName: room.name });
        }
      }
    }

    render() {
      const { config, roomId, devices } = this.props;
      const room = config ? config.rooms[roomId] : undefined;
      const roomName = this.state.roomName || (room ? room.name : '');
      const { deleting, editingName } = this.state;

      return room && devices ? (
        <Room
          devices={devices}
          room={room}
          deleting={deleting}
          back={this.handleBack}
          editName={this.editName}
          saveName={this.saveName}
          editingName={editingName}
          delete={this.handleDelete}
          cancelDelete={this.cancelDelete}
          roomName={roomName}
          onChange={this.handleChange}
        />
      ) : null;
    }

    editName = () => {
      this.setState({ editingName: !this.state.editingName });
    };

    saveName = (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { config, roomId } = this.props;
      const room = clone(config.rooms[roomId]);
      room.name = this.state.roomName!;
      this.props.updateRoom(room).then(success => {
        if (success) {
          this.setState({ editingName: false });
        }
      });
    };

    cancelDelete = () => {
      this.setState({ deleting: false });
    };

    handleDelete = () => {
      if (this.state.deleting) {
        this.props.deleteRoom(this.props.roomId);
        this.setState({ deleting: false });
        history.push('/');
      } else {
        this.setState({ deleting: true });
      }
    };

    handleChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
      const target = event.currentTarget;
      const name = target.getAttribute('name')!;

      if (name === 'name') {
        this.setState({ roomName: target.value });
      } else {
        const { config, roomId } = this.props;
        const room = clone(config.rooms[roomId]);
        const deviceIds = room.deviceIds || [];
        if (!room.deviceIds) {
          room.deviceIds = deviceIds;
        }

        const deviceId = name.slice('device-'.length);
        const index = deviceIds.indexOf(deviceId);
        const checked = target.checked;

        if (checked && index === -1) {
          deviceIds.push(deviceId);
        } else if (!checked && index !== -1) {
          deviceIds.splice(index, 1);
        }

        this.props.updateRoom(room);
      }
    };

    handleBack = () => {
      history.goBack();
    };
  }
);

export interface RoomContainerProps {
  roomId: string;
  config: Config;
  devices: { [id: string]: Device };
  deleteRoom(roomId: string): Promise<boolean>;
  updateRoom(room: RoomData): Promise<boolean>;
}

export interface RoomContainerState {
  editingName: boolean;
  deleting: boolean;
  roomName?: string;
}

function mapStateToProps(
  state: State
): Pick<RoomContainerProps, 'config' | 'devices'> {
  return {
    devices: getAllDevices(state)!,
    config: getConfig(state)!
  };
}

function mapDispatchToProps(
  dispatch: Dispatch<State>
): Pick<RoomContainerProps, 'deleteRoom' | 'updateRoom'> {
  return {
    updateRoom(room: RoomData) {
      return dispatch(updateRoom(room));
    },
    deleteRoom(roomId: string) {
      return dispatch(deleteRoom(roomId));
    }
  };
}
