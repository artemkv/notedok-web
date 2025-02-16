import {
  AutoSuggestHashTag,
  AutoSuggestItem,
  NoteCreatingFromText,
  NoteCreatingFromTitle,
  NoteDeletable,
  NoteDeleted,
  NoteDeleting,
  NoteRef,
  NoteRenaming,
  NoteRestoring,
  NoteSavingText,
  NoteTextEditable,
  NoteTextSaveable,
  NoteTitleEditable,
  NoteTitleSaveable,
} from "./model";

export enum EventType {
  // "Never" event is never triggered in the app
  // this is just to make TS happy
  Never,

  UserAuthenticated,
  UserSessionCreated,

  SearchActivated,
  SearchTextChanged,
  SearchTextSubmitted,
  SearchTextSubmittedFromAutocomplete,
  SearchCancelEdit,

  TemplateNoteStartTitleEditing,
  TemplateNoteTitleUpdated,

  RegularNoteStartTitleEditing,
  RegularNoteTitleUpdated,

  NoteTitleEditorTextChanged,
  NoteTitleEditorCancelEdit,

  TemplateNoteStartTextEditing,
  TemplateNoteTextUpdated,

  RegularNoteStartTextEditing,
  RegularNoteTextUpdated,

  NoteTextEditorTextChanged,
  NoteTextEditorCancelEdit,

  NoteDeleteTriggered,
  NoteRestoreTriggered,

  // Storage-related events
  // Success-indicating events are more specific so we can take specific actions
  NoteRenamed, // NoteRenaming
  NoteTextSaved, // NoteSavingText
  NoteCreated, // NoteCreatingFromTitle | NoteCreatingFromText
  NoteDeleted, // NoteDeleting
  NoteRestored, // NoteRestoring
  NoteRestoredOnNewPath, // NoteRestoring

  RetrieveFileListSuccess,

  SearchAutoSuggestionsComputed,
  TitleAutoSuggestionsUpdated,

  LoadNoteTextSuccess,
  LoadNextPage,

  // Note-related errors (or whatever we treat as such)
  // Error-indicating events are less specific, to simplify the handling
  NoteLoadFailed,
  NoteSyncFailed, // NoteRenaming | NoteSavingText | NoteRestoring
  NoteCreationFailed, // NoteCreatingFromTitle | NoteCreatingFromText

  RestApiError, // Generic errors, includes failing to delete note
}

export interface NeverEvent {
  type: EventType.Never;
}

export interface UserAuthenticatedEvent {
  type: EventType.UserAuthenticated;
  idToken: string;
}

export interface UserSessionCreatedEvent {
  type: EventType.UserSessionCreated;
}

export interface SearchActivatedEvent {
  type: EventType.SearchActivated;
}

export interface SearchTextChangedEvent {
  type: EventType.SearchTextChanged;
  newText: string;
}

export interface SearchTextSubmittedEvent {
  type: EventType.SearchTextSubmitted;
}

export interface SearchTextSubmittedFromAutocompleteEvent {
  type: EventType.SearchTextSubmittedFromAutocomplete;
  text: string;
}

export interface SearchCancelEditEvent {
  type: EventType.SearchCancelEdit;
}

export interface TemplateNoteStartTitleEditingEvent {
  type: EventType.TemplateNoteStartTitleEditing;
}

export interface TemplateNoteTitleUpdatedEvent {
  type: EventType.TemplateNoteTitleUpdated;
  newTitle: string;
}

export interface RegularNoteStartTitleEditingEvent {
  type: EventType.RegularNoteStartTitleEditing;
  note: NoteTitleEditable;
}

export interface RegularNoteTitleUpdatedEvent {
  type: EventType.RegularNoteTitleUpdated;
  note: NoteTitleSaveable;
  newTitle: string;
}

export interface NoteTitleEditorTextChangedEvent {
  type: EventType.NoteTitleEditorTextChanged;
  newText: string;
}

export interface NoteTitleEditorCancelEditEvent {
  type: EventType.NoteTitleEditorCancelEdit;
}

export interface TemplateNoteStartTextEditingEvent {
  type: EventType.TemplateNoteStartTextEditing;
}

export interface TemplateNoteTextUpdatedEvent {
  type: EventType.TemplateNoteTextUpdated;
  newText: string;
}

export interface RegularNoteStartTextEditingEvent {
  type: EventType.RegularNoteStartTextEditing;
  note: NoteTextEditable;
}

