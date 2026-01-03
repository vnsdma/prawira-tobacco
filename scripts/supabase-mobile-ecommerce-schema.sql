-- Mobile E-commerce tables for FinOpenPOS integration
-- Run this in your Supabase SQL editor

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;

-- Create mobile orders table
CREATE TABLE IF NOT EXISTS mobile_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cod',
    payment_status VARCHAR(20) DEFAULT 'pending',
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mobile order items table
CREATE TABLE IF NOT EXISTS mobile_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES mobile_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL, -- References products table from FinOpenPOS
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES mobile_orders(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    midtrans_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(product_id UUID, quantity_sold INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET stock_quantity = stock_quantity - quantity_sold,
        updated_at = NOW()
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mobile_orders_customer_phone ON mobile_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_mobile_orders_status ON mobile_orders(status);
CREATE INDEX IF NOT EXISTS idx_mobile_orders_created_at ON mobile_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_mobile_order_items_order_id ON mobile_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_mobile_order_items_product_id ON mobile_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);

-- Create RLS policies for mobile orders (allow read for customers with matching phone)
CREATE POLICY "Users can view their own orders" ON mobile_orders
    FOR SELECT USING (true); -- For now, allow all reads. In production, implement proper auth

CREATE POLICY "Users can create orders" ON mobile_orders
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for mobile order items
CREATE POLICY "Users can view order items" ON mobile_order_items
    FOR SELECT USING (true);

CREATE POLICY "Users can create order items" ON mobile_order_items
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for payment transactions
CREATE POLICY "Users can view payment transactions" ON payment_transactions
    FOR SELECT USING (true);

CREATE POLICY "Users can create payment transactions" ON payment_transactions
    FOR INSERT WITH CHECK (true);

-- Enable RLS on new tables
ALTER TABLE mobile_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mobile_orders_updated_at
    BEFORE UPDATE ON mobile_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
