import { createContext } from "react";
import { Dispatch } from "./model";
import uistrings from "./uistrings";

const nop: Dispatch = () => {};

const deafultContext = {
  uistrings: uistrings,
  dispatch: nop,
};

const AppContext = createContext(deafultContext);

export default AppContext;
