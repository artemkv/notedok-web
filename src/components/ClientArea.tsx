import { AppEvent } from "../events";
import { Dispatch } from "../hooks/useReducer";
import { AppStateAuthenticated, SearchAutoSuggestState } from "../model";
import "./ClientArea.css";
import Footer from "./Footer";
import NoteContainer from "./NoteContainer";
import SearchPanel from "./SearchPanel";

function ClientArea(props: {
  state: AppStateAuthenticated;
  dispatch: Dispatch<AppEvent>;
}) {
  const searchText = props.state.searchText;
  const noteTitleEditor = props.state.noteTitleEditor;
  const noteTextEditor = props.state.noteTextEditor;
  const noteList = props.state.noteList;
  const dispatch = props.dispatch;

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
          dispatch={dispatch}
        />
        <NoteContainer
          noteTitleEditor={noteTitleEditor}
          noteTextEditor={noteTextEditor}
          noteList={noteList}
          dispatch={dispatch}
        />
        <Footer noteList={noteList} dispatch={dispatch} />
      </div>
    </div>
  );
}

export default ClientArea;
