-- Add tobacco products to existing products table
-- Make sure your products table has these columns: name, description, price, stock_quantity, category, brand, image_url, is_active

INSERT INTO products (name, description, price, stock_quantity, category, brand, image_url, is_active) VALUES
-- Cigarettes
('Marlboro Red', 'Rokok Marlboro Red kemasan 20 batang', 25000, 50, 'cigarettes', 'Marlboro', '/images/products/marlboro-red.jpg', true),
('Gudang Garam Surya', 'Rokok Gudang Garam Surya kemasan 16 batang', 22000, 30, 'cigarettes', 'Gudang Garam', '/images/products/gg-surya.jpg', true),
('Sampoerna Mild', 'Rokok Sampoerna Mild kemasan 16 batang', 24000, 40, 'cigarettes', 'Sampoerna', '/images/products/sampoerna-mild.jpg', true),
('Djarum Super', 'Rokok Djarum Super kemasan 16 batang', 23000, 35, 'cigarettes', 'Djarum', '/images/products/djarum-super.jpg', true),
('Lucky Strike', 'Rokok Lucky Strike kemasan 20 batang', 26000, 25, 'cigarettes', 'Lucky Strike', '/images/products/lucky-strike.jpg', true),
('LA Bold', 'Rokok LA Bold kemasan 16 batang', 21000, 45, 'cigarettes', 'LA', '/images/products/la-bold.jpg', true),

-- Tobacco
('Tembakau Shag Golden Virginia', 'Tembakau linting Golden Virginia 50g', 45000, 15, 'tobacco', 'Golden Virginia', '/images/products/golden-virginia.jpg', true),
('Tembakau Drum Original', 'Tembakau linting Drum Original 50g', 42000, 20, 'tobacco', 'Drum', '/images/products/drum-original.jpg', true),
('Tembakau Bali Shag', 'Tembakau linting Bali Shag 40g', 38000, 18, 'tobacco', 'Bali Shag', '/images/products/bali-shag.jpg', true),
('Tembakau Amphora', 'Tembakau pipa Amphora Full Aroma 50g', 55000, 12, 'tobacco', 'Amphora', '/images/products/amphora.jpg', true),

-- Accessories
('Filter Rokok OCB', 'Filter rokok OCB isi 120 pcs', 8000, 100, 'accessories', 'OCB', '/images/products/ocb-filter.jpg', true),
('Kertas Linting Rizla Blue', 'Kertas linting Rizla Blue', 5000, 80, 'accessories', 'Rizla', '/images/products/rizla-blue.jpg', true),
('Kertas Linting OCB Premium', 'Kertas linting OCB Premium', 6000, 75, 'accessories', 'OCB', '/images/products/ocb-premium.jpg', true),
('Lighter Zippo Classic', 'Korek api Zippo Classic Chrome', 350000, 10, 'accessories', 'Zippo', '/images/products/zippo-classic.jpg', true),
('Rolling Machine OCB', 'Mesin linting rokok OCB', 25000, 30, 'accessories', 'OCB', '/images/products/ocb-rolling.jpg', true),
('Asbak Keramik', 'Asbak keramik ukuran sedang', 15000, 25, 'accessories', 'Generic', '/images/products/asbak-keramik.jpg', true)

ON CONFLICT (name) DO NOTHING;
