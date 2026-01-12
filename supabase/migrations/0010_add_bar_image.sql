-- Add image_url to bars table
ALTER TABLE bars ADD COLUMN IF NOT EXISTS image_url TEXT;

-- (Optional) We could add storage bucket policies here if we were setting up storage,
-- but for now we are just storing the URL text.
