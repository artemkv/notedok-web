import { NoteLoaded } from "./model";

export enum EventType {
  TemplateNoteStartTextEditing,
  TemplateNoteCancelTextEditing,
  TemplateNoteTextUpdated,
  RegularNoteStartTextEditing,
  RegularNoteCancelTextEditing,
  RegularNoteTextUpdated,
  NoteEditorTextChanged,
  RetrieveFileListSuccess, // TODO: handle failure
  LoadNoteContentSuccess, // TODO: handle failure
  LoadNextPage,
}

export interface TemplateNoteStartTextEditingEvent {
  type: EventType.TemplateNoteStartTextEditing;
}

export interface TemplateNoteCancelTextEditingEvent {
  type: EventType.TemplateNoteCancelTextEditing;
}

export interface TemplateNoteTextUpdatedEvent {
  type: EventType.TemplateNoteTextUpdated;
  newText: string;
}

export interface RegularNoteStartTextEditingEvent {
  type: EventType.RegularNoteStartTextEditing;
  note: NoteLoaded;
}

export interface RegularNoteCancelTextEditingEvent {
  type: EventType.RegularNoteCancelTextEditing;
}

export interface RegularNoteTextUpdatedEvent {
  type: EventType.RegularNoteTextUpdated;
  note: NoteLoaded;
  newText: string;
}

export interface NoteEditorTextChangedEvent {
  type: EventType.NoteEditorTextChanged;
  newText: string;
}

export interface RetrieveFileListSuccessEvent {
  type: EventType.RetrieveFileListSuccess;
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

export type AppEvent =
  | TemplateNoteStartTextEditingEvent
  | TemplateNoteCancelTextEditingEvent
  | TemplateNoteTextUpdatedEvent
  | RegularNoteStartTextEditingEvent
  | RegularNoteCancelTextEditingEvent
  | RegularNoteTextUpdatedEvent
  | NoteEditorTextChangedEvent
  | RetrieveFileListSuccessEvent
  | LoadNoteContentSuccessEvent
  | LoadNextPageEvent;
