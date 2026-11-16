/**
 * API contract — every provider (supabase, or any future backend) must
 * implement this exact shape. UI code only ever imports `api` from
 * `src/api/index.ts` and never reaches into a provider directly, so
 * swapping providers later means writing a new file in `providers/`,
 * not touching any component.
 */
