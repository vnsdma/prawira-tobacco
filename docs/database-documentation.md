# Dokumentasi Database Sistem E-Commerce Tembakau

## 1. OVERVIEW SISTEM

Sistem E-Commerce Tembakau adalah aplikasi mobile-first yang memungkinkan user untuk:
- Browse dan membeli produk tembakau
- Login optional (guest checkout tersedia)
- Multiple payment methods (Midtrans, COD)
- Real-time order tracking
- Wishlist dan profile management

## 2. STRUKTUR DATABASE

### 2.1 User Management Tables

#### USERS
**Tujuan**: Menyimpan data user yang terdaftar
**Kolom Utama**:
- `id`: Primary key
- `email`: Unique identifier untuk login
- `password_hash`: Password terenkripsi dengan bcrypt
- `name`: Nama lengkap user
- `phone`, `address`: Data kontak
- `status`: active/inactive/suspended
- `last_login`: Tracking aktivitas user

#### USER_SESSIONS
**Tujuan**: Manajemen session login dengan JWT
**Kolom Utama**:
- `user_id`: Foreign key ke users
- `session_token`: JWT token
- `expires_at`: Waktu kadaluarsa session

#### USER_PREFERENCES
**Tujuan**: Pengaturan personal user
**Kolom Utama**:
- `notifications_enabled`: Setting notifikasi
- `newsletter_subscribed`: Langganan newsletter
- `preferred_language`: Bahasa pilihan
- `theme`: Light/dark mode

### 2.2 Product Management Tables

#### PRODUCT_CATEGORIES
**Tujuan**: Kategori produk (Rokok, Tembakau, Aksesoris)
**Kolom Utama**:
- `name`: Nama kategori
- `slug`: URL-friendly identifier
- `is_active`: Status aktif kategori

#### PRODUCTS
**Tujuan**: Katalog produk tembakau
**Kolom Utama**:
- `name`: Nama produk
- `description`: Deskripsi detail
- `price`: Harga dalam IDR
- `in_stock`: Jumlah stok tersedia
- `category_id`: Link ke kategori
- `brand`: Merek produk
- `weight`, `dimensions`: Spesifikasi fisik

#### WISHLIST
**Tujuan**: Produk favorit user terdaftar
**Kolom Utama**:
- `user_id`: Foreign key ke users
- `product_id`: Foreign key ke products
- Unique constraint pada kombinasi user_id + product_id

### 2.3 Customer & Order Management Tables

#### CUSTOMERS
**Tujuan**: Data customer (guest + registered)
**Fitur Khusus**:
- Support guest checkout (user_id = NULL)
- Link ke users untuk registered customers
- Menyimpan data kontak untuk setiap order

#### ORDERS
**Tujuan**: Data pesanan
**Kolom Utama**:
- `order_number`: Unique identifier untuk customer
- `customer_id`: Link ke customer data
- `user_id`: Optional link ke registered user
- `total_amount`: Total sebelum ongkir/pajak
- `final_amount`: Total akhir setelah semua biaya
- `payment_status`: pending/paid/failed/refunded/cancelled
- `order_status`: pending/confirmed/processing/shipped/delivered/cancelled/returned

#### ORDER_ITEMS
**Tujuan**: Detail item dalam setiap pesanan
**Kolom Utama**:
- `order_id`: Foreign key ke orders
- `product_id`: Foreign key ke products
- `quantity`: Jumlah item
- `unit_price`: Harga per unit saat order
- `total_price`: Total harga item

### 2.4 Payment Management Tables

#### PAYMENT_METHODS
**Tujuan**: Master data metode pembayaran
**Data Default**:
- COD (Cash on Delivery)
- Midtrans (Online Payment)
- Bank Transfer
- E-Wallet

#### PAYMENT_TRANSACTIONS
**Tujuan**: Record transaksi pembayaran
**Kolom Utama**:
- `transaction_id`: Unique ID dari payment gateway
- `payment_method`: Metode yang digunakan
- `status`: pending/paid/failed/cancelled/refunded/challenge
- `gateway_response`: Response dari payment gateway
- `midtrans_response`: Specific response dari Midtrans

#### TRANSACTIONS (Legacy)
**Tujuan**: Backward compatibility dengan sistem lama
**Fungsi**: Record transaksi untuk accounting

### 2.5 System Monitoring Tables

#### WEBHOOK_LOGS
**Tujuan**: Logging webhook dari payment gateway
**Kolom Utama**:
- `webhook_type`: Jenis webhook (midtrans, dll)
- `payload`: Data webhook dalam JSON
- `response_status`: HTTP status response
- `error_message`: Error jika ada

## 3. FLOWCHART SISTEM

### 3.1 Penjelasan Flowchart
Flowchart menggambarkan complete user journey dari membuka aplikasi hingga order selesai:

**Fase 1: Authentication (Optional)**
- User dapat browse tanpa login
- Login memberikan enhanced experience
- Register process dengan validasi

**Fase 2: Product Discovery**
- Browse produk dengan filter kategori
- Search functionality
- Product detail view
- Add to cart/wishlist

**Fase 3: Checkout Process**
- Guest checkout (form manual)
- Registered user checkout (auto-fill)
- Payment method selection

**Fase 4: Payment Processing**
- Midtrans integration dengan Snap.js
- COD processing
- Real-time status updates

**Fase 5: Order Management**
- Order confirmation
- Status tracking
- Stock updates
- Notifications

## 4. DATA FLOW DIAGRAM (DFD)

### 4.1 DFD Level 0
**Konsep**: Sistem sebagai black box
**Entitas Eksternal**:
- User/Customer: End user aplikasi
- Admin: Administrator sistem
- Midtrans: Payment gateway
- Email Service: Notifikasi email
- Bank/E-Wallet: Financial institutions

