flowchart TD
    A[User Membuka Aplikasi] --> B{User Sudah Login?}
    
    B -->|Ya| C[Dashboard dengan Profil User]
    B -->|Tidak| D[Dashboard Guest Mode]
    
    C --> E[Browse Produk dengan Fitur Lengkap]
    D --> F[Browse Produk Basic]
    
    E --> G[Pilih Produk]
    F --> G
    
    G --> H[Lihat Detail Produk]
    H --> I{Tambah ke Keranjang?}
    
    I -->|Ya| J[Tambah ke Cart]
    I -->|Tidak| K{Tambah ke Wishlist?}
    
    K -->|Ya| L{User Login?}
    K -->|Tidak| G
    
    L -->|Ya| M[Tambah ke Wishlist]
    L -->|Tidak| N[Prompt Login]
    
    M --> G
    N --> O{Login/Register?}
    
    O -->|Login| P[Form Login]
    O -->|Register| Q[Form Register]
    O -->|Skip| G
    
    P --> R{Kredensial Valid?}
    Q --> S{Data Valid?}
    
    R -->|Ya| C
    R -->|Tidak| T[Error Message]
    S -->|Ya| C
    S -->|Tidak| U[Error Message]
    
    T --> P
    U --> Q
    
    J --> V[Update Cart]
    V --> W{Checkout?}
    
    W -->|Ya| X{User Login?}
    W -->|Tidak| G
    
    X -->|Ya| Y[Form Checkout Auto-fill]
    X -->|Tidak| Z[Form Checkout Manual]
    
    Y --> AA[Pilih Metode Pembayaran]
    Z --> AA
    
    AA --> BB{Payment Method?}
    
    BB -->|Midtrans| CC[Create Midtrans Transaction]
    BB -->|COD| DD[Create COD Order]
    
    CC --> EE[Redirect ke Midtrans]
    EE --> FF[User Payment Process]
    
    FF --> GG{Payment Status?}
    
    GG -->|Success| HH[Payment Success]
    GG -->|Pending| II[Payment Pending]
    GG -->|Failed| JJ[Payment Failed]
    
    HH --> KK[Update Order Status: Paid]
    II --> LL[Update Order Status: Pending]
    JJ --> MM[Update Order Status: Failed]
    
    DD --> NN[Update Order Status: COD]
    
    KK --> OO[Update Stock]
    LL --> PP[Wait for Payment]
    MM --> QQ[Order Cancelled]
    NN --> RR[Order Confirmed]
    
    OO --> SS[Send Confirmation]
    PP --> TT[Send Pending Notice]
    QQ --> UU[Send Failure Notice]
    RR --> VV[Send COD Confirmation]
    
    SS --> WW[Order Processing]
    TT --> XX[Payment Monitoring]
    UU --> YY[Return to Cart]
    VV --> WW
    
    WW --> ZZ[Order Shipped]
    ZZ --> AAA[Order Delivered]
    
    XX --> BBB{Payment Completed?}
    BBB -->|Ya| KK
    BBB -->|Timeout| QQ
    
    YY --> W
    AAA --> CCC[Order Complete]
    
    CCC --> DDD[Update Order History]
    DDD --> EEE[Send Review Request]
