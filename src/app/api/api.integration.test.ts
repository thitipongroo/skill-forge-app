/**
 * API integration tests — exercise the real route handlers against a real
 * Postgres (set DATABASE_URL, e.g. the docker compose db). Run with:
 *   npm run test:integration
 * The Auth.js module is mocked so we control which user is "signed in".
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";

const sessionRef: { user?: { id: string } } = {};
vi.mock("@/auth", () => ({
  auth: vi.fn(async () => (sessionRef.user ? { user: sessionRef.user } : null)),
}));

import { db } from "@/lib/db";
import { POST as createSkill, GET as listSkills } from "@/app/api/skills/route";
import { POST as createSession } from "@/app/api/sessions/route";
import { POST as createReview } from "@/app/api/reviews/route";
import { PATCH as reviewAction } from "@/app/api/reviews/[id]/route";
import { todayISO, addDays, REVIEW_STEPS } from "@/lib/review";

const body = (b: unknown) =>
  new Request("http://test/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });

type Skill = { id: string; name: string; userId: string };
type Review = { id: string; box: number; due: string };

let userA = "", userB = "";

beforeAll(async () => {
  const stamp = Date.now();
  const a = await db.user.create({ data: { email: `a_${stamp}@test.local`, passwordHash: "x" } });
  const b = await db.user.create({ data: { email: `b_${stamp}@test.local`, passwordHash: "x" } });
  userA = a.id; userB = b.id;
});
afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: [userA, userB] } } }); // cascades to skills/sessions/reviews
  await db.$disconnect();
});
beforeEach(() => { sessionRef.user = undefined; });

describe("skills/sessions/reviews API against a real DB", () => {
  it("returns 401 when unauthenticated", async () => {
    expect((await listSkills()).status).toBe(401);
  });

  it("creates skills and scopes listing to the owner", async () => {
    sessionRef.user = { id: userA };
    const created = await createSkill(body({ name: "Guitar" }));
    expect(created.status).toBe(201);
    const skill = (await created.json()) as Skill;
    expect(skill.userId).toBe(userA);

    const mine = (await (await listSkills()).json()) as Skill[];
    expect(mine.some((s) => s.id === skill.id)).toBe(true);

    sessionRef.user = { id: userB };
    const theirs = (await (await listSkills()).json()) as Skill[];
    expect(theirs.some((s) => s.id === skill.id)).toBe(false);
  });

  it("logs a session and advances a review on the Leitner ladder", async () => {
    sessionRef.user = { id: userA };
    const skill = (await (await createSkill(body({ name: "Piano" }))).json()) as Skill;

    expect((await createSession(body({ skillId: skill.id, date: todayISO(), minutes: 30, what: "scales" }))).status).toBe(201);

    const review = (await (await createReview(body({ skillId: skill.id, topic: "C major" }))).json()) as Review;
    expect(review.box).toBe(0);

    const advanced = (await (await reviewAction(body({ action: "got" }), { params: { id: review.id } })).json()) as Review;
    expect(advanced.box).toBe(1);
    expect(advanced.due).toBe(addDays(todayISO(), REVIEW_STEPS[1]));
  });

  it("blocks acting on another user's review", async () => {
    sessionRef.user = { id: userA };
    const skill = (await (await createSkill(body({ name: "Chess" }))).json()) as Skill;
    const review = (await (await createReview(body({ skillId: skill.id, topic: "Sicilian" }))).json()) as Review;

    sessionRef.user = { id: userB };
    const res = await reviewAction(body({ action: "got" }), { params: { id: review.id } });
    expect([403, 404]).toContain(res.status);
  });
});
