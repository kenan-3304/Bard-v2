-- Migration 0012: Activation & Compliance Schema
-- Creates venues table, adds activation fields to campaigns, creates compliance tables

-- 1. Create venues table (bars/venues are physical locations, NOT a user role)
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  city TEXT,
  state TEXT DEFAULT 'Virginia',
  capacity INTEGER,
  peak_nights TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert venues" ON venues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Copy existing venue data from agencies table (which was renamed from bars in 0011)
-- Only copy rows that look like venue data (have capacity/peak_nights set)
INSERT INTO venues (id, name, location, capacity, peak_nights, image_url, created_at)
SELECT id, name, location, capacity, peak_nights, image_url, created_at
FROM agencies
WHERE capacity IS NOT NULL OR peak_nights IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 2. Add activation/compliance columns to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS activation_type TEXT CHECK (activation_type IN ('tasting', 'sponsored_event', 'ambassador_visit', 'brand_promotion')) DEFAULT 'tasting';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Virginia';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS proposed_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS compliance_status TEXT CHECK (compliance_status IN ('pending', 'compliant', 'conditional', 'blocked')) DEFAULT 'pending';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS compliance_reasoning JSONB;

-- 3. Create compliance_packets table
CREATE TABLE IF NOT EXISTS compliance_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  ambassador_id UUID REFERENCES ambassadors(id),
  checklist_responses JSONB DEFAULT '[]'::jsonb,
  evidence_photos JSONB DEFAULT '[]'::jsonb,
  receipt_total NUMERIC DEFAULT 0,
  receipt_photo_path TEXT,
  estimated_attendance INTEGER,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE compliance_packets ENABLE ROW LEVEL SECURITY;

-- Brand owners can view compliance packets for their activations
CREATE POLICY "Brand owners can view compliance packets" ON compliance_packets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN brands b ON c.brand_id = b.id
    WHERE c.id = compliance_packets.activation_id
    AND b.owner_id = auth.uid()
  )
);

-- Brand owners can insert compliance packets
CREATE POLICY "Brand owners can insert compliance packets" ON compliance_packets
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN brands b ON c.brand_id = b.id
    WHERE c.id = activation_id
    AND b.owner_id = auth.uid()
  )
);

-- Brand owners can update compliance packets
CREATE POLICY "Brand owners can update compliance packets" ON compliance_packets
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN brands b ON c.brand_id = b.id
    WHERE c.id = compliance_packets.activation_id
    AND b.owner_id = auth.uid()
  )
);

-- Agency owners can view/update compliance packets for their assigned activations
CREATE POLICY "Agency owners can view assigned compliance packets" ON compliance_packets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM offers o
    JOIN agencies a ON o.bar_id = a.id
    WHERE o.campaign_id = compliance_packets.activation_id
    AND a.owner_id = auth.uid()
  )
);

CREATE POLICY "Agency owners can update assigned compliance packets" ON compliance_packets
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM offers o
    JOIN agencies a ON o.bar_id = a.id
    WHERE o.campaign_id = compliance_packets.activation_id
    AND a.owner_id = auth.uid()
  )
);

-- 4. Create compliance_checklist_templates table
CREATE TABLE IF NOT EXISTS compliance_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL DEFAULT 'Virginia',
  activation_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE compliance_checklist_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view checklist templates" ON compliance_checklist_templates FOR SELECT USING (true);

-- 5. Insert default Virginia checklist templates
INSERT INTO compliance_checklist_templates (state, activation_type, items) VALUES
('Virginia', 'tasting', '[
  {"id": "permit", "label": "Ambassador has valid Solicitor Tasting Permit ($350/year)", "required": true, "category": "permits"},
  {"id": "bar_staff_pour", "label": "Bar staff will pour all samples (ambassador cannot serve)", "required": true, "category": "operations"},
  {"id": "sample_limits", "label": "Sample limits posted: 0.5oz spirits, 1.5oz total spirits/person, 6oz wine, 16oz beer", "required": true, "category": "operations"},
  {"id": "purchase_cap", "label": "Product purchases will not exceed $100/day per location at retail price", "required": true, "category": "financial"},
  {"id": "no_minor_samples", "label": "No samples to minors or visibly intoxicated persons", "required": true, "category": "operations"},
  {"id": "pos_materials", "label": "Branded POS materials under $40 wholesale value each", "required": false, "category": "materials"},
  {"id": "consumer_swag", "label": "Consumer swag only (not compensation to venue)", "required": false, "category": "materials"},
  {"id": "record_keeping", "label": "Tasting records will be maintained for 2 years", "required": true, "category": "compliance"}
]'::jsonb),
('Virginia', 'sponsored_event', '[
  {"id": "abc_approval", "label": "Prior ABC approval obtained via sponsorship request form", "required": true, "category": "permits"},
  {"id": "event_type", "label": "Event is charity, cultural, or sports event (required for sponsorship)", "required": true, "category": "compliance"},
  {"id": "permit", "label": "Ambassador has valid Solicitor Tasting Permit", "required": true, "category": "permits"},
  {"id": "bar_staff_pour", "label": "Bar/venue staff will pour all samples", "required": true, "category": "operations"},
  {"id": "sample_limits", "label": "Sample limits enforced per VA ABC regulations", "required": true, "category": "operations"},
  {"id": "purchase_cap", "label": "Product purchases will not exceed $100/day per location", "required": true, "category": "financial"},
  {"id": "record_keeping", "label": "All records will be maintained for 2 years", "required": true, "category": "compliance"}
]'::jsonb),
('Virginia', 'ambassador_visit', '[
  {"id": "permit", "label": "Ambassador has valid Solicitor Tasting Permit", "required": true, "category": "permits"},
  {"id": "bar_staff_pour", "label": "Bar staff will pour all samples", "required": true, "category": "operations"},
  {"id": "sample_limits", "label": "Sample limits enforced", "required": true, "category": "operations"},
  {"id": "purchase_cap", "label": "Product purchases under $100/day at retail", "required": true, "category": "financial"},
  {"id": "no_compensation", "label": "No direct compensation to venue (tied-house rules)", "required": true, "category": "compliance"},
  {"id": "record_keeping", "label": "Records maintained for 2 years", "required": true, "category": "compliance"}
]'::jsonb),
('Virginia', 'brand_promotion', '[
  {"id": "no_payment_to_venue", "label": "No payments to venue for hosting (tied-house prohibition)", "required": true, "category": "compliance"},
  {"id": "pos_materials", "label": "POS materials under $40 wholesale value each", "required": true, "category": "materials"},
  {"id": "consumer_swag", "label": "Swag is for consumers only, not venue compensation", "required": false, "category": "materials"},
  {"id": "advertising_rules", "label": "All advertising complies with VA ABC advertising restrictions", "required": true, "category": "compliance"},
  {"id": "record_keeping", "label": "Records maintained for 2 years", "required": true, "category": "compliance"}
]'::jsonb);

-- 6. Update offers table: add venue_id reference for when offers are linked to specific venues
ALTER TABLE offers ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id);