\`\`\`

```mermaid file="diagrams/dfd-level-0.md" type="diagram"
graph LR
    subgraph "Sistem E-Commerce Tembakau"
        SYSTEM[0<br/>Sistem E-Commerce<br/>Tembakau]
    end
    
    %% External Entities
    USER[User/Customer]
    ADMIN[Admin]
    MIDTRANS[Midtrans<br/>Payment Gateway]
    EMAIL[Email Service]
    BANK[Bank/E-Wallet]
    
    %% Data flows from external entities to system
    USER -->|"Data Registrasi<br/>Data Login<br/>Data Pesanan<br/>Request Produk<br/>Data Pembayaran"| SYSTEM
    ADMIN -->|"Data Produk<br/>Manajemen Stok<br/>Konfirmasi Pesanan<br/>Update Status"| SYSTEM
    MIDTRANS -->|"Status Pembayaran<br/>Konfirmasi Transaksi<br/>Webhook Notification"| SYSTEM
    EMAIL -->|"Delivery Status<br/>Email Confirmation"| SYSTEM
    BANK -->|"Payment Confirmation<br/>Transaction Status"| SYSTEM
    
    %% Data flows from system to external entities
    SYSTEM -->|"Info Produk<br/>Status Pesanan<br/>Konfirmasi Order<br/>Notifikasi<br/>Invoice"| USER
    SYSTEM -->|"Laporan Penjualan<br/>Data Pesanan<br/>Info Stok<br/>Analytics"| ADMIN
    SYSTEM -->|"Request Pembayaran<br/>Data Transaksi<br/>Customer Info"| MIDTRANS
    SYSTEM -->|"Email Notifikasi<br/>Konfirmasi Pesanan<br/>Status Update"| EMAIL
    SYSTEM -->|"Payment Request<br/>Transaction Data"| BANK
    
    %% Styling
    classDef entity fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef system fill:#f3e5f5,stroke:#4a148c,stroke-width:3px
    
    class USER,ADMIN,MIDTRANS,EMAIL,BANK entity
    class SYSTEM system
\`\`\`

```mermaid file="diagrams/dfd-level-1.md" type="diagram"
graph TD
    %% External Entities
    USER[User/Customer]
    ADMIN[Admin]
    MIDTRANS[Midtrans]
    EMAIL[Email Service]
    
    %% Processes
    P1[1.0<br/>Manajemen<br/>Autentikasi<br/>& User]
    P2[2.0<br/>Manajemen<br/>Produk<br/>& Katalog]
    P3[3.0<br/>Manajemen<br/>Keranjang<br/>& Wishlist]
    P4[4.0<br/>Manajemen<br/>Pesanan<br/>& Checkout]
    P5[5.0<br/>Manajemen<br/>Pembayaran<br/>& Transaksi]
    P6[6.0<br/>Manajemen<br/>Notifikasi<br/>& Email]
    P7[7.0<br/>Manajemen<br/>Laporan<br/>& Analytics]
    
    %% Data Stores
    DS1[(D1: Users<br/>& Sessions)]
    DS2[(D2: Products<br/>& Categories)]
    DS3[(D3: Orders<br/>& Order Items)]
    DS4[(D4: Payments<br/>& Transactions)]
    DS5[(D5: Customers)]
    DS6[(D6: Wishlist<br/>& Cart)]
    DS7[(D7: Webhook Logs<br/>& System Data)]
    
    %% User flows
    USER -->|Data Login/Register| P1
    USER -->|Request Produk| P2
    USER -->|Manage Cart/Wishlist| P3
    USER -->|Data Checkout| P4
    USER -->|Payment Request| P5
    
    P1 -->|Konfirmasi Auth| USER
    P2 -->|Info Produk| USER
    P3 -->|Cart Status| USER
    P4 -->|Order Confirmation| USER
    P5 -->|Payment Status| USER
    P6 -->|Notifications| USER
    
    %% Admin flows
    ADMIN -->|Manage Products| P2
    ADMIN -->|Manage Orders| P4
    ADMIN -->|View Reports| P7
    
    P2 -->|Product Reports| ADMIN
    P4 -->|Order Reports| ADMIN
    P7 -->|Analytics Data| ADMIN
    
    %% External service flows
    P5 <-->|Payment Processing| MIDTRANS
    P6 <-->|Email Delivery| EMAIL
    
    %% Data store interactions
    P1 <-->|User Data| DS1
    P1 <-->|Customer Data| DS5
    
    P2 <-->|Product Data| DS2
    
    P3 <-->|Wishlist Data| DS6
    P3 <-->|User Data| DS1
    P3 <-->|Product Data| DS2
    
    P4 <-->|Order Data| DS3
    P4 <-->|Customer Data| DS5
    P4 <-->|Product Data| DS2
    
    P5 <-->|Transaction Data| DS4
    P5 <-->|Order Data| DS3
    P5 <-->|Webhook Data| DS7
    
    P6 <-->|User Data| DS1
    P6 <-->|Order Data| DS3
    
    P7 <-->|All Data Stores| DS1
    P7 <-->|All Data Stores| DS2
    P7 <-->|All Data Stores| DS3
    P7 <-->|All Data Stores| DS4
    
    %% Inter-process flows
    P1 -->|User Info| P3
    P1 -->|User Info| P4
    P2 -->|Product Info| P3
    P2 -->|Product Info| P4
    P3 -->|Cart Data| P4
    P4 -->|Order Info| P5
    P4 -->|Order Info| P6
    P5 -->|Payment Info| P6
    
    %% Styling
    classDef entity fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef process fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef datastore fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    
    class USER,ADMIN,MIDTRANS,EMAIL entity
    class P1,P2,P3,P4,P5,P6,P7 process
    class DS1,DS2,DS3,DS4,DS5,DS6,DS7 datastore
