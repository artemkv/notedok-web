export enum EventType {
  TemplateNoteStartTextEditing,
  TemplateNoteCancelTextEditing,
  RetrieveFileListSuccess,
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

export type AppEvent =
  | TemplateNoteStartTextEditingEvent
  | TemplateNoteCancelTextEditingEvent
  | RetrieveFileListSuccessEvent;
