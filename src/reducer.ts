import {
  finishEditing,
  handleLoadedNode,
  shiftNotesToLoadForNextPage,
} from "./business";
import { AppCommand, DoNothing } from "./commands";
import { LoadNextPage, SaveNoteText } from "./commands/storage";
import { AppEvent, EventType } from "./events";
import {
  AppState,
  NoteListState,
  NoteListFileListRetrieved,
  NoteEditorState,
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
  // console.log(`Reducing event '${JSON.stringify(event)}'`);

  if (event.type === EventType.TemplateNoteStartTextEditing) {
    const newState: AppState = {
      noteList: state.noteList,
      noteEditor: {
        state: NoteEditorState.EditingTemplateNote,
        text: "",
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.TemplateNoteCancelTextEditing) {
    const newState: AppState = {
      noteList: state.noteList,
      noteEditor: {
        state: NoteEditorState.NotActive,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.TemplateNoteTextUpdated) {
    // TODO: convert to a regular note
    // TODO: update the note in the note list
    // TODO: save changes
    // TODO: what if updated before file list is retrieved?

    const newState: AppState = {
      noteList: state.noteList,
      noteEditor: {
        state: NoteEditorState.NotActive,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.RegularNoteStartTextEditing) {
    const newState: AppState = {
      noteList: state.noteList,
      noteEditor: {
        state: NoteEditorState.EditingRegularNote,
        note: event.note,
        text: event.note.text,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.RegularNoteCancelTextEditing) {
    const newState: AppState = {
      noteList: state.noteList,
      noteEditor: {
        state: NoteEditorState.NotActive,
      },
    };

    return JustState(newState);
  }

  if (event.type === EventType.RegularNoteTextUpdated) {
    const noteList = state.noteList;
    const noteEditor = state.noteEditor;
    if (noteList.state === NoteListState.FileListRetrieved) {
      if (noteEditor.state === NoteEditorState.EditingRegularNote) {
        const newNoteList = finishEditing(noteList, noteEditor);

        const newState: AppState = {
          noteList: newNoteList,
          noteEditor: {
            state: NoteEditorState.NotActive,
          },
        };
        const command = SaveNoteText(noteEditor.note, noteEditor.text);

        return [newState, command];
      }
    }

    return JustState(state);
  }

  if (event.type === EventType.NoteEditorTextChanged) {
    if (
      state.noteEditor.state === NoteEditorState.EditingRegularNote ||
      state.noteEditor.state === NoteEditorState.EditingTemplateNote
    ) {
      const newState: AppState = {
        noteList: state.noteList,
        noteEditor: {
          ...state.noteEditor,
          text: event.newText,
        },
      };

      return JustState(newState);
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
