export function setError(error: Error | null): SetError {
  return {
    type: SET_ERROR,
    error
  };
}

export interface SetError {
  readonly type: typeof SET_ERROR;
  readonly error: Error | null;
}

export const SET_ERROR = 'SET_ERROR';
