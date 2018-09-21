import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as ReactModal from 'react-modal';
import { ConnectedRouter } from 'react-router-redux';

import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';
import { loadConfig, loadDevices, handleEvent } from './actions';
import { subscribe } from './hub';
import store from './store';
import history from './history';

import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);

ReactModal.setAppElement('#root');

store.dispatch(loadConfig());
store.dispatch(loadDevices());
subscribe(event => {
  store.dispatch(handleEvent(event));
});

registerServiceWorker();
