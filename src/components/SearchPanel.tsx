import "./SearchPanel.css";
import { AppEvent, EventType } from "../events";
import SearchAutocomplete from "./SearchAutocomplete";
import { AutoSuggestItem } from "../model";
import { Dispatch } from "../hooks/useReducer";
import uistrings from "../uistrings";
import { memo, useCallback, useState } from "react";

const SearchPanel = memo(function SearchPanel(props: {
  autoSuggestItems: AutoSuggestItem[];
  dispatch: Dispatch<AppEvent>;
}) {
  const [searchText, setSearchText] = useState("");

  const autoSuggestItems = props.autoSuggestItems;
  const dispatch = props.dispatch;

  const searchTextOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(() => e.target.value);
  };

  const searchTextOnKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchText(() => "");
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
      text: searchText,
    });
    e.preventDefault();
  };

  const onAutocomplete = useCallback(
    (text: string) => {
      setSearchText(() => text);
    },
    [setSearchText]
  );

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
        onAutocomplete={onAutocomplete}
      />
    </div>
  );
});

export default SearchPanel;
