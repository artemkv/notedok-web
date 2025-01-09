import { AppCommand, DoNothing } from "./commands";
import { Event, EventType } from "./events";
import { AppState, NoteListState, TemplateNoteState } from "./state";

export const Reducer = (
  state: AppState,
  event: Event
): [AppState, AppCommand] => {
  // TODO: use lens
  if (event.type === EventType.TemplateNoteStartTextEditing) {
    return [
      {
        templateNoteState: TemplateNoteState.EditingText,
        noteList: {
          state: NoteListState.NotLoaded,
        },
      },
      DoNothing,
    ];
  }
  if (event.type === EventType.TemplateNoteCancelTextEditing) {
    return [
      {
        templateNoteState: TemplateNoteState.Initial,
        noteList: {
          state: NoteListState.NotLoaded,
        },
      },
      DoNothing,
    ];
  }
  if (event.type === EventType.RetrieveFileListSuccess) {
    return [state, DoNothing];
  }

  console.error(`Unknown event '${event.type}'`);

  return [state, DoNothing];
};
