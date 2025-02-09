import { AppCommand, DoMany, DoNothing } from "./commands";
import { ReportError } from "./commands/alerts";
import { StartUserSession } from "./commands/auth";
import { ActivateSearchAutoSuggest } from "./commands/autosuggest";
import {
  CreateNewNoteWithText,
  CreateNewNoteWithTitle,
  DeleteNote,
  LoadNoteText,
  RenameNoteFromTitle,
  RestoreNote,
  RetrieveFileList,
  SaveNoteText,
} from "./commands/storage";
import {
  LoadNoteTextSuccessEvent,
  NoteCreationFromTextFailedEvent,
  NoteCreationFromTitleFailedEvent,
  NoteDeletedEvent,
  NoteDeleteTriggeredEvent,
  NoteLoadFailedEvent,
  NoteRestoreTriggeredEvent,
  NoteSavedEvent,
  NoteSavedOnNewPathEvent,
  NoteSyncFailedEvent,
  NoteTextEditorTextChangedEvent,
  RegularNoteStartTextEditingEvent,
  RegularNoteTextUpdatedEvent,
  RegularNoteTitleEditorTextChangedEvent,
  RegularNoteTitleUpdatedEvent,
  RestApiErrorEvent,
  RetrieveFileListSuccessEvent,
  SearchAutoSuggestionsComputedEvent,
  SearchTextAutoFilledEvent,
  SearchTextChangedEvent,
  TemplateNoteTitleEditorTextChangedEvent,
  UserAuthenticatedEvent,
} from "./events";
import {
  NoteListState,
  NoteListFileListRetrieved,
  NoteTextEditorEditingRegularNote,
  NoteTitleEditorEditingRegularNote,
  NoteTextEditorEditingTemplateNote,
  NoteTitleEditorEditingTemplateNote,
  NoteTextEditor,
  NoteTextEditorState,
  NoteTitleEditor,
  AppState,
  NoteTitleEditorState,
  NoteList,
  NoteRef,
  NoteSynced,
  NoteVisible,
  isVisible,
  NoteState,
  NoteTextSaveable,
  NoteTitleSaveable,
  NoteSyncing,
  NotePendingStorageUpdate,
  NoteDeleted,
  NoteDeletable,
  Note,
  NoteOutOfSync,
  NoteDeleting,
  AuthenticationStatus,
  AppStateAuthenticated,
  AppStateUnauthenticated,
  SearchAutoSuggestState,
} from "./model";
import {
  createNewNoteFromText,
  createNewNoteFromTitle,
  createNewNoteRef,
  noteCreatingFromTextToOutOfSync,
  noteCreatingFromTextToSynced,
  noteCreatingFromTitleToOutOfSync,
  noteCreatingFromTitleToSynced,
  noteDeletedToSyncing,
  noteDeletingToDeleted,
  noteOutOfSyncToDeleting,
  noteOutOfSyncToSyncing,
  noteRefToOutOfSync,
  noteRefToSynced,
  noteSyncedToDeleting,
  noteSyncedToSyncing,
  noteSyncingToOutOfSync,
  noteSyncingToSynced,
  noteSyncingToSyncedWithNewPath,
} from "./noteLifecycle";

export const NOTES_ON_PAGE = 10;

export const JustStateAuthenticated = (
  state: AppStateAuthenticated
): [AppStateAuthenticated, AppCommand] => [state, DoNothing];

export const handleUserAuthenticated = (
  state: AppStateUnauthenticated,
  event: UserAuthenticatedEvent
): [AppState, AppCommand] => {
  return [state, StartUserSession(event.idToken)];
};

export const handleUserSessionCreated = (): [
  AppStateAuthenticated,
  AppCommand
] => {
  const newState: AppStateAuthenticated = {
    auth: AuthenticationStatus.Authenticated,
    searchText: "",
    searchAutoSuggest: {
      state: SearchAutoSuggestState.NotComputed,
    },
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.RetrievingFileList,
      fileListVersion: 0,
    },
  };

  return [newState, RetrieveFileList("", 0)];
};

