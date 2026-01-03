-- Sample products for tobacco e-commerce (assuming products table exists in FinOpenPOS)
-- This script adds sample tobacco products to integrate with the existing inventory system

INSERT INTO products (name, description, price, stock_quantity, category, brand, image_url, is_active) VALUES
-- Cigarettes
('Marlboro Red', 'Rokok Marlboro Red kemasan 20 batang', 25000, 50, 'cigarettes', 'Marlboro', '/images/marlboro-red.jpg', true),
('Gudang Garam Surya', 'Rokok Gudang Garam Surya kemasan 16 batang', 22000, 30, 'cigarettes', 'Gudang Garam', '/images/gg-surya.jpg', true),
('Sampoerna Mild', 'Rokok Sampoerna Mild kemasan 16 batang', 24000, 40, 'cigarettes', 'Sampoerna', '/images/sampoerna-mild.jpg', true),
('Djarum Super', 'Rokok Djarum Super kemasan 16 batang', 23000, 35, 'cigarettes', 'Djarum', '/images/djarum-super.jpg', true),
('Lucky Strike', 'Rokok Lucky Strike kemasan 20 batang', 26000, 25, 'cigarettes', 'Lucky Strike', '/images/lucky-strike.jpg', true),

-- Tobacco
('Tembakau Shag Golden Virginia', 'Tembakau linting Golden Virginia 50g', 45000, 15, 'tobacco', 'Golden Virginia', '/images/golden-virginia.jpg', true),
('Tembakau Drum Original', 'Tembakau linting Drum Original 50g', 42000, 20, 'tobacco', 'Drum', '/images/drum-original.jpg', true),
('Tembakau Bali Shag', 'Tembakau linting Bali Shag 40g', 38000, 18, 'tobacco', 'Bali Shag', '/images/bali-shag.jpg', true),

-- Accessories
('Filter Rokok OCB', 'Filter rokok OCB isi 120 pcs', 8000, 100, 'accessories', 'OCB', '/images/ocb-filter.jpg', true),
('Kertas Linting Rizla Blue', 'Kertas linting Rizla Blue', 5000, 80, 'accessories', 'Rizla', '/images/rizla-blue.jpg', true),
('Kertas Linting OCB Premium', 'Kertas linting OCB Premium', 6000, 75, 'accessories', 'OCB', '/images/ocb-premium.jpg', true),
('Lighter Zippo Classic', 'Korek api Zippo Classic Chrome', 350000, 10, 'accessories', 'Zippo', '/images/zippo-classic.jpg', true),
('Rolling Machine OCB', 'Mesin linting rokok OCB', 25000, 30, 'accessories', 'OCB', '/images/ocb-rolling.jpg', true)

ON CONFLICT (name) DO NOTHING;

-- Update product categories if needed
UPDATE products SET category = 'cigarettes' WHERE category IN ('rokok', 'cigarette');
UPDATE products SET category = 'tobacco' WHERE category IN ('tembakau', 'shag');
UPDATE products SET category = 'accessories' WHERE category IN ('aksesoris', 'accessory');
