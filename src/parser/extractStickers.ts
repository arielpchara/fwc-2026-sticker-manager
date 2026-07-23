import { matchAllChain } from "./matchers";

export function extractStickers(text: string): Record<string, number> {
  const { matches } = matchAllChain(text);

  const inventory = matches.reduce(
    (acc, curr) => {
      if (curr) {
        const [code, count] = curr;
        const upperCode = code.toUpperCase();
        acc[upperCode] = (acc[upperCode] || 0) + count;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
  return inventory;
}
