-- 1. Add slug column to businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 1.5 Drop the Auth FK constraint (for Demo/Development mode)
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_owner_id_fkey;

-- 2. Create an index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

-- 3. Update RLS for public access
-- Allow anyone to view business profiles via slug
CREATE POLICY "Public can view business profiles"
    ON businesses
    FOR SELECT
    USING (true);

-- Allow anyone to view inventory items for public stores
CREATE POLICY "Public can view inventory items"
    ON inventory_items
    FOR SELECT
    USING (true);

-- Allow anyone to view booking items (needed for availability checks)
CREATE POLICY "Public can view booking items"
    ON booking_items
    FOR SELECT
    USING (true);

-- Allow anyone to view existing bookings (needed for availability checks)
CREATE POLICY "Public can view bookings for availability"
    ON bookings
    FOR SELECT
    USING (true);

-- Allow anyone to CREATE a booking (Request a Quote)
CREATE POLICY "Public can request bookings"
    ON bookings
    FOR INSERT
    WITH CHECK (true);

-- Allow anyone to CREATE booking items
CREATE POLICY "Public can insert booking items"
    ON booking_items
    FOR INSERT
    WITH CHECK (true);

-- 4. Set a default slug for our dummy business for testing
UPDATE businesses 
SET slug = 'demo-store' 
WHERE id = '00000000-0000-0000-0000-000000000001' 
AND slug IS NULL;
