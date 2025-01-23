import { convertToNoteLoaded } from "../business";
import {
  CommandType,
  LoadNotesContentCommand,
  RenameNoteCommand,
  RetrieveFileListCommand,
  SaveNoteTextCommand,
} from "../commands";
import { EventType } from "../events";
import { NoteLoaded, NoteNotLoaded } from "../model";
import { getFiles, getFile } from "../sessionapi";

interface FileData {
  fileName: string;
  lastModified: string;
  etag: string;
}

interface GetFilesResponse {
  files: FileData[];
  hasMore: boolean;
  nextContinuationToken: string;
}

export const RetrieveFileList: RetrieveFileListCommand = {
  type: CommandType.RetrieveFileList,
  execute: async (dispatch) => {
    // console.log("Executing initial command");

    const getFilesResponse: GetFilesResponse = await getFiles(100, "");

    dispatch({
      type: EventType.RetrieveFileListSuccess,
      fileList: getFilesResponse.files.map((f) => f.fileName),
    });
  },
};

export const LoadNextPage = (
  notes: Array<NoteNotLoaded>,
  fileListVersion: number
): LoadNotesContentCommand => ({
  type: CommandType.LoadNextPage,
  notes,
  execute: (dispatch) => {
    // console.log("Executing load next page");

    // TODO: Only complete the rendering if the file list is still the same

    let notesReversed: Array<NoteNotLoaded> = [];

    notes.forEach((note) => {
      notesReversed = [note, ...notesReversed];
    });

    notesReversed.forEach((note) => {
      getFile(note.path) // TODO: url-encode
        .then((content: string) => {
          // TODO: maybe push to helper method
          const noteLoaded = convertToNoteLoaded(note, content);
          return noteLoaded;
        })
        .then((noteLoaded: NoteLoaded) => {
          dispatch({
            type: EventType.LoadNoteContentSuccess,
            note: noteLoaded,
            fileListVersion, // TODO:
          });
        });
    });
  },
});

export const SaveNoteText = (
  note: NoteLoaded,
  newText: string
): SaveNoteTextCommand => ({
  type: CommandType.SaveNoteText,
  note,
  newText,
  execute: (dispatch) => {
    // TODO:
    console.log("Saving text");
  },
});

export const RenameNote = (
  note: NoteLoaded,
  newTitle: string
): RenameNoteCommand => ({
  type: CommandType.RenameNote,
  note,
  newTitle,
  execute: (dispatch) => {
    // TODO:
    console.log("Saving title");
  },
});
