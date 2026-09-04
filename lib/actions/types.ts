/** Uniform Server Action result. `data` carries optional payloads. */
export type ActionResult<T = undefined> = {
  ok: true;
  data?: T;
} | {
  ok: false;
  error: string;
};