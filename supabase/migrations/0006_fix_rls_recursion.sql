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
