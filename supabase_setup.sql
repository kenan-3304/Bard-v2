
-- 0000_init.sql
CREATE TABLE IF NOT EXISTS bars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER,
  peak_nights TEXT[], -- Array of strings
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 0001_auth_profiles.sql
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

-- 0002_transaction_schema.sql
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

-- 0003_proof_activation.sql
-- Add proof columns to offers
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS proof_image_path TEXT,
ADD COLUMN IF NOT EXISTS estimated_attendance INTEGER;

-- Update status check to include 'completed'
ALTER TABLE offers 
DROP CONSTRAINT IF EXISTS offers_status_check;

ALTER TABLE offers 
ADD CONSTRAINT offers_status_check 
CHECK (status IN ('sent', 'accepted', 'rejected', 'countered', 'declined', 'completed'));

-- Create Storage Bucket for Proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage (Simplified for prototype)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'proofs' );

CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'proofs' AND auth.role() = 'authenticated' );

-- 0004_campaign_completion.sql
-- Update campaign status check to include 'completed'
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('active', 'draft', 'completed', 'archived'));

-- 0005_fix_rls_policies.sql
-- Enable RLS on all tables if not already enabled
ALTER TABLE bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- 1. Policies for Bars
-- Public can view basic bar info (needed for Brands to search)
DROP POLICY IF EXISTS "Public can view bars" ON bars;
CREATE POLICY "Public can view bars" ON bars FOR SELECT USING (true);

-- Only owner can update their bar
DROP POLICY IF EXISTS "Owners can update their bars" ON bars;
CREATE POLICY "Owners can update their bars" ON bars FOR UPDATE USING (auth.uid() = owner_id);

-- Only authenticated users can insert (handled by onboarding logic usually)
DROP POLICY IF EXISTS "Authenticated can insert bars" ON bars;
CREATE POLICY "Authenticated can insert bars" ON bars FOR INSERT WITH CHECK (auth.uid() = owner_id);


-- 2. Policies for Brands
-- Public can view basic brand info (needed for Bars to see who sent offers)
DROP POLICY IF EXISTS "Public can view brands" ON brands;
CREATE POLICY "Public can view brands" ON brands FOR SELECT USING (true);

-- Only owner can update their brand
DROP POLICY IF EXISTS "Owners can update their brands" ON brands;
CREATE POLICY "Owners can update their brands" ON brands FOR UPDATE USING (auth.uid() = owner_id);

-- Only authenticated users can insert
DROP POLICY IF EXISTS "Authenticated can insert brands" ON brands;
CREATE POLICY "Authenticated can insert brands" ON brands FOR INSERT WITH CHECK (auth.uid() = owner_id);


-- 3. Policies for Campaigns
-- Replaces "Enable read access for authenticated users"
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON campaigns;
DROP POLICY IF EXISTS "Brand Owners can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Bars can view campaigns they have offers for" ON campaigns;

-- Brand Owner can view their own campaigns
CREATE POLICY "Brand Owners can view their campaigns" ON campaigns 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM brands WHERE brands.id = campaigns.brand_id AND brands.owner_id = auth.uid())
);

-- Bars can view campaigns they have an offer for
CREATE POLICY "Bars can view campaigns they have access to" ON campaigns 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM offers 
    JOIN bars ON offers.bar_id = bars.id 
    WHERE offers.campaign_id = campaigns.id 
    AND bars.owner_id = auth.uid()
  )
);

-- Only Brand Owner can insert/update campaigns
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON campaigns;
CREATE POLICY "Brand Owners can insert campaigns" ON campaigns 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM brands WHERE brands.id = brand_id AND brands.owner_id = auth.uid())
);

CREATE POLICY "Brand Owners can update campaigns" ON campaigns 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM brands WHERE brands.id = brand_id AND brands.owner_id = auth.uid())
);


-- 4. Policies for Offers
-- Replaces "Enable read access for authenticated users"
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON offers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON offers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON offers;

-- Visibility: Brand Owner OR Bar Owner
CREATE POLICY "Users can view relevant offers" ON offers 
FOR SELECT USING (
  -- User owns the Bar
  EXISTS (SELECT 1 FROM bars WHERE bars.id = offers.bar_id AND bars.owner_id = auth.uid())
  OR
  -- User owns the Brand (via Campaign)
  EXISTS (
    SELECT 1 FROM campaigns 
    JOIN brands ON campaigns.brand_id = brands.id 
    WHERE campaigns.id = offers.campaign_id 
    AND brands.owner_id = auth.uid()
  )
);

-- Insert: Only Brand Owner (creating offers for a campaign)
CREATE POLICY "Brand Owners can insert offers" ON offers 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns 
    JOIN brands ON campaigns.brand_id = brands.id 
    WHERE campaigns.id = offers.campaign_id 
    AND brands.owner_id = auth.uid()
  )
);

-- Update: Brand Owner OR Bar Owner (accepting/rejecting vs changing terms?)
-- For now, allow both to update, but typically we might restrict *what* they can update via triggers or more complex policies.
-- Simpler: "Parties involved can update"
CREATE POLICY "Parties can update offers" ON offers 
FOR UPDATE USING (
  -- User owns the Bar
  EXISTS (SELECT 1 FROM bars WHERE bars.id = offers.bar_id AND bars.owner_id = auth.uid())
  OR
  -- User owns the Brand
  EXISTS (
    SELECT 1 FROM campaigns 
    JOIN brands ON campaigns.brand_id = brands.id 
    WHERE campaigns.id = offers.campaign_id 
    AND brands.owner_id = auth.uid()
  )
);

