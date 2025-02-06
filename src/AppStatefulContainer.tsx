import useReducer from "./hooks/useReducer";
import { IntialState } from "./model";
import App from "./App";
import AppContext from "./AppContext";
import uistrings from "./uistrings";
import { Reducer } from "./reducer";
import { InitialCommand } from "./commands";

function AppStatefulContainer() {
  const [state, dispatch] = useReducer(Reducer, IntialState, InitialCommand);

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
