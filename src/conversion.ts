import { decodePathFileSystemFriendly } from "./util";

const TITLE_POSTFIX_SEPARATOR = "~~";

export const getTitleFromPath = (path: string) => {
  const filename = path.substring(path.lastIndexOf("/") + 1);
  const fileNameWithoutExtension = filename.slice(0, -4);

  let title = fileNameWithoutExtension;

  const separatorIndex = title.lastIndexOf(TITLE_POSTFIX_SEPARATOR);
  if (separatorIndex >= 0) {
    title = title.substring(0, separatorIndex);
  }

  title = decodePathFileSystemFriendly(title);

  return title;
};
