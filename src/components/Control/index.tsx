import * as React from 'react';

import * as styles from './index.module.css';

export default function Control(props: ControlProps) {
  return (
    <div className={styles.root}>
      <div className={styles.legend}>{props.label}</div>
      {props.children}
    </div>
  );
}

export interface ControlProps {
  children: React.ReactNode;
  label: string;
}
