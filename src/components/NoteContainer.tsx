import TemplateNote from "./TemplateNote";
import "./NoteContainer.css";
import { NoteList, TemplateNoteState } from "../state";
import ProgressIndicator from "./ProgressIndicator";

function NoteContainer(props: {
  templateNoteState: TemplateNoteState;
  noteList: NoteList;
}) {
  const templateNoteState = props.templateNoteState;
  // const noteList = props.noteList;

  return (
    <div className="notes-outer">
      <div className="notes-inner">
        <TemplateNote state={templateNoteState} />
        <ProgressIndicator />
      </div>
    </div>
  );
}

export default NoteContainer;
