import * as React from 'react';
import * as ReactModal from 'react-modal';

import { Device, Room as RoomData } from '../../types';
import NameHeader from '../NameHeader';
import Checkbox from '../Checkbox';
import * as styles from './index.module.css';
import * as baseStyles from '../../base.module.css';

export default function Room(props: RoomProps) {
  const { editingName, deleting, room, devices } = props;
  const roomDeviceIds = room.deviceIds || [];

  return (
    <div className={styles.root}>
      <ReactModal
        className={baseStyles.modal}
        isOpen={deleting || false}
        contentLabel="Are you sure?"
      >
        <p>Are you sure?</p>

        <div className={baseStyles.modalButtons}>
          <button className={baseStyles.button} onClick={props.delete}>
            Yes
          </button>
          <button className={baseStyles.button} onClick={props.cancelDelete}>
            No
          </button>
        </div>
      </ReactModal>

      <NameHeader
        name={props.roomName}
        onChange={props.onChange}
        editName={props.editName}
        saveName={props.saveName}
        back={props.back}
        editingName={editingName}
        delete={props.delete}
      />

      <div className={styles.devicesWrapper}>
        <ul className={styles.devices}>
          {Object.keys(devices)
            .sort((a, b) => {
              const labelA = devices[a].label;
              const labelB = devices[b].label;
              if (labelA < labelB) {
                return -1;
              } else if (labelB < labelA) {
                return 1;
              } else {
                return 0;
              }
            })
            .map(deviceId => {
              const checked = roomDeviceIds.indexOf(deviceId) !== -1;
              return renderItem(deviceId, props, checked);
            })}
        </ul>
      </div>
    </div>
  );
}

function renderItem(deviceId: string, props: RoomProps, checked = false) {
  const { devices } = props;
  return (
    <li key={deviceId}>
      <Checkbox
        name={`device-${deviceId}`}
        data-device-id={deviceId}
        checked={checked}
        disabled={props.editingName}
        onChange={props.onChange}
        label={devices[deviceId].label}
      />
    </li>
  );
}

export interface RoomProps {
  devices: { [id: string]: Device };
  room: RoomData;
  roomName: string;
  deleting?: boolean;
  editingName?: boolean;
  back(): void;
  editName(): void;
  saveName(event: React.SyntheticEvent<HTMLFormElement>): void;
  cancelDelete(): void;
  delete(): void;
  onChange(even: React.SyntheticEvent<HTMLInputElement>): void;
}
