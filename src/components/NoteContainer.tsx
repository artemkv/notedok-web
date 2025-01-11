import TemplateNote from "./TemplateNote";
import "./NoteContainer.css";
import { NoteList, NoteListState, TemplateNoteState } from "../model";
import ProgressIndicator from "./ProgressIndicator";
import RegularNote from "./RegularNote";

function NoteContainer(props: {
  templateNoteState: TemplateNoteState;
  noteList: NoteList;
}) {
  const templateNoteState = props.templateNoteState;
  const noteList = props.noteList;

  return (
    <div className="notes-outer">
      <div className="notes-inner">
        <TemplateNote state={templateNoteState} />
        {noteList.state === NoteListState.RetrievingFileList ? (
          <ProgressIndicator />
        ) : (
          <div>
            {noteList.notes.map((note) => (
              <RegularNote key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteContainer;
