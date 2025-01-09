import { useState } from "react";

export type Dispatch<E> = (event: E) => void;
export type Reducer<S, E> = (state: S, event: E) => [S, Command<E>];
export interface Command<E> {
  execute: (dispatch: Dispatch<E>) => void;
}

const useReducer = <S, E>(
  reducer: Reducer<S, E>,
  initialState: S,
  initialCommand: Command<E>
): [S, Dispatch<E>] => {
  const [state, setState] = useState(initialState);

  const dispatch = (event: E) => {
    const [newState, command] = reducer(state, event);

    setState(newState);
    setTimeout(() => command.execute(dispatch), 0);
  };

  setTimeout(() => initialCommand.execute(dispatch), 0);

  return [state, dispatch];
};

export default useReducer;
