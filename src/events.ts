import { NoteLoaded } from "./model";

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

  NoteSavedOnNewPath,

  RetrieveFileListSuccess, // TODO: handle failure
  LoadNoteContentSuccess, // TODO: handle failure
  LoadNextPage,

  RestApiError,
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
  note: NoteLoaded;
  newText: string;
}

export interface RegularNoteTitleUpdatedEvent {
  type: EventType.RegularNoteTitleUpdated;
  note: NoteLoaded;
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
  note: NoteLoaded;
}

export interface RegularNoteTextUpdatedEvent {
  type: EventType.RegularNoteTextUpdated;
  note: NoteLoaded;
  newText: string;
}

export interface NoteDeleteTriggeredEvent {
  type: EventType.NoteDeleteTriggered;
  note: NoteLoaded;
}

export interface NoteRestoreTriggeredEvent {
  type: EventType.NoteRestoreTriggered;
  note: NoteLoaded;
}

export interface RetrieveFileListSuccessEvent {
  type: EventType.RetrieveFileListSuccess;
  fileListVersion: number;
  fileList: Array<string>;
}

export interface LoadNoteContentSuccessEvent {
  type: EventType.LoadNoteContentSuccess;
  note: NoteLoaded;
  fileListVersion: number;
}

export interface LoadNextPageEvent {
  type: EventType.LoadNextPage;
}

export interface NoteSavedOnNewPathEvent {
  type: EventType.NoteSavedOnNewPath;
  note: NoteLoaded;
  newPath: string;
}

export interface RestApiErrorEvent {
  type: EventType.RestApiError;
  err: unknown;
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
  | RetrieveFileListSuccessEvent
  | LoadNoteContentSuccessEvent
  | LoadNextPageEvent
  | RestApiErrorEvent;
