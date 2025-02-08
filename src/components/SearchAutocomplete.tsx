import "./SearchAutocomplete.css";
import $ from "jquery";
import "devbridge-autocomplete";
import { useContext, useEffect } from "react";
import AppContext from "../AppContext";
import { EventType } from "../events";
import { AutoSuggestItem } from "../model";
import { autoSuggestFilter, SEARCH_STRING_DELIMITER } from "../autosuggest";

function SearchAutocomplete(props: { autoSuggestItems: AutoSuggestItem[] }) {
  const { dispatch } = useContext(AppContext);

  const autoSuggestItems = props.autoSuggestItems;

  useEffect(() => {
    const autocompleteContainer = $(
      "#search_autocomplete_suggestions_container"
    );
    const searchTextbox = $("#search_textbox");

    const options: JQueryAutocompleteOptions = {
      lookup: autoSuggestItems,
      lookupLimit: 10,
      minChars: 1,
      delimiter: SEARCH_STRING_DELIMITER,
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
      onSelect: () => {
        dispatch({
          type: EventType.SearchTextChanged,
          // TODO: full note titles get appended to the input, and produce shit
          newText: searchTextbox.val(),
        });
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
