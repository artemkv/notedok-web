import { AppEvent } from "../events";
import { Dispatch } from "../hooks/useReducer";
import { NoteList, NoteListState } from "../model";
import Empty from "./Empty";
import "./Footer.css";
import MoreButton from "./MoreButton";

function Footer(props: { noteList: NoteList; dispatch: Dispatch<AppEvent> }) {
  const noteList = props.noteList;
  const dispatch = props.dispatch;

  let notesNotYetLoadedTotal = 0;
  if (noteList.state === NoteListState.FileListRetrieved) {
    notesNotYetLoadedTotal = noteList.unprocessedFiles.length;
  }

  return (
    <div className="footer-outer">
      <div className="footer-inner">
        <div className="more-button-container">
          {notesNotYetLoadedTotal > 0 ? (
            <MoreButton
              notesNotYetLoadedTotal={notesNotYetLoadedTotal}
              dispatch={dispatch}
            />
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </div>
  );
}

export default Footer;
