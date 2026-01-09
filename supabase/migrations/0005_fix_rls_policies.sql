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
