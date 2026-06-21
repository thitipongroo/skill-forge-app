// Shared domain types (mirror the Prisma models, minus server-only fields).
export type Lang = "en" | "th";
export type Theme = "light" | "dark";

export interface SubSkill { id: string; text: string; vital: boolean; order: number; }
export interface Session {
  id: string; date: string; minutes: number; what: string;
  reflection: string; subskillId: string | null;
}
export interface Review { id: string; topic: string; box: number; due: string; last: string | null; }
export interface PrincipleNote { key: string; done: boolean; note: string; }

export interface Skill {
  id: string; name: string; why: string; target: string; targetHours: number;
  celebrated: boolean; archived: boolean; shareToken?: string | null;
  subskills: SubSkill[]; sessions: Session[]; reviews: Review[]; principles: PrincipleNote[];
}

export interface UserPrefs { lang: Lang; theme: Theme; weeklyGoal: number; remindersOptIn: boolean; }
export interface Snapshot extends UserPrefs { skills: Skill[]; }
