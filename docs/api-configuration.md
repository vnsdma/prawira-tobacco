# API Configuration Guide for Prawira Tobacco Mobile App

## Domain Configuration

Your mobile app is configured to connect to: **https://prawiratobacco.shop**

## Required API Endpoints

Make sure these endpoints are available on your domain:

### Product Endpoints
- `GET /api/mobile/products` - Get all products with categories
- `GET /api/mobile/products?category={category}` - Filter by category
- `GET /api/mobile/products?search={query}` - Search products

### Order Endpoints  
- `POST /api/mobile/orders` - Create new order
- `GET /api/mobile/orders?email={email}` - Get orders by email

### Customer Endpoints
- `POST /api/mobile/customers` - Create/update customer info

### Payment Endpoints
- `POST /api/payment/snap` - Create Midtrans Snap payment

### Authentication Endpoints (Optional)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

## Environment Variables

Create these environment variables in your React Native project:

### For Development (.env.development)
\`\`\`
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-your-sandbox-key
EXPO_PUBLIC_MIDTRANS_IS_PRODUCTION=false
\`\`\`

### For Production (.env.production)
\`\`\`
EXPO_PUBLIC_API_BASE_URL=https://prawiratobacco.shop
EXPO_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-your-production-key
EXPO_PUBLIC_MIDTRANS_IS_PRODUCTION=true
\`\`\`

## CORS Configuration

Make sure your domain allows requests from mobile apps by configuring CORS headers:

\`\`\`javascript
// In your Next.js API routes or server
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
\`\`\`

## SSL Certificate

Ensure your domain has a valid SSL certificate since mobile apps require HTTPS for API calls.

## Testing API Connection

You can test if your API is accessible by making a simple request:

\`\`\`bash
curl -X GET https://prawiratobacco.shop/api/mobile/products
\`\`\`

## Midtrans Configuration

1. Get your Midtrans Client Key from Midtrans Dashboard
2. For production: Use production client key
3. For testing: Use sandbox client key (starts with "SB-")

## Network Security

For production apps, consider implementing:
- API rate limiting
- Request authentication/authorization
- Input validation and sanitization
- HTTPS enforcement
