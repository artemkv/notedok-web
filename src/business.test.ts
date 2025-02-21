import { test } from "@jest/globals";
import {
  AppStateAuthenticated,
  AppStateUnauthenticated,
  AuthenticationStatus,
  NoteCreatingFromText,
  NoteCreatingFromTitle,
  NoteDeleted,
  NoteDeleting,
  NoteListState,
  NoteOutOfSync,
  NoteRef,
  NoteRenaming,
  NoteRestoring,
  NoteSavingText,
  NoteState,
  NoteSynced,
  NoteTextEditorState,
  NoteTitleEditorState,
  SearchAutoSuggestState,
} from "./model";
import {
  EventType,
  LoadNoteTextSuccessEvent,
  NoteCreatedEvent,
  NoteCreationFailedEvent,
  NoteDeletedEvent,
  NoteDeleteTriggeredEvent,
  NoteLoadFailedEvent,
  NoteRenamedEvent,
  NoteRestoredEvent,
  NoteRestoredOnNewPathEvent,
  NoteRestoreTriggeredEvent,
  NoteSyncFailedEvent,
  NoteTextEditorTextChangedEvent,
  NoteTextSavedEvent,
  RegularNoteStartTextEditingEvent,
  RegularNoteTextUpdatedEvent,
  RegularNoteTitleEditorActivatedEvent,
  RegularNoteTitleEditorTextChangedEvent,
  RegularNoteTitleUpdatedEvent,
  RestApiErrorEvent,
  RetrieveFileListSuccessEvent,
  SearchAutoSuggestionsComputedEvent,
  SearchTextSubmittedEvent,
  TemplateNoteTitleEditorTextChangedEvent,
  TitleAutoSuggestionsUpdatedEvent,
  UserAuthenticatedEvent,
} from "./events";
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
  handleRegularNoteStartTextEditing,
  handleRegularNoteTextUpdated,
  handleRegularNoteTitleEditorActivated,
  handleRegularNoteTitleEditorTextChanged,
  handleRegularNoteTitleUpdated,
  handleRestApiError,
  handleRetrieveFileListSuccess,
  handleSearchActivated,
  handleSearchAutoSuggestionsComputed,
  handleSearchTextSubmitted,
  handleTemplateNoteStartTextEditing,
  handleTemplateNoteTextUpdated,
  handleTemplateNoteTitleEditorActivated,
  handleTemplateNoteTitleEditorTextChanged,
  handleTemplateNoteTitleUpdated,
  handleTitleAutoSuggestionsUpdated,
  handleUserAuthenticated,
  handleUserSessionCreated,
} from "./business";
import {
  CommandType,
  ComputeSearchAutoSuggestionsCommand,
  CreateNewNoteWithTextCommand,
  CreateNewNoteWithTitleCommand,
  CreateUserSessionCommand,
  DeleteNoteCommand,
  DoManyCommand,
  LoadNoteTextCommand,
  RenameNoteCommand,
  ReportErrorCommand,
  RestoreNoteCommand,
  RetrieveFileListCommand,
  SaveNoteTextCommand,
} from "./commands";

test("When user is authenticated, start new session", () => {
  const state: AppStateUnauthenticated = {
    auth: AuthenticationStatus.Unauthenticated,
  };

  const event: UserAuthenticatedEvent = {
    type: EventType.UserAuthenticated,
    idToken: "idToken",
  };

  const expectedState = state;

  const [newState, command] = handleUserAuthenticated(state, event);

  expect(newState).toBe(expectedState);
  expect(command.type).toBe(CommandType.CreateUserSession);
  expect((command as CreateUserSessionCommand).idToken).toBe("idToken");
});

