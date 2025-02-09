import "./App.css";
import "./components/ClientArea";
import ClientArea from "./components/ClientArea";
import CognitoSignin from "./components/CognitoSignIn";
import { AppEvent } from "./events";
import { Dispatch } from "./hooks/useReducer";
import { AppState, AuthenticationStatus } from "./model";

function App(props: { state: AppState; dispatch: Dispatch<AppEvent> }) {
  const state = props.state;
  const dispatch = props.dispatch;

  if (state.auth === AuthenticationStatus.Unauthenticated) {
    return <CognitoSignin dispatch={dispatch} />;
  }

  return <ClientArea state={state} dispatch={dispatch} />;
}

export default App;