export const handleSearchTextSubmitted = (
  state: AppStateAuthenticated
): [AppStateAuthenticated, AppCommand] => {
  const newFileListVersion = state.noteList.fileListVersion + 1;

  const newState: AppStateAuthenticated = {
    ...state,
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.RetrievingFileList,
      fileListVersion: newFileListVersion,
    },
  };

  return [newState, RetrieveFileList(state.searchText, newFileListVersion)];
};

export const handleSearchTextAutoFilled = (
  state: AppStateAuthenticated,
  event: SearchTextAutoFilledEvent
): [AppStateAuthenticated, AppCommand] => {
  const newFileListVersion = state.noteList.fileListVersion + 1;

  const newState: AppStateAuthenticated = {
    ...state,
    searchText: event.text,
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
    noteList: {
      state: NoteListState.RetrievingFileList,
      fileListVersion: newFileListVersion,
    },
  };

  return [newState, RetrieveFileList(event.text, newFileListVersion)];
};

export const cancelAllActiveEditors = (
  state: AppStateAuthenticated
): [AppStateAuthenticated, AppCommand] => {
  const newState: AppStateAuthenticated = {
    ...state,
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleSearchTextChanged = (
  state: AppStateAuthenticated,
  event: SearchTextChangedEvent
): [AppStateAuthenticated, AppCommand] => {
  const newState: AppStateAuthenticated = {
    ...state,
    searchText: event.newText,
  };
  return JustStateAuthenticated(newState);
};

export const handleTemplateNoteTitleEditorTextChanged = (
  state: AppStateAuthenticated,
  event: TemplateNoteTitleEditorTextChangedEvent
): [AppStateAuthenticated, AppCommand] => {
  const newState: AppStateAuthenticated = {
    ...state,
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingTemplateNote,
      text: event.newText,
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleTemplateNoteTitleUpdated = (
  state: AppStateAuthenticated
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    if (
      state.noteTitleEditor.state === NoteTitleEditorState.EditingTemplateNote
    ) {
      const [newNoteList, newTextEditor, command] =
        convertToRegularNoteOnTitleUpdated(
          state.noteList,
          state.noteTitleEditor
        );

      const newState: AppStateAuthenticated = {
        ...state,
        noteList: newNoteList,
        noteTitleEditor: {
          state: NoteTitleEditorState.NotActive,
        },
        noteTextEditor: newTextEditor,
      };

      return [newState, command];
    }
  }

  // If the file list wasnt't retrieved, ignore the change
  const newState: AppStateAuthenticated = {
    ...state,
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleRegularNoteTitleEditorTextChanged = (
  state: AppStateAuthenticated,
  event: RegularNoteTitleEditorTextChangedEvent
): [AppStateAuthenticated, AppCommand] => {
  const newState: AppStateAuthenticated = {
    ...state,
    noteTitleEditor: {
      state: NoteTitleEditorState.EditingRegularNote,
      note: event.note,
      text: event.newText,
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleRegularNoteTitleUpdated = (
  state: AppStateAuthenticated,
  event: RegularNoteTitleUpdatedEvent
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    if (
      state.noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote
    ) {
      const [newNoteList, command] = finishNoteTitleEditing(
        state.noteList,
        event.note,
        state.noteTitleEditor
      );

      const newState: AppStateAuthenticated = {
        ...state,
        noteList: newNoteList,
        noteTitleEditor: {
          state: NoteTitleEditorState.NotActive,
        },
      };

      return [newState, command];
    }
  }
  return JustStateAuthenticated(state);
};

export const handleNoteTextEditorTextChanged = (
  state: AppStateAuthenticated,
  event: NoteTextEditorTextChangedEvent
): [AppStateAuthenticated, AppCommand] => {
  if (
    state.noteTextEditor.state === NoteTextEditorState.EditingRegularNote ||
    state.noteTextEditor.state === NoteTextEditorState.EditingTemplateNote
  ) {
    const newState: AppStateAuthenticated = {
      ...state,
      noteTextEditor: {
        ...state.noteTextEditor,
        text: event.newText,
      },
    };
    return JustStateAuthenticated(newState);
  }
  return JustStateAuthenticated(state);
};

export const handleNoteTitleEditorCancelEdit = (
  state: AppStateAuthenticated
): [AppStateAuthenticated, AppCommand] => {
  const newState: AppStateAuthenticated = {
    ...state,
    noteTitleEditor: {
      state: NoteTitleEditorState.NotActive,
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleNoteTextEditorCancelEdit = (
  state: AppStateAuthenticated
): [AppStateAuthenticated, AppCommand] => {
  const newState: AppStateAuthenticated = {
    ...state,
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleTemplateNoteStartTextEditing = (
  state: AppStateAuthenticated
): [AppStateAuthenticated, AppCommand] => {
  const newState: AppStateAuthenticated = {
    ...state,
    noteTextEditor: {
      state: NoteTextEditorState.EditingTemplateNote,
      text: "",
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleTemplateNoteTextUpdated = (
  state: AppStateAuthenticated
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    if (
      state.noteTextEditor.state === NoteTextEditorState.EditingTemplateNote
    ) {
      const [newNoteList, command] = convertToRegularNoteOnTextUpdated(
        state.noteList,
        state.noteTextEditor
      );

      const newState: AppStateAuthenticated = {
        ...state,
        noteList: newNoteList,
        noteTextEditor: {
          state: NoteTextEditorState.NotActive,
        },
      };

      return [newState, command];
    }
  }

  // If the file list wasnt't retrieved, ignore the change
  const newState: AppStateAuthenticated = {
    ...state,
    noteTextEditor: {
      state: NoteTextEditorState.NotActive,
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleRegularNoteStartTextEditing = (
  state: AppStateAuthenticated,
  event: RegularNoteStartTextEditingEvent
): [AppStateAuthenticated, AppCommand] => {
  const newState: AppStateAuthenticated = {
    ...state,
    noteTextEditor: {
      state: NoteTextEditorState.EditingRegularNote,
      note: event.note,
      text:
        event.note.state === NoteState.CreatingFromTitle ? "" : event.note.text,
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleRegularNoteTextUpdated = (
  state: AppStateAuthenticated,
  event: RegularNoteTextUpdatedEvent
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    if (state.noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
      const [newNoteList, command] = finishNoteTextEditing(
        state.noteList,
        event.note,
        state.noteTextEditor
      );

      const newState: AppStateAuthenticated = {
        ...state,
        noteList: newNoteList,
        noteTextEditor: {
          state: NoteTextEditorState.NotActive,
        },
      };

      return [newState, command];
    }
  }
  return JustStateAuthenticated(state);
};

export const handleNoteDeleteTriggered = (
  state: AppStateAuthenticated,
  event: NoteDeleteTriggeredEvent
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    const [newNoteList, noteDeleting, notesToLoad] = deleteNote(
      state.noteList,
      event.note
    );

    const newState: AppStateAuthenticated = {
      ...state,
      noteList: newNoteList,
    };

    const command = DoMany([
      DeleteNote(noteDeleting),
      LoadNoteText(notesToLoad, state.noteList.fileListVersion),
    ]);

    return [newState, command];
  }
  return JustStateAuthenticated(state);
};

export const handleNoteDeleted = (
  state: AppStateAuthenticated,
  event: NoteDeletedEvent
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    const newNoteList = updateNoteAsDeleted(state.noteList, event.note);
    const newState: AppStateAuthenticated = {
      ...state,
      noteList: newNoteList,
    };
    return JustStateAuthenticated(newState);
  }
  return JustStateAuthenticated(state);
};

export const handleNoteRestoreTriggered = (
  state: AppStateAuthenticated,
  event: NoteRestoreTriggeredEvent
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    const [newNoteList, noteSyncing] = restoreNote(state.noteList, event.note);
    const newState: AppStateAuthenticated = {
      ...state,
      noteList: newNoteList,
    };
    return [newState, RestoreNote(noteSyncing)];
  }
  return JustStateAuthenticated(state);
};

export const handleRetrieveFileListSuccess = (
  state: AppStateAuthenticated,
  event: RetrieveFileListSuccessEvent
): [AppStateAuthenticated, AppCommand] => {
  if (
    state.noteList.state === NoteListState.RetrievingFileList &&
    state.noteList.fileListVersion === event.fileListVersion
  ) {
    const noteList: NoteListFileListRetrieved = {
      state: NoteListState.FileListRetrieved,
      fileListVersion: event.fileListVersion,
      unprocessedFiles: event.fileList,
      lastUsedNoteId: 0,
      renderingQueue: [],
      notes: [],
    };

    const [newNoteList, notesToLoad] = shiftNotesToLoad(
      noteList,
      NOTES_ON_PAGE
    );

    const newState: AppStateAuthenticated = {
      ...state,
      noteList: newNoteList,
    };

    return [
      newState,
      DoMany([
        LoadNoteText(notesToLoad, event.fileListVersion),
        // Only activate once
        state.searchAutoSuggest.state === SearchAutoSuggestState.NotComputed
          ? ActivateSearchAutoSuggest(event.fileList)
          : DoNothing,
      ]),
    ];
  }
  return JustStateAuthenticated(state);
};

export const handleSearchAutoSuggestionsComputed = (
  state: AppStateAuthenticated,
  event: SearchAutoSuggestionsComputedEvent
): [AppStateAuthenticated, AppCommand] => {
  const newState: AppStateAuthenticated = {
    ...state,
    searchAutoSuggest: {
      state: SearchAutoSuggestState.Computed,
      autoSuggestItems: event.autoSuggestItems,
    },
  };
  return JustStateAuthenticated(newState);
};

export const handleNoteSavedOnNewPath = (
  state: AppStateAuthenticated,
  event: NoteSavedOnNewPathEvent
): [AppStateAuthenticated, AppCommand] => {
  const [newNoteList, newNoteTitleEditor, newNoteTextEditor] = updateNotePath(
    state,
    event.note,
    event.newPath
  );
  const newState: AppStateAuthenticated = {
    ...state,
    noteTitleEditor: newNoteTitleEditor,
    noteTextEditor: newNoteTextEditor,
    noteList: newNoteList,
  };
  return JustStateAuthenticated(newState);
};

export const handleNoteSaved = (
  state: AppStateAuthenticated,
  event: NoteSavedEvent
): [AppStateAuthenticated, AppCommand] => {
  const [newNoteList, newNoteTitleEditor, newNoteTextEditor] =
    updateNoteAsSynced(state, event.note);
  const newState: AppStateAuthenticated = {
    ...state,
    noteTitleEditor: newNoteTitleEditor,
    noteTextEditor: newNoteTextEditor,
    noteList: newNoteList,
  };
  return JustStateAuthenticated(newState);
};

export const handleLoadNoteTextSuccess = (
  state: AppStateAuthenticated,
  event: LoadNoteTextSuccessEvent
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    if (state.noteList.fileListVersion === event.fileListVersion) {
      const newNoteList = handleLoadedNote(
        state.noteList,
        event.note,
        event.text
      );

      const newState: AppStateAuthenticated = {
        ...state,
        noteList: newNoteList,
      };

      return JustStateAuthenticated(newState);
    }
  }
  return JustStateAuthenticated(state);
};

export const handleLoadNextPage = (
  state: AppStateAuthenticated
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    const [newNoteList, notesToLoad] = shiftNotesToLoad(
      state.noteList,
      NOTES_ON_PAGE
    );

    const newState: AppStateAuthenticated = {
      ...state,
      noteList: newNoteList,
    };

    return [
      newState,
      LoadNoteText(notesToLoad, state.noteList.fileListVersion),
    ];
  }
  return JustStateAuthenticated(state);
};

export const handleNoteLoadFailed = (
  state: AppStateAuthenticated,
  event: NoteLoadFailedEvent
): [AppStateAuthenticated, AppCommand] => {
  if (state.noteList.state === NoteListState.FileListRetrieved) {
    const newNoteList = handleNoteFailedToLoad(
      state.noteList,
      event.note,
      event.err
    );

    const newState: AppStateAuthenticated = {
      ...state,
      noteList: newNoteList,
    };
    return [newState, ReportError(event.err)];
  }
  return JustStateAuthenticated(state);
};

export const handleNoteSyncFailed = (
  state: AppStateAuthenticated,
  event: NoteSyncFailedEvent
): [AppStateAuthenticated, AppCommand] => {
  const [newNoteList, newNoteTitleEditor, newNoteTextEditor] =
    updateNoteAsOutOfSync(state, event.note, event.note.path, event.err);
  const newState: AppStateAuthenticated = {
    ...state,
    noteTitleEditor: newNoteTitleEditor,
    noteTextEditor: newNoteTextEditor,
    noteList: newNoteList,
  };
  return [newState, ReportError(event.err)];
};

export const handleNoteCreationFromTitleFailed = (
  state: AppStateAuthenticated,
  event: NoteCreationFromTitleFailedEvent
): [AppStateAuthenticated, AppCommand] => {
  const [newNoteList, newNoteTitleEditor, newNoteTextEditor] =
    updateNoteAsOutOfSync(state, event.note, event.path, event.err);
  const newState: AppStateAuthenticated = {
    ...state,
    noteTitleEditor: newNoteTitleEditor,
    noteTextEditor: newNoteTextEditor,
    noteList: newNoteList,
  };
  return [newState, ReportError(event.err)];
};

export const handleNoteCreationFromTextFailed = (
  state: AppStateAuthenticated,
  event: NoteCreationFromTextFailedEvent
): [AppStateAuthenticated, AppCommand] => {
  const [newNoteList, newNoteTitleEditor, newNoteTextEditor] =
    updateNoteAsOutOfSync(state, event.note, event.path, event.err);
  const newState: AppStateAuthenticated = {
    ...state,
    noteTitleEditor: newNoteTitleEditor,
    noteTextEditor: newNoteTextEditor,
    noteList: newNoteList,
  };
  return [newState, ReportError(event.err)];
};

export const handleRestApiError = (
  state: AppStateAuthenticated,
  event: RestApiErrorEvent
): [AppStateAuthenticated, AppCommand] => {
  return [state, ReportError(event.err)];
};

const shiftNotesToLoad = (
  noteList: NoteListFileListRetrieved,
  notesToShift: number
): [NoteListFileListRetrieved, NoteRef[]] => {
  // Shortcuts to inner props
  const unprocessedFiles = noteList.unprocessedFiles;
  const renderingQueue = noteList.renderingQueue;

  // Adjust the amount of notes to shift in case not enough notes
  if (unprocessedFiles.length < notesToShift) {
    notesToShift = unprocessedFiles.length;
  }

  // Split out the files for the notes to load
  const filesToLoad = unprocessedFiles.slice(0, notesToShift);
  const filesRemaining = unprocessedFiles.slice(
    notesToShift,
    unprocessedFiles.length
  );

  // Prepare the dummy notes that need to be loaded
  const notesToLoad = filesToLoad.map((path, idx) => {
    return createNewNoteRef(noteList.lastUsedNoteId + idx, path);
  });

  // Put on a rendering queue to keep track of the order
  const newRenderingQueue = [...renderingQueue, ...notesToLoad];

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: noteList.fileListVersion,
    unprocessedFiles: filesRemaining,
    lastUsedNoteId: noteList.lastUsedNoteId + notesToShift,
    renderingQueue: newRenderingQueue,
    notes: noteList.notes,
  };

  return [newNoteList, notesToLoad];
};

const handleLoadedNote = (
  noteList: NoteListFileListRetrieved,
  note: NoteRef,
  text: string
): NoteListFileListRetrieved => {
  // Shortcuts to inner props
  const queue = noteList.renderingQueue;

  // Create a new note
  const newNote = noteRefToSynced(note, text);

  // Update the note on the queue with the loaded one
  const newQueue = replaceOnQueue(queue, newNote);

  // Find out which notes are ready to be shown
  // (I.e. all the notes visible notes at the beginning of the rendering queue)
  const readyNotes: NoteVisible[] = [];
  let firstNotReadyNoteIdx = 0;
  while (firstNotReadyNoteIdx < newQueue.length) {
    if (isVisible(newQueue[firstNotReadyNoteIdx])) {
      const note: NoteVisible = newQueue[firstNotReadyNoteIdx] as NoteVisible;
      readyNotes.push(note);
      firstNotReadyNoteIdx++;
    } else {
      break;
    }
  }

  // Cut out the notes that are not ready
  const notReadyNotes = newQueue.slice(firstNotReadyNoteIdx, newQueue.length);

  // Now ready to be shown
  const newNotes = [...noteList.notes, ...readyNotes];

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: noteList.fileListVersion,
    unprocessedFiles: noteList.unprocessedFiles,
    lastUsedNoteId: noteList.lastUsedNoteId,
    renderingQueue: notReadyNotes,
    notes: newNotes,
  };

  return newNoteList;
};

const finishNoteTitleEditing = (
  noteList: NoteListFileListRetrieved,
  note: NoteTitleSaveable,
  noteTitleEditor: NoteTitleEditorEditingRegularNote
): [NoteListFileListRetrieved, AppCommand] => {
  // Shortcuts to inner props
  const newTitle = noteTitleEditor.text;

  // Only save if the title has actually changed
  if (newTitle === note.title) {
    return [noteList, DoNothing];
  }

  const newNote = noteTitleSaveableToSyncing(note, newTitle);
  const newNoteList = replaceNote(noteList, newNote);
  const command = RenameNoteFromTitle(newNote);
  return [newNoteList, command];
};

const finishNoteTextEditing = (
  noteList: NoteListFileListRetrieved,
  note: NoteTextSaveable,
  noteTextEditor: NoteTextEditorEditingRegularNote
): [NoteListFileListRetrieved, AppCommand] => {
  // Shortcuts to inner props
  const newText = noteTextEditor.text;

  // Only save if the text has actually changed
  if (newText === note.text) {
    return [noteList, DoNothing];
  }

  const newNote = noteTextSaveableToSyncing(note, newText);
  const newNoteList = replaceNote(noteList, newNote);
  const command = SaveNoteText(newNote);
  return [newNoteList, command];
};

const convertToRegularNoteOnTitleUpdated = (
  noteList: NoteListFileListRetrieved,
  noteTitleEditor: NoteTitleEditorEditingTemplateNote
): [NoteListFileListRetrieved, NoteTextEditor, AppCommand] => {
  // Shortcuts to inner props
  const newTitle = noteTitleEditor.text;

  // Only save if the title is not empty
  if (newTitle === "") {
    return [
      noteList,
      {
        state: NoteTextEditorState.NotActive,
      },
      DoNothing,
    ];
  }

  // Initialize new note
  const newNote = createNewNoteFromTitle(noteList.lastUsedNoteId + 1, newTitle);

  // Update the note list with the new note
  const newNotes = [newNote, ...noteList.notes];

  // New note list
  const newNoteList: NoteListFileListRetrieved = {
    ...noteList,
    notes: newNotes,
    lastUsedNoteId: noteList.lastUsedNoteId + 1,
  };

  // New text editor
  const newTextEditor = {
    state: NoteTextEditorState.EditingRegularNote,
    note: newNote,
    text: "",
  };

  const command = CreateNewNoteWithTitle(newNote);

  return [newNoteList, newTextEditor, command];
};

const convertToRegularNoteOnTextUpdated = (
  noteList: NoteListFileListRetrieved,
  noteTextEditor: NoteTextEditorEditingTemplateNote
): [NoteListFileListRetrieved, AppCommand] => {
  // Shortcuts to inner props
  const newText = noteTextEditor.text;

  // Only save if the text is not empty
  if (newText === "") {
    return [noteList, DoNothing];
  }

  // Initialize new note
  const newNote = createNewNoteFromText(noteList.lastUsedNoteId + 1, newText);

  // Update the note list with the new note
  const newNotes = [newNote, ...noteList.notes];

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    ...noteList,
    notes: newNotes,
    lastUsedNoteId: noteList.lastUsedNoteId + 1,
  };

  const command = CreateNewNoteWithText(newNote);

  return [newNoteList, command];
};

const updateNotePath = (
  state: AppStateAuthenticated,
  note: NotePendingStorageUpdate,
  newPath: string
): [NoteList, NoteTitleEditor, NoteTextEditor] => {
  const noteTitleEditor = state.noteTitleEditor;
  const noteTextEditor = state.noteTextEditor;
  const noteList = state.noteList;

  if (noteList.state === NoteListState.FileListRetrieved) {
    // New note with an updated path
    const newNote: NoteSynced = notePendingStorageUpdateToSynced(note, newPath);
    const newNoteList = replaceNote(noteList, newNote);

    // Update editors to make sure they reference up-to-date note
    let newNoteTextEditor = noteTextEditor;
    if (noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
      if (noteTextEditor.note.id === note.id) {
        newNoteTextEditor = {
          ...noteTextEditor,
          note: newNote,
        };
      }
    }
    let newNoteTitleEditor = noteTitleEditor;
    if (noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote) {
      if (noteTitleEditor.note.id === note.id) {
        newNoteTitleEditor = {
          ...noteTitleEditor,
          note: newNote,
        };
      }
    }

    return [newNoteList, newNoteTitleEditor, newNoteTextEditor];
  }

  return [noteList, noteTitleEditor, noteTextEditor];
};

const updateNoteAsSynced = (
  state: AppStateAuthenticated,
  note: NoteSyncing
): [NoteList, NoteTitleEditor, NoteTextEditor] => {
  const noteTitleEditor = state.noteTitleEditor;
  const noteTextEditor = state.noteTextEditor;
  const noteList = state.noteList;

  if (noteList.state === NoteListState.FileListRetrieved) {
    // New note with the same path
    const newNote: NoteSynced = noteSyncingToSynced(note);
    const newNoteList = replaceNote(noteList, newNote);

    // Update editors to make sure they reference up-to-date note
    let newNoteTextEditor = noteTextEditor;
    if (noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
      if (noteTextEditor.note.id === note.id) {
        newNoteTextEditor = {
          ...noteTextEditor,
          note: newNote,
        };
      }
    }
    let newNoteTitleEditor = noteTitleEditor;
    if (noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote) {
      if (noteTitleEditor.note.id === note.id) {
        newNoteTitleEditor = {
          ...noteTitleEditor,
          note: newNote,
        };
      }
    }

    return [newNoteList, newNoteTitleEditor, newNoteTextEditor];
  }

  return [noteList, noteTitleEditor, noteTextEditor];
};

const updateNoteAsOutOfSync = (
  state: AppStateAuthenticated,
  note: NotePendingStorageUpdate,
  path: string,
  err: string
): [NoteList, NoteTitleEditor, NoteTextEditor] => {
  const noteTitleEditor = state.noteTitleEditor;
  const noteTextEditor = state.noteTextEditor;
  const noteList = state.noteList;

  if (noteList.state === NoteListState.FileListRetrieved) {
    // New note with the same path
    const newNote: NoteOutOfSync = notePendingStorageUpdateToOutOfSync(
      note,
      path,
      err
    );
    const newNoteList = replaceNote(noteList, newNote);

    // Update editors to make sure they reference up-to-date note
    let newNoteTextEditor = noteTextEditor;
    if (noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
      if (noteTextEditor.note.id === note.id) {
        newNoteTextEditor = {
          ...noteTextEditor,
          note: newNote,
        };
      }
    }
    let newNoteTitleEditor = noteTitleEditor;
    if (noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote) {
      if (noteTitleEditor.note.id === note.id) {
        newNoteTitleEditor = {
          ...noteTitleEditor,
          note: newNote,
        };
      }
    }

    return [newNoteList, newNoteTitleEditor, newNoteTextEditor];
  }

  return [noteList, noteTitleEditor, noteTextEditor];
};

const handleNoteFailedToLoad = (
  noteList: NoteListFileListRetrieved,
  note: NoteRef,
  err: string
): NoteListFileListRetrieved => {
  const newNote: NoteOutOfSync = noteRefToOutOfSync(note, err);
  return replaceNote(noteList, newNote);
};

const deleteNote = (
  noteList: NoteListFileListRetrieved,
  note: NoteDeletable
): [NoteListFileListRetrieved, NoteDeleting, NoteRef[]] => {
  // New note as deleted
  const newNote = noteDeletableToDeleting(note);

  // delete all already deleted notes from UI and update the note list
  const newNotes = noteList.notes
    .filter(
      (n) => !(n.state === NoteState.Deleting || n.state === NoteState.Deleted)
    )
    .map((n) => (n.id === newNote.id ? newNote : n));

  // Load and render one more note from the list (if exists),
  // so the number of displayed notes stays the same
  const [noteListShifted, notesToLoad] = shiftNotesToLoad(noteList, 1);

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    ...noteListShifted,
    notes: newNotes,
  };

  return [newNoteList, newNote, notesToLoad];
};

const updateNoteAsDeleted = (
  noteList: NoteListFileListRetrieved,
  note: NoteDeleting
): NoteListFileListRetrieved => {
  // Undelete the note
  const newNote = noteDeletingToDeleted(note);
  const newNoteList = replaceNote(noteList, newNote);

  return newNoteList;
};

const restoreNote = (
  noteList: NoteListFileListRetrieved,
  note: NoteDeleted
): [NoteListFileListRetrieved, NoteSyncing] => {
  // Undelete the note
  const newNote = noteDeletedToSyncing(note);
  const newNoteList = replaceNote(noteList, newNote);

  return [newNoteList, newNote];
};

const replaceOnQueue = (queue: Note[], note: Note): Note[] => {
  return queue.map((n) => (n.id === note.id ? note : n));
};

const replaceNote = (
  noteList: NoteListFileListRetrieved,
  note: NoteVisible
): NoteListFileListRetrieved => {
  return {
    ...noteList,
    notes: noteList.notes.map((n) => (n.id === note.id ? note : n)),
  };
};

const noteTitleSaveableToSyncing = (
  note: NoteTitleSaveable,
  newTitle: string
): NoteSyncing => {
  if (note.state === NoteState.Synced) {
    return {
      ...noteSyncedToSyncing(note),
      title: newTitle,
    };
  }
  if (note.state === NoteState.OutOfSync) {
    return {
      ...noteOutOfSyncToSyncing(note),
      title: newTitle,
    };
  }
  throw new Error("Impossible");
};

const noteTextSaveableToSyncing = (
  note: NoteTextSaveable,
  newText: string
): NoteSyncing => {
  if (note.state === NoteState.Synced) {
    return {
      ...noteSyncedToSyncing(note),
      text: newText,
    };
  }
  if (note.state === NoteState.OutOfSync) {
    return {
      ...noteOutOfSyncToSyncing(note),
      text: newText,
    };
  }
  throw new Error("Impossible");
};

const notePendingStorageUpdateToSynced = (
  note: NotePendingStorageUpdate,
  newPath: string
): NoteSynced => {
  if (note.state === NoteState.Syncing) {
    return noteSyncingToSyncedWithNewPath(note, newPath);
  }
  if (note.state === NoteState.CreatingFromTitle) {
    return noteCreatingFromTitleToSynced(note, newPath);
  }
  if (note.state === NoteState.CreatingFromText) {
    return noteCreatingFromTextToSynced(note, newPath);
  }
  throw new Error("Impossible");
};

const notePendingStorageUpdateToOutOfSync = (
  note: NotePendingStorageUpdate,
  path: string,
  err: string
): NoteOutOfSync => {
  if (note.state === NoteState.Syncing) {
    return noteSyncingToOutOfSync(note, err);
  }
  if (note.state === NoteState.CreatingFromTitle) {
    return noteCreatingFromTitleToOutOfSync(note, path, err);
  }
  if (note.state === NoteState.CreatingFromText) {
    return noteCreatingFromTextToOutOfSync(note, path, err);
  }
  throw new Error("Impossible");
};

const noteDeletableToDeleting = (note: NoteDeletable): NoteDeleting => {
  if (note.state === NoteState.Synced) {
    return noteSyncedToDeleting(note);
  }
  if (note.state === NoteState.OutOfSync) {
    return noteOutOfSyncToDeleting(note);
  }
  throw new Error("Impossible");
};
