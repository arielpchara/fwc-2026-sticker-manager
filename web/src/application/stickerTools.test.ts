import { describe, it, expect } from "vitest";
import { groupByGroup, groupByTeam } from "./stickerTools.js";

describe("groupByTeam", () => {
  it("returns empty array for empty input", () => {
    expect(groupByTeam({})).toEqual([]);
  });

  it("the group match with", () => {
    const stickers = { BRA1: 1, BRA2: 2, ARG2: 2, MEX3: 3 };
    const result = groupByTeam(stickers);
    expect(result).toHaveLength(3);
    expect(result).toMatchObject([
      { team: "BRA", stickers: { BRA1: 1, BRA2: 2 } },
      { team: "ARG", stickers: { ARG2: 2 } },
      { team: "MEX", stickers: { MEX3: 3 } },
    ]);
  });

  it("groups single sticker into one team", () => {
    const result = groupByTeam({ BRA1: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].team).toBe("BRA");
    expect(result[0].stickers).toEqual({ BRA1: 1 });
  });

  it("groups multiple stickers from same team", () => {
    const result = groupByTeam({ BRA1: 1, BRA2: 1, BRA10: 2 });
    expect(result).toHaveLength(1);
    expect(result[0].team).toBe("BRA");
    expect(result[0].stickers).toEqual({ BRA1: 1, BRA2: 1, BRA10: 2 });
  });

  it("creates separate groups for different teams", () => {
    const result = groupByTeam({ BRA1: 1, ARG3: 1, MEX5: 1 });
    expect(result).toHaveLength(3);
    expect(result[0].team).toBe("BRA");
    expect(result[1].team).toBe("ARG");
    expect(result[2].team).toBe("MEX");
  });

  it("preserves insertion order of teams", () => {
    const result = groupByTeam({ ARG1: 1, BRA2: 1, MEX3: 1 });
    expect(result[0].team).toBe("ARG");
    expect(result[1].team).toBe("BRA");
    expect(result[2].team).toBe("MEX");
  });

  it("handles quantities greater than 1", () => {
    const result = groupByTeam({ BRA1: 3, BRA2: 5 });
    expect(result).toHaveLength(1);
    expect(result[0].stickers["BRA1"]).toBe(3);
    expect(result[0].stickers["BRA2"]).toBe(5);
  });

  it("groups special 00 code under team 00", () => {
    const result = groupByTeam({ "00": 1, BRA1: 2 });
    expect(result).toHaveLength(2);
    expect(result[0].team).toBe("00");
    expect(result[0].stickers["00"]).toBe(1);
    expect(result[1].team).toBe("BRA");
  });
});

describe("groupByGroup", () => {
  it("returns as expect object", () => {
    const result = groupByGroup(
      groupByTeam({
        BRA1: 1,
        BRA2: 2,
        ARG2: 2,
        MEX3: 3,
        SCO2: 2,
        SCO20: 1000,
      }),
    );
    expect(result).toMatchObject([
      { labelKey: "group_A", teams: [{ team: "MEX", stickers: { MEX3: 3 } }] },
      {
        labelKey: "group_C",
        teams: [
          { team: "BRA", stickers: { BRA1: 1, BRA2: 2 } },
          { team: "SCO", stickers: { SCO2: 2, SCO20: 1000 } },
        ],
      },
      { labelKey: "group_J", teams: [{ team: "ARG", stickers: { ARG2: 2 } }] },
    ]);
  });
});
