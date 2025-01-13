import TemplateNote from "./TemplateNote";
import "./NoteContainer.css";
import { NoteEditor, NoteList, NoteListState } from "../model";
import ProgressIndicator from "./ProgressIndicator";
import RegularNote from "./RegularNote";

function NoteContainer(props: { noteList: NoteList; noteEditor: NoteEditor }) {
  const noteEditor = props.noteEditor;
  const noteList = props.noteList;

  return (
    <div className="notes-outer">
      <div className="notes-inner">
        <TemplateNote noteEditor={noteEditor} />
        {noteList.state === NoteListState.RetrievingFileList ? (
          <ProgressIndicator />
        ) : (
          <div>
            {noteList.notes.map((note) => (
              <RegularNote key={note.id} note={note} noteEditor={noteEditor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteContainer;
