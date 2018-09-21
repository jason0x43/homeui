import * as React from 'react';
import autobind from 'autobind-decorator';

import * as styles from './index.module.css';
import history from '../../history';
import NameHeader from '../NameHeader';
import Attribute from '../Attribute';
import DeviceControl from '../../containers/DeviceControl';
import { Device, DeviceState } from '../../types';

export default class DeviceDetails extends React.Component<DeviceDetailsProps> {
  render() {
    const { device, deviceType, state } = this.props;

    if (device) {
      return (
        <div className={styles.root}>
          <NameHeader name={device.label} back={this.handleBack} />

          <div className={styles.content}>
            <div className={styles.contentInner}>
              <DeviceControl />

              <table className={styles.table}>
                <tbody>
                  <tr key="id">
                    <th>ID</th>
                    <td>
                      {device.link ? (
                        <a href={device.link}>{device.id}</a>
                      ) : (
                        device.id
                      )}
                    </td>
                  </tr>
                  <tr key="type">
                    <th>Type</th>
                    <td>
                      {device.type === 'switch' ? (
                        <select
                          name="type"
                          value={deviceType}
                          onChange={this.handleTypeChange}
                        >
                          <option value="switch">switch</option>
                          <option value="bulb">bulb</option>
                        </select>
                      ) : (
                        deviceType
                      )}
                    </td>
                  </tr>
                  {device && state ? (
                    Object.keys(device.attributes).map(attr => (
                      <tr key={attr}>
                        <th>{attr}</th>
                        <td>
                          <Attribute
                            value={state[attr]}
                            name={attr}
                            type={device.attributes[attr].type}
                            unit={device.attributes[attr].unit}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="loading">
                      <td colSpan={2}>Loading...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  }

  @autobind
  handleTypeChange(event: React.SyntheticEvent<HTMLSelectElement>) {
    const target = event.currentTarget;
    this.props.onTypeChange(target.value);
  }

  handleBack = () => {
    history.goBack();
  };
}

export interface DeviceDetailsProps {
  device?: Device;
  deviceType?: string;
  state?: DeviceState;
  onTypeChange(newType: string): void;
}
