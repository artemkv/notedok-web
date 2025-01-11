import { convertToNoteLoaded } from "../business";
import {
  CommandType,
  LoadNotesContentCommand,
  RetrieveFileListCommand,
} from "../commands";
import { EventType } from "../events";
import { NoteNotLoaded } from "../model";

export const RetrieveFileList: RetrieveFileListCommand = {
  type: CommandType.RetrieveFileList,
  execute: (dispatch) => {
    // console.log("Executing initial command");

    setTimeout(
      () => {
        // console.log("Dispatching RetrieveFileListSuccess");

        dispatch({
          type: EventType.RetrieveFileListSuccess,
          data: [
            "file001.txt",
            "file005.txt",
            "file014.txt",
            "file015.txt",
            "file016.txt",
            "file017.txt",
            "file018.txt",
            "file019.txt",
          ], // TODO:
        });
      },
      1000 // TODO
    );
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
      // TODO: maybe push to helper method
      const NoteLoaded = convertToNoteLoaded(
        note,
        "dummy content for " + note.id
      );

      setTimeout(() => {
        // console.log("loaded " + updatedNote.id);

        dispatch({
          type: EventType.LoadNoteContentSuccess,
          data: [NoteLoaded, fileListVersion], // TODO:
        });
      }, 300);
    });
  },
});
