import "./Note.css";
import { memo, useCallback, useEffect, useRef } from "react";
import { AppEvent, EventType } from "../events";
import Empty from "./Empty";
import { AutoSuggestHashTag, EditableText, ModifiedState } from "../model";
import { Dispatch } from "../hooks/useReducer";
import uistrings from "../uistrings";
import NoteTitleAutocomplete from "./NoteTitleAutocomplete";

const TemplateNote = memo(function TemplateNote(props: {
  titleEditable: EditableText;
  textEditable: EditableText;
  autoSuggestHashTags: AutoSuggestHashTag[];
  dispatch: Dispatch<AppEvent>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const titleEditable = props.titleEditable;
  const textEditable = props.textEditable;
  const autoSuggestHashTags = props.autoSuggestHashTags;
  const dispatch = props.dispatch;

  const getTitleEditorState = (): [boolean, string] => {
    if (titleEditable.state === ModifiedState.ModifiedValue) {
      return [true, titleEditable.newValue];
    }
    return [false, ""];
  };
  const [isEditingTitle, noteTitle] = getTitleEditorState();

  const getTextEditorState = (): [boolean, string] => {
    if (textEditable.state === ModifiedState.ModifiedValue) {
      return [true, textEditable.newValue];
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
    if (!isEditingTitle) {
      dispatch({
        type: EventType.TemplateNoteTitleEditorActivated,
      });
    }
  };

  // TODO: the only thing that does not work with this, is picking autocomplete with mouse
  // TODO: need to find the way to tackle this
  const noteTitleOnBlur = () => {
    dispatch({
      type: EventType.TemplateNoteTitleUpdated,
      newTitle: noteTitle,
    });
  };

  const noteTitleOnKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      dispatch({
        type: EventType.NoteTitleEditorCancelEdit,
      });
    }
  };

  const noteTitleAutoComplete = useCallback(
    (newText: string) => {
      dispatch({
        type: EventType.TemplateNoteTitleEditorTextChanged,
        newText,
      });
    },
    [dispatch]
  );

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

  const noteTextOnKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      dispatch({
        type: EventType.NoteTextEditorCancelEdit,
      });
    }
  };

  const noteCancelButtonOnClick = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      dispatch({
        type: EventType.NoteTextEditorCancelEdit,
      });
      e.preventDefault();
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

  const noteSaveButtonOnClick = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      dispatch({
        type: EventType.TemplateNoteTextUpdated,
        newText: editedText,
      });
      e.preventDefault();
    }
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
      <div className="note-text" onClick={onStartNoteTextEditing}>
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
        <a
          className="note-button"
          tabIndex={0}
          onClick={onSaveUpdatedNoteText}
          onKeyDown={noteSaveButtonOnClick}
        >
          {uistrings.SaveButtonText}
        </a>
        <a
          className="note-button"
          tabIndex={0}
          onClick={onCancelNoteTextEditing}
          onKeyDown={noteCancelButtonOnClick}
        >
          {uistrings.CancelButtonText}
        </a>
      </div>
    );
  };

  return (
    <div id="note_template" className="note-outer">
      <div className="note-inner">
        <div className="note-title-container">
          <input
            id="note_template_title"
            type="text"
            className="note-title"
            value={noteTitle}
            onChange={noteTitleOnChange}
            onFocus={noteTitleOnFocus}
            onBlur={noteTitleOnBlur}
            onKeyUp={noteTitleOnKeyUp}
            placeholder={uistrings.TemplateNoteTitlePlaceholder}
            maxLength={50}
          />
        </div>
        <NoteTitleAutocomplete
          noteTitleId="note_template_title"
          autoSuggestHashTags={autoSuggestHashTags}
          onAutocomplete={noteTitleAutoComplete}
        />
        {isEditingText ? textEditor() : noteTextPlaceholder()}
        {isEditingText ? editingNoteControlArea() : <Empty />}
      </div>
    </div>
  );
});

export default TemplateNote;
