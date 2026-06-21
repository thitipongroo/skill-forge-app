/**
 * Integration tests for data export / import / account deletion (real DB).
 * Run with: npm run test:integration
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";

const sessionRef: { user?: { id: string } } = {};
vi.mock("@/auth", () => ({
  auth: vi.fn(async () => (sessionRef.user ? { user: sessionRef.user } : null)),
}));

import { db } from "@/lib/db";
import { POST as createSkill, GET as listSkills } from "@/app/api/skills/route";
import { GET as exportData } from "@/app/api/export/route";
import { POST as importData } from "@/app/api/import/route";
import { DELETE as deleteAccount } from "@/app/api/account/route";

const body = (b: unknown) =>
  new Request("http://test/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });

type Skill = { id: string; name: string };
type Export = { version: number; prefs: { lang: string }; skills: { name: string }[] };

let userX = "";

beforeAll(async () => {
  const u = await db.user.create({ data: { email: `x_${Date.now()}@test.local`, passwordHash: "x" } });
  userX = u.id;
});
afterAll(async () => {
  await db.user.deleteMany({ where: { id: userX } });
  await db.$disconnect();
});
beforeEach(() => { sessionRef.user = { id: userX }; });

describe("export / import / delete (real DB)", () => {
  it("exports the user's skills and prefs", async () => {
    await createSkill(body({ name: "Cooking" }));
    const dump = (await (await exportData()).json()) as Export;
    expect(dump.version).toBe(1);
    expect(dump.prefs.lang).toBeDefined();
    expect(dump.skills.some((s) => s.name === "Cooking")).toBe(true);
  });

  it("imports skills from an export payload (merge)", async () => {
    const before = ((await (await listSkills()).json()) as Skill[]).length;
    const res = await importData(body({
      skills: [{ name: "Imported A", subskills: [{ id: "old1", text: "piece", vital: true, order: 0 }],
        sessions: [{ date: "2024-01-01", minutes: 20, what: "x", subskillId: "old1" }] }],
    }));
    const out = await res.json();
    expect(out.imported).toBe(1);
    const after = ((await (await listSkills()).json()) as Skill[]).length;
    expect(after).toBe(before + 1);
  });

  it("replace mode wipes existing skills first", async () => {
    await importData(body({ mode: "replace", skills: [{ name: "Only One" }] }));
    const list = (await (await listSkills()).json()) as Skill[];
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Only One");
  });

  it("deletes the account and then refuses further access", async () => {
    const victim = await db.user.create({ data: { email: `del_${Date.now()}@test.local`, passwordHash: "x" } });
    sessionRef.user = { id: victim.id };
    expect((await deleteAccount()).status).toBe(200);
    expect(await db.user.findUnique({ where: { id: victim.id } })).toBeNull();
    // session still points at the deleted user -> unauthorized
    expect((await exportData()).status).toBe(401);
  });
});