test("When session is created, load file list", () => {
  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.RetrievingFileList,
      fileListVersion: 0,
    },
  };

  const [newState, command] = handleUserSessionCreated();

  expect(newState).toEqual(expectedState);
  expect(command.type).toBe(CommandType.DoMany);

  const firstCommand = (command as DoManyCommand).commands[0];
  expect(firstCommand.type).toBe(CommandType.RetrieveFileList);
  expect((firstCommand as RetrieveFileListCommand).searchString).toBe("");
  expect((firstCommand as RetrieveFileListCommand).fileListVersion).toBe(0);
});

test("When session is created, also schedule IdToken periodic refresh", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, command] = handleUserSessionCreated();

  expect(command.type).toBe(CommandType.DoMany);

  const secondCommand = (command as DoManyCommand).commands[1];
  expect(secondCommand.type).toBe(CommandType.ScheduleIdTokenRefresh);
});

test("When search is submitted, retrieve filtered file list", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: SearchTextSubmittedEvent = {
    type: EventType.SearchTextSubmitted,
    text: "search text",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.RetrievingFileList,
      fileListVersion: 1,
    },
  };

  const [newState, command] = handleSearchTextSubmitted(state, event);

  expect(newState).toEqual(expectedState);

  expect(command.type).toBe(CommandType.RetrieveFileList);
  expect((command as RetrieveFileListCommand).searchString).toBe("search text");
  expect((command as RetrieveFileListCommand).fileListVersion).toBe(1);
});

test("When search is activated, title editing is canceled", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingTemplateNote,
      text: "template note",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleSearchActivated(state);

  expect(newState).toEqual(expectedState);
});

test("When search is activated, text editing is canceled", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingTemplateNote,
      text: "template note",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleSearchActivated(state);

  expect(newState).toEqual(expectedState);
});

test("Editing template note title is recorded in state", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingTemplateNote,
      text: "template note",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: TemplateNoteTitleEditorTextChangedEvent = {
    type: EventType.TemplateNoteTitleEditorTextChanged,
    newText: "template note updated",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingTemplateNote,
      text: "template note updated",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleTemplateNoteTitleEditorTextChanged(state, event);

  expect(newState).toEqual(expectedState);
});

test("Editing regular note title is recorded in state", () => {
  const note: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingRegularNote,
      note,
      text: "text",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: RegularNoteTitleEditorTextChangedEvent = {
    type: EventType.RegularNoteTitleEditorTextChanged,
    note,
    newText: "text updated",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingRegularNote,
      note,
      text: "text updated",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleRegularNoteTitleEditorTextChanged(state, event);

  expect(newState).toEqual(expectedState);
});

test("When template note title is updated, the note converts to a regular, is saved and goes into text editing mode", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingTemplateNote,
      text: "template note",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const expectedNote: NoteCreatingFromTitle = {
    state: NoteState.CreatingFromTitle,
    id: "note_1",
    title: "template note",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingRegularNote,
      note: expectedNote,
      text: "",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 1,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  const [newState, command] = handleTemplateNoteTitleUpdated(state);

  expect(newState).toEqual(expectedState);

  expect(command.type).toBe(CommandType.CreateNewNoteWithTitle);
  expect((command as CreateNewNoteWithTitleCommand).note).toEqual(expectedNote);
});

test("When regular note title is updated, the note is renamed", () => {
  const note: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingRegularNote,
      note,
      text: "title updated",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: RegularNoteTitleUpdatedEvent = {
    type: EventType.RegularNoteTitleUpdated,
    note,
  };

  const expectedNote: NoteRenaming = {
    state: NoteState.Renaming,
    id: "id",
    path: "path",
    title: "title updated",
    text: "text",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  const [newState, command] = handleRegularNoteTitleUpdated(state, event);

  expect(newState).toEqual(expectedState);

  expect(command.type).toBe(CommandType.RenameNote);
  expect((command as RenameNoteCommand).note).toEqual(expectedNote);
});

test("Editing note text is recorded in state", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingTemplateNote,
      text: "template note",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: NoteTextEditorTextChangedEvent = {
    type: EventType.NoteTextEditorTextChanged,
    newText: "template note updated",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingTemplateNote,
      text: "template note updated",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleNoteTextEditorTextChanged(state, event);

  expect(newState).toEqual(expectedState);
});

test("Cancel note title editing reverts to previous value", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingTemplateNote,
      text: "template note",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleNoteTitleEditorCancelEdit(state);

  expect(newState).toEqual(expectedState);
});

test("Cancel note text editing reverts to previous value", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingTemplateNote,
      text: "template note",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleNoteTextEditorCancelEdit(state);

  expect(newState).toEqual(expectedState);
});

