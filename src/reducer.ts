import {
  cancelAllActiveEditors,
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
  handleNoteTitleEditorCancelEdit,
  handleRegularNoteStartTextEditing,
  handleRegularNoteTextUpdated,
  handleRegularNoteTitleEditorTextChanged,
  handleRegularNoteTitleUpdated,
  handleRestApiError,
  handleRetrieveFileListSuccess,
  handleSearchAutoSuggestionsComputed,
  handleSearchCancelEdit,
  handleSearchTextAutoFilled,
  handleSearchTextChanged,
  handleSearchTextSubmitted,
  handleTemplateNoteStartTextEditing,
  handleTemplateNoteTextUpdated,
  handleTemplateNoteTitleEditorTextChanged,
  handleTemplateNoteTitleUpdated,
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
      return cancelAllActiveEditors(state);
    }

    if (event.type === EventType.TitleEditorActivated) {
      return cancelAllActiveEditors(state);
    }

    if (event.type === EventType.TitleEditorCancelEdit) {
      return handleNoteTitleEditorCancelEdit(state);
    }

    if (event.type === EventType.SearchTextSubmitted) {
      return handleSearchTextSubmitted(state);
    }

    if (event.type === EventType.SearchTextAutoFilled) {
      return handleSearchTextAutoFilled(state, event);
    }

    if (event.type === EventType.SearchTextChanged) {
      return handleSearchTextChanged(state, event);
    }

    if (event.type === EventType.SearchCancelEdit) {
      return handleSearchCancelEdit(state);
    }

    if (event.type === EventType.TemplateNoteTitleEditorTextChanged) {
      return handleTemplateNoteTitleEditorTextChanged(state, event);
    }

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

    if (event.type === EventType.NoteTextEditorCancelEdit) {
      return handleNoteTextEditorCancelEdit(state);
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

    if (event.type === EventType.SearchAutoSuggestionsComputed) {
      return handleSearchAutoSuggestionsComputed(state, event);
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
  }

  console.error(
    `Unknown event ${EventType[event.type]} '${JSON.stringify(event)}'`
  );

  return JustState(state);
};
