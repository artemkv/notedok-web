import TemplateNote from "./TemplateNote";
import "./NoteContainer.css";
import {
  NoteEditor,
  NoteEditorState,
  NoteList,
  NoteListState,
  NoteLoaded,
} from "../model";
import ProgressIndicator from "./ProgressIndicator";
import RegularNote from "./RegularNote";

function NoteContainer(props: { noteList: NoteList; noteEditor: NoteEditor }) {
  const noteEditor = props.noteEditor;
  const noteList = props.noteList;

  const isEditing = (note: NoteLoaded) => {
    if (noteEditor.state === NoteEditorState.EditingRegularNote) {
      if (noteEditor.note === note) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="notes-outer">
      <div className="notes-inner">
        <TemplateNote noteEditor={noteEditor} />
        {noteList.state === NoteListState.RetrievingFileList ? (
          <ProgressIndicator />
        ) : (
          <div>
            {noteList.notes.map((note) => (
              <RegularNote
                key={note.id}
                note={note}
                isEditing={isEditing(note)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteContainer;
