import { convertToNoteLoaded } from "../business";
import {
  CommandType,
  CreateNewNoteWithTextCommand,
  CreateNewNoteWithTitleCommand,
  DeleteNoteCommand,
  LoadNotesContentCommand,
  RenameNoteFromTitleCommand,
  RestoreNoteCommand,
  RetrieveFileListCommand,
  SaveNoteTextCommand,
} from "../commands";
import { generatePathFromTitle } from "../conversion";
import { EventType } from "../events";
import { NoteLoaded, NoteNotLoaded } from "../model";
import { ApiError } from "../restapi";
import {
  getFiles,
  getFile,
  putFile,
  postFile,
  renameFile,
  deleteFile,
} from "../sessionapi";

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

interface FileDataWithDate {
  fileName: string;
  lastModified: Date;
  etag: string;
}

export const RetrieveFileList = (
  fileListVersion: number
): RetrieveFileListCommand => ({
  type: CommandType.RetrieveFileList,
  fileListVersion,
  execute: async (dispatch) => {
    const getFilesResponse: GetFilesResponse = await getFiles(100, "");
    const files: FileDataWithDate[] = getFilesResponse.files.map((f) => ({
      fileName: f.fileName,
      lastModified: new Date(f.lastModified),
      etag: f.etag,
    }));
    files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

    dispatch({
      type: EventType.RetrieveFileListSuccess,
      fileListVersion,
      fileList: files.map((f) => f.fileName),
    });
  },
});

// TODO: maybe rename more grammaticaly correct
export const LoadNotesContent = (
  notes: Array<NoteNotLoaded>,
  fileListVersion: number
): LoadNotesContentCommand => ({
  type: CommandType.LoadNotesContent,
  notes,
  execute: (dispatch) => {
    let notesReversed: Array<NoteNotLoaded> = [];

    notes.forEach((note) => {
      notesReversed = [note, ...notesReversed];
    });

    notesReversed.forEach((note) => {
      // TODO: one file failing to fetch is blocking the rest
      // TODO: handle errors
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
            fileListVersion,
          });
        });
    });
  },
});

export const RenameNoteFromTitle = (
  note: NoteLoaded
): RenameNoteFromTitleCommand => ({
  type: CommandType.RenameNoteFromTitle,
  note,
  execute: async (dispatch) => {
    // First time try with path derived from title
    // Unless title is empty, in which case we immediately ask for a unique one
    const newPath = generatePathFromTitle(note.title, note.title === ""); // TODO: inform UI about change
    try {
      await renameFile(note.path, newPath);
      dispatch({
        type: EventType.NoteSavedOnNewPath,
        note,
        newPath,
      });
    } catch (err) {
      if ((err as ApiError).statusCode === 409) {
        // Regenerate path from title, this time focing uniqueness
        const newPath = generatePathFromTitle(note.title, true);
        try {
          await renameFile(note.path, newPath); // TODO: handle error
          dispatch({
            type: EventType.NoteSavedOnNewPath,
            note,
            newPath,
          });
        } catch (err) {
          dispatch({
            type: EventType.RestApiError,
            err,
          });
        }
      } else {
        dispatch({
          type: EventType.RestApiError,
          err,
        });
      }
    }
  },
});

export const SaveNoteText = (note: NoteLoaded): SaveNoteTextCommand => ({
  type: CommandType.SaveNoteText,
  note,
  execute: async (dispatch) => {
    try {
      // Store at the exact path we loaded from
      await putFile(note.path, note.text);
    } catch (err) {
      dispatch({
        type: EventType.RestApiError,
        err,
      });
    }
  },
});

export const CreateNewNoteWithTitle = (
  note: NoteLoaded
): CreateNewNoteWithTitleCommand => ({
  type: CommandType.CreateNewNoteWithTitle,
  note,
  execute: async (dispatch) => {
    // Title is not empty, ensured by business, so we first try to store with path derived from the title
    const path = generatePathFromTitle(note.title, false);
    try {
      // Don't overwrite, in case not unique
      await postFile(path, note.text);
      dispatch({
        type: EventType.NoteSavedOnNewPath,
        note,
        newPath: path,
      });
    } catch (err) {
      if ((err as ApiError).statusCode === 409) {
        // Regenerate path from title, this time enfocing uniqueness
        const newPath = generatePathFromTitle(note.title, true);
        try {
          await putFile(newPath, note.text);
          dispatch({
            type: EventType.NoteSavedOnNewPath,
            note,
            newPath: path,
          });
        } catch (err) {
          dispatch({
            type: EventType.RestApiError,
            err,
          });
        }
      } else {
        dispatch({
          type: EventType.RestApiError,
          err,
        });
      }
    }
  },
});

export const CreateNewNoteWithText = (
  note: NoteLoaded
): CreateNewNoteWithTextCommand => ({
  type: CommandType.CreateNewNoteWithText,
  note,
  execute: async (dispatch) => {
    // Here we know that title is empty, so no need to even try storing it with an original path
    // Immediately ask for a unique (empty) path
    const path = generatePathFromTitle(note.title, true);
    try {
      await putFile(path, note.text);
      dispatch({
        type: EventType.NoteSavedOnNewPath,
        note,
        newPath: path,
      });
    } catch (err) {
      dispatch({
        type: EventType.RestApiError,
        err,
      });
    }
  },
});

export const DeleteNote = (note: NoteLoaded): DeleteNoteCommand => ({
  type: CommandType.DeleteNote,
  note,
  execute: async (dispatch) => {
    try {
      await deleteFile(note.path);
    } catch (err) {
      dispatch({
        type: EventType.RestApiError,
        err,
      });
    }
  },
});

export const RestoreNote = (note: NoteLoaded): RestoreNoteCommand => ({
  type: CommandType.RestoreNote,
  note,
  execute: async (dispatch) => {
    try {
      // Try to restore with exactly the same path as before, don't overwrite
      // TODO: so now, if restores into the path that suddenly is taken, will fail and show 2 notes in UI
      // TODO: maybe I should actually do the same thing as when storing new note from title, why not? just ensure the uniqueness and then update path
      await postFile(note.path, note.text);
    } catch (err) {
      dispatch({
        type: EventType.RestApiError,
        err,
      });
    }
  },
});