test("When template note title editor is activated, all other editors are disactivated", () => {
  const note: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingRegularNote,
      note,
      text: "title",
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingRegularNote,
      note,
      text: "text",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingTemplateNote,
      text: "",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleTemplateNoteTitleEditorActivated(state);

  expect(newState).toEqual(expectedState);
});

test("When regular note title editor is activated, all other editors are disactivated", () => {
  const note: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingTemplateNote,
      text: "title",
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingTemplateNote,
      text: "text",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: RegularNoteTitleEditorActivatedEvent = {
    type: EventType.RegularNoteTitleEditorActivated,
    note,
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingRegularNote,
      note,
      text: "title",
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleRegularNoteTitleEditorActivated(state, event);

  expect(newState).toEqual(expectedState);
});

test("When template note starts text editing, all other editors are disactivated", () => {
  const note: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingRegularNote,
      note,
      text: "title",
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingRegularNote,
      note,
      text: "text",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingTemplateNote,
      text: "",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleTemplateNoteStartTextEditing(state);

  expect(newState).toEqual(expectedState);
});

test("When regular note note starts text editing, all other editors are disactivated", () => {
  const note: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingTemplateNote,
      text: "title",
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingTemplateNote,
      text: "text",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: RegularNoteStartTextEditingEvent = {
    type: EventType.RegularNoteStartTextEditing,
    note,
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingRegularNote,
      note,
      text: "text",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleRegularNoteStartTextEditing(state, event);

  expect(newState).toEqual(expectedState);
});

test("When template note text is updated, the note converts to a regular and is saved", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingTemplateNote,
      text: "template note",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const expectedNote: NoteCreatingFromText = {
    state: NoteState.CreatingFromText,
    id: "note_1",
    text: "template note",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 1,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  const [newState, command] = handleTemplateNoteTextUpdated(state);

  expect(newState).toEqual(expectedState);

  expect(command.type).toBe(CommandType.CreateNewNoteWithText);
  expect((command as CreateNewNoteWithTextCommand).note).toEqual(expectedNote);
});

test("When regular note text is updated, the note is saved", () => {
  const note: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.EditingRegularNote,
      note,
      text: "text updated",
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: RegularNoteTextUpdatedEvent = {
    type: EventType.RegularNoteTextUpdated,
    note,
  };

  const expectedNote: NoteSavingText = {
    state: NoteState.SavingText,
    id: "id",
    path: "path",
    title: "title",
    text: "text updated",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  const [newState, command] = handleRegularNoteTextUpdated(state, event);

  expect(newState).toEqual(expectedState);

  expect(command.type).toBe(CommandType.SaveNoteText);
  expect((command as SaveNoteTextCommand).note).toEqual(expectedNote);
});

test("When note is deleted, converts to deleting and is deleted in the storage", () => {
  const note: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteDeleteTriggeredEvent = {
    type: EventType.NoteDeleteTriggered,
    note,
  };

  const expectedNote: NoteDeleting = {
    state: NoteState.Deleting,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  const [newState, command] = handleNoteDeleteTriggered(state, event);

  expect(newState).toEqual(expectedState);

  expect(command.type).toBe(CommandType.DoMany);

  const firstCommand = (command as DoManyCommand).commands[0];
  expect(firstCommand.type).toBe(CommandType.DeleteNote);
  expect((firstCommand as DeleteNoteCommand).note).toEqual(expectedNote);
});

test("When note is deleted, one more note is loaded from unprocessed list", () => {
  const note: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: ["path1"],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteDeleteTriggeredEvent = {
    type: EventType.NoteDeleteTriggered,
    note,
  };

  const expectedNoteDeleting: NoteDeleting = {
    state: NoteState.Deleting,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const expectedNoteRef: NoteRef = {
    state: NoteState.Ref,
    id: "note_1",
    path: "path1",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 1,
      renderingQueue: [expectedNoteRef],
      notes: [expectedNoteDeleting],
    },
  };

  const [newState, command] = handleNoteDeleteTriggered(state, event);

  expect(newState).toEqual(expectedState);
  expect(command.type).toBe(CommandType.DoMany);

  const secondCommand = (command as DoManyCommand).commands[1];
  expect(secondCommand.type).toBe(CommandType.LoadNoteText);
  expect((secondCommand as LoadNoteTextCommand).notes).toContainEqual(
    expectedNoteRef
  );
  expect((secondCommand as LoadNoteTextCommand).fileListVersion).toBe(0);
});

test("When deleting note is deleted in storage, it gets updated in the note list", () => {
  const note: NoteDeleting = {
    state: NoteState.Deleting,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteDeletedEvent = {
    type: EventType.NoteDeleted,
    note,
  };

  const expectedNote: NoteDeleted = {
    state: NoteState.Deleted,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleNoteDeleted(state, event);

  expect(newState).toEqual(expectedState);
});

test("When note is restored, converts to syncing and is restored in the storage", () => {
  const note: NoteDeleted = {
    state: NoteState.Deleted,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteRestoreTriggeredEvent = {
    type: EventType.NoteRestoreTriggered,
    note,
  };

  const expectedNote: NoteRestoring = {
    state: NoteState.Restoring,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  const [newState, command] = handleNoteRestoreTriggered(state, event);

  expect(newState).toEqual(expectedState);

  expect(command.type).toBe(CommandType.RestoreNote);
  expect((command as RestoreNoteCommand).note).toEqual(expectedNote);
});

test("When filelist is retrieved with more notes than fits one page, load notes on first page", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.RetrievingFileList,
      fileListVersion: 0,
    },
  };

  const event: RetrieveFileListSuccessEvent = {
    type: EventType.RetrieveFileListSuccess,
    fileList: [
      "file1",
      "file2",
      "file3",
      "file4",
      "file5",
      "file6",
      "file7",
      "file8",
      "file9",
      "file10",
      "file11",
      "file12",
      "file13",
      "file14",
      "file15",
    ],
    fileListVersion: 0,
  };

  const expectedRenderingQueue: NoteRef[] = [
    {
      state: NoteState.Ref,
      id: "note_1",
      path: "file1",
    },
    {
      state: NoteState.Ref,
      id: "note_2",
      path: "file2",
    },
    {
      state: NoteState.Ref,
      id: "note_3",
      path: "file3",
    },
    {
      state: NoteState.Ref,
      id: "note_4",
      path: "file4",
    },
    {
      state: NoteState.Ref,
      id: "note_5",
      path: "file5",
    },
    {
      state: NoteState.Ref,
      id: "note_6",
      path: "file6",
    },
    {
      state: NoteState.Ref,
      id: "note_7",
      path: "file7",
    },
    {
      state: NoteState.Ref,
      id: "note_8",
      path: "file8",
    },
    {
      state: NoteState.Ref,
      id: "note_9",
      path: "file9",
    },
    {
      state: NoteState.Ref,
      id: "note_10",
      path: "file10",
    },
  ];

  const expectedNotes: NoteRef[] = [
    {
      state: NoteState.Ref,
      id: "note_1",
      path: "file1",
    },
    {
      state: NoteState.Ref,
      id: "note_2",
      path: "file2",
    },
    {
      state: NoteState.Ref,
      id: "note_3",
      path: "file3",
    },
    {
      state: NoteState.Ref,
      id: "note_4",
      path: "file4",
    },
    {
      state: NoteState.Ref,
      id: "note_5",
      path: "file5",
    },
    {
      state: NoteState.Ref,
      id: "note_6",
      path: "file6",
    },
    {
      state: NoteState.Ref,
      id: "note_7",
      path: "file7",
    },
    {
      state: NoteState.Ref,
      id: "note_8",
      path: "file8",
    },
    {
      state: NoteState.Ref,
      id: "note_9",
      path: "file9",
    },
    {
      state: NoteState.Ref,
      id: "note_10",
      path: "file10",
    },
  ];

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: ["file11", "file12", "file13", "file14", "file15"],
      lastUsedNoteId: 10,
      renderingQueue: expectedRenderingQueue,
      notes: [],
    },
  };

  const [newState, command] = handleRetrieveFileListSuccess(state, event);

  expect(newState).toEqual(expectedState);
  expect(command.type).toBe(CommandType.DoMany);

  const firstCommand = (command as DoManyCommand).commands[0];
  expect(firstCommand.type).toBe(CommandType.LoadNoteText);
  expect((firstCommand as LoadNoteTextCommand).notes).toEqual(expectedNotes);
  expect((firstCommand as LoadNoteTextCommand).fileListVersion).toBe(0);
});

test("When filelist is retrieved with less notes than fits one page, load all of them", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.RetrievingFileList,
      fileListVersion: 0,
    },
  };

  const event: RetrieveFileListSuccessEvent = {
    type: EventType.RetrieveFileListSuccess,
    fileList: ["file1", "file2", "file3"],
    fileListVersion: 0,
  };

  const expectedRenderingQueue: NoteRef[] = [
    {
      state: NoteState.Ref,
      id: "note_1",
      path: "file1",
    },
    {
      state: NoteState.Ref,
      id: "note_2",
      path: "file2",
    },
    {
      state: NoteState.Ref,
      id: "note_3",
      path: "file3",
    },
  ];

  const expectedNotes: NoteRef[] = [
    {
      state: NoteState.Ref,
      id: "note_1",
      path: "file1",
    },
    {
      state: NoteState.Ref,
      id: "note_2",
      path: "file2",
    },
    {
      state: NoteState.Ref,
      id: "note_3",
      path: "file3",
    },
  ];

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 3,
      renderingQueue: expectedRenderingQueue,
      notes: [],
    },
  };

  const [newState, command] = handleRetrieveFileListSuccess(state, event);

  expect(newState).toEqual(expectedState);
  expect(command.type).toBe(CommandType.DoMany);

  const firstCommand = (command as DoManyCommand).commands[0];
  expect(firstCommand.type).toBe(CommandType.LoadNoteText);
  expect((firstCommand as LoadNoteTextCommand).notes).toEqual(expectedNotes);
  expect((firstCommand as LoadNoteTextCommand).fileListVersion).toBe(0);
});

