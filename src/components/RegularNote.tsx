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
import ErrorIcon from "../assets/error_outline.svg";
import Empty from "./Empty";
import { Dispatch } from "../hooks/useReducer";
import uistrings from "../uistrings";
import NoteTitleAutocomplete from "./NoteTitleAutocomplete";
import OrbitProgressIndicator from "./OrbitProgressIndicator";

const RegularNote = memo(function RegularNote(props: {
  note: NoteRegular;
  titleEditable: EditableText;
  textEditable: EditableText;
  autoSuggestHashTags: AutoSuggestHashTag[];
  dispatch: Dispatch<AppEvent>;
}) {
  const note = props.note;
  const titleEditable = props.titleEditable;
  const textEditable = props.textEditable;
  const autoSuggestHashTags = props.autoSuggestHashTags;
  const dispatch = props.dispatch;

  const isPendingTextUpdate =
    note.state === NoteState.SavingText ||
    note.state === NoteState.Restoring ||
    note.state === NoteState.CreatingFromTitle || // prevents showing "Save" button until saved
    note.state === NoteState.CreatingFromText;
  const hasError = note.state === NoteState.OutOfSync;
  const errorText = hasError ? note.err : "";

  const [isEditingText, effectiveNoteText] = (() => {
    if (textEditable.state === ModifiedState.ModifiedValue) {
      return [true, textEditable.newValue];
    }
    if (note.state === NoteState.CreatingFromTitle) {
      return [false, ""];
    }
    return [false, note.text];
  })();

  const noteTextElement = () => {
    if (isEditingText) {
      return (
        <TextEditor
          note={note}
          editedText={effectiveNoteText}
          dispatch={dispatch}
        />
      );
    }
    if (effectiveNoteText) {
      return (
        <NoteTextReadonly
          note={note}
          readOnlyText={effectiveNoteText}
          dispatch={dispatch}
        />
      );
    }
    return <NoteTextPlaceholder note={note} dispatch={dispatch} />;
  };

  const controlArea = () => {
    if (isPendingTextUpdate) {
      return <BusyNoteControlArea />;
    }
    if (isEditingText) {
      return (
        <EditingNoteControlArea
          note={note}
          editedText={effectiveNoteText}
          dispatch={dispatch}
        />
      );
    }
    return <ReadonlyNoteControlArea note={note} dispatch={dispatch} />;
  };

  return (
    <div id={note.id} className="note-outer">
      {hasError ? <NoteError errorText={errorText} /> : <Empty />}
      <div className="note-inner">
        <NoteTitle
          note={note}
          titleEditable={titleEditable}
          autoSuggestHashTags={autoSuggestHashTags}
          dispatch={dispatch}
        />
        {noteTextElement()}
        {controlArea()}
      </div>
    </div>
  );
});

const NoteTitle = memo(
  (props: {
    note: NoteRegular;
    titleEditable: EditableText;
    autoSuggestHashTags: AutoSuggestHashTag[];
    dispatch: Dispatch<AppEvent>;
  }) => {
    const note = props.note;
    const titleEditable = props.titleEditable;
    const autoSuggestHashTags = props.autoSuggestHashTags;
    const dispatch = props.dispatch;

    const isPendingTitleUpdate = note.state === NoteState.Renaming;

    const [isEditingTitle, effectiveNoteTitle] = (() => {
      if (titleEditable.state === ModifiedState.ModifiedValue) {
        return [true, titleEditable.newValue];
      }
      if (note.state === NoteState.CreatingFromText) {
        return [false, ""];
      }
      return [false, note.title];
    })();

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
      if (isTitleEditable(note) && !isEditingTitle) {
        dispatch({
          type: EventType.RegularNoteTitleEditorActivated,
          note,
        });
      }
    };

    // TODO: the only thing that does not work with this, is picking autocomplete with mouse
    // TODO: need to find the way to tackle this
    const noteTitleOnBlur = () => {
      if (isTitleSaveable(note)) {
        dispatch({
          type: EventType.RegularNoteTitleUpdated,
          note,
          newTitle: effectiveNoteTitle,
        });
      }
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
        if (isTitleEditable(note)) {
          dispatch({
            type: EventType.RegularNoteTitleEditorTextChanged,
            note,
            newText,
          });
        }
      },
      [dispatch, note]
    );

    return (
      <>
        <div className="note-title-container">
          <input
            id={`${note.id}_title`}
            type="text"
            className="note-title"
            value={effectiveNoteTitle}
            onChange={noteTitleOnChange}
            onFocus={noteTitleOnFocus}
            onBlur={noteTitleOnBlur}
            onKeyUp={noteTitleOnKeyUp}
            placeholder={uistrings.NoteTitlePlaceholder}
            maxLength={50}
          />
          <div className="note-title-progress-container">
            {isPendingTitleUpdate ? (
              <div className="note-title-progress">
                <OrbitProgressIndicator />
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </div>
        <NoteTitleAutocomplete
          noteTitleId={`${note.id}_title`}
          autoSuggestHashTags={autoSuggestHashTags}
          onAutocomplete={noteTitleAutoComplete}
        />
      </>
    );
  }
);

