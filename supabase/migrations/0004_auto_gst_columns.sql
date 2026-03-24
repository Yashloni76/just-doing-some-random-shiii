-- Phase 4: Upgrade inventory items to support automated legal taxonomy
-- These fields are injected autonomously by the Node backend and mapped directly into GST Pdfs.

ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) DEFAULT 18.00,
ADD COLUMN IF NOT EXISTS hsn_code TEXT DEFAULT '9973';
