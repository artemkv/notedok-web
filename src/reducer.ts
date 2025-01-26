import {
  convertToRegularNoteOnTextUpdated,
  convertToRegularNoteOnTitleUpdated,
  finishNoteTextEditing,
  finishNoteTitleEditing,
  handleLoadedNode,
  shiftNotesToLoadForNextPage,
  updateNotePath,
} from "./business";
import { AppCommand, DoNothing } from "./commands";
import { ReportError } from "./commands/alerts";
import { LoadNextPage } from "./commands/storage";
import { AppEvent, EventType } from "./events";
import {
  AppState,
  NoteListState,
  NoteListFileListRetrieved,
  NoteTextEditorState,
  NoteTitleEditorState,
} from "./model";

const JustState = (state: AppState): [AppState, AppCommand] => [
  state,
  DoNothing,
];

// TODO: see if I really need optics
export const Reducer = (
  state: AppState,
  event: AppEvent
): [AppState, AppCommand] => {
  console.log(
    `Reducing event '${EventType[event.type]} ${JSON.stringify(event)}'`
  );

  if (event.type === EventType.TemplateNoteTitleEditorTextChanged) {
    const newState: AppState = {
      ...state,
      noteTitleEditor: {
        state: NoteTitleEditorState.EditingTemplateNote,
        text: event.newText,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.TemplateNoteTitleUpdated) {
    // TODO: what if updated before file list is retrieved?
    if (state.noteList.state === NoteListState.FileListRetrieved) {
      if (
        state.noteTitleEditor.state === NoteTitleEditorState.EditingTemplateNote
      ) {
        const [newNoteList, newTextEditor, command] =
          convertToRegularNoteOnTitleUpdated(
            state.noteList,
            state.noteTitleEditor
          );

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
      ...state,
      noteTitleEditor: {
        state: NoteTitleEditorState.EditingRegularNote,
        note: event.note,
        text: event.newText,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.RegularNoteTitleUpdated) {
    if (state.noteList.state === NoteListState.FileListRetrieved) {
      if (
        state.noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote
      ) {
        const [newNoteList, command] = finishNoteTitleEditing(
          state.noteList,
          state.noteTitleEditor
        );

        const newState: AppState = {
          ...state,
          noteList: newNoteList,
          noteTitleEditor: {
            state: NoteTitleEditorState.NotActive,
          },
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
        ...state,
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
      ...state,
      noteTextEditor: {
        state: NoteTextEditorState.NotActive,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.TemplateNoteStartTextEditing) {
    const newState: AppState = {
      ...state,
      noteTextEditor: {
        state: NoteTextEditorState.EditingTemplateNote,
        text: "",
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.TemplateNoteTextUpdated) {
    // TODO: what if updated before file list is retrieved?
    if (state.noteList.state === NoteListState.FileListRetrieved) {
      if (
        state.noteTextEditor.state === NoteTextEditorState.EditingTemplateNote
      ) {
        const [newNoteList, command] = convertToRegularNoteOnTextUpdated(
          state.noteList,
          state.noteTextEditor
        );

        const newState: AppState = {
          ...state,
          noteList: newNoteList,
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
      ...state,
      noteTextEditor: {
        state: NoteTextEditorState.EditingRegularNote,
        note: event.note,
        text: event.note.text,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.RegularNoteTextUpdated) {
    if (state.noteList.state === NoteListState.FileListRetrieved) {
      if (
        state.noteTextEditor.state === NoteTextEditorState.EditingRegularNote
      ) {
        const [newNoteList, command] = finishNoteTextEditing(
          state.noteList,
          state.noteTextEditor
        );

        const newState: AppState = {
          ...state,
          noteList: newNoteList,
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
    if (
      state.noteList.state === NoteListState.RetrievingFileList &&
      state.noteList.fileListVersion === event.fileListVersion
    ) {
      const noteList: NoteListFileListRetrieved = {
        state: NoteListState.FileListRetrieved,
        fileListVersion: event.fileListVersion,
        unprocessedFiles: event.fileList,
        lastUsedNoteId: 0,
        renderingQueue: [],
        notes: [],
      };

      const [newNoteList, notesToLoad] = shiftNotesToLoadForNextPage(noteList);

      const newState: AppState = {
        ...state,
        noteList: newNoteList,
      };

      return [newState, LoadNextPage(notesToLoad, event.fileListVersion)];
    }
    return JustState(state);
  }

  if (event.type === EventType.NoteSavedOnNewPath) {
    const [newNoteList, newNoteTitleEditor, newNoteTextEditor] = updateNotePath(
      state,
      event.note,
      event.newPath
    );

    const newState: AppState = {
      ...state,
      noteTitleEditor: newNoteTitleEditor,
      noteTextEditor: newNoteTextEditor,
      noteList: newNoteList,
    };

    return JustState(newState);
  }

  if (event.type === EventType.LoadNoteContentSuccess) {
    if (state.noteList.state === NoteListState.FileListRetrieved) {
      if (state.noteList.fileListVersion === event.fileListVersion) {
        const newNoteList = handleLoadedNode(state.noteList, event.note);

        const newState: AppState = {
          ...state,
          noteList: newNoteList,
        };

        return JustState(newState);
      }
    }
    return JustState(state);
  }

  if (event.type === EventType.LoadNextPage) {
    if (state.noteList.state === NoteListState.FileListRetrieved) {
      const [newNoteList, notesToLoad] = shiftNotesToLoadForNextPage(
        state.noteList
      );

      const newState: AppState = {
        ...state,
        noteList: newNoteList,
      };

      return [
        newState,
        LoadNextPage(notesToLoad, state.noteList.fileListVersion),
      ];
    }

    return JustState(state);
  }

  if (event.type === EventType.RestApiError) {
    return [state, ReportError(event.err)];
  }

  console.error(`Unknown event '${JSON.stringify(event)}'`);

  return JustState(state);
};
