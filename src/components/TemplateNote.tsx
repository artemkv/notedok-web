import "./TemplateNote.css";
import { TemplateNoteState, ActionType } from "../model";
import { useContext } from "react";
import AppContext from "../AppContext";

// TODO: where to put the CSS that are common with note?

function TemplateNote(props: { state: TemplateNoteState }) {
  const { uistrings, dispatch } = useContext(AppContext);

  const state = props.state;

  const onStartNoteTextEditing = () => {
    dispatch({
      type: ActionType.TemplateNoteStartTextEditing,
    });
  };

  const onCancelNoteTextEditing = () => {
    dispatch({
      type: ActionType.TemplateNoteCancelTextEditing,
    });
  };

  const templateNotePlaceHolder = () => {
    return (
      <div className="note-text" tabIndex={0} onClick={onStartNoteTextEditing}>
        <span className="placeholder">{uistrings.NoteTextPlaceholder}</span>
      </div>
    );
  };

  const templateNoteTextEditor = () => {
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
        {state === TemplateNoteState.Initial
          ? templateNotePlaceHolder()
          : templateNoteTextEditor()}
      </div>
    </div>
  );
}

export default TemplateNote;
