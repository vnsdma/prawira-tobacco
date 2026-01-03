# Dokumentasi Sistem E-Commerce Tembakau

## 1. Flowchart Sistem

### Penjelasan Flowchart:
Flowchart menggambarkan alur kerja lengkap sistem dari user membuka aplikasi hingga menyelesaikan transaksi.

**Fitur Utama:**
- **Login Optional**: User dapat browse tanpa login
- **Guest Checkout**: User dapat checkout tanpa registrasi
- **Enhanced Experience**: User yang login mendapat fitur tambahan
- **Multiple Payment**: Support Midtrans dan COD

**Alur Kerja:**
1. User membuka aplikasi
2. Sistem cek status login
3. User dapat browse produk dengan/tanpa login
4. Proses checkout disesuaikan dengan status login
5. Payment processing melalui Midtrans atau COD
6. Update status pesanan dan notifikasi

## 2. Data Flow Diagram (DFD) Level 0

### Penjelasan DFD Level 0:
DFD Level 0 menunjukkan sistem sebagai satu kesatuan dengan entitas eksternal.

**Entitas Eksternal:**
- **User/Customer**: Pengguna akhir aplikasi
- **Admin**: Administrator sistem
- **Midtrans**: Payment gateway
- **Email Service**: Layanan notifikasi email

**Data Flow:**
- Input: Data registrasi, login, pesanan, pembayaran
- Output: Info produk, status pesanan, konfirmasi, notifikasi
- Proses: Semua operasi sistem dalam satu kotak

## 3. Diagram Berjenjang (Hierarchy Chart)

### Penjelasan Diagram Berjenjang:
Menunjukkan struktur hierarki modul-modul dalam sistem.

**Modul Utama:**
1. **Modul Autentikasi**: Login, register, logout, session management
2. **Modul Produk**: Browse, search, filter, detail produk
3. **Modul Pesanan**: Keranjang, checkout, riwayat, status
4. **Modul Pembayaran**: Midtrans, COD, webhook, history
5. **Modul Profil**: View, edit, wishlist, preferences

**Keuntungan Struktur:**
- Modular design untuk maintainability
- Separation of concerns
- Scalable architecture

## 4. Data Flow Diagram (DFD) Level 1

### Penjelasan DFD Level 1:
Memecah sistem menjadi proses-proses yang lebih detail.

**Proses Utama:**
1. **Manajemen Autentikasi (1.0)**
   - Input: Data login/register dari user
   - Output: Konfirmasi autentikasi
   - Data Store: Users, Sessions

2. **Manajemen Produk (2.0)**
   - Input: Request produk dari user, manage dari admin
   - Output: Info produk, reports
   - Data Store: Products

3. **Manajemen Pesanan (3.0)**
   - Input: Data pesanan dari user
   - Output: Konfirmasi pesanan
   - Data Store: Orders

4. **Manajemen Pembayaran (4.0)**
   - Input: Request pembayaran
   - Output: Payment response
   - External: Midtrans integration

5. **Manajemen Profil (5.0)**
   - Input: Profile requests
   - Output: Profile data
   - Data Store: Users, Wishlist

## 5. Entity Relationship Diagram (ERD)

### Penjelasan ERD:
Menggambarkan struktur database dan relasi antar tabel.

**Entitas Utama:**

1. **USERS**
   - Primary Key: id
   - Unique: email
   - Attributes: password_hash, name, phone, address, status
   - Purpose: Menyimpan data user yang registrasi

2. **USER_SESSIONS**
   - Primary Key: id
   - Foreign Key: user_id → USERS(id)
   - Purpose: Manajemen session login

3. **USER_PREFERENCES**
   - Primary Key: id
   - Foreign Key: user_id → USERS(id)
   - Purpose: Pengaturan user personal

4. **CUSTOMERS**
   - Primary Key: id
   - Foreign Key: user_id → USERS(id) (optional)
   - Purpose: Data customer untuk guest checkout

5. **PRODUCTS**
   - Primary Key: id
   - Attributes: name, price, in_stock, category
   - Purpose: Katalog produk

6. **ORDERS**
   - Primary Key: id
   - Foreign Keys: customer_id, user_id (optional)
   - Purpose: Data pesanan

7. **ORDER_ITEMS**
   - Primary Key: id
   - Foreign Keys: order_id, product_id
   - Purpose: Detail item dalam pesanan

8. **TRANSACTIONS**
   - Primary Key: id
   - Foreign Keys: order_id, payment_method_id
   - Purpose: Record transaksi keuangan

9. **WISHLIST**
   - Primary Key: id
   - Foreign Keys: user_id, product_id
   - Purpose: Produk favorit user

## 6. Relasi Antar Tabel

### Penjelasan Relasi:

**1. One-to-Many Relationships:**
- USERS → USER_SESSIONS (1:N)
- USERS → ORDERS (1:N)
- USERS → WISHLIST (1:N)
- CUSTOMERS → ORDERS (1:N)
- ORDERS → ORDER_ITEMS (1:N)
- ORDERS → TRANSACTIONS (1:N)
- PRODUCTS → ORDER_ITEMS (1:N)
- PRODUCTS → WISHLIST (1:N)

**2. One-to-One Relationships:**
- USERS → USER_PREFERENCES (1:1)
- USERS → CUSTOMERS (1:1, optional)

**3. Many-to-Many Relationships:**
- USERS ↔ PRODUCTS (melalui WISHLIST)
- ORDERS ↔ PRODUCTS (melalui ORDER_ITEMS)

### Keuntungan Desain Database:

1. **Fleksibilitas Login Optional**:
   - Guest dapat checkout tanpa registrasi (via CUSTOMERS)
   - User terdaftar dapat link ke CUSTOMERS untuk history

2. **Scalability**:
   - Terpisahnya USERS dan CUSTOMERS memungkinkan guest checkout
   - Session management terpisah untuk keamanan

3. **Data Integrity**:
   - Foreign key constraints
   - Unique constraints pada email
   - Check constraints pada status

4. **Performance**:
   - Proper indexing pada kolom yang sering di-query
   - Normalized structure mengurangi redundansi

## 7. Fitur Login Optional

### Implementasi:

**Tanpa Login (Guest):**
- Browse produk ✓
- Add to cart ✓
- Checkout dengan form manual ✓
- Order tracking via email ✓

**Dengan Login (Registered User):**
- Semua fitur guest ✓
- Auto-fill checkout form ✓
- Order history lengkap ✓
- Wishlist ✓
- Profile management ✓
- Notifikasi personal ✓

### Keuntungan Pendekatan:
1. **User Experience**: Tidak memaksa registrasi
2. **Conversion Rate**: Mengurangi friction dalam checkout
3. **Retention**: Memberikan insentif untuk registrasi
4. **Flexibility**: User dapat upgrade ke registered kapan saja

## 8. Security Considerations

**Authentication:**
- Password hashing dengan bcrypt (salt rounds: 12)
- JWT tokens untuk session management
- Session expiry (7 hari)
- Secure token storage

**Authorization:**
- Row Level Security (RLS) pada Supabase
- API endpoint protection
- User data isolation

**Data Protection:**
- Input validation
- SQL injection prevention
- XSS protection
- HTTPS enforcement
\`\`\`

Mari kita update environment variables:
