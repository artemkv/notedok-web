import { useReducer } from "react";
import { Reducer, IntialState } from "./model";
import App from "./App";
import AppContext from "./AppContext";
import uistrings from "./uistrings";

function AppStatefulContainer() {
  const [state, dispatch] = useReducer(Reducer, IntialState);

  const context = {
    uistrings: uistrings,
    dispatch: dispatch,
  };

  return (
    <AppContext.Provider value={context}>
      <App state={state} />
    </AppContext.Provider>
  );
}

export default AppStatefulContainer;
