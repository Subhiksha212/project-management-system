-- ProjectFlow production schema (Supabase Auth + strict RLS)
-- Run this file in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- =========================
-- Core enums
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('director', 'coordinator', 'student');
  end if;

  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type public.project_status as enum ('on_track', 'at_risk', 'delayed', 'completed');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('todo', 'active', 'done');
  end if;

  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type public.submission_status as enum ('draft', 'submitted', 'reviewed', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('pending', 'approved', 'changes_requested');
  end if;
end $$;

-- =========================
-- Utility functions
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- Tables
-- =========================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'student',
  department text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration support for older schema versions.
-- Drop plaintext password storage if it exists.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'password'
  ) then
    alter table public.users drop column password;
  end if;
end $$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select u.role
  from public.users u
  where u.auth_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_director()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() = 'director', false);
$$;

create or replace function public.is_coordinator_or_director()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() in ('coordinator', 'director'), false);
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  department text,
  coordinator_id uuid references public.users(id) on delete set null,
  status public.project_status not null default 'on_track',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  start_date date,
  due_date date,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role_in_project text,
  joined_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status public.task_status not null default 'todo',
  sort_order int not null default 0,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  assignee_id uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  due_date date,
  completed_at timestamptz,
  priority text default 'medium',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  coordinator_id uuid references public.users(id) on delete set null,
  student_id uuid references public.users(id) on delete set null,
  task_title text not null,
  due_at timestamptz,
  status public.review_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  student_id uuid references public.users(id) on delete set null,
  title text not null,
  file_url text,
  remarks text,
  status public.submission_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  audience_role public.user_role,
  title text not null,
  message text not null,
  severity text default 'info',
  posted_by uuid references public.users(id) on delete set null,
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

-- =========================
-- Indexes
-- =========================
create index if not exists idx_users_auth_id on public.users(auth_id);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_department on public.users(department);

create index if not exists idx_projects_coordinator on public.projects(coordinator_id);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_due_date on public.projects(due_date);

create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_assignee on public.tasks(assignee_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);

create index if not exists idx_milestones_project on public.milestones(project_id);
create index if not exists idx_reviews_project on public.reviews(project_id);
create index if not exists idx_reviews_status on public.reviews(status);
create index if not exists idx_schedule_project on public.schedule_events(project_id);
create index if not exists idx_submissions_project on public.submissions(project_id);
create index if not exists idx_announcements_project on public.announcements(project_id);
create index if not exists idx_activity_logs_project on public.activity_logs(project_id);

-- =========================
-- updated_at triggers
-- =========================
drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists trg_milestones_updated_at on public.milestones;
create trigger trg_milestones_updated_at
before update on public.milestones
for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

drop trigger if exists trg_schedule_events_updated_at on public.schedule_events;
create trigger trg_schedule_events_updated_at
before update on public.schedule_events
for each row execute function public.set_updated_at();

drop trigger if exists trg_submissions_updated_at on public.submissions;
create trigger trg_submissions_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

drop trigger if exists trg_announcements_updated_at on public.announcements;
create trigger trg_announcements_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

