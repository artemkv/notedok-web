import { handleLoadedNode, shiftNotesToLoadForNextPage } from "./business";
import { AppCommand, DoNothing } from "./commands";
import { LoadNextPage } from "./commands/storage";
import { AppEvent, EventType } from "./events";
import {
  AppState,
  NoteListState,
  NoteListStateFileListRetrieved,
  TemplateNoteState,
} from "./state";
import * as O from "optics-ts";

const JustState = (state: AppState): [AppState, AppCommand] => [
  state,
  DoNothing,
];

export const Reducer = (
  state: AppState,
  event: AppEvent
): [AppState, AppCommand] => {
  // console.log(`Reducing event '${JSON.stringify(event)}'`);

  if (event.type === EventType.TemplateNoteStartTextEditing) {
    const newTemplateNoteState = TemplateNoteState.EditingText;

    const optic = O.optic_<AppState>().prop("templateNoteState");
    return JustState(O.set(optic)(newTemplateNoteState)(state));
  }
  if (event.type === EventType.TemplateNoteCancelTextEditing) {
    const newTemplateNoteState = TemplateNoteState.Initial;

    const optic = O.optic_<AppState>().prop("templateNoteState");
    return JustState(O.set(optic)(newTemplateNoteState)(state));
  }
  if (event.type === EventType.RetrieveFileListSuccess) {
    const fileList = event.data;

    let fileListVersion = 0;
    if (state.noteList.state === NoteListState.FileListRetrieved) {
      fileListVersion = state.noteList.unprocessedFiles.fileListVersion + 1;
    }

    const noteListState: NoteListStateFileListRetrieved = {
      state: NoteListState.FileListRetrieved,
      unprocessedFiles: {
        fileList: fileList,
        fileListVersion,
      },
      lastUsedNoteId: 0,
      renderingQueue: {
        queue: [],
        readyNoteIds: new Set<string>(),
      },
      notes: [],
    };

    const [newNoteListState, notesToLoad] =
      shiftNotesToLoadForNextPage(noteListState);

    const optic = O.optic_<AppState>().prop("noteList");
    return [
      O.set(optic)(newNoteListState)(state),
      LoadNextPage(notesToLoad, fileListVersion),
    ];
  }
  if (event.type === EventType.LoadNoteContentSuccess) {
    const [note, fileListVersion] = event.data;

    if (state.noteList.state === NoteListState.FileListRetrieved) {
      if (state.noteList.unprocessedFiles.fileListVersion === fileListVersion) {
        const newNoteListState = handleLoadedNode(state.noteList, note);

        const optic = O.optic_<AppState>().prop("noteList");
        return JustState(O.set(optic)(newNoteListState)(state));
      }
    }
    return JustState(state);
  }

  console.error(`Unknown event '${JSON.stringify(event)}'`);

  return JustState(state);
};
