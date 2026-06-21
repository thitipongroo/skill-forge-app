import { db } from "./db";
// Confirm a skill belongs to the user (ownership check for nested resources).
export async function ownsSkill(userId: string, skillId: string) {
  return Boolean(await db.skill.findFirst({ where: { id: skillId, userId }, select: { id: true } }));
}
export async function ownsSession(userId: string, sessionId: string) {
  const s = await db.session.findUnique({ where: { id: sessionId }, include: { skill: { select: { userId: true } } } });
  return s?.skill.userId === userId ? s : null;
}
export async function ownsReview(userId: string, reviewId: string) {
  const r = await db.review.findUnique({ where: { id: reviewId }, include: { skill: { select: { userId: true } } } });
  return r?.skill.userId === userId ? r : null;
}
