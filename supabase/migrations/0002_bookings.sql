CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'quote' CHECK (status IN ('quote', 'confirmed', 'delivered', 'cancelled')),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
    quantity_booked INTEGER NOT NULL
);

-- RLS Configurations
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;

-- Allow operations utilizing the dummy ID bypass
CREATE POLICY "Unrestricted operations for the dummy testing ID on bookings"
    ON bookings
    FOR ALL
    USING (business_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Unrestricted operations for the dummy testing ID on booking items via join"
    ON booking_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_items.booking_id
            AND bookings.business_id = '00000000-0000-0000-0000-000000000001'
        )
    );
