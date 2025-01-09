import { AppState } from "../state";
import "./ClientArea.css";
import NoteContainer from "./NoteContainer";
import SearchPanel from "./SearchPanel";

function ClientArea(props: { state: AppState }) {
  const templateNoteState = props.state.templateNoteState;
  const noteList = props.state.noteList;

  return (
    <div className="client-area-outer">
      <div className="client-area-inner">
        <SearchPanel />
        <NoteContainer
          noteList={noteList}
          templateNoteState={templateNoteState}
        />
      </div>
    </div>
  );
}

export default ClientArea;
