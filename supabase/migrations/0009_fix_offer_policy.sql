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
