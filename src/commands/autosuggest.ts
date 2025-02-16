import { computeAutoSuggestLookups, hashTagsExtractor } from "../autosuggest";
import {
  CommandType,
  ComputeSearchAutoSuggestionsCommand,
  ExtractNewHashTagsCommand,
} from "../commands";
import { EventType } from "../events";
import { AutoSuggestHashTag } from "../model";

export const ComputeSearchAutoSuggestions = (
  fileList: string[]
): ComputeSearchAutoSuggestionsCommand => ({
  type: CommandType.ComputeSearchAutoSuggestions,
  fileList,
  execute: async (dispatch) => {
    const [items, hashTags] = computeAutoSuggestLookups(fileList);
    dispatch({
      type: EventType.SearchAutoSuggestionsComputed,
      items,
      hashTags,
    });
  },
});

export const ExtractNewHashTags = (
  title: string
): ExtractNewHashTagsCommand => ({
  type: CommandType.ExtractNewHashTags,
  title,
  execute: async (dispatch) => {
    const newHashTags = hashTagsExtractor.extractNewHashTags(title);
    const newAutoSuggestHashTags: AutoSuggestHashTag[] = newHashTags.map(
      (tag) => ({
        value: tag,
        data: tag,
      })
    );
    dispatch({
      type: EventType.TitleAutoSuggestionsUpdated,
      hashTags: newAutoSuggestHashTags,
    });
  },
});
