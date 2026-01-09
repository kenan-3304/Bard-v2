
-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('brand', 'bar')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Access policies for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Add owner_id to bars
alter table bars 
add column if not exists owner_id uuid references profiles(id);

-- Add owner_id to brands
alter table brands 
add column if not exists owner_id uuid references profiles(id);

-- RLS for bars (optional but recommended)
-- alter table bars enable row level security;
-- create policy "Owners can update their bars" on bars for update using (auth.uid() = owner_id);

-- RLS for brands (optional but recommended)
-- alter table brands enable row level security;
-- create policy "Owners can update their brands" on brands for update using (auth.uid() = owner_id);
