import { computeAutoSuggestLookups, hashTagsExtractor } from "../autosuggest";
import {
  CommandType,
  ActivateSearchAutoSuggestCommand,
  ExtractNewHashTagsCommand,
} from "../commands";
import { EventType } from "../events";
import { AutoSuggestHashTag } from "../model";

export const ActivateSearchAutoSuggest = (
  fileList: string[]
): ActivateSearchAutoSuggestCommand => ({
  type: CommandType.ActivateSearchAutoSuggest,
  fileList,
  execute: async (dispatch) => {
    const [autoSuggestItems, autoSuggestHashTags] =
      computeAutoSuggestLookups(fileList);
    dispatch({
      type: EventType.SearchAutoSuggestionsComputed,
      autoSuggestItems,
      autoSuggestHashTags,
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
      autoSuggestHashTags: newAutoSuggestHashTags,
    });
  },
});
