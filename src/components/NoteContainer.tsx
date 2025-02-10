import TemplateNote from "./TemplateNote";
import "./NoteContainer.css";
import {
  NoteTextEditor,
  NoteList,
  NoteListState,
  NoteTitleEditor,
  NoteState,
  NoteTitleEditorState,
  NoteRegular,
  NoteTextEditorState,
  ModifiedState,
  EditableText,
  AutoSuggestHashTag,
} from "../model";
import ProgressIndicator from "./ProgressIndicator";
import RegularNote from "./RegularNote";
import DeletedNote from "./DeletedNote";
import { AppEvent } from "../events";
import { Dispatch } from "../hooks/useReducer";
import { memo } from "react";

const noChanges: EditableText = {
  state: ModifiedState.OriginalValue,
};

const NoteContainer = memo(function NoteContainer(props: {
  noteTitleEditor: NoteTitleEditor;
  noteTextEditor: NoteTextEditor;
  noteList: NoteList;
  autoSuggestHashTags: AutoSuggestHashTag[];
  dispatch: Dispatch<AppEvent>;
}) {
  const noteTitleEditor = props.noteTitleEditor;
  const noteTextEditor = props.noteTextEditor;
  const noteList = props.noteList;
  const autoSuggestHashTags = props.autoSuggestHashTags;
  const dispatch = props.dispatch;

  const getTitleAsEditableText = (
    noteTitleEditor: NoteTitleEditor,
    note: NoteRegular
  ): EditableText => {
    if (
      noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote &&
      noteTitleEditor.note === note
    ) {
      return {
        state: ModifiedState.ModifiedValue,
        newValue: noteTitleEditor.text,
      };
    }
    return noChanges;
  };

  const getTextAsEditableText = (
    noteTextEditor: NoteTextEditor,
    note: NoteRegular
  ): EditableText => {
    if (
      noteTextEditor.state === NoteTextEditorState.EditingRegularNote &&
      noteTextEditor.note === note
    ) {
      return {
        state: ModifiedState.ModifiedValue,
        newValue: noteTextEditor.text,
      };
    }
    return noChanges;
  };

  const getTemplateTitleAsEditableText = (
    noteTitleEditor: NoteTitleEditor
  ): EditableText => {
    if (noteTitleEditor.state === NoteTitleEditorState.EditingTemplateNote) {
      return {
        state: ModifiedState.ModifiedValue,
        newValue: noteTitleEditor.text,
      };
    }
    return noChanges;
  };

  const getTemplateTextAsEditableText = (
    noteTextEditor: NoteTextEditor
  ): EditableText => {
    if (noteTextEditor.state === NoteTextEditorState.EditingTemplateNote) {
      return {
        state: ModifiedState.ModifiedValue,
        newValue: noteTextEditor.text,
      };
    }
    return noChanges;
  };

  return (
    <div className="notes-outer">
      <div className="notes-inner">
        <TemplateNote
          titleEditable={getTemplateTitleAsEditableText(noteTitleEditor)}
          textEditable={getTemplateTextAsEditableText(noteTextEditor)}
          autoSuggestHashTags={autoSuggestHashTags}
          dispatch={dispatch}
        />
        {noteList.state === NoteListState.RetrievingFileList ? (
          <ProgressIndicator />
        ) : (
          <div>
            {noteList.notes.map((note) =>
              note.state === NoteState.Deleting ||
              note.state === NoteState.Deleted ? (
                <DeletedNote key={note.id} note={note} dispatch={dispatch} />
              ) : (
                <RegularNote
                  key={note.id}
                  note={note}
                  titleEditable={getTitleAsEditableText(noteTitleEditor, note)}
                  textEditable={getTextAsEditableText(noteTextEditor, note)}
                  dispatch={dispatch}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default NoteContainer;
