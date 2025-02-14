-- Create projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  issues jsonb not null default '[]'::jsonb,
  document_text text not null,
  repository jsonb,
  model text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  constraint projects_name_length check (char_length(name) >= 1 and char_length(name) <= 100)
);

-- Create indexes
create index projects_user_id_idx on public.projects(user_id);
create index projects_updated_at_idx on public.projects(updated_at desc);

-- Set up RLS
alter table public.projects enable row level security;

create policy "Users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create trigger to update updated_at timestamp
create trigger projects_handle_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at(); 