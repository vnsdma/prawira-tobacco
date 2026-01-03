-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR TOBACCO E-COMMERCE
-- =====================================================

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;

-- =====================================================
-- 1. AUTHENTICATION & USER MANAGEMENT TABLES
-- =====================================================

-- Users table for registered users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT false,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    newsletter_subscribed BOOLEAN DEFAULT false,
    preferred_language VARCHAR(10) DEFAULT 'id',
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. PRODUCT MANAGEMENT TABLES
-- =====================================================

-- Product categories
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    in_stock INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES product_categories(id),
    category VARCHAR(50), -- Legacy field for backward compatibility
    brand VARCHAR(100),
    image_url VARCHAR(500),
    weight DECIMAL(8, 2), -- in grams
    dimensions VARCHAR(100), -- e.g., "10x5x2 cm"
    is_active BOOLEAN DEFAULT true,
    user_uid VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist for registered users
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- =====================================================
-- 3. CUSTOMER & ORDER MANAGEMENT TABLES
-- =====================================================

-- Customers table (for both guest and registered users)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    user_id INTEGER REFERENCES users(id), -- NULL for guest customers
    user_uid VARCHAR(255) NOT NULL DEFAULT 'guest',
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    user_id INTEGER REFERENCES users(id), -- NULL for guest orders
    total_amount DECIMAL(12, 2) NOT NULL,
    shipping_cost DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    final_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cod',
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
    order_status VARCHAR(20) CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')) DEFAULT 'pending',
    shipping_address TEXT,
    notes TEXT,
    user_uid VARCHAR(255) NOT NULL DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. PAYMENT MANAGEMENT TABLES
-- =====================================================

-- Payment methods
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE,
    payment_method_id INTEGER REFERENCES payment_methods(id),
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'challenge')) DEFAULT 'pending',
    gateway_response JSONB,
    midtrans_response JSONB,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legacy transactions table for backward compatibility
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    description TEXT,
    order_id INTEGER REFERENCES orders(id),
    payment_method_id INTEGER REFERENCES payment_methods(id),
    amount DECIMAL(12, 2) NOT NULL,
    user_uid VARCHAR(255) NOT NULL DEFAULT 'system',
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) DEFAULT 'income',
    category VARCHAR(100) DEFAULT 'sales',
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. SYSTEM MONITORING TABLES
-- =====================================================

-- Webhook logs for debugging and monitoring
CREATE TABLE webhook_logs (
    id SERIAL PRIMARY KEY,
    webhook_type VARCHAR(50) NOT NULL,
    order_id INTEGER,
    transaction_id VARCHAR(255),
    status VARCHAR(50),
    payload JSONB,
    response_status INTEGER,
    error_message TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User sessions indexes
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Products indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_price ON products(price);

-- Customers indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_status ON customers(status);

-- Orders indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Payment transactions indexes
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Wishlist indexes
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);

-- Webhook logs indexes
CREATE INDEX idx_webhook_logs_order_id ON webhook_logs(order_id);
CREATE INDEX idx_webhook_logs_transaction_id ON webhook_logs(transaction_id);
CREATE INDEX idx_webhook_logs_webhook_type ON webhook_logs(webhook_type);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);

-- =====================================================
-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for simplicity - adjust for production)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_preferences" ON user_preferences FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on payment_transactions" ON payment_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on wishlist" ON wishlist FOR ALL USING (true);
CREATE POLICY "Allow all operations on webhook_logs" ON webhook_logs FOR ALL USING (true);

-- =====================================================
-- 9. INITIAL DATA
-- =====================================================

-- Insert product categories
INSERT INTO product_categories (name, slug, description) VALUES
('Rokok', 'cigarettes', 'Berbagai jenis rokok dan cerutu'),
('Tembakau', 'tobacco', 'Tembakau linting dan shag'),
('Aksesoris', 'accessories', 'Filter, kertas linting, dan aksesoris lainnya')
ON CONFLICT (slug) DO NOTHING;

-- Insert payment methods
INSERT INTO payment_methods (name, display_name, description) VALUES 
('cod', 'Cash on Delivery', 'Bayar saat barang diterima'),
('midtrans', 'Pembayaran Online', 'Transfer Bank, E-Wallet, Kartu Kredit/Debit'),
('bank_transfer', 'Transfer Bank', 'Transfer manual ke rekening toko'),
('ewallet', 'E-Wallet', 'GoPay, OVO, DANA, dll')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, in_stock, category, brand, image_url) VALUES
-- Cigarettes
('Marlboro Red', 'Rokok Marlboro Red kemasan 20 batang', 25000, 50, 'cigarettes', 'Marlboro', '/images/products/marlboro-red.jpg'),
('Gudang Garam Surya', 'Rokok Gudang Garam Surya kemasan 16 batang', 22000, 30, 'cigarettes', 'Gudang Garam', '/images/products/gg-surya.jpg'),
('Sampoerna Mild', 'Rokok Sampoerna Mild kemasan 16 batang', 24000, 40, 'cigarettes', 'Sampoerna', '/images/products/sampoerna-mild.jpg'),
('Djarum Super', 'Rokok Djarum Super kemasan 16 batang', 23000, 35, 'cigarettes', 'Djarum', '/images/products/djarum-super.jpg'),
('Lucky Strike', 'Rokok Lucky Strike kemasan 20 batang', 26000, 25, 'cigarettes', 'Lucky Strike', '/images/products/lucky-strike.jpg'),
('LA Bold', 'Rokok LA Bold kemasan 16 batang', 21000, 45, 'cigarettes', 'LA', '/images/products/la-bold.jpg'),

-- Tobacco
('Tembakau Golden Virginia', 'Tembakau linting Golden Virginia 50g', 45000, 15, 'tobacco', 'Golden Virginia', '/images/products/golden-virginia.jpg'),
('Tembakau Drum Original', 'Tembakau linting Drum Original 50g', 42000, 20, 'tobacco', 'Drum', '/images/products/drum-original.jpg'),
('Tembakau Bali Shag', 'Tembakau linting Bali Shag 40g', 38000, 18, 'tobacco', 'Bali Shag', '/images/products/bali-shag.jpg'),
('Tembakau Amphora', 'Tembakau pipa Amphora Full Aroma 50g', 55000, 12, 'tobacco', 'Amphora', '/images/products/amphora.jpg'),

-- Accessories
('Filter Rokok OCB', 'Filter rokok OCB isi 120 pcs', 8000, 100, 'accessories', 'OCB', '/images/products/ocb-filter.jpg'),
('Kertas Linting Rizla', 'Kertas linting Rizla Blue', 5000, 80, 'accessories', 'Rizla', '/images/products/rizla-blue.jpg'),
('Kertas Linting OCB', 'Kertas linting OCB Premium', 6000, 75, 'accessories', 'OCB', '/images/products/ocb-premium.jpg'),
('Lighter Zippo', 'Korek api Zippo Classic Chrome', 350000, 10, 'accessories', 'Zippo', '/images/products/zippo-classic.jpg'),
('Rolling Machine', 'Mesin linting rokok OCB', 25000, 30, 'accessories', 'OCB', '/images/products/ocb-rolling.jpg'),
('Asbak Keramik', 'Asbak keramik ukuran sedang', 15000, 25, 'accessories', 'Generic', '/images/products/asbak-keramik.jpg')
ON CONFLICT (name) DO NOTHING;