-- 0006_fix_rls_recursion.sql
-- Fix for Infinite Recursion in RLS
-- The issue was circular dependency:
-- campaigns policy -> checks offers -> triggers offers policy -> checks campaigns -> triggers campaigns policy ...

-- Solution: Use SECURITY DEFINER functions to bypass RLS when checking permissions.

-- 1. Helper function to check if a user (Bar Owner) has an offer for a specific campaign
-- SECURITY DEFINER means it runs with the privileges of the creator (postgres/admin), implementation details hidden from RLS.
CREATE OR REPLACE FUNCTION public.fn_bar_has_offer_for_campaign(p_campaign_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM offers o
    JOIN bars b ON o.bar_id = b.id
    WHERE o.campaign_id = p_campaign_id
    AND b.owner_id = p_user_id
  );
END;
$$;

-- 2. Helper function to check if a user (Brand Owner) owns the campaign for an offer
-- Used in Offers table policy
CREATE OR REPLACE FUNCTION public.fn_brand_owns_campaign_offer(p_campaign_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM campaigns c
    JOIN brands b ON c.brand_id = b.id
    WHERE c.id = p_campaign_id
    AND b.owner_id = p_user_id
  );
END;
$$;


-- 3. Update CAMPAIGNS Policies
DROP POLICY IF EXISTS "Bars can view campaigns they have access to" ON campaigns;

CREATE POLICY "Bars can view campaigns they have access to" ON campaigns 
FOR SELECT USING (
  -- Use the trusted function to break the loop
  fn_bar_has_offer_for_campaign(id, auth.uid())
);


-- 4. Update OFFERS Policies
DROP POLICY IF EXISTS "Users can view relevant offers" ON offers;

CREATE POLICY "Users can view relevant offers" ON offers 
FOR SELECT USING (
  -- User owns the Bar (Direct check on bars table is fine as bars table RLS does not depend on offers)
  EXISTS (SELECT 1 FROM bars WHERE bars.id = offers.bar_id AND bars.owner_id = auth.uid())
  OR
  -- User owns the Brand (Use trusted function to avoid triggering Campaign RLS loops if any)
  fn_brand_owns_campaign_offer(offers.campaign_id, auth.uid())
);

-- Update Insert/Update policies to be safe as well
DROP POLICY IF EXISTS "Brand Owners can insert offers" ON offers;
CREATE POLICY "Brand Owners can insert offers" ON offers 
FOR INSERT WITH CHECK (
  fn_brand_owns_campaign_offer(campaign_id, auth.uid())
);

DROP POLICY IF EXISTS "Parties can update offers" ON offers;
CREATE POLICY "Parties can update offers" ON offers 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM bars WHERE bars.id = offers.bar_id AND bars.owner_id = auth.uid())
  OR
  fn_brand_owns_campaign_offer(offers.campaign_id, auth.uid())
);

-- 0007_add_counter_price.sql
ALTER TABLE offers
ADD COLUMN IF NOT EXISTS counter_price INTEGER;

-- Ensure counter_price is null by default
ALTER TABLE offers
ALTER COLUMN counter_price DROP DEFAULT;

-- 0008_add_deliverables.sql
-- Add deliverables column to campaigns table
alter table campaigns 
add column if not exists deliverables jsonb default '[]'::jsonb;

-- Add comment describing the structure
comment on column campaigns.deliverables is 'Array of strings describing required deliverables for the campaign';

-- 0009_fix_offer_policy.sql
-- Ensure the function exists (re-declaring to be safe)
CREATE OR REPLACE FUNCTION public.fn_brand_owns_campaign_offer(p_campaign_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM campaigns c
    JOIN brands b ON c.brand_id = b.id
    WHERE c.id = p_campaign_id
    AND b.owner_id = p_user_id
  );
END;
$$;

-- Drop existing policy to reset
DROP POLICY IF EXISTS "Parties can update offers" ON offers;

-- recreate with Explicit WITH CHECK
CREATE POLICY "Parties can update offers" ON offers 
FOR UPDATE USING (
  -- User owns the Bar
  EXISTS (SELECT 1 FROM bars WHERE bars.id = offers.bar_id AND bars.owner_id = auth.uid())
  OR
  -- User owns the Brand
  public.fn_brand_owns_campaign_offer(offers.campaign_id, auth.uid())
)
WITH CHECK (
  -- User owns the Bar
  EXISTS (SELECT 1 FROM bars WHERE bars.id = offers.bar_id AND bars.owner_id = auth.uid())
  OR
  -- User owns the Brand
  public.fn_brand_owns_campaign_offer(offers.campaign_id, auth.uid())
);

-- 0010_add_bar_image.sql
-- Add image_url to bars table
ALTER TABLE bars ADD COLUMN IF NOT EXISTS image_url TEXT;

-- (Optional) We could add storage bucket policies here if we were setting up storage,
-- but for now we are just storing the URL text.
