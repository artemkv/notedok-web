import TemplateNote from "./TemplateNote";
import "./NoteContainer.css";
import {
  NoteTextEditor,
  NoteList,
  NoteListState,
  NoteTitleEditor,
} from "../model";
import ProgressIndicator from "./ProgressIndicator";
import RegularNote from "./RegularNote";

function NoteContainer(props: {
  noteTitleEditor: NoteTitleEditor;
  noteTextEditor: NoteTextEditor;
  noteList: NoteList;
}) {
  const noteTitleEditor = props.noteTitleEditor;
  const noteTextEditor = props.noteTextEditor;
  const noteList = props.noteList;

  return (
    <div className="notes-outer">
      <div className="notes-inner">
        <TemplateNote
          noteTitleEditor={noteTitleEditor}
          noteTextEditor={noteTextEditor}
        />
        {noteList.state === NoteListState.RetrievingFileList ? (
          <ProgressIndicator />
        ) : (
          <div>
            {noteList.notes.map((note) => (
              <RegularNote
                key={note.id}
                note={note}
                noteTitleEditor={noteTitleEditor}
                noteTextEditor={noteTextEditor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteContainer;
