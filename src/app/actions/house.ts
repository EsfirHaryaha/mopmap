"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/utils";

export async function createHouse(formData: FormData) {
  const name = formData.get("name") as string;

  if (!name || name.trim().length === 0) {
    return { error: "Il nome della casa è obbligatorio" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autenticato" };
  }

  // Generate a unique house ID client-side so we can insert house + member
  // without needing to SELECT the house back (RLS blocks SELECT before membership)
  const houseId = crypto.randomUUID();
  const inviteCode = generateInviteCode();

  // Insert the house
  const { error: houseError } = await supabase.from("houses").insert({
    id: houseId,
    name: name.trim(),
    invite_code: inviteCode,
    created_by: user.id,
  });

  if (houseError) {
    // Retry with different code if duplicate invite_code
    if (houseError.code === "23505") {
      const retryCode = generateInviteCode();
      const retryId = crypto.randomUUID();
      const { error: retryError } = await supabase.from("houses").insert({
        id: retryId,
        name: name.trim(),
        invite_code: retryCode,
        created_by: user.id,
      });

      if (retryError) {
        return { error: "Errore nella creazione della casa" };
      }

      await supabase
        .from("house_members")
        .insert({ house_id: retryId, user_id: user.id });

      revalidatePath("/dashboard");
      return { success: true };
    }
    return { error: "Errore nella creazione della casa" };
  }

  // Add creator as member
  const { error: memberError } = await supabase
    .from("house_members")
    .insert({ house_id: houseId, user_id: user.id });

  if (memberError) {
    return { error: "Casa creata ma errore nell'aggiunta come membro" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function joinHouse(formData: FormData) {
  const code = (formData.get("code") as string)?.toUpperCase().trim();

  if (!code || code.length !== 6) {
    return { error: "Il codice invito deve essere di 6 caratteri" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autenticato" };
  }

  // Find house by invite code
  // Note: this SELECT will fail if user is not a member (RLS).
  // We need to use a different approach — try to insert directly
  // and let the DB constraints handle validation.

  // We can't read houses we're not a member of due to RLS.
  // Use rpc or a workaround: try inserting into house_members with a subquery.
  // Simplest fix: use supabase rpc or relax the RLS for houses SELECT on invite_code.

  // For now, we do a raw rpc call to find the house by invite code
  const { data: house, error: lookupError } = await supabase.rpc(
    "find_house_by_invite_code",
    {
      code,
    }
  );

  if (lookupError || !house) {
    return { error: "Codice invito non valido" };
  }

  // Join the house
  const { error: joinError } = await supabase
    .from("house_members")
    .insert({ house_id: house, user_id: user.id });

  if (joinError) {
    if (joinError.code === "23505") {
      return { error: "Fai già parte di questa casa" };
    }
    return { error: "Errore nell'unirsi alla casa" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
