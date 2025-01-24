import { convertToNoteLoaded } from "../business";
import {
  CommandType,
  CreateNewNoteWithTextCommand,
  CreateNewNoteWithTitleCommand,
  LoadNotesContentCommand,
  RenameNoteFromTitleCommand,
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

export const RetrieveFileList: RetrieveFileListCommand = {
  type: CommandType.RetrieveFileList,
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
      fileList: files.map((f) => f.fileName),
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
    // TODO: Only complete the rendering if the file list is still the same

    let notesReversed: Array<NoteNotLoaded> = [];

    notes.forEach((note) => {
      notesReversed = [note, ...notesReversed];
    });

    notesReversed.forEach((note) => {
      // TODO: one file failing to fetch is blocking the rest
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

export const RenameNoteFromTitle = (
  note: NoteLoaded
): RenameNoteFromTitleCommand => ({
  type: CommandType.RenameNoteFromTitle,
  note,
  execute: async (dispatch) => {
    const newPath = generatePathFromTitle(note.title, note.title === ""); // TODO: inform UI about change
    try {
      await renameFile(note.path, newPath);
    } catch (err) {
      if ((err as ApiError).statusCode === 409) {
        // Regenerate path from title, this time focing uniqueness
        const newPath = generatePathFromTitle(note.title, true);
        await postFile(newPath, note.text); // TODO: handle error

        // TODO: inform UI about change
      } else {
        // TODO: handle error
      }
    }
  },
});

export const SaveNoteText = (note: NoteLoaded): SaveNoteTextCommand => ({
  type: CommandType.SaveNoteText,
  note,
  execute: async (dispatch) => {
    // Title is potentially empty, but the path should have been already made unique.
    // TODO: Maybe this uniqueness can move here
    await putFile(note.path, note.text); // TODO: handle error
  },
});

export const CreateNewNoteWithTitle = (
  note: NoteLoaded
): CreateNewNoteWithTitleCommand => ({
  type: CommandType.CreateNewNoteWithTitle,
  note,
  execute: async (dispatch) => {
    // Title is not empty, ensured by business, so save it as is, but don't overwrite, in case not unique
    try {
      await postFile(note.path, note.text);
    } catch (err) {
      if ((err as ApiError).statusCode === 409) {
        // Regenerate path from title, this time focing uniqueness
        const newPath = generatePathFromTitle(note.title, true);
        await putFile(newPath, note.text); // TODO: handle error

        // TODO: inform UI about change
      } else {
        // TODO: handle error
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
    // If note is new, the title is empty, and we know that the path was forced unique by business
    // TODO: maybe generate the path here, so the uniqueness moves here, and then update the note list through event
    await putFile(note.path, note.text); // TODO: handle error
  },
});
