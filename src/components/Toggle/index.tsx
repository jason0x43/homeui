import * as React from 'react';

import * as styles from './index.module.css';

export default function Toggle(props: ToggleProps) {
  return (
    <label className={styles.root}>
      <input
        type="checkbox"
        name={props.name}
        checked={props.checked}
        onChange={props.onChange}
      />
      <span className={styles.toggle} />
      {props.label}
    </label>
  );
}

export interface ToggleProps {
  name: string;
  checked?: boolean;
  label?: string;
  onChange?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
  className?: string;
}
