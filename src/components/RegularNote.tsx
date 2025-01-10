import "./Note.css";
import { useContext } from "react";
import { Note } from "../state";
import AppContext from "../AppContext";

function RegularNote(props: { note: Note }) {
  const { uistrings } = useContext(AppContext);

  const note = props.note;

  // TODO: do I need to htmlEscape??
  // TODO: render formatted
  // TODO: maybe extract text rendering into helper functions
  return (
    <div id={note.id} className="note-outer">
      <div className="note-inner">
        <input
          type="text"
          className="note-title"
          value={note.title}
          placeholder={uistrings.NoteTitlePlaceholder}
          maxLength={50}
        />
        {note.text ? (
          <div className="note-text" tabIndex={0}>
            {note.text}
          </div>
        ) : (
          <div className="note-text" tabIndex={0}>
            <span className="placeholder">
              <span className="placeholder">
                {uistrings.NoteTextPlaceholder}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegularNote;

// TODO: buttons
/*
          <a
            href="javascript:void(0);"
            className="note-button note-button-share"
          >
            {uistrings.ShareButtonText}
          </a>
          <a
            href="javascript:void(0);"
            className="note-button note-button-edit"
          >
            {uistrings.EditButtonText}
          </a>
          <a
            href="javascript:void(0);"
            className="note-button note-button-delete"
          >
            {uistrings.DeleteButtonText}
          </a>
*/
