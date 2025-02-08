import "./Note.css";
import { useContext, useEffect, useRef } from "react";
import AppContext from "../AppContext";
import { EventType } from "../events";
import Empty from "./Empty";
import {
  NoteTextEditor,
  NoteTextEditorState,
  NoteTitleEditor,
  NoteTitleEditorState,
} from "../model";

function TemplateNote(props: {
  noteTitleEditor: NoteTitleEditor;
  noteTextEditor: NoteTextEditor;
}) {
  const { uistrings, dispatch } = useContext(AppContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const noteTitleEditor = props.noteTitleEditor;
  const noteTextEditor = props.noteTextEditor;

  const getNoteTitle = (): string => {
    if (noteTitleEditor.state === NoteTitleEditorState.EditingTemplateNote) {
      return noteTitleEditor.text;
    }
    return "";
  };
  const noteTitle = getNoteTitle();

  const getTextEditorState = (): [boolean, string] => {
    if (noteTextEditor.state === NoteTextEditorState.EditingTemplateNote) {
      return [true, noteTextEditor.text];
    }
    return [false, ""];
  };
  const [isEditingText, editedText] = getTextEditorState();

  const noteTitleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: EventType.TemplateNoteTitleEditorTextChanged,
      newText: e.target.value,
    });
  };

  const noteTitleOnFocus = () => {
    dispatch({
      type: EventType.TitleEditorActivated,
    });
  };

  const noteTitleOnBlur = () => {
    dispatch({
      type: EventType.TemplateNoteTitleUpdated,
      newTitle: noteTitle,
    });
  };

  const onStartNoteTextEditing = () => {
    dispatch({
      type: EventType.TemplateNoteStartTextEditing,
    });
  };

  const noteTextOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({
      type: EventType.NoteTextEditorTextChanged,
      newText: e.target.value,
    });
  };

  // TODO: could do the same thing for the title editing
  const noteTextOnKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      dispatch({
        type: EventType.NoteTextEditorCancelEdit,
      });
    }
  };

  const onCancelNoteTextEditing = () => {
    dispatch({
      type: EventType.NoteTextEditorCancelEdit,
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

  const noteTextPlaceholder = () => {
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
      <div className="note-text-editable-container">
        <textarea
          ref={textareaRef}
          className="note-text-editable text-area-short"
          value={editedText}
          onChange={noteTextOnChange}
          onKeyUp={noteTextOnKeyUp}
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
          id="note_template_title"
          type="text"
          className="note-title"
          value={noteTitle}
          onChange={noteTitleOnChange}
          onFocus={noteTitleOnFocus}
          onBlur={noteTitleOnBlur}
          placeholder={uistrings.TemplateNoteTitlePlaceholder}
          maxLength={50}
        />
        {isEditingText ? textEditor() : noteTextPlaceholder()}
        {isEditingText ? editingNoteControlArea() : <Empty />}
      </div>
    </div>
  );
}

export default TemplateNote;
