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
  path = path.replace(/\(pct\)/g, "%");
  return path;
};

export const encodePathFileSystemFriendly = (path: string): string => {
  path = path.replace(/\//g, "(sl)");
  path = path.replace(/\?/g, "(qst)");
  path = path.replace(/</g, "(lt)");
  path = path.replace(/>/g, "(gt)");
  path = path.replace(/\\/g, "(bsl)");
  path = path.replace(/:/g, "(col)");
  path = path.replace(/\*/g, "(star)");
  path = path.replace(/\|/g, "(pipe)");
  path = path.replace(/"/g, "(dqt)");
  path = path.replace(/\^/g, "(crt)");
  path = path.replace(/%/g, "(pct)");

  if (path[0] === ".") {
    path = "_" + path;
  }

  return path;
};

export const countLines = (text: string) => {
  if (!text) {
    return 0;
  }

  let linesTotal = 0;

  const lines = text.split("\n");
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i];

    const visualLinesCount = Math.floor(line.length / 80) + 1;
    linesTotal += visualLinesCount;
  }

  return linesTotal;
};

export const selectionIsNotEmpty = (): boolean => {
  return (
    window.getSelection() !== null &&
    window.getSelection()!.toString() !== "" &&
    window.getSelection()!.toString() !== null
  );
};
