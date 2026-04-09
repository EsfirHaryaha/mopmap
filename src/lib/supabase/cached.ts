import { cache } from "react";
import { createClient } from "./server";

/**
 * Cached per-request: getUser() viene chiamato una sola volta
 * anche se layout + page lo invocano entrambi.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Cached per-request: membership + house info in una sola query.
 */
export const getMembership = cache(async () => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("house_members")
    .select("house_id, houses(id, name, invite_code)")
    .eq("user_id", user.id)
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
