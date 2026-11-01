export type Phase = "dawn" | "morning" | "day" | "afternoon" | "sunset" | "night";

// Seven even stretches of the scroll; the last two are both night.
const BOARDS: Phase[] = ["dawn", "morning", "day", "afternoon", "sunset", "night", "night"];

export function dayPhase(p: number): Phase {
  const clamped = Math.min(Math.max(p, 0), 1);
  return BOARDS[Math.round(clamped * (BOARDS.length - 1))];
}
