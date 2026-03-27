-- Phase 4: Dedicated Manual Payments Ledger

-- 1. Create the dedicated Payments tracking table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'NEFT', 'Card')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Expand Bookings to track aggregate status
-- (Assuming we drop the previous columns if they existed, or just safely alter)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

-- Note: We will dynamically aggregate 'amount_paid' on the fly in the component utilizing the `payments` table, 
-- or we can retain `amount_paid` here. For strict relational tracking, we'll sum dynamically from the payments table to avoid drift!

-- 3. Security (RLS)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted testing operations for the dummy ID tied directly via Booking reference
CREATE POLICY "Unrestricted operations for the dummy testing ID on payments"
    ON payments
    FOR ALL
    USING (
        booking_id IN (
            SELECT id FROM bookings WHERE business_id = '00000000-0000-0000-0000-000000000001'
        )
    );
