export type Env = { reduced: boolean; webgl: boolean; memory?: number };

// Owner's ruling: only reduced motion or missing WebGL keeps the poster. `memory` is ignored.
export function capable(e: Env): boolean {
  return !e.reduced && e.webgl;
}
