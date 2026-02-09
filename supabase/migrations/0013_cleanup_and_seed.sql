-- Migration 0013: Cleanup Duplicates and Seed Data

-- 1. DELETE "Ellie's" from agencies table (it is a Venue, not an Agency)
DELETE FROM agencies WHERE name = 'Ellie''s';

-- 2. SEED mock agencies (for "Executing Agency" dropdown)
-- These are "ghost" agencies for the demo. They don't have owner_ids, so no one can log in as them,
-- but they will appear in the Brand's "Select Agency" dropdown.
INSERT INTO agencies (name, location, capacity, created_at) VALUES 
('Kyndred', 'Richmond, VA', 50, now()),
('Prestige Marketing', 'Virginia Beach, VA', 100, now()),
('Campus Ambassadors', 'Blacksburg, VA', 200, now())
ON CONFLICT DO NOTHING; -- In case they already exist

-- 3. SEED more mock venues (for "Select Venue" dropdown)
-- Adding some diverse options for the demo
INSERT INTO venues (name, location, city, state, capacity, peak_nights) VALUES
('The Cellar', 'Main St', 'Blacksburg', 'Virginia', 150, ARRAY['Friday', 'Saturday']),
('Sharkey''s', 'Main St', 'Blacksburg', 'Virginia', 200, ARRAY['Thursday', 'Friday', 'Saturday']),
('Top of the Stairs', 'College Ave', 'Blacksburg', 'Virginia', 300, ARRAY['Friday', 'Saturday']),
('Southern Railway Taphouse', 'Canal Walk', 'Richmond', 'Virginia', 250, ARRAY['Friday', 'Saturday']),
('Bingo Beer Co', 'Broad St', 'Richmond', 'Virginia', 300, ARRAY['Saturday', 'Sunday'])
ON CONFLICT DO NOTHING;
