# Prawira Tobacco Mobile App

A React Native mobile e-commerce application for tobacco products built with Expo.

## 🚀 Features

- **Product Catalog**: Browse tobacco products with categories and search
- **Shopping Cart**: Add/remove items with quantity management
- **Checkout System**: Support for online payment (Midtrans) and COD
- **Order Management**: Track order history and status
- **User Authentication**: Login/register system
- **Responsive Design**: Optimized for mobile devices

## 📱 Tech Stack

- **Framework**: Expo SDK 50
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **Payment**: Midtrans Snap API
- **Storage**: Expo SecureStore
- **UI**: React Native with custom styling

## 🛠 Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure environment:**
   Update `app.json` with your API endpoints and Midtrans keys:
   \`\`\`json
   "extra": {
     "apiBaseUrl": "https://prawiratobacco.shop",
     "midtransClientKey": "your-midtrans-client-key",
     "midtransIsProduction": false
   }
   \`\`\`

3. **Start development server:**
   \`\`\`bash
   npm start
   \`\`\`

4. **Run on device:**
   - Install Expo Go app on your phone
   - Scan QR code from terminal

## 🏗 Building

### Development Build
\`\`\`bash
eas build --profile development --platform android
\`\`\`

### Preview Build (APK)
\`\`\`bash
eas build --profile preview --platform android
\`\`\`

### Production Build
\`\`\`bash
eas build --profile production --platform android
\`\`\`

## 📋 Requirements

- Node.js 18+
- Expo CLI
- EAS CLI (for building)
- Android Studio (for Android development)
- Xcode (for iOS development)

## 🔧 Configuration

### API Endpoints Required:
- `/api/mobile/products` - Product listing
- `/api/mobile/orders` - Order management
- `/api/payment/snap` - Midtrans payment
- `/api/auth/*` - Authentication (optional)

### Environment Variables:
- `EXPO_PUBLIC_API_URL` - Your backend API URL
- `EXPO_PUBLIC_MIDTRANS_CLIENT_KEY` - Midtrans client key
- `EXPO_PUBLIC_MIDTRANS_IS_PRODUCTION` - Production flag

## 📱 App Structure

\`\`\`
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── contexts/           # React contexts (Cart, Auth)
├── services/           # API services
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── config/             # Configuration files
\`\`\`

## 🎯 Key Components

- **HomeScreen**: Product browsing and search
- **CartScreen**: Shopping cart management
- **CheckoutModal**: Payment and order processing
- **ProductCard**: Individual product display
- **CategoryFilter**: Product category filtering

## 💳 Payment Integration

The app uses Midtrans Snap for payment processing:
- Supports all major Indonesian payment methods
- Bank transfer, e-wallets, credit cards
- Cash on delivery (COD) option
- Real-time payment status updates

## 🔐 Security

- Secure storage for sensitive data
- API key protection
- Input validation and sanitization
- HTTPS-only communication

## 📞 Support

For technical support or questions, contact the development team.
