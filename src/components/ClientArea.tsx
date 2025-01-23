import { AppState } from "../model";
import "./ClientArea.css";
import Footer from "./Footer";
import NoteContainer from "./NoteContainer";
import SearchPanel from "./SearchPanel";

function ClientArea(props: { state: AppState }) {
  const noteTitleEditor = props.state.noteTitleEditor;
  const noteTextEditor = props.state.noteTextEditor;
  const noteList = props.state.noteList;

  return (
    <div className="client-area-outer">
      <div className="client-area-inner">
        <SearchPanel />
        <NoteContainer
          noteTitleEditor={noteTitleEditor}
          noteTextEditor={noteTextEditor}
          noteList={noteList}
        />
        <Footer noteList={noteList} />
      </div>
    </div>
  );
}

export default ClientArea;
