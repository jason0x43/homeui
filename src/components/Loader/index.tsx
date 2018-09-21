import * as React from 'react';

import * as styles from './index.module.css';

export default function Loader(props: LoaderProps) {
  const { inline, type, height } = props;
  const classes = [styles.root];
  if (inline) {
    classes.push(styles.inline);
  }

  return (
    <div
      className={classes.join(' ')}
      style={{ ['--height']: height ? `${height}px` : undefined }}
    >
      {type === 'rotatingPlane' ? renderRotatingPlane() : renderThreebounce()}
    </div>
  );
}

export interface LoaderProps {
  children?: React.ReactNode;
  type?: 'rotatingPlane' | 'threeBounce';
  height?: number;
  inline?: boolean;
}

function renderThreebounce() {
  return (
    <div className={styles.threeBounce}>
      <div
        className={[styles.threeBounceChild, styles.threeBounceBounce1].join(
          ' '
        )}
      />
      <div
        className={[styles.threeBounceChild, styles.threeBounceBounce2].join(
          ' '
        )}
      />
      <div className={styles.threeBounceChild} />
    </div>
  );
}

function renderRotatingPlane() {
  return <div className={styles.rotatingPlane} />;
}
