import { useContext } from "react";
import "./MoreButton.css";
import AppContext from "../AppContext";

function MoreButton(props: { notesNotYetLoadedTotal: number }) {
  const { uistrings } = useContext(AppContext);

  const notesNotYetLoadedTotal = props.notesNotYetLoadedTotal;

  // TODO: handle click
  return (
    <button className="more-button">
      {`${uistrings.MoreButtonText} (`}
      <span className="more-button-count">{notesNotYetLoadedTotal}</span>
      {` ${uistrings.MoreButtonNotLoadedText})`}
    </button>
  );
}

export default MoreButton;
