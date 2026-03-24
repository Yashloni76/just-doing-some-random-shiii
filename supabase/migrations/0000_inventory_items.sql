-- Create the inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    price_per_day NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only the logged-in business owner (auth.uid()) to manage their items
CREATE POLICY "Users can manage their own inventory items"
    ON inventory_items
    FOR ALL
    USING (auth.uid() = business_id)
    WITH CHECK (auth.uid() = business_id);
