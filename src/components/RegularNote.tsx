import "./Note.css";
import { useContext, useEffect, useRef } from "react";
import { NoteEditor, NoteEditorState, NoteLoaded } from "../model";
import AppContext from "../AppContext";
import { htmlEscape, renderNoteTextHtml } from "../ui";
import { EventType } from "../events";
import { countLines } from "../util";

function RegularNote(props: { note: NoteLoaded; noteEditor: NoteEditor }) {
  const { uistrings, dispatch } = useContext(AppContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const note = props.note;
  const noteEditor = props.noteEditor;

  const getEditorState = (): [boolean, string] => {
    if (noteEditor.state === NoteEditorState.EditingRegularNote) {
      if (noteEditor.note === note) {
        return [true, noteEditor.text];
      }
    }
    return [false, ""];
  };
  const [isEditing, editedText] = getEditorState();

  const onStartNoteTextEditing = () => {
    dispatch({
      type: EventType.RegularNoteStartTextEditing,
      note,
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
      type: EventType.RegularNoteTextUpdated,
      note,
      newText: editedText,
    });
  };

  const onCancelNoteTextEditing = () => {
    dispatch({
      type: EventType.RegularNoteCancelTextEditing,
    });
  };

  const onSaveUpdatedNoteText = () => {
    dispatch({
      type: EventType.RegularNoteTextUpdated,
      note,
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

  const isLongText = () => {
    return countLines(note.text) > 10;
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
        onClick={onStartNoteTextEditing}
      ></div>
    );
  };

  // TODO: should I html escape??
  // TODO: cancel editing by esc
  const textEditor = () => {
    return (
      <div className="note-text-editable-container">
        <textarea
          ref={textareaRef}
          className={`note-text-editable ${
            isLongText() ? "text-area-tall" : "text-area-short"
          }`}
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