**Data Flow Utama**:
- Input: Registrasi, login, pesanan, pembayaran
- Output: Produk info, status, konfirmasi, notifikasi

### 4.2 DFD Level 1
**Konsep**: Breakdown sistem menjadi 7 proses utama

**Proses 1.0 - Manajemen Autentikasi & User**
- Input: Data login/register
- Output: Konfirmasi auth, user info
- Data Store: Users, Sessions, Customers

**Proses 2.0 - Manajemen Produk & Katalog**
- Input: Request produk, manage produk (admin)
- Output: Info produk, reports
- Data Store: Products, Categories

**Proses 3.0 - Manajemen Keranjang & Wishlist**
- Input: Add/remove cart, wishlist actions
- Output: Cart status, wishlist updates
- Data Store: Wishlist, Cart (session)

**Proses 4.0 - Manajemen Pesanan & Checkout**
- Input: Data checkout, order management
- Output: Order confirmation, status
- Data Store: Orders, Order Items

**Proses 5.0 - Manajemen Pembayaran & Transaksi**
- Input: Payment requests
- Output: Payment status
- External: Midtrans integration
- Data Store: Transactions, Payment Transactions

**Proses 6.0 - Manajemen Notifikasi & Email**
- Input: Trigger events
- Output: Notifications
- External: Email service

**Proses 7.0 - Manajemen Laporan & Analytics**
- Input: Data requests
- Output: Reports, analytics
- Data Store: All tables for reporting

## 5. ENTITY RELATIONSHIP DIAGRAM (ERD)

### 5.1 Relationship Types

**One-to-Many Relationships:**
- USERS → USER_SESSIONS (1:N)
- USERS → ORDERS (1:N)
- USERS → WISHLIST (1:N)
- PRODUCT_CATEGORIES → PRODUCTS (1:N)
- CUSTOMERS → ORDERS (1:N)
- ORDERS → ORDER_ITEMS (1:N)
- ORDERS → PAYMENT_TRANSACTIONS (1:N)
- PRODUCTS → ORDER_ITEMS (1:N)
- PRODUCTS → WISHLIST (1:N)

**One-to-One Relationships:**
- USERS → USER_PREFERENCES (1:1)
- USERS → CUSTOMERS (1:1, optional)

**Many-to-Many Relationships:**
- USERS ↔ PRODUCTS (via WISHLIST)
- ORDERS ↔ PRODUCTS (via ORDER_ITEMS)

### 5.2 Key Constraints

**Primary Keys:**
- Semua tabel menggunakan auto-increment integer
- Unique constraints pada business keys (email, order_number, session_token)

**Foreign Keys:**
- Cascade delete untuk dependent data
- Optional foreign keys untuk guest functionality

**Check Constraints:**
- Status fields dengan predefined values
- Quantity > 0 untuk order items
- Amount >= 0 untuk financial fields

## 6. RELASI ANTAR TABEL

### 6.1 User Management Flow
\`\`\`
USERS (1) → (N) USER_SESSIONS
USERS (1) → (1) USER_PREFERENCES  
USERS (1) → (1) CUSTOMERS (optional)
\`\`\`

### 6.2 Product Management Flow
\`\`\`
PRODUCT_CATEGORIES (1) → (N) PRODUCTS
PRODUCTS (1) → (N) WISHLIST
PRODUCTS (1) → (N) ORDER_ITEMS
\`\`\`

### 6.3 Order Management Flow
\`\`\`
CUSTOMERS (1) → (N) ORDERS
ORDERS (1) → (N) ORDER_ITEMS
ORDERS (1) → (N) PAYMENT_TRANSACTIONS
\`\`\`

### 6.4 Payment Flow
\`\`\`
PAYMENT_METHODS (1) → (N) PAYMENT_TRANSACTIONS
ORDERS (1) → (N) PAYMENT_TRANSACTIONS
ORDERS (1) → (N) TRANSACTIONS (legacy)
\`\`\`

## 7. INDEXING STRATEGY

### 7.1 Performance Indexes
- **Lookup Indexes**: email, order_number, session_token
- **Filter Indexes**: status fields, category, brand
- **Range Indexes**: created_at, price, in_stock
- **Join Indexes**: Foreign key columns

### 7.2 Composite Indexes
- `(user_id, product_id)` pada wishlist
- `(order_id, product_id)` pada order_items
- `(webhook_type, created_at)` pada webhook_logs

## 8. SECURITY CONSIDERATIONS

### 8.1 Row Level Security (RLS)
- Enabled pada semua tabel
- Policies untuk data isolation
- Admin override capabilities

### 8.2 Data Protection
- Password hashing dengan bcrypt
- JWT token dengan expiry
- Sensitive data encryption
- Audit trails

## 9. SCALABILITY FEATURES

### 9.1 Database Design
- Normalized structure mengurangi redundansi
- Proper indexing untuk query performance
- Partitioning ready untuk large datasets

### 9.2 Caching Strategy
- Session data caching
- Product catalog caching
- Query result caching

## 10. BACKUP & RECOVERY

### 10.1 Backup Strategy
- Daily full backups
- Hourly incremental backups
- Point-in-time recovery capability

### 10.2 Data Retention
- User data: Indefinite (with GDPR compliance)
- Session data: Auto-cleanup expired sessions
- Webhook logs: 1 year retention
- Order data: 7 years for tax compliance

## 11. MONITORING & MAINTENANCE

### 11.1 Health Checks
- Connection pool monitoring
- Query performance tracking
- Storage usage monitoring
- Index usage analysis

### 11.2 Maintenance Tasks
- Regular VACUUM and ANALYZE
- Index rebuilding
- Statistics updates
- Log rotation
