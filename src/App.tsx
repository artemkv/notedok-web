import "./App.css";
import "./components/ClientArea";
import ClientArea from "./components/ClientArea";
import CognitoSignin from "./components/CognitoSignIn";
import { AppState, AuthenticationStatus } from "./model";

function App(props: { state: AppState }) {
  const state = props.state;

  if (state.auth === AuthenticationStatus.Unauthenticated) {
    return <CognitoSignin />;
  }

  return <ClientArea state={state} />;
}

export default App;
