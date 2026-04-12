import type { PQChoice } from "./types";

export const PQ_PAIRS: Record<
  PQChoice,
  { p: number; q: number; label: string }
> = {
  "3-5": { p: 3, q: 5, label: "p = 3, q = 5" },
  "3-7": { p: 3, q: 7, label: "p = 3, q = 7" },
};