export interface RegularNoteTextUpdatedEvent {
  type: EventType.RegularNoteTextUpdated;
  note: NoteTextSaveable;
  newText: string;
}

export interface NoteTextEditorTextChangedEvent {
  type: EventType.NoteTextEditorTextChanged;
  newText: string;
}

export interface NoteTextEditorCancelEditEvent {
  type: EventType.NoteTextEditorCancelEdit;
}

export interface NoteDeleteTriggeredEvent {
  type: EventType.NoteDeleteTriggered;
  note: NoteDeletable;
}

export interface NoteRestoreTriggeredEvent {
  type: EventType.NoteRestoreTriggered;
  note: NoteDeleted;
}

export interface NoteRenamedEvent {
  type: EventType.NoteRenamed;
  note: NoteRenaming;
  newPath: string;
}

export interface NoteTextSavedEvent {
  type: EventType.NoteTextSaved;
  note: NoteSavingText;
}

export interface NoteCreatedEvent {
  type: EventType.NoteCreated;
  note: NoteCreatingFromTitle | NoteCreatingFromText;
  newPath: string;
}

export interface NoteDeletedEvent {
  type: EventType.NoteDeleted;
  note: NoteDeleting;
}

export interface NoteRestoredEvent {
  type: EventType.NoteRestored;
  note: NoteRestoring;
}

export interface NoteRestoredOnNewPathEvent {
  type: EventType.NoteRestoredOnNewPath;
  note: NoteRestoring;
  newPath: string;
}

export interface RetrieveFileListSuccessEvent {
  type: EventType.RetrieveFileListSuccess;
  fileListVersion: number;
  fileList: string[];
}

export interface SearchAutoSuggestionsComputedEvent {
  type: EventType.SearchAutoSuggestionsComputed;
  autoSuggestItems: AutoSuggestItem[];
  autoSuggestHashTags: AutoSuggestHashTag[];
}

export interface TitleAutoSuggestionsUpdatedEvent {
  type: EventType.TitleAutoSuggestionsUpdated;
  autoSuggestHashTags: AutoSuggestHashTag[];
}

export interface LoadNoteTextSuccessEvent {
  type: EventType.LoadNoteTextSuccess;
  note: NoteRef;
  text: string;
  fileListVersion: number;
}

export interface LoadNextPageEvent {
  type: EventType.LoadNextPage;
}

export interface NoteLoadFailedEvent {
  type: EventType.NoteLoadFailed;
  note: NoteRef;
  err: string;
}

export interface NoteSyncFailedEvent {
  type: EventType.NoteSyncFailed;
  note: NoteRenaming | NoteSavingText | NoteRestoring;
  err: string;
}

export interface NoteCreationFailedEvent {
  type: EventType.NoteCreationFailed;
  note: NoteCreatingFromTitle | NoteCreatingFromText;
  path: string;
  err: string;
}

export interface RestApiErrorEvent {
  type: EventType.RestApiError;
  err: string;
}

export type AppEvent =
  | NeverEvent
  | UserAuthenticatedEvent
  | UserSessionCreatedEvent
  | SearchActivatedEvent
  | SearchTextChangedEvent
  | SearchTextSubmittedEvent
  | SearchTextSubmittedFromAutocompleteEvent
  | SearchCancelEditEvent
  | TemplateNoteStartTitleEditingEvent
  | TemplateNoteTitleUpdatedEvent
  | RegularNoteStartTitleEditingEvent
  | RegularNoteTitleUpdatedEvent
  | NoteTitleEditorTextChangedEvent
  | NoteTitleEditorCancelEditEvent
  | TemplateNoteStartTextEditingEvent
  | TemplateNoteTextUpdatedEvent
  | RegularNoteStartTextEditingEvent
  | RegularNoteTextUpdatedEvent
  | NoteTextEditorTextChangedEvent
  | NoteTextEditorCancelEditEvent
  | NoteDeleteTriggeredEvent
  | NoteRestoreTriggeredEvent
  | NoteRenamedEvent
  | NoteTextSavedEvent
  | NoteCreatedEvent
  | NoteDeletedEvent
  | NoteRestoredEvent
  | NoteRestoredOnNewPathEvent
  | RetrieveFileListSuccessEvent
  | SearchAutoSuggestionsComputedEvent
  | TitleAutoSuggestionsUpdatedEvent
  | LoadNoteTextSuccessEvent
  | LoadNextPageEvent
  | NoteLoadFailedEvent
  | NoteSyncFailedEvent
  | NoteCreationFailedEvent
  | RestApiErrorEvent;
