-- =============================================
-- MOPMAP — Full schema (final)
-- =============================================

create type assignment_type as enum ('fixed', 'rotation', 'manual');
create type recurrence_type as enum ('none', 'frequency', 'specific_dates');

-- =============================================
-- Tables
-- =============================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table houses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table house_members (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(house_id, user_id)
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  name text not null,
  icon text not null default '🏠',
  image_url text,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  house_id uuid not null references houses(id) on delete cascade,
  name text not null,
  description text,
  points integer not null default 0 check (points >= 0 and points <= 3),
  assignment_type assignment_type not null default 'manual',
  assigned_to uuid references profiles(id) on delete set null,
  recurrence_type recurrence_type not null default 'none',
  recurrence_rule jsonb,
  daily_count integer not null default 1 check (daily_count >= 1 and daily_count <= 10),
  archived boolean not null default false,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table task_instances (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  house_id uuid not null references houses(id) on delete cascade,
  assigned_to uuid references profiles(id) on delete set null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  completed_by uuid references profiles(id) on delete set null,
  points_earned integer not null default 0,
  duration_sec integer,
  created_at timestamptz not null default now()
);

create table task_rotation_order (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  position integer not null,
  unique(task_id, user_id),
  unique(task_id, position)
);

-- =============================================
-- Indexes
-- =============================================

create index idx_house_members_house on house_members(house_id);
create index idx_house_members_user on house_members(user_id);
create index idx_rooms_house on rooms(house_id);
create index idx_tasks_room on tasks(room_id);
create index idx_tasks_house on tasks(house_id);
create index idx_tasks_assigned on tasks(assigned_to);
create index idx_tasks_archived on tasks(archived);
create index idx_instances_task on task_instances(task_id);
create index idx_instances_house on task_instances(house_id);
create index idx_instances_assigned on task_instances(assigned_to);
create index idx_instances_due on task_instances(due_date);
create index idx_instances_status on task_instances(status);

-- =============================================
-- Triggers
-- =============================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- RPC
-- =============================================

create or replace function find_house_by_invite_code(code text)
returns uuid
language sql
security definer
as $$
  select id from houses where invite_code = code limit 1;
$$;

-- =============================================
-- RLS — authenticated = access
-- =============================================

alter table profiles enable row level security;
alter table houses enable row level security;
alter table house_members enable row level security;
alter table rooms enable row level security;
alter table tasks enable row level security;
alter table task_instances enable row level security;
alter table task_rotation_order enable row level security;

-- Profiles
create policy "select" on profiles for select using (auth.uid() is not null);
create policy "update" on profiles for update using (auth.uid() = id);

-- Houses
create policy "select" on houses for select using (auth.uid() is not null);
create policy "insert" on houses for insert with check (auth.uid() is not null);
create policy "update" on houses for update using (auth.uid() is not null);

-- House members
create policy "select" on house_members for select using (auth.uid() is not null);
create policy "insert" on house_members for insert with check (auth.uid() is not null);
create policy "delete" on house_members for delete using (auth.uid() = user_id);

-- Rooms
create policy "select" on rooms for select using (auth.uid() is not null);
create policy "insert" on rooms for insert with check (auth.uid() is not null);
create policy "update" on rooms for update using (auth.uid() is not null);
create policy "delete" on rooms for delete using (auth.uid() is not null);

-- Tasks
create policy "select" on tasks for select using (auth.uid() is not null);
create policy "insert" on tasks for insert with check (auth.uid() is not null);
create policy "update" on tasks for update using (auth.uid() is not null);
create policy "delete" on tasks for delete using (auth.uid() is not null);

-- Task instances
create policy "select" on task_instances for select using (auth.uid() is not null);
create policy "insert" on task_instances for insert with check (auth.uid() is not null);
create policy "update" on task_instances for update using (auth.uid() is not null);
create policy "delete" on task_instances for delete using (auth.uid() is not null);

-- Task rotation order
create policy "select" on task_rotation_order for select using (auth.uid() is not null);
create policy "insert" on task_rotation_order for insert with check (auth.uid() is not null);
create policy "update" on task_rotation_order for update using (auth.uid() is not null);
create policy "delete" on task_rotation_order for delete using (auth.uid() is not null);
