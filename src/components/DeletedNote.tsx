import "./DeletedNote.css";
import { useContext } from "react";
import { NoteDeleted, NoteDeleting, NoteState } from "../model";
import AppContext from "../AppContext";
import { EventType } from "../events";
import { OrbitProgress } from "react-loading-indicators";

function DeletedNote(props: { note: NoteDeleting | NoteDeleted }) {
  const { uistrings, dispatch } = useContext(AppContext);

  const note = props.note;
  const isDeleting = note.state === NoteState.Deleting;

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
