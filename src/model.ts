export enum ActionType {
  TemplateNoteStartTextEditing,
  TemplateNoteCancelTextEditing,
}

export interface TemplateNoteStartTextEditingAction {
  type: ActionType.TemplateNoteStartTextEditing;
}

export interface TemplateNoteCancelTextEditingAction {
  type: ActionType.TemplateNoteCancelTextEditing;
}

export type Action =
  | TemplateNoteStartTextEditingAction
  | TemplateNoteCancelTextEditingAction;

export interface Note {
  id: string;
  path: string;
  title: string;
  text: string;
}

export enum TemplateNoteState {
  Initial,
  EditingText,
}

export interface AppState {
  templateNoteState: TemplateNoteState;
}

export const IntialState: AppState = {
  templateNoteState: TemplateNoteState.Initial,
};

export type Dispatch = (action: Action) => void;

export const Reducer = (state: AppState, action: Action): AppState => {
  // TODO: use lens
  if (action.type === ActionType.TemplateNoteStartTextEditing) {
    return {
      templateNoteState: TemplateNoteState.EditingText,
    };
  }
  if (action.type === ActionType.TemplateNoteCancelTextEditing) {
    return {
      templateNoteState: TemplateNoteState.Initial,
    };
  }

  return state;
};
