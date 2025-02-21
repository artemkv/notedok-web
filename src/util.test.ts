import { countLines } from "./util";

test("line count - basic", () => {
  const text = "1\n2\n3";

  expect(countLines(text)).toBe(3);
});

test("line count - empty text", () => {
  const text = "";

  expect(countLines(text)).toBe(0);
});

test("line count - empty lines", () => {
  const text = "1\n2\n\n3\n";

  expect(countLines(text)).toBe(5);
});

test("line count - long line", () => {
  const text =
    "0123456789012345678901234567890123456789 0123456789012345678901234567890123456789 01234567890123456789";

  expect(countLines(text)).toBe(2);
});

test("line count - very long line", () => {
  const text =
    "0123456789012345678901234567890123456789 0123456789012345678901234567890123456789 0123456789012345678901234567890123456789 0123456789012345678901234567890123456789 01234567890123456789";

  expect(countLines(text)).toBe(3);
});

test("line count - combined", () => {
  const text =
    "1\n0123456789012345678901234567890123456789 0123456789012345678901234567890123456789 0123456789012345678901234567890123456789 0123456789012345678901234567890123456789 01234567890123456789\n\n3";

  expect(countLines(text)).toBe(6);
});
