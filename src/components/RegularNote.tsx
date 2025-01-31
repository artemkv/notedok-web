import "./Note.css";
import { useContext, useEffect, useRef } from "react";
import {
  NoteTextEditor,
  NoteTextEditorState,
  NoteRegular,
  NoteTitleEditor,
  NoteTitleEditorState,
  NoteState,
  isTitleEditable,
  isTitleSaveable,
  isTextEditable,
  isTextSaveable,
  isDeletable,
} from "../model";
import AppContext from "../AppContext";
import { htmlEscape, renderNoteTextHtml } from "../ui";
import { EventType } from "../events";
import { countLines, selectionIsNotEmpty } from "../util";

// TODO: adjust to all new note types
function RegularNote(props: {
  note: NoteRegular;
  noteTitleEditor: NoteTitleEditor;
  noteTextEditor: NoteTextEditor;
}) {
  const { uistrings, dispatch } = useContext(AppContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const note = props.note;
  const noteTitleEditor = props.noteTitleEditor;
  const noteTextEditor = props.noteTextEditor;

  const getNoteTitle = (): string => {
    if (noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote) {
      if (noteTitleEditor.note === note) {
        return noteTitleEditor.text;
      }
    }
    if (note.state === NoteState.CreatingFromText) {
      return "";
    }
    return note.title;
  };
  const noteTitle = getNoteTitle();

  const getTextEditorState = (): [boolean, string] => {
    if (noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
      if (noteTextEditor.note === note) {
        return [true, noteTextEditor.text];
      }
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

  const noteTitleOnBlur = () => {
    if (isTitleSaveable(note)) {
      dispatch({
        type: EventType.RegularNoteTitleUpdated,
        note,
        newTitle: noteTitle,
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

  const noteTextOnBlur = () => {
    if (isTextSaveable(note)) {
      dispatch({
        type: EventType.RegularNoteTextUpdated,
        note,
        newText: editedText,
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

  // TODO: should I html escape??
  // TODO: cancel editing by esc
  // TODO: Before you had to click anywhere outside of the textarea to finish editing
  //   , now it happens on blur. See if I can restore the old behavior, and if it's actually better
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
          onBlur={noteTextOnBlur}
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

  return (
    <div id={note.id} className="note-outer">
      <div className="note-inner">
        <input
          type="text"
          className="note-title"
          value={noteTitle}
          onChange={noteTitleOnChange}
          onBlur={noteTitleOnBlur}
          placeholder={uistrings.NoteTitlePlaceholder}
          maxLength={50}
        />
        {isEditingText
          ? textEditor()
          : noteText
          ? noteTextReadonly()
          : noteTextPlaceholder()}
        {isEditingText ? editingNoteControlArea() : readonlyNoteControlArea()}
      </div>
    </div>
  );
}

export default RegularNote;
