import * as React from 'react';

import * as styles from './index.module.css';

export default function Loading() {
  return (
    <div className={styles.root}>
      <div className={styles.dot1} />
      <div className={styles.dot2} />
      <div />
    </div>
  );
}
