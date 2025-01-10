import { useState, useEffect, useCallback } from "react";

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

  const dispatch = useCallback(
    (event: E) => {
      setState((state) => {
        const [newState, command] = reducer(state, event);

        setTimeout(() => {
          command.execute(dispatch);
        }, 0);

        return newState;
      });
    },
    [reducer]
  );

  useEffect(() => {
    setTimeout(() => {
      initialCommand.execute(dispatch);
    }, 0);
  }, [initialCommand, dispatch]);

  return [state, dispatch];
};

export default useReducer;
