"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createRoom(formData: FormData) {
  const name = formData.get("name") as string;
  const icon = (formData.get("icon") as string) || "🏠";
  const houseId = formData.get("houseId") as string;

  if (!name || name.trim().length === 0) {
    return { error: "Il nome della stanza è obbligatorio" };
  }

  if (!houseId) {
    return { error: "Devi appartenere a una casa per creare stanze" };
  }

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { error: "Non autenticato" };
  }
  const user = session.user;

  const { error } = await supabase.from("rooms").insert({
    house_id: houseId,
    name: name.trim(),
    icon,
    created_by: user.id,
  });

  if (error) {
    return { error: "Errore nella creazione della stanza" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
