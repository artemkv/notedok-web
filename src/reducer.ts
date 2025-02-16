import {
  handleLoadNextPage,
  handleLoadNoteTextSuccess,
  handleNoteCreated,
  handleNoteCreationFailed,
  handleNoteDeleted,
  handleNoteDeleteTriggered,
  handleNoteLoadFailed,
  handleNoteRenamed,
  handleNoteRestored,
  handleNoteRestoredOnNewPath,
  handleNoteRestoreTriggered,
  handleNoteSyncFailed,
  handleNoteTextEditorCancelEdit,
  handleNoteTextEditorTextChanged,
  handleNoteTextSaved,
  handleNoteTitleEditorCancelEdit,
  handleNoteTitleEditorTextChanged,
  handleRegularNoteStartTextEditing,
  handleRegularNoteStartTitleEditing,
  handleRegularNoteTextUpdated,
  handleRegularNoteTitleUpdated,
  handleRestApiError,
  handleRetrieveFileListSuccess,
  handleSearchActivated,
  handleSearchAutoSuggestionsComputed,
  handleSearchTextSubmitted,
  handleTemplateNoteStartTextEditing,
  handleTemplateNoteStartTitleEditing,
  handleTemplateNoteTextUpdated,
  handleTemplateNoteTitleUpdated,
  handleTitleAutoSuggestionsUpdated,
  handleUserAuthenticated,
  handleUserSessionCreated,
} from "./business";
import { AppCommand, DoNothing } from "./commands";
import { AppEvent, EventType } from "./events";
import { AppState, AuthenticationStatus } from "./model";

export const JustState = (state: AppState): [AppState, AppCommand] => [
  state,
  DoNothing,
];

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

  if (state.auth === AuthenticationStatus.Unauthenticated) {
    if (event.type == EventType.UserAuthenticated) {
      return handleUserAuthenticated(state, event);
    }

    if (event.type == EventType.UserSessionCreated) {
      return handleUserSessionCreated();
    }
  } else {
    if (event.type === EventType.SearchActivated) {
      return handleSearchActivated(state);
    }

    if (event.type === EventType.SearchTextSubmitted) {
      return handleSearchTextSubmitted(state, event);
    }

    if (event.type === EventType.TemplateNoteStartTitleEditing) {
      return handleTemplateNoteStartTitleEditing(state);
    }

    if (event.type === EventType.TemplateNoteTitleUpdated) {
      return handleTemplateNoteTitleUpdated(state);
    }

    if (event.type === EventType.RegularNoteStartTitleEditing) {
      return handleRegularNoteStartTitleEditing(state, event);
    }

    if (event.type === EventType.RegularNoteTitleUpdated) {
      return handleRegularNoteTitleUpdated(state, event);
    }

    if (event.type === EventType.NoteTitleEditorTextChanged) {
      return handleNoteTitleEditorTextChanged(state, event);
    }

    if (event.type === EventType.NoteTitleEditorCancelEdit) {
      return handleNoteTitleEditorCancelEdit(state);
    }

    if (event.type === EventType.TemplateNoteStartTextEditing) {
      return handleTemplateNoteStartTextEditing(state);
    }

    if (event.type === EventType.TemplateNoteTextUpdated) {
      return handleTemplateNoteTextUpdated(state);
    }

    if (event.type === EventType.RegularNoteStartTextEditing) {
      return handleRegularNoteStartTextEditing(state, event);
    }

    if (event.type === EventType.RegularNoteTextUpdated) {
      return handleRegularNoteTextUpdated(state, event);
    }

    if (event.type === EventType.NoteTextEditorTextChanged) {
      return handleNoteTextEditorTextChanged(state, event);
    }

    if (event.type === EventType.NoteTextEditorCancelEdit) {
      return handleNoteTextEditorCancelEdit(state);
    }

    if (event.type === EventType.NoteDeleteTriggered) {
      return handleNoteDeleteTriggered(state, event);
    }

    if (event.type === EventType.NoteRestoreTriggered) {
      return handleNoteRestoreTriggered(state, event);
    }

    if (event.type === EventType.NoteRenamed) {
      return handleNoteRenamed(state, event);
    }

    if (event.type === EventType.NoteTextSaved) {
      return handleNoteTextSaved(state, event);
    }

    if (event.type === EventType.NoteCreated) {
      return handleNoteCreated(state, event);
    }

    if (event.type === EventType.NoteDeleted) {
      return handleNoteDeleted(state, event);
    }

    if (event.type === EventType.NoteRestored) {
      return handleNoteRestored(state, event);
    }

    if (event.type === EventType.NoteRestoredOnNewPath) {
      return handleNoteRestoredOnNewPath(state, event);
    }

    if (event.type === EventType.RetrieveFileListSuccess) {
      return handleRetrieveFileListSuccess(state, event);
    }

    if (event.type === EventType.SearchAutoSuggestionsComputed) {
      return handleSearchAutoSuggestionsComputed(state, event);
    }

    if (event.type == EventType.TitleAutoSuggestionsUpdated) {
      return handleTitleAutoSuggestionsUpdated(state, event);
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

    if (event.type === EventType.NoteCreationFailed) {
      return handleNoteCreationFailed(state, event);
    }

    if (event.type === EventType.RestApiError) {
      return handleRestApiError(state, event);
    }
  }

  console.error(
    `Unknown event ${EventType[event.type]} '${JSON.stringify(event)}'`
  );

  return JustState(state);
};
