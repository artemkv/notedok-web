import "./SearchAutocomplete.css";
import $ from "jquery";
import "devbridge-autocomplete";
import { memo, useEffect } from "react";
import { AutoSuggestItem } from "../model";
import { autoSuggestFilter } from "../autosuggest";

const SearchAutocomplete = memo(function SearchAutocomplete(props: {
  autoSuggestItems: AutoSuggestItem[];
  onAutocomplete: (text: string) => void;
}) {
  const autoSuggestItems = props.autoSuggestItems;
  const onAutocomplete = props.onAutocomplete;

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
      onSelect: () => {
        onAutocomplete(searchTextbox.val());
      },
    };
    searchTextbox.autocomplete(options);

    return () => {
      searchTextbox.autocomplete("dispose");
    };
  }, [autoSuggestItems, onAutocomplete]);

  return (
    <div
      id="search_autocomplete_suggestions_container"
      className="autocomplete-suggestions-container"
    />
  );
});

export default SearchAutocomplete;
