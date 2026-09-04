import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Route prefixes that require an authenticated session. */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Auth pages that bounce authenticated users to the dashboard. */
const AUTH_ROUTES = ["/login", "/signup"];

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Next.js middleware for Supabase SSR session management.
 *
 *  - Refreshes expiring auth cookies on every request.
 *  - Protects /dashboard/*: unauthenticated users → /login?next=<path>.
 *  - Redirects authenticated users away from /login and /signup.
 *  - Leaves every public route untouched.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });
  let refreshedCookies: CookieToSet[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        refreshedCookies = cookiesToSet;
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: no code between client creation and getUser() — the call may
  // rotate tokens, and the cookie writes above must capture that.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    for (const { name, value, options } of refreshedCookies) {
      redirectResponse.cookies.set(name, value, options);
    }
    return redirectResponse;
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    const redirectResponse = NextResponse.redirect(redirectUrl);
    for (const { name, value, options } of refreshedCookies) {
      redirectResponse.cookies.set(name, value, options);
    }
    return redirectResponse;
  }

  return supabaseResponse;
}