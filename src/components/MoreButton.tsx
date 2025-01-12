import { useContext } from "react";
import "./MoreButton.css";
import AppContext from "../AppContext";
import { EventType } from "../events";

function MoreButton(props: { notesNotYetLoadedTotal: number }) {
  const { uistrings, dispatch } = useContext(AppContext);

  const notesNotYetLoadedTotal = props.notesNotYetLoadedTotal;

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
