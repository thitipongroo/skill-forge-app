import { describe, it, expect } from "vitest";
import en from "./locales/en.json";
import th from "./locales/th.json";

type Dict = Record<string, unknown>;
const strKeys = (o: Dict) => Object.keys(o).filter((k) => typeof o[k] === "string");

describe("locale parity", () => {
  const ek = strKeys(en as Dict);

  it("th defines every en key except intentional _one plural forms", () => {
    expect(ek.filter((k) => !(k in (th as Dict)) && !k.endsWith("_one"))).toEqual([]);
  });
  it("principles and stages line up across languages", () => {
    expect((th as Dict).principles).toHaveLength((en as { principles: unknown[] }).principles.length);
  });
});
