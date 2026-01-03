# TABEL DATABASE SISTEM E-COMMERCE TEMBAKAU

## 1. TABEL USERS (Pengguna Terdaftar)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | email | VARCHAR | 255 | NO | - | Email unik untuk login |
| 3 | password_hash | VARCHAR | 255 | NO | - | Password terenkripsi |
| 4 | name | VARCHAR | 255 | NO | - | Nama lengkap pengguna |
| 5 | phone | VARCHAR | 20 | YES | NULL | Nomor telepon |
| 6 | address | TEXT | - | YES | NULL | Alamat lengkap |
| 7 | avatar_url | VARCHAR | 500 | YES | NULL | URL foto profil |
| 8 | email_verified | BOOLEAN | - | NO | false | Status verifikasi email |
| 9 | status | VARCHAR | 20 | NO | 'active' | Status akun (active/inactive/suspended) |
| 10 | last_login | TIMESTAMP | - | YES | NULL | Waktu login terakhir |
| 11 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |
| 12 | updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu diupdate |

**Constraints:**
- PRIMARY KEY: id
- UNIQUE: email
- CHECK: status IN ('active', 'inactive', 'suspended')

---

## 2. TABEL USER_SESSIONS (Sesi Pengguna)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | user_id | INTEGER | - | NO | - | Foreign Key ke users.id |
| 3 | session_token | VARCHAR | 255 | NO | - | Token JWT unik |
| 4 | expires_at | TIMESTAMP | - | NO | - | Waktu kadaluarsa token |
| 5 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |

**Constraints:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id REFERENCES users(id) ON DELETE CASCADE
- UNIQUE: session_token

---

## 3. TABEL USER_PREFERENCES (Preferensi Pengguna)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | user_id | INTEGER | - | NO | - | Foreign Key ke users.id |
| 3 | notifications_enabled | BOOLEAN | - | NO | true | Aktifkan notifikasi |
| 4 | newsletter_subscribed | BOOLEAN | - | NO | false | Langganan newsletter |
| 5 | preferred_language | VARCHAR | 10 | NO | 'id' | Bahasa pilihan |
| 6 | theme | VARCHAR | 20 | NO | 'light' | Tema aplikasi |
| 7 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |
| 8 | updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu diupdate |

**Constraints:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id REFERENCES users(id) ON DELETE CASCADE

---

## 4. TABEL PRODUCT_CATEGORIES (Kategori Produk)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | name | VARCHAR | 100 | NO | - | Nama kategori |
| 3 | slug | VARCHAR | 100 | NO | - | URL-friendly identifier |
| 4 | description | TEXT | - | YES | NULL | Deskripsi kategori |
| 5 | image_url | VARCHAR | 500 | YES | NULL | URL gambar kategori |
| 6 | is_active | BOOLEAN | - | NO | true | Status aktif kategori |
| 7 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |

**Constraints:**
- PRIMARY KEY: id
- UNIQUE: slug

---

## 5. TABEL PRODUCTS (Produk)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | name | VARCHAR | 255 | NO | - | Nama produk |
| 3 | description | TEXT | - | YES | NULL | Deskripsi produk |
| 4 | price | DECIMAL | 12,2 | NO | - | Harga produk (IDR) |
| 5 | in_stock | INTEGER | - | NO | 0 | Jumlah stok tersedia |
| 6 | category_id | INTEGER | - | YES | NULL | Foreign Key ke product_categories.id |
| 7 | category | VARCHAR | 50 | YES | NULL | Kategori (legacy field) |
| 8 | brand | VARCHAR | 100 | YES | NULL | Merek produk |
| 9 | image_url | VARCHAR | 500 | YES | NULL | URL gambar produk |
| 10 | weight | DECIMAL | 8,2 | YES | NULL | Berat produk (gram) |
| 11 | dimensions | VARCHAR | 100 | YES | NULL | Dimensi produk |
| 12 | is_active | BOOLEAN | - | NO | true | Status aktif produk |
| 13 | user_uid | VARCHAR | 255 | NO | 'system' | UID pengguna pembuat |
| 14 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |
| 15 | updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu diupdate |

**Constraints:**
- PRIMARY KEY: id
- FOREIGN KEY: category_id REFERENCES product_categories(id)

---

## 6. TABEL WISHLIST (Daftar Keinginan)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | user_id | INTEGER | - | NO | - | Foreign Key ke users.id |
| 3 | product_id | INTEGER | - | NO | - | Foreign Key ke products.id |
| 4 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |

**Constraints:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY: product_id REFERENCES products(id) ON DELETE CASCADE
- UNIQUE: (user_id, product_id)

---

