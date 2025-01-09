import "./App.css";
import "./components/ClientArea";
import ClientArea from "./components/ClientArea";
import { AppState } from "./model";

function App(props: { state: AppState }) {
  const state = props.state;

  return <ClientArea state={state} />;
}

export default App;
