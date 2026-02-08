-- Rename bars table to agencies
ALTER TABLE IF EXISTS bars RENAME TO agencies;

-- Update RLS policies for agencies (formerly bars)
DROP POLICY IF EXISTS "Public can view bars" ON agencies;
DROP POLICY IF EXISTS "Owners can update their bars" ON agencies;
DROP POLICY IF EXISTS "Authenticated can insert bars" ON agencies;

-- Re-create policies with new terminology
CREATE POLICY "Public can view agencies" ON agencies FOR SELECT USING (true);
CREATE POLICY "Owners can update their agency" ON agencies FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated can insert agency" ON agencies FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Update profiles role check
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('brand', 'agency', 'bar')); -- Keeping 'bar' for backward compatibility if needed, but primary is 'agency'

-- Create Ambassadors Table
CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Ambassadors
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;

-- Agency Owners can manage their ambassadors
CREATE POLICY "Agencies can view their ambassadors" ON ambassadors
  FOR SELECT USING (EXISTS (SELECT 1 FROM agencies WHERE agencies.id = ambassadors.agency_id AND agencies.owner_id = auth.uid()));

CREATE POLICY "Agencies can insert ambassadors" ON ambassadors
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM agencies WHERE agencies.id = agency_id AND agencies.owner_id = auth.uid()));

CREATE POLICY "Agencies can update their ambassadors" ON ambassadors
  FOR UPDATE USING (EXISTS (SELECT 1 FROM agencies WHERE agencies.id = ambassadors.agency_id AND agencies.owner_id = auth.uid()));

CREATE POLICY "Agencies can delete their ambassadors" ON ambassadors
  FOR DELETE USING (EXISTS (SELECT 1 FROM agencies WHERE agencies.id = ambassadors.agency_id AND agencies.owner_id = auth.uid()));

-- Create Permits Table
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  permit_number TEXT NOT NULL,
  expiration_date DATE NOT NULL,
  state TEXT DEFAULT 'VA', -- Context implies Virginia primarily
  status TEXT CHECK (status IN ('valid', 'expired', 'revoked')) DEFAULT 'valid',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Permits
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;

-- Agency Owners can view/manage permits through ambassadors
CREATE POLICY "Agencies can view permits" ON permits
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM ambassadors 
    JOIN agencies ON ambassadors.agency_id = agencies.id 
    WHERE ambassadors.id = permits.ambassador_id AND agencies.owner_id = auth.uid()
  ));

CREATE POLICY "Agencies can insert permits" ON permits
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM ambassadors 
    JOIN agencies ON ambassadors.agency_id = agencies.id 
    WHERE ambassadors.id = ambassador_id AND agencies.owner_id = auth.uid()
  ));

CREATE POLICY "Agencies can update permits" ON permits
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM ambassadors 
    JOIN agencies ON ambassadors.agency_id = agencies.id 
    WHERE ambassadors.id = permits.ambassador_id AND agencies.owner_id = auth.uid()
  ));

-- Update Offers/Activations
-- We are keeping the 'offers' table but conceptually it's now an 'activation' or 'booking'.
-- Ideally we'd rename 'offers' to 'activations' but that might break too much frontend code right now.
-- For now, let's add a column to link an ambassador to an offer (activation).

ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS ambassador_id UUID REFERENCES ambassadors(id);

-- Update RLS for Offers to include Agency checks (formerly Bar checks)
-- The existing policies check `bars.owner_id`. Since we renamed `bars` to `agencies`, the underlying implementation of RLS 
-- *should* track the OID, but usually text-based policies might break if they referenced the name "bars".
-- Postgres usually handles the table rename in policies automatically, but let's be safe and verify/re-apply if needed.
-- Actually, we dropped the old bar policies above on the `agencies` table. 
-- But `offers` policies check `bars`. Let's update `offers` policies to be clear.

DROP POLICY IF EXISTS "Users can view relevant offers" ON offers;
DROP POLICY IF EXISTS "Parties can update offers" ON offers;

CREATE POLICY "Users can view relevant offers" ON offers 
FOR SELECT USING (
  -- User owns the Agency (formerly Bar)
  EXISTS (SELECT 1 FROM agencies WHERE agencies.id = offers.bar_id AND agencies.owner_id = auth.uid())
  OR
  -- User owns the Brand (via Campaign)
  EXISTS (
    SELECT 1 FROM campaigns 
    JOIN brands ON campaigns.brand_id = brands.id 
    WHERE campaigns.id = offers.campaign_id 
    AND brands.owner_id = auth.uid()
  )
);

CREATE POLICY "Parties can update offers" ON offers 
FOR UPDATE USING (
  -- User owns the Agency
  EXISTS (SELECT 1 FROM agencies WHERE agencies.id = offers.bar_id AND agencies.owner_id = auth.uid())
  OR
  -- User owns the Brand
  public.fn_brand_owns_campaign_offer(offers.campaign_id, auth.uid())
);

-- Update function `fn_bar_has_offer_for_campaign` to reference `agencies`
CREATE OR REPLACE FUNCTION public.fn_bar_has_offer_for_campaign(p_campaign_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM offers o
    JOIN agencies a ON o.bar_id = a.id -- changed from bars to agencies
    WHERE o.campaign_id = p_campaign_id
    AND a.owner_id = p_user_id
  );
END;
$$;
