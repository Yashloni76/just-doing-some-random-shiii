-- Temporary RLS Bypass for the Auth-Disabled Phase
-- This allows our frontend strictly using the dummy business ID to insert/update inventory items 
-- without needing a valid authenticated session token.

CREATE POLICY "Allow all inventory operations for dummy business" ON inventory_items
FOR ALL USING (business_id = '00000000-0000-0000-0000-000000000001');
