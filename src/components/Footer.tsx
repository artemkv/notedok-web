import { NoteList, NoteListState } from "../state";
import "./Footer.css";
import MoreButton from "./MoreButton";

function Footer(props: { noteList: NoteList }) {
  const noteList = props.noteList;

  let notesNotYetLoadedTotal = 0;
  if (noteList.state === NoteListState.FileListRetrieved) {
    notesNotYetLoadedTotal = noteList.unprocessedFiles.fileList.length;
  }

  return (
    <div className="footer-outer">
      <div className="footer-inner">
        <div className="more-button-container">
          <MoreButton notesNotYetLoadedTotal={notesNotYetLoadedTotal} />
        </div>
      </div>
    </div>
  );
}

export default Footer;
