import "./Note.css";
import { memo, useCallback, useEffect, useRef } from "react";
import {
  NoteRegular,
  NoteState,
  isTitleEditable,
  isTitleSaveable,
  isTextEditable,
  isTextSaveable,
  isDeletable,
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

  const isPendingTitleUpdate = (note: NoteRegular) => {
    return note.state === NoteState.Renaming;
  };
  const isPendingTextUpdate = (note: NoteRegular) => {
    return (
      note.state === NoteState.SavingText ||
      note.state === NoteState.Restoring ||
      note.state === NoteState.CreatingFromTitle || // prevents showing "Save" button until saved
      note.state === NoteState.CreatingFromText
    );
  };
  const isBusyTitle = isPendingTitleUpdate(note);
  const isBusyText = isPendingTextUpdate(note);

  const hasError = note.state === NoteState.OutOfSync;
  const errorText = hasError ? note.err : "";
  const titleEditable = props.titleEditable;
  const textEditable = props.textEditable;
  const autoSuggestHashTags = props.autoSuggestHashTags;

  const getTitleEditorState = (): [boolean, string] => {
    if (titleEditable.state === ModifiedState.ModifiedValue) {
      return [true, titleEditable.newValue];
    }
    if (note.state === NoteState.CreatingFromText) {
      return [false, ""];
    }
    return [false, note.title];
  };
  const [isEditingTitle, noteTitle] = getTitleEditorState();

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
        type: EventType.NoteTitleEditorTextChanged,
        newText: e.target.value,
      });
    }
  };

  const noteTitleOnClick = () => {
    if (isTitleEditable(note) && !isEditingTitle) {
      dispatch({
        type: EventType.RegularNoteStartTitleEditing,
        note,
      });
    }
  };

  const onTitleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isTitleSaveable(note)) {
      dispatch({
        type: EventType.RegularNoteTitleUpdated,
        note,
        newTitle: noteTitle,
      });
    }
    e.preventDefault();
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
      if (isEditingTitle) {
        dispatch({
          type: EventType.NoteTitleEditorTextChanged,
          newText,
        });
      }
    },
    [dispatch, isEditingTitle]
  );

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
    if (isBusyText) {
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
      {hasError ? noteError() : <Empty />}
      <div className="note-inner">
        <div className="note-title-outer">
          <div className="note-title-container">
            <form className="note-title-form" onSubmit={onTitleSubmit}>
              <input
                readOnly={!isEditingTitle}
                id={`${note.id}_title`}
                type="text"
                className="note-title"
                value={noteTitle}
                onChange={noteTitleOnChange}
                onClick={noteTitleOnClick}
                onKeyUp={noteTitleOnKeyUp}
                placeholder={uistrings.NoteTitlePlaceholder}
                maxLength={50}
              />
            </form>
            <div className="note-title-progress-container">
              {isBusyTitle ? (
                <div className="note-title-progress">
                  <OrbitProgress
                    variant="dotted"
                    color="#a9a9a9"
                    style={{ fontSize: "3px" }}
                    text=""
                    textColor=""
                  />
                </div>
              ) : (
                <Empty />
              )}
            </div>
          </div>
          <div
            className={
              isEditingTitle
                ? "note-title-editable-underline"
                : "note-title-underline"
            }
          ></div>
        </div>
        <NoteTitleAutocomplete
          noteTitleId={`${note.id}_title`}
          autoSuggestHashTags={autoSuggestHashTags}
          onAutocomplete={noteTitleAutoComplete}
        />
        {noteTextElement()}
        {controlArea()}
      </div>
    </div>
  );
});

export default RegularNote;
