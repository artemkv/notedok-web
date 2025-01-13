import "./Note.css";
import { useContext, useEffect, useRef } from "react";
import AppContext from "../AppContext";
import { EventType } from "../events";
import Empty from "./Empty";
import { NoteEditor, NoteEditorState } from "../model";

function TemplateNote(props: { noteEditor: NoteEditor }) {
  const { uistrings, dispatch } = useContext(AppContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const noteEditor = props.noteEditor;

  const getEditorState = (): [boolean, string] => {
    if (noteEditor.state === NoteEditorState.EditingTemplateNote) {
      return [true, noteEditor.text];
    }
    return [false, ""];
  };
  const [isEditing, editedText] = getEditorState();

  const onStartNoteTextEditing = () => {
    dispatch({
      type: EventType.TemplateNoteStartTextEditing,
    });
  };

  const textAreaValueOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({
      type: EventType.NoteEditorTextChanged,
      newText: e.target.value,
    });
  };

  const textAreaValueOnBlur = () => {
    dispatch({
      type: EventType.TemplateNoteTextUpdated,
      newText: editedText,
    });
  };

  const onCancelNoteTextEditing = () => {
    dispatch({
      type: EventType.TemplateNoteCancelTextEditing,
    });
  };

  const onSaveUpdatedNoteText = () => {
    dispatch({
      type: EventType.TemplateNoteTextUpdated,
      newText: editedText,
    });
  };

  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    focusTextarea();
  });

  const placeHolder = () => {
    return (
      <div className="note-text" tabIndex={0} onClick={onStartNoteTextEditing}>
        <span className="placeholder">
          {uistrings.TemplateNoteNoteTextPlaceholder}
        </span>
      </div>
    );
  };

  // TODO: cancel editing by esc
  const textEditor = () => {
    return (
      <div className="note-text-editable-container">
        <textarea
          ref={textareaRef}
          className="note-text-editable text-area-short"
          value={editedText}
          onChange={textAreaValueOnChange}
          onBlur={textAreaValueOnBlur}
        ></textarea>
      </div>
    );
  };

  // TODO: this is only on tablets I guess, review
  /*
          <button className="note-save-button">
            {uistrings.SaveButtonText}
          </button>
  */

  const editingNoteControlArea = () => {
    return (
      <div className="note-controlarea">
        <a className="note-button" onClick={onSaveUpdatedNoteText}>
          {uistrings.SaveButtonText}
        </a>
        <a className="note-button" onClick={onCancelNoteTextEditing}>
          {uistrings.CancelButtonText}
        </a>
      </div>
    );
  };

  return (
    <div id="note_template" className="note-outer">
      <div className="note-inner">
        <input
          type="text"
          className="note-title"
          placeholder={uistrings.TemplateNoteTitlePlaceholder}
          maxLength={50}
        />
        {isEditing ? textEditor() : placeHolder()}
        {isEditing ? editingNoteControlArea() : <Empty />}
      </div>
    </div>
  );
}

export default TemplateNote;