test("When filelist is retrieved with outdated version, ignore the results", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.RetrievingFileList,
      fileListVersion: 2,
    },
  };

  const event: RetrieveFileListSuccessEvent = {
    type: EventType.RetrieveFileListSuccess,
    fileList: ["file1", "file2", "file3"],
    fileListVersion: 0,
  };

  const expectedState = state;

  const [newState, command] = handleRetrieveFileListSuccess(state, event);

  expect(newState).toEqual(expectedState);
  expect(command.type).toBe(CommandType.DoNothing);
});

test("When filelist is retrieved, also compute autosuggest state", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.RetrievingFileList,
      fileListVersion: 0,
    },
  };

  const event: RetrieveFileListSuccessEvent = {
    type: EventType.RetrieveFileListSuccess,
    fileList: [
      "file1",
      "file2",
      "file3",
      "file4",
      "file5",
      "file6",
      "file7",
      "file8",
      "file9",
      "file10",
      "file11",
      "file12",
      "file13",
      "file14",
      "file15",
    ],
    fileListVersion: 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, command] = handleRetrieveFileListSuccess(state, event);

  expect(command.type).toBe(CommandType.DoMany);

  const secondCommand = (command as DoManyCommand).commands[1];
  expect(secondCommand.type).toBe(CommandType.ComputeSearchAutoSuggestions);
  expect(
    (secondCommand as ComputeSearchAutoSuggestionsCommand).fileList
  ).toEqual(event.fileList);
});

