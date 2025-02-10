import { computeAutoSuggestLookups } from "../autosuggest";
import { CommandType, ActivateSearchAutoSuggestCommand } from "../commands";
import { EventType } from "../events";

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
