"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getNextDueDate, getNextRotationMember } from "@/lib/instances";

export async function createTask(formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const roomId = formData.get("roomId") as string;
  const houseId = formData.get("houseId") as string;
  const points = parseInt(formData.get("points") as string) || 0;
  const assignmentType = (formData.get("assignmentType") as string) || "manual";
  const assignedTo = (formData.get("assignedTo") as string) || null;
  const recurrenceType = (formData.get("recurrenceType") as string) || "none";
  const recurrenceRuleRaw = formData.get("recurrenceRule") as string;
  const dailyCount = parseInt(formData.get("dailyCount") as string) || 1;
  const startDate =
    (formData.get("startDate") as string) || new Date().toISOString().split("T")[0];

  if (!name?.trim()) return { error: "Il nome del task è obbligatorio" };
  if (!roomId || !houseId) return { error: "Stanza e casa sono obbligatorie" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  let recurrenceRule = null;
  if (recurrenceRuleRaw) {
    try {
      recurrenceRule = JSON.parse(recurrenceRuleRaw);
    } catch {
      return { error: "Regola di ricorrenza non valida" };
    }
  }

  // 1. Create the task template
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      name: name.trim(),
      description,
      room_id: roomId,
      house_id: houseId,
      points,
      assignment_type: assignmentType,
      assigned_to: assignedTo || null,
      recurrence_type: recurrenceType,
      recurrence_rule: recurrenceRule,
      daily_count: dailyCount,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !task) return { error: "Errore nella creazione del task" };

  // 2. Determine who is assigned to the first instance
  let firstAssigned: string | null = null;

  if (assignmentType === "fixed" && assignedTo) {
    firstAssigned = assignedTo;
  } else if (assignmentType === "rotation") {
    const { data: members } = await supabase
      .from("house_members")
      .select("user_id")
      .eq("house_id", houseId)
      .order("joined_at", { ascending: true });

    const memberIds = (members ?? []).map((m) => m.user_id);

    // Save rotation order
    if (memberIds.length > 0) {
      await supabase
        .from("task_rotation_order")
        .insert(
          memberIds.map((uid, i) => ({ task_id: task.id, user_id: uid, position: i }))
        );
      firstAssigned = memberIds[0];
    }
  }

  // 3. Create the first instance
  await supabase.from("task_instances").insert({
    task_id: task.id,
    house_id: houseId,
    assigned_to: firstAssigned,
    due_date: startDate,
    points_earned: points,
  });

  revalidatePath(`/room/${roomId}`);
  revalidatePath("/my-tasks");
  return { success: true };
}

export async function updateTask(formData: FormData) {
  const taskId = formData.get("taskId") as string;
  const name = formData.get("name") as string;
  const roomId = formData.get("roomId") as string;
  const description = (formData.get("description") as string) || null;
  const points = parseInt(formData.get("points") as string) || 0;
  const assignmentType = (formData.get("assignmentType") as string) || "manual";
  const assignedTo = (formData.get("assignedTo") as string) || null;
  const recurrenceType = (formData.get("recurrenceType") as string) || "none";
  const recurrenceRuleRaw = formData.get("recurrenceRule") as string;
  const dailyCount = parseInt(formData.get("dailyCount") as string) || 1;
  const dueDate = formData.get("dueDate") as string;

  if (!taskId) return { error: "Task non trovato" };
  if (!name?.trim()) return { error: "Il nome è obbligatorio" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  let recurrenceRule = null;
  if (recurrenceRuleRaw) {
    try {
      recurrenceRule = JSON.parse(recurrenceRuleRaw);
    } catch {
      return { error: "Regola di ricorrenza non valida" };
    }
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      name: name.trim(),
      description,
      points,
      assignment_type: assignmentType,
      assigned_to: assignedTo || null,
      recurrence_type: recurrenceType,
      recurrence_rule: recurrenceRule,
      daily_count: dailyCount,
    })
    .eq("id", taskId);

  if (error) return { error: "Errore nella modifica del task" };

  // If date changed, delete all pending instances and create a fresh one
  if (dueDate) {
    await supabase
      .from("task_instances")
      .delete()
      .eq("task_id", taskId)
      .eq("status", "pending");

    let newAssigned: string | null = null;
    if (assignmentType === "fixed" && assignedTo) {
      newAssigned = assignedTo;
    } else if (assignmentType === "rotation") {
      // Use the selected member as starting point, or fall back to first in rotation
      if (assignedTo) {
        newAssigned = assignedTo;
      } else {
        const { data: rotation } = await supabase
          .from("task_rotation_order")
          .select("user_id")
          .eq("task_id", taskId)
          .order("position", { ascending: true })
          .limit(1)
          .single();
        newAssigned = rotation?.user_id ?? null;
      }
    }

    const { data: taskForHouse } = await supabase
      .from("tasks")
      .select("house_id")
      .eq("id", taskId)
      .single();

    if (taskForHouse) {
      await supabase.from("task_instances").insert({
        task_id: taskId,
        house_id: taskForHouse.house_id,
        assigned_to: newAssigned,
        due_date: dueDate,
        points_earned: points,
      });
    }
  } else {
    // No date change: just update the pending instance
    const { data: pendingInstance } = await supabase
      .from("task_instances")
      .select("id")
      .eq("task_id", taskId)
      .eq("status", "pending")
      .order("due_date", { ascending: true })
      .limit(1)
      .single();

    if (pendingInstance) {
      let newAssigned: string | null = null;
      if (assignmentType === "fixed" && assignedTo) newAssigned = assignedTo;

      await supabase
        .from("task_instances")
        .update({
          points_earned: points,
          ...(assignmentType !== "rotation" ? { assigned_to: newAssigned } : {}),
        })
        .eq("id", pendingInstance.id);
    }
  }

  revalidatePath(`/room/${roomId}`);
  revalidatePath("/my-tasks");
  return { success: true };
}

