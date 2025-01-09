import { AppState } from "../model";
import "./ClientArea.css";
import NoteContainer from "./NoteContainer";
import SearchPanel from "./SearchPanel";

function ClientArea(props: { state: AppState }) {
  const templateNoteState = props.state.templateNoteState;

  return (
    <div className="client-area-outer">
      <div className="client-area-inner">
        <SearchPanel />
        <NoteContainer templateNoteState={templateNoteState} />
      </div>
    </div>
  );
}

export default ClientArea;