\`\`\`

```mermaid file="diagrams/erd.md" type="diagram"
erDiagram
    %% User Management
    USERS {
        int id PK
        varchar email UK
        varchar password_hash
        varchar name
        varchar phone
        text address
        varchar avatar_url
        boolean email_verified
        varchar status
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }
    
    USER_SESSIONS {
        int id PK
        int user_id FK
        varchar session_token UK
        timestamp expires_at
        timestamp created_at
    }
    
    USER_PREFERENCES {
        int id PK
        int user_id FK
        boolean notifications_enabled
        boolean newsletter_subscribed
        varchar preferred_language
        varchar theme
        timestamp created_at
        timestamp updated_at
    }
    
    %% Product Management
    PRODUCT_CATEGORIES {
        int id PK
        varchar name
        varchar slug UK
        text description
        varchar image_url
        boolean is_active
        timestamp created_at
    }
    
    PRODUCTS {
        int id PK
        varchar name
        text description
        decimal price
        int in_stock
        int category_id FK
        varchar category
        varchar brand
        varchar image_url
        decimal weight
        varchar dimensions
        boolean is_active
        varchar user_uid
        timestamp created_at
        timestamp updated_at
    }
    
    WISHLIST {
        int id PK
        int user_id FK
        int product_id FK
        timestamp created_at
    }
    
    %% Customer & Order Management
    CUSTOMERS {
        int id PK
        varchar name
        varchar email
        varchar phone
        text address
        int user_id FK
        varchar user_uid
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS {
        int id PK
        varchar order_number UK
        int customer_id FK
        int user_id FK
        decimal total_amount
        decimal shipping_cost
        decimal tax_amount
        decimal discount_amount
        decimal final_amount
        varchar payment_method
        varchar payment_status
        varchar order_status
        text shipping_address
        text notes
        varchar user_uid
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        varchar product_name
        text product_description
        int quantity
        decimal unit_price
        decimal total_price
        timestamp created_at
    }
    
    %% Payment Management
    PAYMENT_METHODS {
        int id PK
        varchar name UK
        varchar display_name
        text description
        boolean is_active
        timestamp created_at
    }
    
    PAYMENT_TRANSACTIONS {
        int id PK
        int order_id FK
        varchar transaction_id UK
        int payment_method_id FK
        varchar payment_method
        decimal amount
        varchar status
        jsonb gateway_response
        jsonb midtrans_response
        timestamp processed_at
        timestamp created_at
        timestamp updated_at
    }
    
    TRANSACTIONS {
        int id PK
        text description
        int order_id FK
        int payment_method_id FK
        decimal amount
        varchar user_uid
        varchar type
        varchar category
        varchar status
        timestamp created_at
    }
    
    %% System Monitoring
    WEBHOOK_LOGS {
        int id PK
        varchar webhook_type
        int order_id
        varchar transaction_id
        varchar status
        jsonb payload
        int response_status
        text error_message
        timestamp processed_at
        timestamp created_at
    }
    
    %% Relationships
    USERS ||--o{ USER_SESSIONS : "has"
    USERS ||--o| USER_PREFERENCES : "has"
    USERS ||--o{ CUSTOMERS : "links to"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ WISHLIST : "creates"
    
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "included in"
    PRODUCTS ||--o{ WISHLIST : "added to"
    
    CUSTOMERS ||--o{ ORDERS : "places"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o{ PAYMENT_TRANSACTIONS : "generates"
    ORDERS ||--o{ TRANSACTIONS : "creates"
    
    PAYMENT_METHODS ||--o{ PAYMENT_TRANSACTIONS : "used in"
    PAYMENT_METHODS ||--o{ TRANSACTIONS : "used in"
\`\`\`

```mermaid file="diagrams/hierarchy-chart.md" type="diagram"
graph TD
    A[Sistem E-Commerce Tembakau] --> B[Modul Autentikasi & User]
    A --> C[Modul Produk & Katalog]
    A --> D[Modul Keranjang & Wishlist]
    A --> E[Modul Pesanan & Checkout]
    A --> F[Modul Pembayaran & Transaksi]
    A --> G[Modul Notifikasi & Email]
    A --> H[Modul Laporan & Analytics]
    A --> I[Modul Sistem & Monitoring]
    
    %% Autentikasi & User
    B --> B1[Login User]
    B --> B2[Register User]
    B --> B3[Logout User]
    B --> B4[Session Management]
    B --> B5[Profile Management]
    B --> B6[User Preferences]
    B --> B7[Password Reset]
    
    %% Produk & Katalog
    C --> C1[Browse Produk]
    C --> C2[Search Produk]
    C --> C3[Filter Kategori]
    C --> C4[Detail Produk]
    C --> C5[Manajemen Stok]
    C --> C6[Kategori Produk]
    C --> C7[Product Reviews]
    
    %% Keranjang & Wishlist
    D --> D1[Add to Cart]
    D --> D2[Update Cart]
    D --> D3[Remove from Cart]
    D --> D4[View Cart]
    D --> D5[Add to Wishlist]
    D --> D6[Manage Wishlist]
    D --> D7[Cart Persistence]
    
    %% Pesanan & Checkout
    E --> E1[Checkout Process]
    E --> E2[Order Creation]
    E --> E3[Order Management]
    E --> E4[Order Status]
    E --> E5[Order History]
    E --> E6[Order Tracking]
    E --> E7[Order Cancellation]
    
    %% Pembayaran & Transaksi
    F --> F1[Midtrans Integration]
    F --> F2[COD Processing]
    F --> F3[Payment Webhook]
    F --> F4[Transaction History]
    F --> F5[Payment Status]
    F --> F6[Refund Processing]
    F --> F7[Payment Methods]
    
    %% Notifikasi & Email
    G --> G1[Email Notifications]
    G --> G2[Order Confirmations]
    G --> G3[Payment Notifications]
    G --> G4[Status Updates]
    G --> G5[Newsletter]
    G --> G6[SMS Notifications]
    
    %% Laporan & Analytics
    H --> H1[Sales Reports]
    H --> H2[Product Analytics]
    H --> H3[User Analytics]
    H --> H4[Payment Reports]
    H --> H5[Inventory Reports]
    H --> H6[Performance Metrics]
    
    %% Sistem & Monitoring
    I --> I1[Webhook Logging]
    I --> I2[Error Monitoring]
    I --> I3[Performance Monitoring]
    I --> I4[Security Logging]
    I --> I5[Backup & Recovery]
    I --> I6[System Health]
\`\`\`

Sekarang mari kita buat dokumentasi lengkap:
