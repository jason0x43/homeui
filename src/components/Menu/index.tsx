import * as React from 'react';

import * as styles from './index.module.css';
import { ReactComponent as Settings } from '../../images/settings.svg';

export default class Menu extends React.Component<MenuProps, MenuState> {
  private _renderTimer: number | undefined;

  constructor(props: MenuProps) {
    super(props);
    this.state = { rendered: false };
  }

  componentDidUpdate() {
    // We need to add the 'rendered' class, which sets the
    // `-webkit-overflow-scrolling` CSS attribute, after the component has
    // been rendered without it. We can't leave the attribute on all the
    // time because if it's set on a component that dynamically becomes
    // tall enough to need scrolling, the container becomes unscrollable.
    // (See
    // http://patrickmuff.ch/blog/2014/10/01/how-we-fixed-the-webkit-overflow-scrolling-touch-bug-on-ios/)
    if (!this.state.rendered) {
      this._renderTimer = setTimeout(() => {
        this._renderTimer = undefined;
        this.setState({ rendered: true });
      });
    }
  }

  componentWillUnmount() {
    if (this._renderTimer) {
      clearTimeout(this._renderTimer);
      this._renderTimer = undefined;
    }
  }

  componentWillReceiveProps(newProps: MenuProps) {
    if (newProps.options !== this.props.options) {
      this.setState({ rendered: false });
    }
  }

  render() {
    const {
      clickSelector,
      activeSelector,
      selectors,
      options,
      onSelect
    } = this.props;
    const popupClasses = [styles.popup];
    if (this.state.rendered) {
      popupClasses.push(styles.popupRendered);
    }

    return (
      <React.Fragment>
        {activeSelector &&
          options && (
            <div className={popupClasses.join(' ')}>
              <ul className={styles.options}>
                {isOptionsArray(options)
                  ? options.map(({ value, label, edit }) => (
                      <li className={styles.option} key={value}>
                        <div
                          onClick={onSelect}
                          data-value={value}
                          className={styles.optionText}
                        >
                          {label || value}
                        </div>
                        {edit && (
                          <div
                            className={styles.optionIcon}
                            onClick={edit}
                            data-value={value}
                          >
                            <Settings width={16} />
                          </div>
                        )}
                      </li>
                    ))
                  : options}
              </ul>
            </div>
          )}
        <div className={styles.root}>
          {selectors.map(selector => {
            const { name, Icon } = selector;
            return (
              <button
                name={name}
                key={name}
                className={activeSelector === name ? styles.active : undefined}
                onClick={clickSelector}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}

export interface MenuProps {
  selectors: Selector[];
  options?: MenuOption[] | React.ReactNode;
  activeSelector?: string;
  clickSelector?: (event: React.SyntheticEvent<HTMLElement>) => void;
  onSelect(event: React.SyntheticEvent<HTMLElement>): void;
}

export interface Selector {
  name: string;
  Icon: new (props: {}) => React.Component<{}>;
}

export interface MenuState {
  rendered: boolean;
}

export interface MenuOption {
  value: string;
  label?: string;
  edit?: (event: React.SyntheticEvent<HTMLElement>) => void;
}

// tslint:disable-next-line:no-any
function isOptionsArray(value: any): value is MenuOption[] {
  return Array.isArray(value);
}