-- =========================
-- Auth trigger: mirror auth.users -> public.users
-- =========================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (auth_id, email, name, role, department, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'user@example.com'), '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role),
    coalesce(new.raw_user_meta_data ->> 'department', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (auth_id) do update
  set
    email = excluded.email,
    name = excluded.name,
    role = excluded.role,
    department = excluded.department,
    phone = excluded.phone,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- =========================
-- RLS policies (strict)
-- =========================
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.reviews enable row level security;
alter table public.schedule_events enable row level security;
alter table public.submissions enable row level security;
alter table public.announcements enable row level security;
alter table public.activity_logs enable row level security;

-- USERS
-- Read own profile or all if director.
drop policy if exists users_select_self_or_director on public.users;
create policy users_select_self_or_director
on public.users
for select
using (auth.uid() = auth_id or public.is_director());

-- Insert only own profile row (normally via trigger).
drop policy if exists users_insert_self on public.users;
create policy users_insert_self
on public.users
for insert
with check (auth.uid() = auth_id);

-- Update own profile or director.
drop policy if exists users_update_self_or_director on public.users;
create policy users_update_self_or_director
on public.users
for update
using (auth.uid() = auth_id or public.is_director())
with check (auth.uid() = auth_id or public.is_director());

-- Delete only director.
drop policy if exists users_delete_director on public.users;
create policy users_delete_director
on public.users
for delete
using (public.is_director());

-- PROJECTS
-- All authenticated users can view projects.
drop policy if exists projects_select_authenticated on public.projects;
create policy projects_select_authenticated
on public.projects
for select
using (auth.role() = 'authenticated');

-- Only coordinator/director can create or modify projects.
drop policy if exists projects_insert_coord_or_director on public.projects;
create policy projects_insert_coord_or_director
on public.projects
for insert
with check (public.is_coordinator_or_director());

drop policy if exists projects_update_coord_or_director on public.projects;
create policy projects_update_coord_or_director
on public.projects
for update
using (public.is_coordinator_or_director())
with check (public.is_coordinator_or_director());

drop policy if exists projects_delete_director on public.projects;
create policy projects_delete_director
on public.projects
for delete
using (public.is_director());

-- PROJECT MEMBERS
-- Authenticated read, coordinator/director write.
drop policy if exists project_members_select_authenticated on public.project_members;
create policy project_members_select_authenticated
on public.project_members
for select
using (auth.role() = 'authenticated');

drop policy if exists project_members_write_coord_or_director on public.project_members;
create policy project_members_write_coord_or_director
on public.project_members
for all
using (public.is_coordinator_or_director())
with check (public.is_coordinator_or_director());

-- MILESTONES
-- Authenticated read, coordinator/director write.
drop policy if exists milestones_select_authenticated on public.milestones;
create policy milestones_select_authenticated
on public.milestones
for select
using (auth.role() = 'authenticated');

drop policy if exists milestones_write_coord_or_director on public.milestones;
create policy milestones_write_coord_or_director
on public.milestones
for all
using (public.is_coordinator_or_director())
with check (public.is_coordinator_or_director());

-- TASKS
-- Authenticated read.
drop policy if exists tasks_select_authenticated on public.tasks;
create policy tasks_select_authenticated
on public.tasks
for select
using (auth.role() = 'authenticated');

-- Coordinator/director can create and manage all tasks.
drop policy if exists tasks_write_coord_or_director on public.tasks;
create policy tasks_write_coord_or_director
on public.tasks
for all
using (public.is_coordinator_or_director())
with check (public.is_coordinator_or_director());

-- Students can update only tasks assigned to themselves.
drop policy if exists tasks_student_update_own on public.tasks;
create policy tasks_student_update_own
on public.tasks
for update
using (
  exists (
    select 1 from public.users u
    where u.id = tasks.assignee_id
      and u.auth_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = tasks.assignee_id
      and u.auth_id = auth.uid()
  )
);

-- REVIEWS
-- Authenticated read, coordinator/director write.
drop policy if exists reviews_select_authenticated on public.reviews;
create policy reviews_select_authenticated
on public.reviews
for select
using (auth.role() = 'authenticated');

drop policy if exists reviews_write_coord_or_director on public.reviews;
create policy reviews_write_coord_or_director
on public.reviews
for all
using (public.is_coordinator_or_director())
with check (public.is_coordinator_or_director());

-- SCHEDULE EVENTS
-- Authenticated read, coordinator/director write.
drop policy if exists schedule_events_select_authenticated on public.schedule_events;
create policy schedule_events_select_authenticated
on public.schedule_events
for select
using (auth.role() = 'authenticated');

drop policy if exists schedule_events_write_coord_or_director on public.schedule_events;
create policy schedule_events_write_coord_or_director
on public.schedule_events
for all
using (public.is_coordinator_or_director())
with check (public.is_coordinator_or_director());

-- SUBMISSIONS
-- Authenticated read.
drop policy if exists submissions_select_authenticated on public.submissions;
create policy submissions_select_authenticated
on public.submissions
for select
using (auth.role() = 'authenticated');

-- Students create submissions for themselves.
drop policy if exists submissions_insert_student_self on public.submissions;
create policy submissions_insert_student_self
on public.submissions
for insert
with check (
  exists (
    select 1 from public.users u
    where u.id = submissions.student_id
      and u.auth_id = auth.uid()
  )
);

-- Students update their own drafts/submissions; coordinators/directors can review.
drop policy if exists submissions_update_owner_or_coord on public.submissions;
create policy submissions_update_owner_or_coord
on public.submissions
for update
using (
  public.is_coordinator_or_director()
  or exists (
    select 1 from public.users u
    where u.id = submissions.student_id
      and u.auth_id = auth.uid()
  )
)
with check (
  public.is_coordinator_or_director()
  or exists (
    select 1 from public.users u
    where u.id = submissions.student_id
      and u.auth_id = auth.uid()
  )
);

-- ANNOUNCEMENTS
-- Authenticated read, coordinator/director write.
drop policy if exists announcements_select_authenticated on public.announcements;
create policy announcements_select_authenticated
on public.announcements
for select
using (auth.role() = 'authenticated');

drop policy if exists announcements_write_coord_or_director on public.announcements;
create policy announcements_write_coord_or_director
on public.announcements
for all
using (public.is_coordinator_or_director())
with check (public.is_coordinator_or_director());

-- ACTIVITY LOGS
-- Authenticated read; coordinator/director insert.
drop policy if exists activity_logs_select_authenticated on public.activity_logs;
create policy activity_logs_select_authenticated
on public.activity_logs
for select
using (auth.role() = 'authenticated');

drop policy if exists activity_logs_insert_coord_or_director on public.activity_logs;
create policy activity_logs_insert_coord_or_director
on public.activity_logs
for insert
with check (public.is_coordinator_or_director());
