import "./Note.css";
import { memo, useEffect, useRef } from "react";
import {
  NoteRegular,
  NoteState,
  isTitleEditable,
  isTitleSaveable,
  isTextEditable,
  isTextSaveable,
  isDeletable,
  isPendingStorageUpdate,
  EditableText,
  ModifiedState,
  AutoSuggestHashTag,
} from "../model";
import { htmlEscape, renderNoteTextHtml } from "../ui";
import { AppEvent, EventType } from "../events";
import { countLines, selectionIsNotEmpty } from "../util";
import { OrbitProgress } from "react-loading-indicators";
import ErrorIcon from "../assets/error_outline.svg";
import Empty from "./Empty";
import { Dispatch } from "../hooks/useReducer";
import uistrings from "../uistrings";
import NoteTitleAutocomplete from "./NoteTitleAutocomplete";

const RegularNote = memo(function RegularNote(props: {
  note: NoteRegular;
  titleEditable: EditableText;
  textEditable: EditableText;
  autoSuggestHashTags: AutoSuggestHashTag[];
  dispatch: Dispatch<AppEvent>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const note = props.note;
  const dispatch = props.dispatch;

  const isBusy = isPendingStorageUpdate(note);
  const hasError = note.state === NoteState.OutOfSync;
  const errorText = hasError ? note.err : "";
  const titleEditable = props.titleEditable;
  const textEditable = props.textEditable;
  const autoSuggestHashTags = props.autoSuggestHashTags;

  const getNoteTitle = (): string => {
    if (titleEditable.state === ModifiedState.ModifiedValue) {
      return titleEditable.newValue;
    }
    if (note.state === NoteState.CreatingFromText) {
      return "";
    }
    return note.title;
  };
  const noteTitle = getNoteTitle();

  const getTextEditorState = (): [boolean, string] => {
    if (textEditable.state === ModifiedState.ModifiedValue) {
      return [true, textEditable.newValue];
    }
    return [false, ""];
  };
  const [isEditingText, editedText] = getTextEditorState();

  const getReadOnlyText = (): string => {
    if (note.state === NoteState.CreatingFromTitle) {
      return "";
    }
    return note.text;
  };
  const noteText = getReadOnlyText();

  const noteTitleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTitleEditable(note)) {
      dispatch({
        type: EventType.RegularNoteTitleEditorTextChanged,
        note,
        newText: e.target.value,
      });
    }
  };

  const noteTitleOnFocus = () => {
    dispatch({
      type: EventType.TitleEditorActivated,
    });
  };

  const noteTitleOnBlur = () => {
    if (isTitleSaveable(note)) {
      dispatch({
        type: EventType.RegularNoteTitleUpdated,
        note,
        newTitle: noteTitle,
      });
    }
  };

  const noteTitleOnKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      dispatch({
        type: EventType.TitleEditorCancelEdit,
      });
    }
  };

  const noteTextOnClick = (e: React.SyntheticEvent) => {
    const element = e.target as HTMLElement;

    if (element.nodeName.toUpperCase() !== "A") {
      onStartNoteTextEditing();
    }
  };

  const onStartNoteTextEditing = () => {
    if (selectionIsNotEmpty()) {
      return;
    }

    if (isTextEditable(note)) {
      dispatch({
        type: EventType.RegularNoteStartTextEditing,
        note,
      });
    }
  };

  const noteTextOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isTextEditable(note)) {
      dispatch({
        type: EventType.NoteTextEditorTextChanged,
        newText: e.target.value,
      });
    }
  };

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
    if (isTextSaveable(note)) {
      dispatch({
        type: EventType.RegularNoteTextUpdated,
        note,
        newText: editedText,
      });
    }
  };

  const onDeleteNote = () => {
    if (isDeletable(note)) {
      dispatch({
        type: EventType.NoteDeleteTriggered,
        note,
      });
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

  const isLongText = () => {
    if (note.state === NoteState.CreatingFromTitle) {
      return false;
    }

    return countLines(note.text) > 10;
  };

  const noteTextPlaceholder = () => {
    return (
      <div className="note-text" tabIndex={0} onClick={onStartNoteTextEditing}>
        <span className="placeholder">{uistrings.NoteTextPlaceholder}</span>
      </div>
    );
  };

  const noteTextReadonly = () => {
    return (
      <div
        className="note-text"
        tabIndex={0}
        dangerouslySetInnerHTML={{
          __html: renderNoteTextHtml(htmlEscape(noteText)),
        }}
        onClick={noteTextOnClick}
      ></div>
    );
  };

  const textEditor = () => {
    return (
      <div className="note-text-editable-container">
        <textarea
          ref={textareaRef}
          className={`note-text-editable ${
            isLongText() ? "text-area-tall" : "text-area-short"
          }`}
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

  const noteTextElement = () => {
    if (isEditingText) {
      return textEditor();
    }
    if (noteText) {
      return noteTextReadonly();
    }
    return noteTextPlaceholder();
  };

  const controlArea = () => {
    if (isBusy) {
      return busyNoteControlArea();
    }
    if (isEditingText) {
      return editingNoteControlArea();
    }
    return readonlyNoteControlArea();
  };

  const busyNoteControlArea = () => {
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

  const readonlyNoteControlArea = () => {
    return (
      <div className="note-controlarea">
        <a className="note-button" onClick={onStartNoteTextEditing}>
          {uistrings.EditButtonText}
        </a>
        <a className="note-button" onClick={onDeleteNote}>
          {uistrings.DeleteButtonText}
        </a>
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

  // TODO: maybe better tooltip
  // TODO: maybe allow copying the error
  const noteError = () => {
    return (
      <div className="note-error">
        <img className="note-error-icon" src={ErrorIcon} title={errorText} />
        <input
          type="text"
          className="note-error-text"
          value={errorText}
          readOnly
        />
      </div>
    );
  };

  return (
    <div id={note.id} className="note-outer">
      {hasError ? noteError() : Empty()}
      <div className="note-inner">
        <input
          id={`${note.id}_title`}
          type="text"
          className="note-title"
          value={noteTitle}
          onChange={noteTitleOnChange}
          onFocus={noteTitleOnFocus}
          onBlur={noteTitleOnBlur}
          onKeyUp={noteTitleOnKeyUp}
          placeholder={uistrings.NoteTitlePlaceholder}
          maxLength={50}
        />
        <NoteTitleAutocomplete
          noteTitleId={`${note.id}_title`}
          autoSuggestHashTags={autoSuggestHashTags}
        />
        {noteTextElement()}
        {controlArea()}
      </div>
    </div>
  );
});

export default RegularNote;
