import TemplateNote from "./TemplateNote";
import "./NoteContainer.css";
import { TemplateNoteState } from "../model";

function NoteContainer(props: { templateNoteState: TemplateNoteState }) {
  const templateNoteState = props.templateNoteState;

  return (
    <div className="notes-outer">
      <div className="notes-inner">
        <TemplateNote state={templateNoteState} />
      </div>
    </div>
  );
}

export default NoteContainer;
