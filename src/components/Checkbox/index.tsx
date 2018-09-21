import * as React from 'react';

import { ReactComponent as Checked } from '../../images/checkbox_checked.svg';
import { ReactComponent as Unchecked } from '../../images/checkbox_unchecked.svg';
import * as styles from './index.module.css';

export default function Checkbox(props: CheckboxProps) {
  const { onChange, label, name, checked, disabled } = props;
  const classes = [styles.root];
  if (disabled) {
    classes.push(styles.disabled);
  }

  return (
    <label className={classes.join(' ')}>
      {checked ? <Checked /> : <Unchecked />}
      <input
        type="checkbox"
        name={name}
        disabled={disabled}
        onChange={onChange}
        checked={onChange ? checked : undefined}
        defaultChecked={onChange ? undefined : checked}
      />
      {label}
    </label>
  );
}

export interface CheckboxProps {
  name: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
}
