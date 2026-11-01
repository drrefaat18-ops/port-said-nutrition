export type Phase = "dawn" | "morning" | "day" | "afternoon" | "sunset" | "night";

// Board i of 7 sits at p = i / 6. Boards 6 and 7 are both night.
const BOARDS: Phase[] = ["dawn", "morning", "day", "afternoon", "sunset", "night", "night"];

export function dayPhase(p: number): Phase {
  const clamped = Math.min(Math.max(p, 0), 1);
  return BOARDS[Math.round(clamped * (BOARDS.length - 1))];
}