## 7. TABEL CUSTOMERS (Pelanggan)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | name | VARCHAR | 255 | NO | - | Nama pelanggan |
| 3 | email | VARCHAR | 255 | NO | - | Email pelanggan |
| 4 | phone | VARCHAR | 20 | YES | NULL | Nomor telepon |
| 5 | address | TEXT | - | YES | NULL | Alamat lengkap |
| 6 | user_id | INTEGER | - | YES | NULL | Foreign Key ke users.id (optional) |
| 7 | user_uid | VARCHAR | 255 | NO | 'guest' | UID pengguna |
| 8 | status | VARCHAR | 20 | NO | 'active' | Status pelanggan |
| 9 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |
| 10 | updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu diupdate |

**Constraints:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id REFERENCES users(id)
- CHECK: status IN ('active', 'inactive')

---

## 8. TABEL ORDERS (Pesanan)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | order_number | VARCHAR | 50 | NO | - | Nomor pesanan unik |
| 3 | customer_id | INTEGER | - | YES | NULL | Foreign Key ke customers.id |
| 4 | user_id | INTEGER | - | YES | NULL | Foreign Key ke users.id |
| 5 | total_amount | DECIMAL | 12,2 | NO | - | Total sebelum ongkir/pajak |
| 6 | shipping_cost | DECIMAL | 12,2 | NO | 0 | Biaya pengiriman |
| 7 | tax_amount | DECIMAL | 12,2 | NO | 0 | Jumlah pajak |
| 8 | discount_amount | DECIMAL | 12,2 | NO | 0 | Jumlah diskon |
| 9 | final_amount | DECIMAL | 12,2 | NO | - | Total akhir |
| 10 | payment_method | VARCHAR | 50 | NO | 'cod' | Metode pembayaran |
| 11 | payment_status | VARCHAR | 20 | NO | 'pending' | Status pembayaran |
| 12 | order_status | VARCHAR | 20 | NO | 'pending' | Status pesanan |
| 13 | shipping_address | TEXT | - | YES | NULL | Alamat pengiriman |
| 14 | notes | TEXT | - | YES | NULL | Catatan pesanan |
| 15 | user_uid | VARCHAR | 255 | NO | 'guest' | UID pengguna |
| 16 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |
| 17 | updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu diupdate |

**Constraints:**
- PRIMARY KEY: id
- FOREIGN KEY: customer_id REFERENCES customers(id)
- FOREIGN KEY: user_id REFERENCES users(id)
- UNIQUE: order_number
- CHECK: payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')
- CHECK: order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')

---

## 9. TABEL ORDER_ITEMS (Item Pesanan)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | order_id | INTEGER | - | NO | - | Foreign Key ke orders.id |
| 3 | product_id | INTEGER | - | YES | NULL | Foreign Key ke products.id |
| 4 | product_name | VARCHAR | 255 | NO | - | Nama produk saat order |
| 5 | product_description | TEXT | - | YES | NULL | Deskripsi produk saat order |
| 6 | quantity | INTEGER | - | NO | - | Jumlah item |
| 7 | unit_price | DECIMAL | 12,2 | NO | - | Harga per unit |
| 8 | total_price | DECIMAL | 12,2 | NO | - | Total harga item |
| 9 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |

**Constraints:**
- PRIMARY KEY: id
- FOREIGN KEY: order_id REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY: product_id REFERENCES products(id)
- CHECK: quantity > 0

---

## 10. TABEL PAYMENT_METHODS (Metode Pembayaran)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | name | VARCHAR | 50 | NO | - | Nama metode (unik) |
| 3 | display_name | VARCHAR | 100 | NO | - | Nama tampilan |
| 4 | description | TEXT | - | YES | NULL | Deskripsi metode |
| 5 | is_active | BOOLEAN | - | NO | true | Status aktif |
| 6 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |

**Constraints:**
- PRIMARY KEY: id
- UNIQUE: name

---

## 11. TABEL PAYMENT_TRANSACTIONS (Transaksi Pembayaran)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | order_id | INTEGER | - | YES | NULL | Foreign Key ke orders.id |
| 3 | transaction_id | VARCHAR | 255 | YES | NULL | ID transaksi dari gateway |
| 4 | payment_method_id | INTEGER | - | YES | NULL | Foreign Key ke payment_methods.id |
| 5 | payment_method | VARCHAR | 50 | NO | - | Metode pembayaran |
| 6 | amount | DECIMAL | 12,2 | NO | - | Jumlah pembayaran |
| 7 | status | VARCHAR | 20 | NO | 'pending' | Status transaksi |
| 8 | gateway_response | JSONB | - | YES | NULL | Response dari gateway |
| 9 | midtrans_response | JSONB | - | YES | NULL | Response dari Midtrans |
| 10 | processed_at | TIMESTAMP | - | YES | NULL | Waktu diproses |
| 11 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |
| 12 | updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu diupdate |

**Constraints:**
- PRIMARY KEY: id
- FOREIGN KEY: order_id REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY: payment_method_id REFERENCES payment_methods(id)
- UNIQUE: transaction_id
- CHECK: status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'challenge')

---

