/**
 * Maps Supabase auth errors to safe, user-friendly messages.
 * Never renders raw error text, codes, or stack traces to users.
 */

export type AuthErrorLike = {
  code?: string | null;
  message?: string | null;
} | null | undefined;

export const GENERIC_AUTH_ERROR = "Something went wrong. Please try again.";
export const NETWORK_ERROR =
  "Network error. Please check your connection and try again.";

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "Invalid email or password.",
  email_not_confirmed:
    "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
  user_already_exists:
    "An account with this email already exists. Try signing in instead.",
  over_email_send_rate_limit:
    "Too many emails have been sent to this address. Please wait a minute and try again.",
  user_banned:
    "This account has been disabled. Contact support if you believe this is a mistake.",
  weak_password:
    "That password is too weak. Use at least 8 characters, mixing letters and numbers.",
  same_password:
    "The new password must be different from your current password.",
  otp_expired:
    "This link has expired. Please request a new one.",
  session_not_found:
    "Your session has expired. Please sign in again.",
  request_timeout: "The request timed out. Please try again.",
};

const MESSAGE_FALLBACKS: [RegExp, string][] = [
  [/invalid login credentials/i, "Invalid email or password."],
  [/email ?not ?confirmed/i, "Please confirm your email address before signing in."],
  [/already been registered|already registered|user already exists/i, "An account with this email already exists. Try signing in instead."],
  [/rate limit/i, "Too many requests. Please wait a minute and try again."],
  [/password should be at least|password is too weak/i, "That password is too weak. Use at least 8 characters, mixing letters and numbers."],
  [/same as the (old|current) password/i, "The new password must be different from your current password."],
  [/session (not found|expired|missing)/i, "Your session has expired. Please sign in again."],
  [/expired/i, "This link has expired. Please request a new one."],
  [/failed to fetch|fetch failed|network/i, NETWORK_ERROR],
];

export function getAuthErrorMessage(error: AuthErrorLike): string {
  if (!error) {
    return GENERIC_AUTH_ERROR;
  }

  if (error.code && CODE_MESSAGES[error.code]) {
    return CODE_MESSAGES[error.code];
  }

  const message = error.message ?? "";
  for (const [pattern, friendly] of MESSAGE_FALLBACKS) {
    if (pattern.test(message)) {
      return friendly;
    }
  }

  return GENERIC_AUTH_ERROR;
}