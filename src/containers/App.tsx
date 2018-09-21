import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';

import { getError } from '../reducers';
import { setError } from '../actions';
import { State } from '../types';
import App, { AppProps } from '../components/App';

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(function AppContainer(
    props: AppProps & RouteComponentProps<{}>
  ) {
    return <App clearError={props.clearError} error={props.error} />;
  })
);

function mapStateToProps(state: State): Pick<AppProps, 'error'> {
  return {
    error: getError(state)
  };
}

function mapDispatchToProps(
  dispatch: Dispatch<State>
): Pick<AppProps, 'clearError'> {
  return {
    clearError() {
      dispatch(setError(null));
    }
  };
}