const onStartNoteTextEditing = (
  note: NoteRegular,
  dispatch: Dispatch<AppEvent>
) => {
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

const NoteTextPlaceholder = memo(
  (props: { note: NoteRegular; dispatch: Dispatch<AppEvent> }) => {
    const note = props.note;
    const dispatch = props.dispatch;

    return (
      <div
        className="note-text"
        onClick={() => onStartNoteTextEditing(note, dispatch)}
      >
        <span className="placeholder">{uistrings.NoteTextPlaceholder}</span>
      </div>
    );
  }
);

const NoteTextReadonly = memo(
  (props: {
    note: NoteRegular;
    readOnlyText: string;
    dispatch: Dispatch<AppEvent>;
  }) => {
    const note = props.note;
    const readOnlyText = props.readOnlyText;
    const dispatch = props.dispatch;

    const noteTextOnClick = (e: React.SyntheticEvent) => {
      const element = e.target as HTMLElement;

      if (element.nodeName.toUpperCase() !== "A") {
        onStartNoteTextEditing(note, dispatch);
      }
    };

    return (
      <div
        className="note-text"
        dangerouslySetInnerHTML={{
          __html: renderNoteTextHtml(htmlEscape(readOnlyText)),
        }}
        onClick={noteTextOnClick}
      ></div>
    );
  }
);

const TextEditor = (props: {
  note: NoteRegular;
  editedText: string;
  dispatch: Dispatch<AppEvent>;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const note = props.note;
  const editedText = props.editedText;
  const dispatch = props.dispatch;

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

const BusyNoteControlArea = memo(() => {
  return (
    <div className="note-progress">
      <OrbitProgressIndicator />
    </div>
  );
});

const ReadonlyNoteControlArea = memo(
  (props: { note: NoteRegular; dispatch: Dispatch<AppEvent> }) => {
    const note = props.note;
    const dispatch = props.dispatch;

    const noteEditButtonOnClick = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        if (isTextEditable(note)) {
          dispatch({
            type: EventType.RegularNoteStartTextEditing,
            note,
          });
        }
        e.preventDefault();
      }
    };

    const noteDeleteButtonOnClick = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        if (isDeletable(note)) {
          dispatch({
            type: EventType.NoteDeleteTriggered,
            note,
          });
        }
        e.preventDefault();
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

    return (
      <div className="note-controlarea">
        <a
          className="note-button"
          tabIndex={0}
          onClick={() => onStartNoteTextEditing(note, dispatch)}
          onKeyDown={noteEditButtonOnClick}
        >
          {uistrings.EditButtonText}
        </a>
        <a
          className="note-button"
          tabIndex={0}
          onClick={onDeleteNote}
          onKeyDown={noteDeleteButtonOnClick}
        >
          {uistrings.DeleteButtonText}
        </a>
      </div>
    );
  }
);

const EditingNoteControlArea = memo(
  (props: {
    note: NoteRegular;
    // TODO: we don't actually have to pass it here, we can get it from the state
    editedText: string;
    dispatch: Dispatch<AppEvent>;
  }) => {
    const note = props.note;
    const editedText = props.editedText;
    const dispatch = props.dispatch;

    const onCancelNoteTextEditing = () => {
      dispatch({
        type: EventType.NoteTextEditorCancelEdit,
      });
    };

    const noteCancelButtonOnClick = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        dispatch({
          type: EventType.NoteTextEditorCancelEdit,
        });
        e.preventDefault();
      }
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

    const noteSaveButtonOnClick = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        if (isTextSaveable(note)) {
          dispatch({
            type: EventType.RegularNoteTextUpdated,
            note,
            newText: editedText,
          });
        }
        e.preventDefault();
      }
    };

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
  }
);

// TODO: maybe better tooltip
// TODO: maybe allow copying the error
const NoteError = memo((props: { errorText: string }) => {
  const errorText = props.errorText;

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
});

export default RegularNote;
