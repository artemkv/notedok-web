import { LoadedNote } from "./state";

export enum EventType {
  TemplateNoteStartTextEditing,
  TemplateNoteCancelTextEditing,
  RetrieveFileListSuccess, // TODO: handle failure
  LoadNoteContentSuccess, // TODO: handle failure
}

export interface Event {
  type: EventType;
}

export interface TemplateNoteStartTextEditingEvent extends Event {
  type: EventType.TemplateNoteStartTextEditing;
}

export interface TemplateNoteCancelTextEditingEvent extends Event {
  type: EventType.TemplateNoteCancelTextEditing;
}

export interface RetrieveFileListSuccessEvent extends Event {
  type: EventType.RetrieveFileListSuccess;
  data: Array<string>;
}

export interface LoadNoteContentSuccessEvent extends Event {
  type: EventType.LoadNoteContentSuccess;
  data: [LoadedNote, number];
}

export type AppEvent =
  | TemplateNoteStartTextEditingEvent
  | TemplateNoteCancelTextEditingEvent
  | RetrieveFileListSuccessEvent
  | LoadNoteContentSuccessEvent;