export async function deleteTask(formData: FormData) {
  const taskId = formData.get("taskId") as string;
  const roomId = formData.get("roomId") as string;

  if (!taskId) return { error: "Task non trovato" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  // Delete pending instances (keep completed ones for history)
  await supabase
    .from("task_instances")
    .delete()
    .eq("task_id", taskId)
    .eq("status", "pending");

  // Delete the task itself (completed instances lose FK but that's ok — they cascade)
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { error: "Errore nell'eliminazione del task" };

  revalidatePath(`/room/${roomId}`);
  revalidatePath("/my-tasks");
  return { success: true };
}

export async function archiveTask(formData: FormData) {
  const taskId = formData.get("taskId") as string;
  const roomId = formData.get("roomId") as string;

  if (!taskId) return { error: "Task non trovato" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  // Delete all pending (future) instances
  await supabase
    .from("task_instances")
    .delete()
    .eq("task_id", taskId)
    .eq("status", "pending");

  // Archive the task
  await supabase.from("tasks").update({ archived: true }).eq("id", taskId);

  revalidatePath(`/room/${roomId}`);
  revalidatePath("/my-tasks");
  return { success: true };
}

export async function completeInstance(instanceId: string, durationSec?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  // Get the instance + its task template
  const { data: instance } = await supabase
    .from("task_instances")
    .select("id, task_id, house_id, points_earned, due_date, assigned_to")
    .eq("id", instanceId)
    .single();

  if (!instance) return { error: "Istanza non trovata" };

  // Mark as completed
  const { error } = await supabase
    .from("task_instances")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      completed_by: user.id,
      ...(durationSec !== undefined && durationSec !== null
        ? { duration_sec: durationSec }
        : {}),
    })
    .eq("id", instanceId);

  if (error) return { error: "Errore nel completamento" };

  // Get the task template to check recurrence and daily_count
  const { data: task } = await supabase
    .from("tasks")
    .select(
      "id, assignment_type, recurrence_type, recurrence_rule, points, house_id, daily_count"
    )
    .eq("id", instance.task_id)
    .single();

  if (!task) return { success: true };

  const dailyCount = task.daily_count ?? 1;

  // Count how many times this task was completed today
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const { count: completedToday } = await supabase
    .from("task_instances")
    .select("id", { count: "exact", head: true })
    .eq("task_id", task.id)
    .eq("status", "completed")
    .eq("due_date", todayStr);

  // If daily count not yet reached, create another instance for today
  if ((completedToday ?? 0) < dailyCount) {
    let nextAssigned = instance.assigned_to;

    if (task.assignment_type === "rotation" && instance.assigned_to) {
      const { data: rotation } = await supabase
        .from("task_rotation_order")
        .select("user_id, position")
        .eq("task_id", task.id)
        .order("position", { ascending: true });

      if (rotation && rotation.length > 0) {
        nextAssigned = getNextRotationMember(instance.assigned_to, rotation);
      }
    }

    await supabase.from("task_instances").insert({
      task_id: task.id,
      house_id: task.house_id,
      assigned_to: nextAssigned,
      due_date: todayStr,
      points_earned: task.points,
    });
  } else {
    // Daily count reached — create next occurrence based on TODAY (not due_date)
    // so overdue tasks don't create instances in the past
    const nextDate = getNextDueDate(
      todayStr,
      task.recurrence_type,
      task.recurrence_rule as {
        type?: string;
        count?: number;
        period?: string;
        weekdays?: number[];
      } | null
    );

    if (nextDate) {
      let nextAssigned: string | null = null;

      if (task.assignment_type === "fixed") {
        nextAssigned = instance.assigned_to;
      } else if (task.assignment_type === "rotation" && instance.assigned_to) {
        const { data: rotation } = await supabase
          .from("task_rotation_order")
          .select("user_id, position")
          .eq("task_id", task.id)
          .order("position", { ascending: true });

        if (rotation && rotation.length > 0) {
          nextAssigned = getNextRotationMember(instance.assigned_to, rotation);
        }
      }

      await supabase.from("task_instances").insert({
        task_id: task.id,
        house_id: task.house_id,
        assigned_to: nextAssigned,
        due_date: nextDate,
        points_earned: task.points,
      });
    } else {
      // Non-recurring task, daily count reached: archive it
      await supabase.from("tasks").update({ archived: true }).eq("id", task.id);
    }
  }

  revalidatePath("/my-tasks");
  revalidatePath("/stats");
  return { success: true };
}

export async function uncompleteInstance(instanceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  const { data: instance } = await supabase
    .from("task_instances")
    .select("id, task_id, house_id, assigned_to, points_earned")
    .eq("id", instanceId)
    .single();

  if (!instance) return { error: "Istanza non trovata" };

  // Get task info
  const { data: task } = await supabase
    .from("tasks")
    .select("id, points, assignment_type, room_id")
    .eq("id", instance.task_id)
    .single();

  if (!task) return { error: "Task non trovato" };

  // Unarchive the task
  await supabase.from("tasks").update({ archived: false }).eq("id", instance.task_id);

  // Create a new pending instance with due_date = today
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  await supabase.from("task_instances").insert({
    task_id: instance.task_id,
    house_id: instance.house_id,
    assigned_to: instance.assigned_to,
    due_date: todayStr,
    points_earned: task.points,
  });

  revalidatePath(`/room/${task.room_id}`);
  revalidatePath("/my-tasks");
  revalidatePath("/stats");
  return { success: true };
}
