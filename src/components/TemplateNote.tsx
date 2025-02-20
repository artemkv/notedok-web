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
  const titleEditable = props.titleEditable;
  const textEditable = props.textEditable;
  const autoSuggestHashTags = props.autoSuggestHashTags;
  const dispatch = props.dispatch;

  const [isEditingText, effectiveNoteText] = (() => {
    if (textEditable.state === ModifiedState.ModifiedValue) {
      return [true, textEditable.newValue];
    }
    return [false, ""];
  })();

  const noteTextElement = () => {
    return isEditingText ? (
      <TextEditor editedText={effectiveNoteText} dispatch={dispatch} />
    ) : (
      <NoteTextPlaceholder dispatch={dispatch} />
    );
  };

  const controlArea = () => {
    return isEditingText ? (
      <EditingNoteControlArea dispatch={dispatch} />
    ) : (
      <Empty />
    );
  };

  return (
    <div id="note_template" className="note-outer">
      <div className="note-inner">
        <NoteTitle
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
    titleEditable: EditableText;
    autoSuggestHashTags: AutoSuggestHashTag[];
    dispatch: Dispatch<AppEvent>;
  }) => {
    const titleEditable = props.titleEditable;
    const autoSuggestHashTags = props.autoSuggestHashTags;
    const dispatch = props.dispatch;

    const [isEditingTitle, effectiveNoteTitle] = (() => {
      if (titleEditable.state === ModifiedState.ModifiedValue) {
        return [true, titleEditable.newValue];
      }
      return [false, ""];
    })();

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
        newTitle: effectiveNoteTitle,
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

    return (
      <>
        <div className="note-title-container">
          <input
            id="note_template_title"
            type="text"
            className="note-title"
            value={effectiveNoteTitle}
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
      </>
    );
  }
);

const NoteTextPlaceholder = memo((props: { dispatch: Dispatch<AppEvent> }) => {
  const dispatch = props.dispatch;

  const onStartNoteTextEditing = () => {
    dispatch({
      type: EventType.TemplateNoteStartTextEditing,
    });
  };

  return (
    <div className="note-text" onClick={onStartNoteTextEditing}>
      <span className="placeholder">
        {uistrings.TemplateNoteNoteTextPlaceholder}
      </span>
    </div>
  );
});

const TextEditor = (props: {
  editedText: string;
  dispatch: Dispatch<AppEvent>;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

const EditingNoteControlArea = memo(
  (props: { dispatch: Dispatch<AppEvent> }) => {
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
      dispatch({
        type: EventType.TemplateNoteTextUpdated,
      });
    };

    const noteSaveButtonOnClick = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        dispatch({
          type: EventType.TemplateNoteTextUpdated,
        });
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

export default TemplateNote;
