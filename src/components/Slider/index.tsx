import * as React from 'react';

import * as styles from './index.module.css';

export default function Slider(props: SliderProps) {
  const { value, min = 0, max } = props;
  const labelClasses = [styles.label];
  if (value < min + (max - min) / 2) {
    labelClasses.push(styles.right);
  }

  return (
    <label className={styles.root}>
      <input
        type="range"
        name={props.name}
        min={min}
        max={max}
        value={value}
        onChange={props.onChange}
      />
      <span className={labelClasses.join(' ')}>{props.label}</span>
    </label>
  );
}

export interface SliderProps {
  max: number;
  value: number;
  name: string;
  label?: string;
  onChange?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
  className?: string;
  min?: number;
}
