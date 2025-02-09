import "./SearchPanel.css";
import { AppEvent, EventType } from "../events";
import SearchAutocomplete from "./SearchAutocomplete";
import { AutoSuggestItem } from "../model";
import { Dispatch } from "../hooks/useReducer";
import uistrings from "../uistrings";
import { memo } from "react";

const SearchPanel = memo(function SearchPanel(props: {
  searchText: string;
  autoSuggestItems: AutoSuggestItem[];
  dispatch: Dispatch<AppEvent>;
}) {
  const searchText = props.searchText;
  const autoSuggestItems = props.autoSuggestItems;
  const dispatch = props.dispatch;

  const searchTextOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: EventType.SearchTextChanged,
      newText: e.target.value,
    });
  };

  const searchTextOnKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      dispatch({
        type: EventType.SearchCancelEdit,
      });
    }
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
              id="search_textbox"
              type="text"
              value={searchText}
              onFocus={searchOnFocus}
              onChange={searchTextOnChange}
              onKeyUp={searchTextOnKeyUp}
              className="search-textbox"
              placeholder={uistrings.SearchTextBoxPlaceholder}
            />
          </form>
        </div>
      </div>
      <SearchAutocomplete
        autoSuggestItems={autoSuggestItems}
        dispatch={dispatch}
      />
    </div>
  );
});

export default SearchPanel;
