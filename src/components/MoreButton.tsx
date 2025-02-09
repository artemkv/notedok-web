import "./MoreButton.css";
import { AppEvent, EventType } from "../events";
import { Dispatch } from "../hooks/useReducer";
import uistrings from "../uistrings";

function MoreButton(props: {
  notesNotYetLoadedTotal: number;
  dispatch: Dispatch<AppEvent>;
}) {
  const notesNotYetLoadedTotal = props.notesNotYetLoadedTotal;
  const dispatch = props.dispatch;

  const loadMore = () => {
    dispatch({
      type: EventType.LoadNextPage,
    });
  };

  return (
    <button className="more-button" onClick={loadMore}>
      {`${uistrings.MoreButtonText} (`}
      <span className="more-button-count">{notesNotYetLoadedTotal}</span>
      {` ${uistrings.MoreButtonNotLoadedText})`}
    </button>
  );
}

export default MoreButton;
