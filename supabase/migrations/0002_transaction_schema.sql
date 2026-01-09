
-- Campaigns Table
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) not null,
  title text not null,
  description text,
  total_budget numeric, -- simplified as number, could be text if flexibility needed
  start_date date,
  end_date date,
  status text check (status in ('draft', 'active', 'completed', 'paused')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Offers Table
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  bar_id uuid references bars(id) not null,
  status text check (status in ('sent', 'accepted', 'rejected', 'countered', 'declined')) default 'sent',
  price numeric not null,
  bar_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Optional/Best Practice)
alter table campaigns enable row level security;
alter table offers enable row level security;

-- Policies (Simplified for prototype: authenticated users can read all for now, logic handled in connection)
create policy "Enable read access for authenticated users" on campaigns for select using (auth.role() = 'authenticated');
create policy "Enable insert for authenticated users" on campaigns for insert with check (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users" on offers for select using (auth.role() = 'authenticated');
create policy "Enable insert for authenticated users" on offers for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users" on offers for update using (auth.role() = 'authenticated');
