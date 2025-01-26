import "./DeletedNote.css";
import { useContext } from "react";
import { NoteLoaded } from "../model";
import AppContext from "../AppContext";
import { EventType } from "../events";

function DeletedNote(props: { note: NoteLoaded }) {
  const { uistrings, dispatch } = useContext(AppContext);

  const note = props.note;

  const onRestoreNote = () => {
    dispatch({
      type: EventType.NoteRestoreTriggered,
      note,
    });
  };

  return (
    <div id={note.id} className="note-outer deleted-note">
      <div className="note-inner">
        <del>
          <div className="note-title">{note.title}</div>
        </del>
        <div className="note-controlarea">
          <a className="note-button" onClick={onRestoreNote}>
            {uistrings.RestoreButtonText}
          </a>
        </div>
      </div>
    </div>
  );
}

export default DeletedNote;