## 12. TABEL TRANSACTIONS (Transaksi Legacy)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | description | TEXT | - | YES | NULL | Deskripsi transaksi |
| 3 | order_id | INTEGER | - | YES | NULL | Foreign Key ke orders.id |
| 4 | payment_method_id | INTEGER | - | YES | NULL | Foreign Key ke payment_methods.id |
| 5 | amount | DECIMAL | 12,2 | NO | - | Jumlah transaksi |
| 6 | user_uid | VARCHAR | 255 | NO | 'system' | UID pengguna |
| 7 | type | VARCHAR | 20 | NO | 'income' | Tipe transaksi |
| 8 | category | VARCHAR | 100 | NO | 'sales' | Kategori transaksi |
| 9 | status | VARCHAR | 20 | NO | 'pending' | Status transaksi |
| 10 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |

**Constraints:**
- PRIMARY KEY: id
- FOREIGN KEY: order_id REFERENCES orders(id)
- FOREIGN KEY: payment_method_id REFERENCES payment_methods(id)
- CHECK: type IN ('income', 'expense')
- CHECK: status IN ('pending', 'completed', 'failed')

---

## 13. TABEL WEBHOOK_LOGS (Log Webhook)

| No | Nama Kolom | Tipe Data | Panjang | Null | Default | Keterangan |
|----|------------|-----------|---------|------|---------|------------|
| 1 | id | INTEGER | - | NO | AUTO_INCREMENT | Primary Key |
| 2 | webhook_type | VARCHAR | 50 | NO | - | Jenis webhook |
| 3 | order_id | INTEGER | - | YES | NULL | ID pesanan terkait |
| 4 | transaction_id | VARCHAR | 255 | YES | NULL | ID transaksi |
| 5 | status | VARCHAR | 50 | YES | NULL | Status webhook |
| 6 | payload | JSONB | - | YES | NULL | Data webhook |
| 7 | response_status | INTEGER | - | YES | NULL | HTTP status response |
| 8 | error_message | TEXT | - | YES | NULL | Pesan error jika ada |
| 9 | processed_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu diproses |
| 10 | created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Waktu dibuat |

**Constraints:**
- PRIMARY KEY: id

---

## RINGKASAN TABEL

| No | Nama Tabel | Jumlah Kolom | Fungsi Utama |
|----|------------|--------------|--------------|
| 1 | users | 12 | Manajemen pengguna terdaftar |
| 2 | user_sessions | 5 | Manajemen sesi login |
| 3 | user_preferences | 8 | Preferensi pengguna |
| 4 | product_categories | 7 | Kategori produk |
| 5 | products | 15 | Katalog produk |
| 6 | wishlist | 4 | Daftar keinginan |
| 7 | customers | 10 | Data pelanggan |
| 8 | orders | 17 | Data pesanan |
| 9 | order_items | 9 | Detail item pesanan |
| 10 | payment_methods | 6 | Metode pembayaran |
| 11 | payment_transactions | 12 | Transaksi pembayaran |
| 12 | transactions | 10 | Transaksi legacy |
| 13 | webhook_logs | 10 | Log webhook sistem |

**Total: 13 Tabel dengan 125 Kolom**

---

## INDEKS DATABASE

### Indeks Primary Key
- Semua tabel memiliki PRIMARY KEY pada kolom `id`

### Indeks Unique
- users.email
- user_sessions.session_token
- product_categories.slug
- orders.order_number
- payment_methods.name
- payment_transactions.transaction_id

### Indeks Foreign Key
- user_sessions.user_id
- user_preferences.user_id
- products.category_id
- wishlist.user_id, product_id
- customers.user_id
- orders.customer_id, user_id
- order_items.order_id, product_id
- payment_transactions.order_id, payment_method_id
- transactions.order_id, payment_method_id

### Indeks Performance
- products.category, brand, is_active, in_stock, price
- orders.payment_status, order_status, created_at
- payment_transactions.status, created_at
- webhook_logs.webhook_type, created_at

---

## CONSTRAINT CHECK

### Status Constraints
- users.status: 'active', 'inactive', 'suspended'
- customers.status: 'active', 'inactive'
- orders.payment_status: 'pending', 'paid', 'failed', 'refunded', 'cancelled'
- orders.order_status: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
- payment_transactions.status: 'pending', 'paid', 'failed', 'cancelled', 'refunded', 'challenge'
- transactions.type: 'income', 'expense'
- transactions.status: 'pending', 'completed', 'failed'

### Numeric Constraints
- order_items.quantity > 0
- products.in_stock >= 0
- Semua amount/price >= 0

---

## TRIGGER FUNCTIONS

### Update Timestamp Trigger
Tabel yang memiliki trigger `update_updated_at_column()`:
- users
- user_preferences
- products
- customers
- orders
- payment_transactions

Trigger ini otomatis mengupdate kolom `updated_at` setiap kali record diupdate.