test("When autosuggest is computed, put in the state", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: SearchAutoSuggestionsComputedEvent = {
    type: EventType.SearchAutoSuggestionsComputed,
    items: [
      {
        value: "item1",
        data: {
          g: "",
        },
      },
      {
        value: "item2",
        data: {
          g: "",
        },
      },
    ],
    hashTags: [
      {
        value: "tag1",
        data: "tag1",
      },
      {
        value: "tag2",
        data: "tag2",
      },
    ],
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.Computed,
      items: event.items,
      hashTags: event.hashTags,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleSearchAutoSuggestionsComputed(state, event);

  expect(newState).toEqual(expectedState);
});

test("When autosuggest is updated, merge into the state", () => {
  const autoSuggestItems = [
    {
      value: "item1",
      data: {
        g: "",
      },
    },
    {
      value: "item2",
      data: {
        g: "",
      },
    },
  ];

  const autoSuggestHashTags = [
    {
      value: "tag1",
      data: "tag1",
    },
    {
      value: "tag2",
      data: "tag2",
    },
  ];

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.Computed,
      items: autoSuggestItems,
      hashTags: autoSuggestHashTags,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: TitleAutoSuggestionsUpdatedEvent = {
    type: EventType.TitleAutoSuggestionsUpdated,
    hashTags: [
      {
        value: "tag3",
        data: "tag3",
      },
    ],
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.Computed,
      items: autoSuggestItems,
      hashTags: autoSuggestHashTags.concat(event.hashTags),
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleTitleAutoSuggestionsUpdated(state, event);

  expect(newState).toEqual(expectedState);
});

test("When note is renamed in storage, update the path", () => {
  const note: NoteRenaming = {
    state: NoteState.Renaming,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteRenamedEvent = {
    type: EventType.NoteRenamed,
    note,
    newPath: "newpath",
  };

  const expectedNote: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "newpath",
    title: "title",
    text: "text",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleNoteRenamed(state, event);

  expect(newState).toEqual(expectedState);
});

test("When note is created in storage, update the path", () => {
  const note: NoteCreatingFromTitle = {
    state: NoteState.CreatingFromTitle,
    id: "id",
    title: "title",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteCreatedEvent = {
    type: EventType.NoteCreated,
    note,
    newPath: "newpath",
  };

  const expectedNote: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "newpath",
    title: "title",
    text: "",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleNoteCreated(state, event);

  expect(newState).toEqual(expectedState);
});

test("When note is restored in storage with new path, update the path", () => {
  const note: NoteRestoring = {
    state: NoteState.Restoring,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteRestoredOnNewPathEvent = {
    type: EventType.NoteRestoredOnNewPath,
    note,
    newPath: "newpath",
  };

  const expectedNote: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "newpath",
    title: "title",
    text: "text",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleNoteRestoredOnNewPath(state, event);

  expect(newState).toEqual(expectedState);
});

test("When note text is saved into storage, update to synced", () => {
  const note: NoteSavingText = {
    state: NoteState.SavingText,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteTextSavedEvent = {
    type: EventType.NoteTextSaved,
    note,
  };

  const expectedNote: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleNoteTextSaved(state, event);

  expect(newState).toEqual(expectedState);
});

test("When note text is restored in storage, update to synced", () => {
  const note: NoteRestoring = {
    state: NoteState.Restoring,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteRestoredEvent = {
    type: EventType.NoteRestored,
    note,
  };

  const expectedNote: NoteSynced = {
    state: NoteState.Synced,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleNoteRestored(state, event);

  expect(newState).toEqual(expectedState);
});

test("When note is loaded and ready to render, render all the ready notes at the head of rendering queue", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 3,
      renderingQueue: [
        {
          state: NoteState.Ref,
          id: "note_1",
          path: "file1",
        },
        {
          state: NoteState.Synced,
          id: "note_2",
          path: "file2",
          title: "title",
          text: "text",
        },
        {
          state: NoteState.Ref,
          id: "note_3",
          path: "file3",
        },
      ],
      notes: [],
    },
  };

  const event: LoadNoteTextSuccessEvent = {
    type: EventType.LoadNoteTextSuccess,
    note: {
      state: NoteState.Ref,
      id: "note_1",
      // important to have extension here, as the title is derived from path
      path: "file1.txt",
    },
    text: "loaded text",
    fileListVersion: 0,
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 3,
      renderingQueue: [
        {
          state: NoteState.Ref,
          id: "note_3",
          path: "file3",
        },
      ],
      notes: [
        {
          state: NoteState.Synced,
          id: "note_1",
          path: "file1.txt",
          title: "file1", // derived from title
          text: "loaded text",
        },
        {
          state: NoteState.Synced,
          id: "note_2",
          path: "file2",
          title: "title",
          text: "text",
        },
      ],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleLoadNoteTextSuccess(state, event);

  expect(newState).toEqual(expectedState);
});

test("When note is loaded but is blocked by previous note, keep it on rendering queue", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 3,
      renderingQueue: [
        {
          state: NoteState.Ref,
          id: "note_1",
          path: "file1",
        },
        {
          state: NoteState.Ref,
          id: "note_2",
          path: "file2",
        },
        {
          state: NoteState.Ref,
          id: "note_3",
          path: "file3",
        },
      ],
      notes: [],
    },
  };

  const event: LoadNoteTextSuccessEvent = {
    type: EventType.LoadNoteTextSuccess,
    note: {
      state: NoteState.Ref,
      id: "note_2",
      // important to have extension here, as the title is derived from path
      path: "file2.txt",
    },
    text: "loaded text",
    fileListVersion: 0,
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 3,
      renderingQueue: [
        {
          state: NoteState.Ref,
          id: "note_1",
          path: "file1",
        },
        {
          state: NoteState.Synced,
          id: "note_2",
          path: "file2.txt",
          title: "file2", // derived from title
          text: "loaded text",
        },
        {
          state: NoteState.Ref,
          id: "note_3",
          path: "file3",
        },
      ],
      notes: [],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleLoadNoteTextSuccess(state, event);

  expect(newState).toEqual(expectedState);
});

test("When note is loaded but it's for an old file list, ignore it", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 2,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: LoadNoteTextSuccessEvent = {
    type: EventType.LoadNoteTextSuccess,
    note: {
      state: NoteState.Ref,
      id: "note_1",
      // important to have extension here, as the title is derived from path
      path: "file1.txt",
    },
    text: "loaded text",
    fileListVersion: 0,
  };

  const expectedState = state;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newState, _] = handleLoadNoteTextSuccess(state, event);

  expect(newState).toEqual(expectedState);
});

test("When load next page is requested, load notes for the next page", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: ["file2", "file3"],
      lastUsedNoteId: 1,
      renderingQueue: [],
      notes: [
        {
          state: NoteState.Synced,
          id: "note_1",
          path: "file1",
          title: "title",
          text: "text",
        },
      ],
    },
  };

  const expectedRenderingQueue: NoteRef[] = [
    {
      state: NoteState.Ref,
      id: "note_2",
      path: "file2",
    },
    {
      state: NoteState.Ref,
      id: "note_3",
      path: "file3",
    },
  ];

  const expectedNotes: NoteRef[] = [
    {
      state: NoteState.Ref,
      id: "note_2",
      path: "file2",
    },
    {
      state: NoteState.Ref,
      id: "note_3",
      path: "file3",
    },
  ];

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 3,
      renderingQueue: expectedRenderingQueue,
      notes: [
        {
          state: NoteState.Synced,
          id: "note_1",
          path: "file1",
          title: "title",
          text: "text",
        },
      ],
    },
  };

  const [newState, command] = handleLoadNextPage(state);
  expect(newState).toEqual(expectedState);

  expect(command.type).toBe(CommandType.LoadNoteText);
  expect((command as LoadNoteTextCommand).notes).toEqual(expectedNotes);
  expect((command as LoadNoteTextCommand).fileListVersion).toBe(0);
});

