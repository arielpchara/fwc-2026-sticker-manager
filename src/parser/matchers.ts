export type MatchCain = {
  text: string;
  matches: [string, number][];
};

const REGULAR_CODES =
  /\b(FWC|ALG|ANG|ARG|AUS|AUT|BEL|BIH|BRA|CAN|CIV|CMR|COD|COL|CPV|CRO|CUW|CZE|DEN|ECU|EGY|ENG|ESP|FRA|GER|GHA|HAI|IRN|IRQ|JOR|JPN|KOR|KSA|MAR|MEX|NED|NOR|NZL|PAN|PAR|POR|QAT|RSA|SCO|SEN|SUI|SWE|TUN|TUR|URU|USA|UZB|CC)(\d{1,2})(?:\s*(?:\()(x\d+))?\b|(00)/gi;

const GROUPED_CODES_LINE =
  /^\s*(\b(?:FWC|ALG|ANG|ARG|AUS|AUT|BEL|BIH|BRA|CAN|CIV|CMR|COD|COL|CPV|CRO|CUW|CZE|DEN|ECU|EGY|ENG|ESP|FRA|GER|GHA|HAI|IRN|IRQ|JOR|JPN|KOR|KSA|MAR|MEX|NED|NOR|NZL|PAN|PAR|POR|QAT|RSA|SCO|SEN|SUI|SWE|TUN|TUR|URU|USA|UZB|CC)\b)\s*[: ]?\s*([\d\s,-]+)?\s*(?=\r?\n|$)/gim;
const GROUPED_CODES_ITEM = /(\d+)/gi;

export function matchAllRegular({ text, matches }: MatchCain): MatchCain {
  matches = matches || [];
  let nextText = text;
  const newMatches: [string, number][] = [];
  for (const match of text.matchAll(REGULAR_CODES)) {
    const mapped = mapFromRegularMatch(match);
    if (mapped) {
      newMatches.push(mapped);
      nextText = nextText.replace(match[0], "");
    }
  }
  return {
    text: nextText,
    matches: [...matches, ...newMatches],
  };
}

export function matchAllGrouped({ text, matches }: MatchCain): MatchCain {
  matches = matches || {};
  let nextText = text;
  const newMatches: [string, number][] = [];
  for (const match of text.matchAll(GROUPED_CODES_LINE)) {
    const [line, code, numbers, ...rest] = match;
    for (const match of numbers.matchAll(GROUPED_CODES_ITEM)) {
      const mapped = mapFromGroupedMatch(code, match);
      if (mapped) {
        newMatches.push(mapped);
      }
    }
    nextText = nextText.replace(line, "");
  }
  return {
    text: nextText,
    matches: [...matches, ...newMatches],
  };
}

export function matchAllChain(text: string): MatchCain {
  const { matches } = [matchAllRegular, matchAllGrouped].reduce(
    (acc, fn) => fn(acc),
    { text, matches: [] as [string, number][] },
  );
  return { text, matches };
}

const mapFromRegularMatch = (
  matches: RegExpExecArray,
): [string, number] | undefined => {
  const [match, group, number, extras, special] = matches;

  const parsedExtras = extras ? parseInt(extras.replace("x", ""), 10) : 1;

  if (special) {
    return [special, parsedExtras];
  }
  if (!group) {
    console.error(`Invalid regular code: ${group} - ${match}`);
    return;
  }
  const parsedNumber = parseInt(number, 10);
  if (isNaN(parsedNumber)) {
    console.error(`Invalid regular number: ${number} - ${match}`);
    return;
  }
  if (!isValid(group, parsedNumber)) {
    return;
  }
  const stickerNumber = [group, parsedNumber].join("");
  return [stickerNumber, parsedExtras];
};

const mapFromGroupedMatch = (
  group: string,
  matches: RegExpExecArray,
): [string, number] | undefined => {
  const [match, number] = matches;
  const parsedNumber = parseInt(number, 10);
  if (isNaN(parsedNumber)) {
    console.error(`Invalid grouped number: ${number} - "${match}"`);
    return;
  }
  if (!isValid(group, parsedNumber)) {
    return;
  }
  const stickerNumber = [group, parsedNumber].join("");
  return [stickerNumber, 1];
};

const isValid = (code: string, num: number): boolean => {
  let limits = { min: 1, max: 20 };
  if (code === "00") {
    return true;
  }
  if (code === "CC") {
    limits = { min: 1, max: 14 };
  }
  if (code === "FWC") {
    limits = { min: 1, max: 19 };
  }
  return num >= limits.min && num <= limits.max;
};
