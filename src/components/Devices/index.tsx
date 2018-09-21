import * as React from 'react';
import autobind from 'autobind-decorator';

import * as styles from './index.module.css';
import Loader from '../Loader';
import Device from '../../containers/Device';
import { Config, DeviceFilter, Device as DeviceType } from '../../types';

export default class Devices extends React.Component<DevicesProps> {
  private ref: React.RefObject<HTMLDivElement>;

  constructor(props: DevicesProps) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    if (this.ref.current && this.props.scrollPosition != null) {
      this.ref.current.scrollTop = this.props.scrollPosition;
    }
  }

  render() {
    const { devices } = this.props;
    let content: React.ReactNode;

    if (devices) {
      const devList = Object.keys(devices).map(id => devices[id]);
      const sortedDevices = devList.sort((a, b) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });
      content = (
        <div className={styles.grid}>
          {sortedDevices.map(device => (
            <Device key={device.id} deviceId={device.id} />
          ))}
        </div>
      );
    } else {
      content = <Loader>Loading</Loader>;
    }

    return (
      <div className={styles.root} onScroll={this.handleScroll} ref={this.ref}>
        {content}
      </div>
    );
  }

  @autobind
  handleScroll(event: React.SyntheticEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    this.props.onScroll(target.scrollTop);
  }
}

export interface DevicesProps {
  config?: Config;
  devices?: { [deviceId: string]: DeviceType };
  deviceIds?: string[];
  filter?: DeviceFilter;
  scrollPosition?: number;
  onScroll(position: number): void;
}
