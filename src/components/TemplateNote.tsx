import "./Note.css";
import { NoteEditor, NoteEditorState } from "../model";
import { useContext } from "react";
import AppContext from "../AppContext";
import { EventType } from "../events";

// TODO: where to put the CSS that are common with note?

function TemplateNote(props: { noteEditor: NoteEditor }) {
  const { uistrings, dispatch } = useContext(AppContext);

  const noteEditor = props.noteEditor;

  const onStartNoteTextEditing = () => {
    dispatch({
      type: EventType.TemplateNoteStartTextEditing,
    });
  };

  const onCancelNoteTextEditing = () => {
    dispatch({
      type: EventType.TemplateNoteCancelTextEditing,
    });
  };

  const placeHolder = () => {
    return (
      <div className="note-text" tabIndex={0} onClick={onStartNoteTextEditing}>
        <span className="placeholder">
          {uistrings.TemplateNoteNoteTextPlaceholder}
        </span>
      </div>
    );
  };

  const textEditor = () => {
    return (
      <div>
        <div className="note-text-editable-container">
          <textarea className="note-text-editable text-area-short"></textarea>
          <button className="note-save-button">
            {uistrings.SaveButtonText}
          </button>
        </div>
        <div className="note-controlarea">
          <a className="note-button">{uistrings.SaveButtonText}</a>
          <a className="note-button" onClick={onCancelNoteTextEditing}>
            {uistrings.CancelButtonText}
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="note-outer">
      <div className="note-inner">
        <input
          type="text"
          className="note-title"
          placeholder={uistrings.TemplateNoteTitlePlaceholder}
          maxLength={50}
        />
        {noteEditor.state === NoteEditorState.EditingTemplateNote
          ? textEditor()
          : placeHolder()}
      </div>
    </div>
  );
}

export default TemplateNote;
