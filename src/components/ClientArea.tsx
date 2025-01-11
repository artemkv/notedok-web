import { AppState } from "../model";
import "./ClientArea.css";
import Footer from "./Footer";
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
        <Footer noteList={noteList} />
      </div>
    </div>
  );
}

export default ClientArea;
