import $ from "jquery";
import "devbridge-autocomplete";
import { useEffect } from "react";
import {
  hashTagAutoSuggestFilter,
  SEARCH_STRING_DELIMITER,
} from "../autosuggest";
import { AutoSuggestHashTag } from "../model";

function NoteTitleAutocomplete(props: {
  noteTitleId: string;
  autoSuggestHashTags: AutoSuggestHashTag[];
  onAutocomplete: (newText: string) => void;
}) {
  const noteTitleId = props.noteTitleId;
  const autoSuggestHashTags = props.autoSuggestHashTags;
  const onAutocomplete = props.onAutocomplete;

  useEffect(() => {
    const autocompleteContainer = $(`#${noteTitleId}-suggestions_container`);
    const titleInputElement = $(`#${noteTitleId}`);

    const options: JQueryAutocompleteOptions = {
      lookup: autoSuggestHashTags,
      lookupLimit: 10,
      minChars: 1,
      delimiter: SEARCH_STRING_DELIMITER,
      maxHeight: 500,
      forceFixPosition: true,
      appendTo: autocompleteContainer,
      lookupFilter: (suggestion, _, queryLowerCase) =>
        hashTagAutoSuggestFilter(suggestion, queryLowerCase),
      onSelect: () => {
        onAutocomplete(titleInputElement.val());
      },
    };
    titleInputElement.autocomplete(options);
  }, [autoSuggestHashTags, noteTitleId, onAutocomplete]); // TODO: do I need to do cleanup???

  return (
    <div
      id={`${noteTitleId}-suggestions_container`}
      className="autocomplete-suggestions-container"
    />
  );
}

export default NoteTitleAutocomplete;