test("When note load fails, render all the ready notes and report error", () => {
  const note: NoteRef = {
    state: NoteState.Ref,
    id: "note_1",
    // important to have extension here, as the title is derived from path
    path: "file1.txt",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [
        note,
        {
          state: NoteState.Synced,
          id: "note_2",
          path: "file2",
          title: "title",
          text: "text",
        },
        {
          state: NoteState.Ref,
          id: "note_3",
          path: "file3",
        },
      ],
      notes: [],
    },
  };

  const event: NoteLoadFailedEvent = {
    type: EventType.NoteLoadFailed,
    note,
    err: "error",
  };

  const expectedNote: NoteOutOfSync = {
    state: NoteState.OutOfSync,
    id: "note_1",
    path: "file1.txt",
    title: "file1", // derived from title
    text: "",
    err: "error",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [
        {
          state: NoteState.Ref,
          id: "note_3",
          path: "file3",
        },
      ],
      notes: [
        expectedNote,
        {
          state: NoteState.Synced,
          id: "note_2",
          path: "file2",
          title: "title",
          text: "text",
        },
      ],
    },
  };

  const [newState, command] = handleNoteLoadFailed(state, event);

  expect(newState).toEqual(expectedState);
  expect(command.type).toBe(CommandType.ReportError);
  expect((command as ReportErrorCommand).err).toBe("error");
});

