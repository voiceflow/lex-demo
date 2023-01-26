export const color = (text: string, color = 36) =>
  `\x1b[${color}m${text}\x1b[0m`;

export const isAlphaNumeric = (str: string) => /^[a-z0-9_]+$/i.test(str);
