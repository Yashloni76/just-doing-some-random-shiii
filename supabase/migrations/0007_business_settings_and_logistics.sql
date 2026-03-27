-- Phase 8: Business Settings & Branding
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS terms_conditions TEXT;

-- Phase 9: Advanced Logistics
-- 1. Security Deposits
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS security_deposit_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_deposit_status TEXT DEFAULT 'unpaid';

-- 2. Partial Returns
ALTER TABLE booking_items 
ADD COLUMN IF NOT EXISTS returned_quantity INTEGER DEFAULT 0;

-- 3. Damage Tracking
CREATE TABLE IF NOT EXISTS damages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    repair_cost NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, repaired, charged
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for damages
ALTER TABLE damages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage damages for their business" ON damages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN inventory_items i ON b.business_id = i.business_id
            WHERE b.id = damages.booking_id
        )
    );
