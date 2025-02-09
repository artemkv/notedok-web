import "./DeletedNote.css";
import { NoteDeleted, NoteDeleting, NoteState } from "../model";
import { AppEvent, EventType } from "../events";
import { OrbitProgress } from "react-loading-indicators";
import { Dispatch } from "../hooks/useReducer";
import uistrings from "../uistrings";

function DeletedNote(props: {
  note: NoteDeleting | NoteDeleted;
  dispatch: Dispatch<AppEvent>;
}) {
  const note = props.note;
  const isDeleting = note.state === NoteState.Deleting;
  const dispatch = props.dispatch;

  const onRestoreNote = () => {
    if (note.state === NoteState.Deleted) {
      dispatch({
        type: EventType.NoteRestoreTriggered,
        note,
      });
    }
  };

  const controlArea = () => {
    if (isDeleting) {
      return deletingNoteControlArea();
    }
    return deletedNoteControlArea();
  };

  const deletingNoteControlArea = () => {
    return (
      <div className="note-progress">
        <OrbitProgress
          variant="dotted"
          color="#a9a9a9"
          style={{ fontSize: "3px" }}
          text=""
          textColor=""
        />
      </div>
    );
  };

  const deletedNoteControlArea = () => {
    return (
      <div className="note-controlarea">
        <a className="note-button" onClick={onRestoreNote}>
          {uistrings.RestoreButtonText}
        </a>
      </div>
    );
  };

  return (
    <div id={note.id} className="note-outer deleted-note">
      <div className="note-inner">
        <del>
          <div className="note-title">{note.title}</div>
        </del>
        {controlArea()}
      </div>
    </div>
  );
}

export default DeletedNote;
