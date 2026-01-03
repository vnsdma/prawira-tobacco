-- Check if orders table exists and has the correct structure
DO $$
BEGIN
    -- Check if order_number column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_number'
    ) THEN
        -- Add order_number column if it doesn't exist
        ALTER TABLE orders ADD COLUMN order_number VARCHAR(50);
        
        -- Update existing orders with a generated order number
        UPDATE orders 
        SET order_number = 'ORD-' || id || '-' || floor(random() * 1000)::text 
        WHERE order_number IS NULL;
        
        -- Make order_number NOT NULL and UNIQUE
        ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
        ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
    END IF;
    
    -- Check if final_amount column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'final_amount'
    ) THEN
        -- Add final_amount column if it doesn't exist
        ALTER TABLE orders ADD COLUMN final_amount DECIMAL(12, 2);
        
        -- Update existing orders with final_amount = total_amount
        UPDATE orders 
        SET final_amount = total_amount 
        WHERE final_amount IS NULL;
        
        -- Make final_amount NOT NULL
        ALTER TABLE orders ALTER COLUMN final_amount SET NOT NULL;
    END IF;
    
    -- Check if shipping_address column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shipping_address'
    ) THEN
        -- Add shipping_address column if it doesn't exist
        ALTER TABLE orders ADD COLUMN shipping_address TEXT;
    END IF;
    
    -- Check if notes column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'notes'
    ) THEN
        -- Add notes column if it doesn't exist
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Check if order_status column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_status'
    ) THEN
        -- Add order_status column if it doesn't exist
        ALTER TABLE orders ADD COLUMN order_status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    -- Check if payment_status column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        -- Add payment_status column if it doesn't exist
        ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    -- Check if order_items table has the correct structure
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'product_name'
    ) THEN
        -- Add product_name column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN product_name VARCHAR(255);
        
        -- Update existing order_items with product names
        UPDATE order_items oi
        SET product_name = p.name
        FROM products p
        WHERE oi.product_id = p.id AND oi.product_name IS NULL;
        
        -- Make product_name NOT NULL
        ALTER TABLE order_items ALTER COLUMN product_name SET NOT NULL;
    END IF;
END $$;

-- Add any missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Output success message
SELECT 'Orders table structure has been verified and fixed if needed.' as message;
