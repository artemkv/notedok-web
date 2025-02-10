import {
  AutoSuggestHashTag,
  AutoSuggestItem,
  NoteCreatingFromText,
  NoteCreatingFromTitle,
  NoteDeletable,
  NoteDeleted,
  NoteDeleting,
  NotePendingStorageUpdate,
  NoteRef,
  NoteSyncing,
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
  SearchTextAutoFilled,
  SearchCancelEdit,

  TitleEditorActivated,
  TitleEditorCancelEdit,

  TemplateNoteTitleEditorTextChanged,
  TemplateNoteTitleUpdated,

  RegularNoteTitleEditorTextChanged,
  RegularNoteTitleUpdated,

  NoteTextEditorTextChanged,
  NoteTextEditorCancelEdit,

  TemplateNoteStartTextEditing,
  TemplateNoteTextUpdated,

  RegularNoteStartTextEditing,
  RegularNoteTextUpdated,

  NoteDeleteTriggered,
  NoteDeleted,
  NoteRestoreTriggered,

  NoteSavedOnNewPath,
  NoteSaved,

  RetrieveFileListSuccess,

  SearchAutoSuggestionsComputed,

  LoadNoteTextSuccess,
  LoadNextPage,

  // Note-related errors (or whatever we treat as such)
  NoteLoadFailed,
  NoteSyncFailed,
  NoteCreationFromTitleFailed,
  NoteCreationFromTextFailed,

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

export interface SearchTextChangedEvent {
  type: EventType.SearchTextChanged;
  newText: string;
}

export interface SearchActivatedEvent {
  type: EventType.SearchActivated;
}

export interface SearchTextSubmittedEvent {
  type: EventType.SearchTextSubmitted;
}

export interface SearchTextAutoFilledEvent {
  type: EventType.SearchTextAutoFilled;
  text: string;
}

export interface SearchCancelEditEvent {
  type: EventType.SearchCancelEdit;
}

export interface TitleEditorActivatedEvent {
  type: EventType.TitleEditorActivated;
}

export interface TitleEditorCancelEditEvent {
  type: EventType.TitleEditorCancelEdit;
}

export interface TemplateNoteTitleEditorTextChangedEvent {
  type: EventType.TemplateNoteTitleEditorTextChanged;
  newText: string;
}

export interface TemplateNoteTitleUpdatedEvent {
  type: EventType.TemplateNoteTitleUpdated;
  newTitle: string;
}

export interface RegularNoteTitleEditorTextChangedEvent {
  type: EventType.RegularNoteTitleEditorTextChanged;
  note: NoteTitleEditable;
  newText: string;
}

export interface RegularNoteTitleUpdatedEvent {
  type: EventType.RegularNoteTitleUpdated;
  note: NoteTitleSaveable;
  newTitle: string;
}

export interface NoteTextEditorTextChangedEvent {
  type: EventType.NoteTextEditorTextChanged;
  newText: string;
}

export interface NoteTextEditorCancelEditEvent {
  type: EventType.NoteTextEditorCancelEdit;
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

export interface NoteDeleteTriggeredEvent {
  type: EventType.NoteDeleteTriggered;
  note: NoteDeletable;
}

export interface NoteDeletedEvent {
  type: EventType.NoteDeleted;
  note: NoteDeleting;
}

export interface NoteRestoreTriggeredEvent {
  type: EventType.NoteRestoreTriggered;
  note: NoteDeleted;
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

export interface LoadNoteTextSuccessEvent {
  type: EventType.LoadNoteTextSuccess;
  note: NoteRef;
  text: string;
  fileListVersion: number;
}

export interface LoadNextPageEvent {
  type: EventType.LoadNextPage;
}

export interface NoteSavedOnNewPathEvent {
  type: EventType.NoteSavedOnNewPath;
  note: NotePendingStorageUpdate;
  newPath: string;
}

export interface NoteSavedEvent {
  type: EventType.NoteSaved;
  note: NoteSyncing;
}

export interface NoteLoadFailedEvent {
  type: EventType.NoteLoadFailed;
  note: NoteRef;
  err: string;
}

export interface NoteSyncFailedEvent {
  type: EventType.NoteSyncFailed;
  note: NoteSyncing;
  err: string;
}

export interface NoteCreationFromTitleFailedEvent {
  type: EventType.NoteCreationFromTitleFailed;
  note: NoteCreatingFromTitle;
  path: string;
  err: string;
}

export interface NoteCreationFromTextFailedEvent {
  type: EventType.NoteCreationFromTextFailed;
  note: NoteCreatingFromText;
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
  | SearchTextAutoFilledEvent
  | SearchCancelEditEvent
  | TitleEditorActivatedEvent
  | TitleEditorCancelEditEvent
  | TemplateNoteTitleEditorTextChangedEvent
  | TemplateNoteTitleUpdatedEvent
  | RegularNoteTitleEditorTextChangedEvent
  | RegularNoteTitleUpdatedEvent
  | NoteTextEditorTextChangedEvent
  | NoteTextEditorCancelEditEvent
  | TemplateNoteStartTextEditingEvent
  | TemplateNoteTextUpdatedEvent
  | RegularNoteStartTextEditingEvent
  | RegularNoteTextUpdatedEvent
  | NoteDeleteTriggeredEvent
  | NoteDeletedEvent
  | NoteRestoreTriggeredEvent
  | NoteSavedOnNewPathEvent
  | NoteSavedEvent
  | RetrieveFileListSuccessEvent
  | SearchAutoSuggestionsComputedEvent
  | LoadNoteTextSuccessEvent
  | LoadNextPageEvent
  | NoteLoadFailedEvent
  | NoteSyncFailedEvent
  | NoteCreationFromTitleFailedEvent
  | NoteCreationFromTextFailedEvent
  | RestApiErrorEvent;
