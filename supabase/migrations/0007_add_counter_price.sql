ALTER TABLE offers
ADD COLUMN IF NOT EXISTS counter_price INTEGER;

-- Ensure counter_price is null by default
ALTER TABLE offers
ALTER COLUMN counter_price DROP DEFAULT;
