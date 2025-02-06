import "./SearchPanel.css";
import { useContext } from "react";
import AppContext from "../AppContext";
import { EventType } from "../events";

function SearchPanel(props: { searchText: string }) {
  const { uistrings, dispatch } = useContext(AppContext);

  const searchText = props.searchText;

  const searchTextOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: EventType.SearchTextChanged,
      newText: e.target.value,
    });
  };

  const searchOnFocus = () => {
    dispatch({
      type: EventType.SearchActivated,
    });
  };

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    dispatch({
      type: EventType.SearchTextSubmitted,
    });
    e.preventDefault();
  };

  return (
    <div className="search-outer">
      <div className="search-inner">
        <div className="search-panel">
          <form onSubmit={onSearchSubmit}>
            <input
              type="text"
              value={searchText}
              onFocus={searchOnFocus}
              onChange={searchTextOnChange}
              className="search-textbox"
              placeholder={uistrings.SearchTextBoxPlaceholder}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default SearchPanel;
