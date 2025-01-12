import { AppState } from "../model";
import "./ClientArea.css";
import Footer from "./Footer";
import NoteContainer from "./NoteContainer";
import SearchPanel from "./SearchPanel";

function ClientArea(props: { state: AppState }) {
  const noteEditor = props.state.noteEditor;
  const noteList = props.state.noteList;

  return (
    <div className="client-area-outer">
      <div className="client-area-inner">
        <SearchPanel />
        <NoteContainer noteList={noteList} noteEditor={noteEditor} />
        <Footer noteList={noteList} />
      </div>
    </div>
  );
}

export default ClientArea;
