import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import * as styles from './index.module.css';
import Menu from '../../containers/Menu';
import DeviceDetails from '../../containers/DeviceDetails';
import Devices from '../../containers/Devices';
import Room from '../../containers/Room';
import Message from '../Message';

export default function App(props: AppProps) {
  return (
    <div className={styles.root}>
      <Switch>
        <Route
          path="/device/:deviceId"
          render={({ match }) => (
            <DeviceDetails deviceId={match.params.deviceId} />
          )}
        />

        <Route
          path="/room/:roomId/edit"
          render={({ match }) => <Room roomId={match.params.roomId} />}
        />

        <Route
          path="/room/:roomId"
          render={() => {
            return (
              <React.Fragment>
                <Devices />
                <Menu />
              </React.Fragment>
            );
          }}
        />

        <Route
          path="/attribute/:name"
          render={() => (
            <React.Fragment>
              <Devices />
              <Menu />
            </React.Fragment>
          )}
        />

        <Route
          path="/"
          render={() => (
            <React.Fragment>
              <Devices />
              <Menu />
            </React.Fragment>
          )}
        />
      </Switch>

      {props.error && (
        <Message
          type="error"
          onHidden={props.clearError}
          content={props.error.message}
        />
      )}
    </div>
  );
}

export interface AppProps {
  error?: Error;
  clearError(): void;
}
