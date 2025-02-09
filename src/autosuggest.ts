import { getTitleFromPath } from "./conversion";
import { AutoSuggestHashTag, AutoSuggestItem } from "./model";
import { getWordsInText } from "./util";

export const SEARCH_STRING_DELIMITER = " ";
const TERM_GROUP = "";
const TITLE_GROUP = " ";

export const computeAutoSuggestLookups = (
  fileList: string[]
): [AutoSuggestItem[], AutoSuggestHashTag[]] => {
  const autoSuggestItemsUsed = new Set<string>();
  const autoSuggestItems = [];

  // Auto-suggest source 1: tokenize
  for (let i = 0, filesTotal = fileList.length; i < filesTotal; i++) {
    const path = fileList[i];
    const title = getTitleFromPath(path);
    const words = getWordsInText(title);
    for (let j = 0, wordsTotal = words.length; j < wordsTotal; j++) {
      const word = words[j].toLowerCase();
      if (word.length > 1 && !autoSuggestItemsUsed.has(word)) {
        autoSuggestItems.push({ value: word, data: { g: TERM_GROUP } });
        autoSuggestItemsUsed.add(word);
      }
    }
  }

  const autoSuggestHashTags = [];

  // Auto-suggest source 2: hashtags
  for (let i = 0, filesTotal = fileList.length; i < filesTotal; i++) {
    const path = fileList[i];
    const title = getTitleFromPath(path);
    const hashTags = _hashTagsExtractor.extractNewHashTags(title);

    for (let j = 0, hashTagsTotal = hashTags.length; j < hashTagsTotal; j++) {
      const hashTag = hashTags[j];
      autoSuggestItems.push({ value: hashTag, data: { g: TERM_GROUP } });
      autoSuggestHashTags.push({ value: hashTag, data: hashTag });
    }
  }

  // Auto-suggest source 3: use titles
  for (let i = 0, filesTotal = fileList.length; i < filesTotal; i++) {
    const path = fileList[i];
    const title = getTitleFromPath(path);
    autoSuggestItems.push({ value: title, data: { g: TITLE_GROUP } });
  }

  return [autoSuggestItems, autoSuggestHashTags];
};

export const autoSuggestFilter = (
  suggestion: AutoSuggestItem,
  searchTextLowerCase: string,
  queryLowerCase: string
): boolean => {
  // Allow any term available
  if (suggestion.data.g === TERM_GROUP) {
    // Copy from the source
    return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
  }

  // For titles, all terms should be in
  const words = searchTextLowerCase.split(SEARCH_STRING_DELIMITER);
  for (let i = 0, wordsTotal = words.length; i < wordsTotal; i++) {
    const word = words[i];
    if (suggestion.value.toLowerCase().indexOf(word) === -1) {
      return false; // Doesn't contain one of the terms, so out immediately
    }
  }
  return true;
};

export const isFullTitleAutoSuggest = (
  suggestion: AutoSuggestItem
): boolean => {
  return suggestion.data.g === TITLE_GROUP;
};

const _hashTagsExtractor = (function () {
  const _autoSuggestHashTagsUsed = new Set<string>();

  return {
    extractNewHashTags: function extractNewHashTags(title: string) {
      const newHashTags = [];

      const hashTags = title.split(SEARCH_STRING_DELIMITER);
      for (let i = 0, hashTagsTotal = hashTags.length; i < hashTagsTotal; i++) {
        const hashTag = hashTags[i].toLowerCase();
        if (
          hashTag.length > 1 &&
          hashTag[0] === "#" &&
          !_autoSuggestHashTagsUsed.has(hashTag)
        ) {
          newHashTags.push(hashTag);
          _autoSuggestHashTagsUsed.add(hashTag);
        }
      }

      return newHashTags;
    },
  };
})();
