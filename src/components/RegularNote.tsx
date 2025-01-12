import "./Note.css";
import { useContext } from "react";
import { NoteLoaded } from "../model";
import AppContext from "../AppContext";
import { htmlEscape, renderNoteTextHtml } from "../ui";
import { EventType } from "../events";

function RegularNote(props: { note: NoteLoaded; isEditing: boolean }) {
  const { uistrings, dispatch } = useContext(AppContext);

  const note = props.note;
  const isEditing = props.isEditing;

  const onStartNoteTextEditing = () => {
    dispatch({
      type: EventType.RegularNoteStartTextEditing,
      data: note,
    });
  };

  const onCancelNoteTextEditing = () => {
    dispatch({
      type: EventType.RegularNoteCancelTextEditing,
    });
  };

  const placeHolder = () => {
    return (
      <div className="note-text" tabIndex={0} onClick={onStartNoteTextEditing}>
        <span className="placeholder">{uistrings.NoteTextPlaceholder}</span>
      </div>
    );
  };

  const noteText = () => {
    return (
      <div
        className="note-text"
        tabIndex={0}
        dangerouslySetInnerHTML={{
          __html: renderNoteTextHtml(htmlEscape(note.text)),
        }}
      ></div>
    );
  };

  // TODO: should I html escape??
  // TODO: the size of text area should adapt
  const textEditor = () => {
    return (
      <div>
        <div className="note-text-editable-container">
          <textarea className="note-text-editable text-area-short">
            {note.text}
          </textarea>
          <button className="note-save-button">
            {uistrings.SaveButtonText}
          </button>
        </div>
      </div>
    );
  };

  const readonlyNoteControlArea = () => {
    return (
      <div className="note-controlarea">
        <a className="note-button">{uistrings.EditButtonText}</a>
      </div>
    );
  };

  const editingNoteControlArea = () => {
    return (
      <div className="note-controlarea">
        <a className="note-button">{uistrings.SaveButtonText}</a>
        <a className="note-button" onClick={onCancelNoteTextEditing}>
          {uistrings.CancelButtonText}
        </a>
      </div>
    );
  };

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
        {isEditing ? textEditor() : note.text ? noteText() : placeHolder()}
        {isEditing ? editingNoteControlArea() : readonlyNoteControlArea()}
      </div>
    </div>
  );
}

export default RegularNote;
