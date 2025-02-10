import "./SearchAutocomplete.css";
import $ from "jquery";
import "devbridge-autocomplete";
import { useEffect } from "react";
import { AppEvent, EventType } from "../events";
import { AutoSuggestItem } from "../model";
import { autoSuggestFilter, isFullTitleAutoSuggest } from "../autosuggest";
import { Dispatch } from "../hooks/useReducer";

function SearchAutocomplete(props: {
  autoSuggestItems: AutoSuggestItem[];
  dispatch: Dispatch<AppEvent>;
}) {
  const autoSuggestItems = props.autoSuggestItems;
  const dispatch = props.dispatch;

  useEffect(() => {
    const autocompleteContainer = $(
      "#search_autocomplete_suggestions_container"
    );
    const searchTextbox = $("#search_textbox");

    const options: JQueryAutocompleteOptions = {
      lookup: autoSuggestItems,
      lookupLimit: 10,
      minChars: 1,
      // single word suggests single words
      // but multiple words autosuggest complete titles
      // does not make sense to suggest some combination that does not exist
      delimiter: "",
      maxHeight: 500,
      groupBy: "g",
      forceFixPosition: true,
      appendTo: autocompleteContainer,
      lookupFilter: (suggestion, _, queryLowerCase) =>
        autoSuggestFilter(
          suggestion,
          searchTextbox.val().toLowerCase(),
          queryLowerCase
        ),
      onSelect: (suggestion: AutoSuggestItem) => {
        if (isFullTitleAutoSuggest(suggestion)) {
          // When full title is selected, trigger search immediately
          dispatch({
            type: EventType.SearchTextAutoFilled,
            text: searchTextbox.val(),
          });
        }
      },
    };
    searchTextbox.autocomplete(options);
  }, [dispatch, autoSuggestItems]);

  return (
    <div
      id="search_autocomplete_suggestions_container"
      className="autocomplete-suggestions-container"
    />
  );
}

export default SearchAutocomplete;
