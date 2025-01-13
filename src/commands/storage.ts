import { convertToNoteLoaded } from "../business";
import {
  CommandType,
  LoadNotesContentCommand,
  RetrieveFileListCommand,
  SaveNoteTextCommand,
} from "../commands";
import { EventType } from "../events";
import { NoteLoaded, NoteNotLoaded } from "../model";

export const RetrieveFileList: RetrieveFileListCommand = {
  type: CommandType.RetrieveFileList,
  execute: (dispatch) => {
    // console.log("Executing initial command");

    setTimeout(
      () => {
        // console.log("Dispatching RetrieveFileListSuccess");

        dispatch({
          type: EventType.RetrieveFileListSuccess,
          fileList: [
            "file001 dfjglkj sdflkj glkjlk;gdsjflkgj sdlkf gkjashdfkjahs dkjfh asdkjhfkjsadhfkjj gfklfjsdlkgj lskdfj gklf hdsakjhfkjdsahfjkasdh fkj.txt",
            "file005 <script>.txt",
            "file014 ?*.txt",
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
      const noteLoaded = convertToNoteLoaded(
        note,
        "dummy content for *" +
          note.id +
          "*" +
          " <script type='text/javascript'>alert('injected')</script>"
      );

      setTimeout(() => {
        // console.log("loaded " + updatedNote.id);

        dispatch({
          type: EventType.LoadNoteContentSuccess,
          note: noteLoaded,
          fileListVersion, // TODO:
        });
      }, 300);
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
  },
});
