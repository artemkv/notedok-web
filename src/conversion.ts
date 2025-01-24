import {
  decodePathFileSystemFriendly,
  encodePathFileSystemFriendly,
} from "./util";

const TITLE_POSTFIX_SEPARATOR = "~~";

export const getTitleFromPath = (path: string) => {
  let title = path.slice(0, -4);

  const separatorIndex = title.lastIndexOf(TITLE_POSTFIX_SEPARATOR);
  if (separatorIndex >= 0) {
    title = title.substring(0, separatorIndex);
  }

  title = decodePathFileSystemFriendly(title);

  return title;
};

export const generatePathFromTitle = (title: string, ensureUniqie: boolean) => {
  let postfix = "";
  if (ensureUniqie) {
    const date = new Date();
    const n = date.getTime();
    postfix = TITLE_POSTFIX_SEPARATOR + n;
  }
  return encodePathFileSystemFriendly(title) + postfix + ".txt";
};
