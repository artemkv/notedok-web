import { createContext } from "react";
import uistrings from "./uistrings";
import { AppEvent } from "./events";
import { Dispatch } from "./hooks/useReducer";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const nop: Dispatch<AppEvent> = (_: AppEvent) => {};

const deafultContext = {
  uistrings: uistrings,
  dispatch: nop,
};

const AppContext = createContext(deafultContext);

export default AppContext;
