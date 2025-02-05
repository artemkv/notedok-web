import {
  handleLoadNextPage,
  handleLoadNoteTextSuccess,
  handleNoteCreationFromTextFailed,
  handleNoteCreationFromTitleFailed,
  handleNoteDeleted,
  handleNoteDeleteTriggered,
  handleNoteLoadFailed,
  handleNoteRestoreTriggered,
  handleNoteSaved,
  handleNoteSavedOnNewPath,
  handleNoteSyncFailed,
  handleNoteTextEditorCancelEdit,
  handleNoteTextEditorTextChanged,
  handleRegularNoteStartTextEditing,
  handleRegularNoteTextUpdated,
  handleRegularNoteTitleEditorTextChanged,
  handleRegularNoteTitleUpdated,
  handleRestApiError,
  handleRetrieveFileListSuccess,
  handleSearchTextChanged,
  handleSearchTextSubmitted,
  handleTemplateNoteStartTextEditing,
  handleTemplateNoteTextUpdated,
  handleTemplateNoteTitleEditorTextChanged,
  handleTemplateNoteTitleUpdated,
  JustState,
} from "./business";
import { AppCommand } from "./commands";
import { AppEvent, EventType } from "./events";
import { AppState } from "./model";

export const Reducer = (
  state: AppState,
  event: AppEvent
): [AppState, AppCommand] => {
  /*
  // Uncomment when debugging
  console.log(
    `Reducing event '${EventType[event.type]} ${JSON.stringify(event)}'`
  );
  */

  if (event.type === EventType.SearchTextSubmitted) {
    return handleSearchTextSubmitted(state);
  }

  if (event.type === EventType.SearchTextChanged) {
    return handleSearchTextChanged(state, event);
  }

  if (event.type === EventType.TemplateNoteTitleEditorTextChanged) {
    return handleTemplateNoteTitleEditorTextChanged(state, event);
  }

  // TODO: what if updated before file list is retrieved?
  if (event.type === EventType.TemplateNoteTitleUpdated) {
    return handleTemplateNoteTitleUpdated(state);
  }

  if (event.type === EventType.RegularNoteTitleEditorTextChanged) {
    return handleRegularNoteTitleEditorTextChanged(state, event);
  }

  if (event.type === EventType.RegularNoteTitleUpdated) {
    return handleRegularNoteTitleUpdated(state, event);
  }

  if (event.type === EventType.NoteTextEditorTextChanged) {
    return handleNoteTextEditorTextChanged(state, event);
  }

  // TODO: does not restore the previous text because lost focus happens first
  if (event.type === EventType.NoteTextEditorCancelEdit) {
    return handleNoteTextEditorCancelEdit(state);
  }

  if (event.type === EventType.TemplateNoteStartTextEditing) {
    return handleTemplateNoteStartTextEditing(state);
  }

  // TODO: what if updated before file list is retrieved?
  if (event.type === EventType.TemplateNoteTextUpdated) {
    return handleTemplateNoteTextUpdated(state);
  }

  if (event.type === EventType.RegularNoteStartTextEditing) {
    return handleRegularNoteStartTextEditing(state, event);
  }

  if (event.type === EventType.RegularNoteTextUpdated) {
    return handleRegularNoteTextUpdated(state, event);
  }

  if (event.type === EventType.NoteDeleteTriggered) {
    return handleNoteDeleteTriggered(state, event);
  }

  if (event.type === EventType.NoteDeleted) {
    return handleNoteDeleted(state, event);
  }

  if (event.type === EventType.NoteRestoreTriggered) {
    return handleNoteRestoreTriggered(state, event);
  }

  if (event.type === EventType.RetrieveFileListSuccess) {
    return handleRetrieveFileListSuccess(state, event);
  }

  if (event.type === EventType.NoteSavedOnNewPath) {
    return handleNoteSavedOnNewPath(state, event);
  }

  if (event.type === EventType.NoteSaved) {
    return handleNoteSaved(state, event);
  }

  if (event.type === EventType.LoadNoteTextSuccess) {
    return handleLoadNoteTextSuccess(state, event);
  }

  if (event.type === EventType.LoadNextPage) {
    return handleLoadNextPage(state);
  }

  if (event.type === EventType.NoteLoadFailed) {
    return handleNoteLoadFailed(state, event);
  }

  if (event.type === EventType.NoteSyncFailed) {
    return handleNoteSyncFailed(state, event);
  }

  if (event.type === EventType.NoteCreationFromTitleFailed) {
    return handleNoteCreationFromTitleFailed(state, event);
  }

  if (event.type === EventType.NoteCreationFromTextFailed) {
    return handleNoteCreationFromTextFailed(state, event);
  }

  if (event.type === EventType.RestApiError) {
    return handleRestApiError(state, event);
  }

  console.error(
    `Unknown event ${EventType[event.type]} '${JSON.stringify(event)}'`
  );

  return JustState(state);
};
