import { NoteLoaded } from "./model";

export enum EventType {
  TemplateNoteStartTextEditing,
  TemplateNoteCancelTextEditing,
  RegularNoteStartTextEditing,
  RegularNoteCancelTextEditing,
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

export interface RegularNoteStartTextEditingEvent {
  type: EventType.RegularNoteStartTextEditing;
  note: NoteLoaded;
}

export interface RegularNoteCancelTextEditingEvent {
  type: EventType.RegularNoteCancelTextEditing;
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
  | RetrieveFileListSuccessEvent
  | LoadNoteContentSuccessEvent
  | LoadNextPageEvent
  | RegularNoteStartTextEditingEvent
  | RegularNoteCancelTextEditingEvent;