test("When note sync fails, update to out of sync", () => {
  const note: NoteSavingText = {
    state: NoteState.SavingText,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteSyncFailedEvent = {
    type: EventType.NoteSyncFailed,
    note,
    err: "error",
  };

  const expectedNote: NoteOutOfSync = {
    state: NoteState.OutOfSync,
    id: "id",
    path: "path",
    title: "title",
    text: "text",
    err: "error",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  const [newState, command] = handleNoteSyncFailed(state, event);

  expect(newState).toEqual(expectedState);
  expect(command.type).toBe(CommandType.ReportError);
  expect((command as ReportErrorCommand).err).toBe("error");
});

test("When note creation fails, update to out of sync", () => {
  const note: NoteCreatingFromTitle = {
    state: NoteState.CreatingFromTitle,
    id: "id",
    title: "title",
  };

  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [note],
    },
  };

  const event: NoteCreationFailedEvent = {
    type: EventType.NoteCreationFailed,
    note,
    path: "title.txt",
    err: "error",
  };

  const expectedNote: NoteOutOfSync = {
    state: NoteState.OutOfSync,
    id: "id",
    path: "title.txt",
    title: "title",
    text: "",
    err: "error",
  };

  const expectedState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [expectedNote],
    },
  };

  const [newState, command] = handleNoteCreationFailed(state, event);

  expect(newState).toEqual(expectedState);
  expect(command.type).toBe(CommandType.ReportError);
  expect((command as ReportErrorCommand).err).toBe("error");
});

test("When received generic rest API error, report it", () => {
  const state: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.FileListRetrieved,
      fileListVersion: 0,
      unprocessedFiles: [],
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    },
  };

  const event: RestApiErrorEvent = {
    type: EventType.RestApiError,
    err: "error",
  };

  const expectedState = state;

  const [newState, command] = handleRestApiError(state, event);

  expect(newState).toEqual(expectedState);
  expect(command.type).toBe(CommandType.ReportError);
  expect((command as ReportErrorCommand).err).toBe("error");
});

test("", () => {});
