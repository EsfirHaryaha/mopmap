import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth check if Supabase is not configured (build time)
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // getSession() validates JWT locally from cookie — no network call
  // Much faster than getUser() which hits Supabase auth servers every time
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect unauthenticated users to login (except for public pages)
  const publicPaths = ["/", "/login", "/register", "/auth/callback"];
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname === path);

  if (!session && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (
    session &&
    (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Pass user id via header so pages don't need to call getUser() again
  if (session?.user) {
    supabaseResponse.headers.set("x-user-id", session.user.id);
  }

  return supabaseResponse;
}
