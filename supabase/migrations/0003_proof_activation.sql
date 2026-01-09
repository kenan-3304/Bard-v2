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
