import {
  NoteDeletable,
  NoteDeleted,
  NotePendingPathUpdate,
  NoteRef,
  NoteSyncing,
  NoteTextEditable,
  NoteTextSaveable,
  NoteTitleEditable,
  NoteTitleSaveable,
} from "./model";

export enum EventType {
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
  NoteRestoreTriggered,

  // TODO: considering these 2, is Syncing really a good state?
  NoteSavedOnNewPath,
  NoteSaved,

  RetrieveFileListSuccess, // TODO: handle failure
  LoadNoteContentSuccess, // TODO: handle failure
  LoadNextPage,

  NoteSyncFailed, // Note-related errors
  RestApiError, // Generic errors
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

export interface NoteRestoreTriggeredEvent {
  type: EventType.NoteRestoreTriggered;
  note: NoteDeleted;
}

export interface RetrieveFileListSuccessEvent {
  type: EventType.RetrieveFileListSuccess;
  fileListVersion: number;
  fileList: Array<string>;
}

export interface LoadNoteContentSuccessEvent {
  type: EventType.LoadNoteContentSuccess;
  note: NoteRef;
  content: string;
  fileListVersion: number;
}

export interface LoadNextPageEvent {
  type: EventType.LoadNextPage;
}

export interface NoteSavedOnNewPathEvent {
  type: EventType.NoteSavedOnNewPath;
  note: NotePendingPathUpdate;
  newPath: string;
}

export interface NoteSavedEvent {
  type: EventType.NoteSaved;
  note: NoteSyncing;
}

export interface NoteSyncFailed {
  type: EventType.NoteSyncFailed;
  note: NoteSyncing;
  err: string;
}

export interface RestApiErrorEvent {
  type: EventType.RestApiError;
  err: string;
}

export type AppEvent =
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
  | NoteRestoreTriggeredEvent
  | NoteSavedOnNewPathEvent
  | NoteSavedEvent
  | RetrieveFileListSuccessEvent
  | LoadNoteContentSuccessEvent
  | LoadNextPageEvent
  | NoteSyncFailed
  | RestApiErrorEvent;
