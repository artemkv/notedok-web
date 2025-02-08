import { AppStateAuthenticated, SearchAutoSuggestState } from "../model";
import "./ClientArea.css";
import Footer from "./Footer";
import NoteContainer from "./NoteContainer";
import SearchPanel from "./SearchPanel";

function ClientArea(props: { state: AppStateAuthenticated }) {
  const searchText = props.state.searchText;
  const noteTitleEditor = props.state.noteTitleEditor;
  const noteTextEditor = props.state.noteTextEditor;
  const noteList = props.state.noteList;

  const searchAutoSuggestItems =
    props.state.searchAutoSuggest.state === SearchAutoSuggestState.Computed
      ? props.state.searchAutoSuggest.autoSuggestItems
      : [];

  return (
    <div className="client-area-outer">
      <div className="client-area-inner">
        <SearchPanel
          searchText={searchText}
          autoSuggestItems={searchAutoSuggestItems}
        />
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
