import * as React from 'react';
import autobind from 'autobind-decorator';

import * as styles from './index.module.css';

export default class Message extends React.Component<
  MessageProps,
  MessageState
> {
  constructor(props: MessageProps) {
    super(props);
    this.state = { hiding: false };
  }

  render() {
    const classes = [styles.root];
    switch (this.props.type) {
      case 'success':
        classes.push(styles.success);
        break;
      case 'error':
        classes.push(styles.error);
        break;
      default:
        break;
    }

    if (this.state.hiding) {
      classes.push(styles.hiding);
    }

    return (
      <div
        className={classes.join(' ')}
        onClick={this.handleClick}
        onTransitionEnd={this.props.onHidden}
      >
        {this.props.content}
      </div>
    );
  }

  @autobind
  handleClick() {
    this.setState({ hiding: true });
  }
}

export interface MessageProps {
  content: string | React.ReactNode;
  type?: 'success' | 'error' | 'info';
  onHidden?: () => void;
}

export interface MessageState {
  hiding: boolean;
}
