import { NoteLoaded } from "./model";

export enum EventType {
  TemplateNoteStartTextEditing,
  TemplateNoteCancelTextEditing,
  RetrieveFileListSuccess, // TODO: handle failure
  LoadNoteContentSuccess, // TODO: handle failure
  LoadNextPage,
  RegularNoteStartTextEditing,
  RegularNoteCancelTextEditing,
}

// TODO: still use data or should I move to named properties? I think I should

export interface TemplateNoteStartTextEditingEvent {
  type: EventType.TemplateNoteStartTextEditing;
}

export interface TemplateNoteCancelTextEditingEvent {
  type: EventType.TemplateNoteCancelTextEditing;
}

export interface RetrieveFileListSuccessEvent {
  type: EventType.RetrieveFileListSuccess;
  data: Array<string>;
}

export interface LoadNoteContentSuccessEvent {
  type: EventType.LoadNoteContentSuccess;
  data: [NoteLoaded, number];
}

export interface LoadNextPageEvent {
  type: EventType.LoadNextPage;
}

export interface RegularNoteStartTextEditingEvent {
  type: EventType.RegularNoteStartTextEditing;
  data: NoteLoaded;
}

export interface RegularNoteCancelTextEditingEvent {
  type: EventType.RegularNoteCancelTextEditing;
}

export type AppEvent =
  | TemplateNoteStartTextEditingEvent
  | TemplateNoteCancelTextEditingEvent
  | RetrieveFileListSuccessEvent
  | LoadNoteContentSuccessEvent
  | LoadNextPageEvent
  | RegularNoteStartTextEditingEvent
  | RegularNoteCancelTextEditingEvent;
