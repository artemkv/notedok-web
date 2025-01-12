// TODO: port the unit tests

export const decodePathFileSystemFriendly = (path: string): string => {
  path = path.replace(/\(sl\)/g, "/");
  path = path.replace(/\(qst\)/g, "?");
  path = path.replace(/\(lt\)/g, "<");
  path = path.replace(/\(gt\)/g, ">");
  path = path.replace(/\(bsl\)/g, "\\");
  path = path.replace(/\(col\)/g, ":");
  path = path.replace(/\(star\)/g, "*");
  path = path.replace(/\(pipe\)/g, "|");
  path = path.replace(/\(dqt\)/g, '"');
  path = path.replace(/\(crt\)/g, "^");
  return path;
};
