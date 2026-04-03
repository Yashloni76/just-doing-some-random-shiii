-- Fix 1: Seed the dummy business
-- This ensures 'Sharma Tent House' exists for the demo

INSERT INTO businesses (
  id, 
  owner_id, 
  business_name, 
  owner_name,
  city, 
  slug, 
  whatsapp_number, 
  business_address, 
  gstin
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Sharma Tent House',
  'Rajesh Sharma',
  'Pune',
  'sharma-tent-house',
  '9876543210',
  '123 MG Road, Pune, Maharashtra 411001',
  '27AAAAA0000A1Z5'
) ON CONFLICT (id) DO NOTHING;
