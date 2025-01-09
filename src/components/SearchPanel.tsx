import { useContext } from "react";
import "./SearchPanel.css";
import AppContext from "../AppContext";

function SearchPanel() {
  const { uistrings } = useContext(AppContext);

  // TODO: react on search textbox text submitten
  // TODO: handling keyup 13 doesn't work on tablets/mobile
  return (
    <div className="search-outer">
      <div className="search-inner">
        <div className="search-panel">
          <input
            type="text"
            className="search-textbox"
            placeholder={uistrings.SearchTextBoxPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}

export default SearchPanel;
