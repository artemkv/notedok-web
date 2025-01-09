// TODO: this is WIP

function Note() {
  const note = {
    Id: "",
  };

  return (
    // TODO: additional classes
    <div id={note.Id} className="note-outer mode-view">
      <div className="note-inner"></div>
    </div>
  );
}

export default Note;

/*
          <a
            href="javascript:void(0);"
            className="note-button note-button-share"
          >
            {uistrings.ShareButtonText}
          </a>
          <a
            href="javascript:void(0);"
            className="note-button note-button-edit"
          >
            {uistrings.EditButtonText}
          </a>
          <a
            href="javascript:void(0);"
            className="note-button note-button-delete"
          >
            {uistrings.DeleteButtonText}
          </a>
*/
