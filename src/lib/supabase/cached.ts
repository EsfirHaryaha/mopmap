import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "./server";

/**
 * Get user from session (local JWT decode, no network call).
 * Use this instead of getUser() which hits Supabase auth servers.
 */
export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
});

/**
 * Get user ID from middleware header (fastest) or fallback to session.
 */
export const getUserId = cache(async (): Promise<string | null> => {
  const h = await headers();
  const fromMiddleware = h.get("x-user-id");
  if (fromMiddleware) return fromMiddleware;
  const user = await getSessionUser();
  return user?.id ?? null;
});

/**
 * Cached per-request: membership + house info in una sola query.
 */
export const getMembership = cache(async () => {
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("house_members")
    .select("house_id, houses(id, name, invite_code)")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (!data) return null;

  const house = data.houses as unknown as {
    id: string;
    name: string;
    invite_code: string;
  };

  return { house_id: data.house_id, house };
});
