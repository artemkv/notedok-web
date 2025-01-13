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
