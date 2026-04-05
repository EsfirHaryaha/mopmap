-- =============================================
-- Seed: rooms, tasks, rotation order, first instances
-- Looks up house/members dynamically by position.
-- Links everything by name, not hardcoded IDs.
-- =============================================

do $$
declare
  v_house_id uuid;
  v_member1 uuid;
  v_member2 uuid;
  v_members uuid[];
  v_room_id uuid;
  v_task_id uuid;
begin
  -- Get the first house
  select id into v_house_id from houses limit 1;
  if v_house_id is null then
    raise notice 'No house found, skipping seed';
    return;
  end if;

  -- Get members ordered by join date
  select array_agg(user_id order by joined_at) into v_members
  from house_members where house_id = v_house_id;

  if v_members is null or array_length(v_members, 1) = 0 then
    raise notice 'No members found, skipping seed';
    return;
  end if;

  v_member1 := v_members[1];
  v_member2 := coalesce(v_members[2], v_members[1]);

  -- =============================================
  -- Rooms
  -- =============================================

  -- Generale
  insert into rooms (house_id, name, icon, created_by)
  values (v_house_id, 'Generale', '🏠', v_member1)
  on conflict do nothing;

  -- Bagno Cesso
  insert into rooms (house_id, name, icon, created_by)
  values (v_house_id, 'Bagno Cesso', '🚽', v_member1)
  on conflict do nothing;

  -- Bagno Doccia
  insert into rooms (house_id, name, icon, created_by)
  values (v_house_id, 'Bagno Doccia', '🚿', v_member1)
  on conflict do nothing;

  -- Cucina
  insert into rooms (house_id, name, icon, created_by)
  values (v_house_id, 'Cucina', '🍳', v_member1)
  on conflict do nothing;

  -- =============================================
  -- Helper: create task + rotation + first instance
  -- =============================================

  -- 1. Sistemare Alfred (Generale, rotation, ogni 2 giorni, 2pt)
  select id into v_room_id from rooms where house_id = v_house_id and name = 'Generale' limit 1;
  insert into tasks (room_id, house_id, name, description, points, assignment_type, recurrence_type, recurrence_rule, daily_count, created_by)
  values (v_room_id, v_house_id, 'Sistemare Alfred', 'controllare: acqua sporca, acqua pulita, filtri', 2, 'rotation', 'frequency', '{"type":"frequency","count":2,"period":"day"}', 1, v_member1)
  returning id into v_task_id;
  insert into task_rotation_order (task_id, user_id, position) values (v_task_id, v_member1, 0), (v_task_id, v_member2, 1);
  insert into task_instances (task_id, house_id, assigned_to, due_date, points_earned) values (v_task_id, v_house_id, v_member1, current_date, 2);

  -- 2. Svuotare cestini (Generale, rotation, ogni settimana, 1pt)
  insert into tasks (room_id, house_id, name, description, points, assignment_type, recurrence_type, recurrence_rule, daily_count, created_by)
  values (v_room_id, v_house_id, 'Svuotare cestini', 'studio, bagno, camera della Patatina', 1, 'rotation', 'frequency', '{"type":"frequency","count":1,"period":"week"}', 1, v_member2)
  returning id into v_task_id;
  insert into task_rotation_order (task_id, user_id, position) values (v_task_id, v_member1, 0), (v_task_id, v_member2, 1);
  insert into task_instances (task_id, house_id, assigned_to, due_date, points_earned) values (v_task_id, v_house_id, v_member2, current_date, 1);

  -- 3. Tavoletta (Bagno Cesso, rotation, ogni 2 settimane, 1pt)
  select id into v_room_id from rooms where house_id = v_house_id and name = 'Bagno Cesso' limit 1;
  insert into tasks (room_id, house_id, name, description, points, assignment_type, recurrence_type, recurrence_rule, daily_count, created_by)
  values (v_room_id, v_house_id, 'Tavoletta', 'con i fazzoletti imbevuti di detersivo passare su tutta la tavoletta', 1, 'rotation', 'frequency', '{"type":"frequency","count":2,"period":"week"}', 1, v_member1)
  returning id into v_task_id;
  insert into task_rotation_order (task_id, user_id, position) values (v_task_id, v_member1, 0), (v_task_id, v_member2, 1);
  insert into task_instances (task_id, house_id, assigned_to, due_date, points_earned) values (v_task_id, v_house_id, v_member1, current_date, 1);

  -- 4. Lavare il cesso (Bagno Cesso, rotation, ogni 2 settimane, 2pt)
  insert into tasks (room_id, house_id, name, description, points, assignment_type, recurrence_type, recurrence_rule, daily_count, created_by)
  values (v_room_id, v_house_id, 'Lavare il cesso', 'tutto intorno sotto sopra dentro ecc', 2, 'rotation', 'frequency', '{"type":"frequency","count":2,"period":"week"}', 1, v_member2)
  returning id into v_task_id;
  insert into task_rotation_order (task_id, user_id, position) values (v_task_id, v_member1, 0), (v_task_id, v_member2, 1);
  insert into task_instances (task_id, house_id, assigned_to, due_date, points_earned) values (v_task_id, v_house_id, v_member2, current_date, 2);

  -- 5. Lavandino + intorno (Bagno Cesso, rotation, ogni settimana, 3pt)
  insert into tasks (room_id, house_id, name, description, points, assignment_type, recurrence_type, recurrence_rule, daily_count, created_by)
  values (v_room_id, v_house_id, 'Lavandino + intorno', 'lavandino, ripiano lavatrice, polvere sulle nicchie portaoggetti della doccia, vetro', 3, 'rotation', 'frequency', '{"type":"frequency","count":1,"period":"week"}', 1, v_member1)
  returning id into v_task_id;
  insert into task_rotation_order (task_id, user_id, position) values (v_task_id, v_member1, 0), (v_task_id, v_member2, 1);
  insert into task_instances (task_id, house_id, assigned_to, due_date, points_earned) values (v_task_id, v_house_id, v_member1, current_date, 3);

  -- 6. Lavare piatto doccia (Bagno Doccia, rotation, ogni 2 settimane, 3pt)
  select id into v_room_id from rooms where house_id = v_house_id and name = 'Bagno Doccia' limit 1;
  insert into tasks (room_id, house_id, name, description, points, assignment_type, recurrence_type, recurrence_rule, daily_count, created_by)
  values (v_room_id, v_house_id, 'Lavare piatto doccia', 'con anticalcare togliere tutti i residui arancioni', 3, 'rotation', 'frequency', '{"type":"frequency","count":2,"period":"week"}', 1, v_member2)
  returning id into v_task_id;
  insert into task_rotation_order (task_id, user_id, position) values (v_task_id, v_member1, 0), (v_task_id, v_member2, 1);
  insert into task_instances (task_id, house_id, assigned_to, due_date, points_earned) values (v_task_id, v_house_id, v_member2, current_date, 3);

  -- 7. Lavare i piatti (Cucina, fixed a member1, ogni giorno, 2pt, 2x al giorno)
  select id into v_room_id from rooms where house_id = v_house_id and name = 'Cucina' limit 1;
  insert into tasks (room_id, house_id, name, description, points, assignment_type, assigned_to, recurrence_type, recurrence_rule, daily_count, created_by)
  values (v_room_id, v_house_id, 'Lavare i piatti', null, 2, 'fixed', v_member1, 'frequency', '{"type":"frequency","count":1,"period":"day"}', 2, v_member1)
  returning id into v_task_id;
  insert into task_instances (task_id, house_id, assigned_to, due_date, points_earned) values (v_task_id, v_house_id, v_member1, current_date, 2);

  -- 8. Cucinare (Cucina, fixed a member2, ogni giorno, 2pt, 2x al giorno)
  insert into tasks (room_id, house_id, name, description, points, assignment_type, assigned_to, recurrence_type, recurrence_rule, daily_count, created_by)
  values (v_room_id, v_house_id, 'Cucinare', null, 2, 'fixed', v_member2, 'frequency', '{"type":"frequency","count":1,"period":"day"}', 2, v_member2)
  returning id into v_task_id;
  insert into task_instances (task_id, house_id, assigned_to, due_date, points_earned) values (v_task_id, v_house_id, v_member2, current_date, 2);

end;
$$;
