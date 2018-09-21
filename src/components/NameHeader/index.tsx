import * as React from 'react';

import * as styles from './index.module.css';
import * as baseStyles from '../../base.module.css';
import { ReactComponent as Back } from '../../images/back.svg';
import { ReactComponent as Cancel } from '../../images/cancel.svg';
import { ReactComponent as Check } from '../../images/check.svg';
import { ReactComponent as Trash } from '../../images/trash.svg';

export default function NameHeader(props: NameHeaderProps) {
  return (
    <div className={styles.root}>
      <button
        className={[baseStyles.nakedButton, styles.back].join(' ')}
        onClick={props.back}
      >
        <Back />
      </button>
      {props.editingName ? (
        <form action="#" onSubmit={props.saveName}>
          <input
            autoFocus={true}
            type="text"
            name="name"
            value={props.name}
            onChange={props.onChange}
          />
          <button
            className={baseStyles.nakedButton}
            onClick={props.editName}
            type="button"
          >
            <Cancel />
          </button>
          <button className={baseStyles.nakedButton} type="submit">
            <Check />
          </button>
        </form>
      ) : (
        <h1 onClick={props.editName}>{props.name}</h1>
      )}
      {props.delete && (
        <button
          onClick={props.delete}
          className={[styles.right, baseStyles.nakedButton].join(' ')}
        >
          <Trash />
        </button>
      )}
    </div>
  );
}

export interface NameHeaderProps {
  name: string;
  editingName?: boolean;
  back?: (event: React.SyntheticEvent<HTMLElement>) => void;
  editName?: (event: React.SyntheticEvent<HTMLElement>) => void;
  saveName?: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  delete?: (event: React.SyntheticEvent<HTMLElement>) => void;
  onChange?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
}
