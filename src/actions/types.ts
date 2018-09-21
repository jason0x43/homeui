import { ThunkAction } from 'redux-thunk';
import { State } from '../types';

export type StoreThunk<T = void> = ThunkAction<T, State, void>;
