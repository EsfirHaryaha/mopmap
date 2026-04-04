-- =============================================
-- MOPMAP Database Schema
-- =============================================

-- Use built-in gen_random_uuid()

-- =============================================
-- ENUM TYPES
-- =============================================

create type assignment_type as enum ('fixed', 'rotation', 'manual');
create type recurrence_type as enum ('none', 'frequency', 'specific_dates');

-- =============================================
-- PROFILES
-- =============================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- HOUSES
-- =============================================

create table houses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- =============================================
-- HOUSE MEMBERS
-- =============================================

create table house_members (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(house_id, user_id)
);

-- =============================================
-- ROOMS
-- =============================================

create table rooms (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  name text not null,
  icon text not null default '🏠',
  image_url text,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- =============================================
-- TASKS
-- =============================================

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
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- =============================================
-- TASK COMPLETIONS
-- =============================================

create table task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  completed_by uuid not null references profiles(id) on delete cascade,
  completed_at timestamptz not null default now(),
  points_earned integer not null default 0,
  duration_sec integer
);

-- =============================================
-- TASK ROTATION ORDER
-- =============================================

create table task_rotation_order (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  position integer not null,
  unique(task_id, user_id),
  unique(task_id, position)
);

-- =============================================
-- INDEXES
-- =============================================

create index idx_house_members_house on house_members(house_id);
create index idx_house_members_user on house_members(user_id);
create index idx_rooms_house on rooms(house_id);
create index idx_tasks_room on tasks(room_id);
create index idx_tasks_house on tasks(house_id);
create index idx_tasks_assigned on tasks(assigned_to);
create index idx_completions_task on task_completions(task_id);
create index idx_completions_user on task_completions(completed_by);
create index idx_completions_date on task_completions(completed_at);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table profiles enable row level security;
alter table houses enable row level security;
alter table house_members enable row level security;
alter table rooms enable row level security;
alter table tasks enable row level security;
alter table task_completions enable row level security;
alter table task_rotation_order enable row level security;

-- Profiles: users can read all profiles of housemates, edit own
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can view housemates profiles"
  on profiles for select
  using (
    id in (
      select hm.user_id from house_members hm
      where hm.house_id in (
        select hm2.house_id from house_members hm2
        where hm2.user_id = auth.uid()
      )
    )
  );

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Houses: members can view, anyone can create
create policy "House members can view house"
  on houses for select
  using (
    id in (select house_id from house_members where user_id = auth.uid())
  );

create policy "Authenticated users can create houses"
  on houses for insert
  with check (auth.uid() = created_by);

create policy "House members can update house"
  on houses for update
  using (
    id in (select house_id from house_members where user_id = auth.uid())
  );

-- House members: members can view their house, authenticated can join
create policy "Members can view house members"
  on house_members for select
  using (
    house_id in (select house_id from house_members where user_id = auth.uid())
  );

create policy "Authenticated users can join houses"
  on house_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave houses"
  on house_members for delete
  using (auth.uid() = user_id);

-- Rooms: house members can CRUD
create policy "House members can view rooms"
  on rooms for select
  using (
    house_id in (select house_id from house_members where user_id = auth.uid())
  );

create policy "House members can create rooms"
  on rooms for insert
  with check (
    house_id in (select house_id from house_members where user_id = auth.uid())
  );

create policy "House members can update rooms"
  on rooms for update
  using (
    house_id in (select house_id from house_members where user_id = auth.uid())
  );

create policy "House members can delete rooms"
  on rooms for delete
  using (
    house_id in (select house_id from house_members where user_id = auth.uid())
  );

-- Tasks: house members can CRUD
create policy "House members can view tasks"
  on tasks for select
  using (
    house_id in (select house_id from house_members where user_id = auth.uid())
  );

create policy "House members can create tasks"
  on tasks for insert
  with check (
    house_id in (select house_id from house_members where user_id = auth.uid())
  );

create policy "House members can update tasks"
  on tasks for update
  using (
    house_id in (select house_id from house_members where user_id = auth.uid())
  );

create policy "House members can delete tasks"
  on tasks for delete
  using (
    house_id in (select house_id from house_members where user_id = auth.uid())
  );

-- Task completions: house members can view and create
create policy "House members can view completions"
  on task_completions for select
  using (
    task_id in (
      select t.id from tasks t
      where t.house_id in (select house_id from house_members where user_id = auth.uid())
    )
  );

create policy "House members can create completions"
  on task_completions for insert
  with check (auth.uid() = completed_by);

-- Task rotation order: house members can CRUD
create policy "House members can view rotation"
  on task_rotation_order for select
  using (
    task_id in (
      select t.id from tasks t
      where t.house_id in (select house_id from house_members where user_id = auth.uid())
    )
  );

create policy "House members can manage rotation"
  on task_rotation_order for insert
  with check (
    task_id in (
      select t.id from tasks t
      where t.house_id in (select house_id from house_members where user_id = auth.uid())
    )
  );

create policy "House members can update rotation"
  on task_rotation_order for update
  using (
    task_id in (
      select t.id from tasks t
      where t.house_id in (select house_id from house_members where user_id = auth.uid())
    )
  );

create policy "House members can delete rotation"
  on task_rotation_order for delete
  using (
    task_id in (
      select t.id from tasks t
      where t.house_id in (select house_id from house_members where user_id = auth.uid())
    )
  );
