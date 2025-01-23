import {
  convertToRegularNoteOnTextUpdated,
  convertToRegularNoteOnTitleUpdated,
  finishNoteTextEditing,
  finishNoteTitleEditing,
  handleLoadedNode,
  shiftNotesToLoadForNextPage,
} from "./business";
import { AppCommand, DoNothing } from "./commands";
import { LoadNextPage } from "./commands/storage";
import { AppEvent, EventType } from "./events";
import {
  AppState,
  NoteListState,
  NoteListFileListRetrieved,
  NoteTextEditorState,
  NoteTitleEditorState,
} from "./model";
import * as O from "optics-ts";

const JustState = (state: AppState): [AppState, AppCommand] => [
  state,
  DoNothing,
];

// TODO: see if I really need optics
export const Reducer = (
  state: AppState,
  event: AppEvent
): [AppState, AppCommand] => {
  /*console.log(
    `Reducing event '${EventType[event.type]} ${JSON.stringify(event)}'`
  );*/

  if (event.type === EventType.TemplateNoteTitleEditorTextChanged) {
    const newState: AppState = {
      noteList: state.noteList,
      noteTitleEditor: {
        state: NoteTitleEditorState.EditingTemplateNote,
        text: event.newText,
      },
      noteTextEditor: state.noteTextEditor,
    };

    return JustState(newState);
  }

  if (event.type === EventType.TemplateNoteTitleUpdated) {
    // TODO: what if updated before file list is retrieved?

    const noteList = state.noteList;
    const noteTitleEditor = state.noteTitleEditor;
    if (noteList.state === NoteListState.FileListRetrieved) {
      if (noteTitleEditor.state === NoteTitleEditorState.EditingTemplateNote) {
        const [newNoteList, newTextEditor, command] =
          convertToRegularNoteOnTitleUpdated(noteList, noteTitleEditor);

        const newState: AppState = {
          noteList: newNoteList,
          noteTitleEditor: {
            state: NoteTitleEditorState.NotActive,
          },
          noteTextEditor: newTextEditor,
        };

        return [newState, command];
      }
    }

    return JustState(state);
  }

  if (event.type === EventType.RegularNoteTitleEditorTextChanged) {
    const newState: AppState = {
      noteList: state.noteList,
      noteTitleEditor: {
        state: NoteTitleEditorState.EditingRegularNote,
        note: event.note,
        text: event.newText,
      },
      noteTextEditor: state.noteTextEditor,
    };

    return JustState(newState);
  }

  if (event.type === EventType.RegularNoteTitleUpdated) {
    const noteList = state.noteList;
    const noteTitleEditor = state.noteTitleEditor;
    if (noteList.state === NoteListState.FileListRetrieved) {
      if (noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote) {
        const [newNoteList, command] = finishNoteTitleEditing(
          noteList,
          noteTitleEditor
        );

        const newState: AppState = {
          noteList: newNoteList,
          noteTitleEditor: {
            state: NoteTitleEditorState.NotActive,
          },
          noteTextEditor: state.noteTextEditor,
        };

        return [newState, command];
      }
    }

    return JustState(state);
  }

  if (event.type === EventType.NoteTextEditorTextChanged) {
    if (
      state.noteTextEditor.state === NoteTextEditorState.EditingRegularNote ||
      state.noteTextEditor.state === NoteTextEditorState.EditingTemplateNote
    ) {
      const newState: AppState = {
        noteList: state.noteList,
        noteTitleEditor: state.noteTitleEditor,
        noteTextEditor: {
          ...state.noteTextEditor,
          text: event.newText,
        },
      };

      return JustState(newState);
    }
    return JustState(state);
  }

  // TODO: does not restore the previous text because lost focus happens first
  if (event.type === EventType.NoteTextEditorCancelEdit) {
    const newState: AppState = {
      noteList: state.noteList,
      noteTitleEditor: state.noteTitleEditor,
      noteTextEditor: {
        state: NoteTextEditorState.NotActive,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.TemplateNoteStartTextEditing) {
    const newState: AppState = {
      noteList: state.noteList,
      noteTitleEditor: state.noteTitleEditor,
      noteTextEditor: {
        state: NoteTextEditorState.EditingTemplateNote,
        text: "",
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.TemplateNoteTextUpdated) {
    // TODO: what if updated before file list is retrieved?

    const noteList = state.noteList;
    const noteTextEditor = state.noteTextEditor;
    if (noteList.state === NoteListState.FileListRetrieved) {
      if (noteTextEditor.state === NoteTextEditorState.EditingTemplateNote) {
        const [newNoteList, command] = convertToRegularNoteOnTextUpdated(
          noteList,
          noteTextEditor
        );

        const newState: AppState = {
          noteList: newNoteList,
          noteTitleEditor: state.noteTitleEditor,
          noteTextEditor: {
            state: NoteTextEditorState.NotActive,
          },
        };

        return [newState, command];
      }
    }

    return JustState(state);
  }

  if (event.type === EventType.RegularNoteStartTextEditing) {
    const newState: AppState = {
      noteList: state.noteList,
      noteTitleEditor: state.noteTitleEditor,
      noteTextEditor: {
        state: NoteTextEditorState.EditingRegularNote,
        note: event.note,
        text: event.note.text,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.RegularNoteTextUpdated) {
    const noteList = state.noteList;
    const noteTextEditor = state.noteTextEditor;
    if (noteList.state === NoteListState.FileListRetrieved) {
      if (noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
        const [newNoteList, command] = finishNoteTextEditing(
          noteList,
          noteTextEditor
        );

        const newState: AppState = {
          noteList: newNoteList,
          noteTitleEditor: state.noteTitleEditor,
          noteTextEditor: {
            state: NoteTextEditorState.NotActive,
          },
        };

        return [newState, command];
      }
    }

    return JustState(state);
  }

  if (event.type === EventType.RetrieveFileListSuccess) {
    const fileList = event.fileList;

    // TODO: this is the wrong place to do it.
    // File list version should increase every time we issue the command to retrieve file list
    // So it should be stored 1 level up, and we should skip rendering if the version does not match
    let fileListVersion = 0;
    if (state.noteList.state === NoteListState.FileListRetrieved) {
      fileListVersion = state.noteList.fileListVersion + 1;
    }

    const noteList: NoteListFileListRetrieved = {
      state: NoteListState.FileListRetrieved,
      fileListVersion,
      unprocessedFiles: fileList,
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    };

    const [newNoteList, notesToLoad] = shiftNotesToLoadForNextPage(noteList);

    const optic = O.optic_<AppState>().prop("noteList");
    return [
      O.set(optic)(newNoteList)(state),
      LoadNextPage(notesToLoad, fileListVersion),
    ];
  }

  if (event.type === EventType.LoadNoteContentSuccess) {
    const note = event.note;
    const fileListVersion = event.fileListVersion;

    if (state.noteList.state === NoteListState.FileListRetrieved) {
      // TODO: so yes, this is the second place the version is checked
      // I think this is correct, but need to be reviewed when the version check moves up
      if (state.noteList.fileListVersion === fileListVersion) {
        const newNoteListState = handleLoadedNode(state.noteList, note);

        const optic = O.optic_<AppState>().prop("noteList");
        return JustState(O.set(optic)(newNoteListState)(state));
      }
    }
    return JustState(state);
  }

  if (event.type === EventType.LoadNextPage) {
    const noteList = state.noteList;
    if (noteList.state === NoteListState.FileListRetrieved) {
      const [newNoteList, notesToLoad] = shiftNotesToLoadForNextPage(noteList);

      const optic = O.optic_<AppState>().prop("noteList");
      return [
        O.set(optic)(newNoteList)(state),
        LoadNextPage(notesToLoad, noteList.fileListVersion),
      ];
    }
  }

  console.error(`Unknown event '${JSON.stringify(event)}'`);

  return JustState(state);
};
