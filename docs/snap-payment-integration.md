# Midtrans Snap Payment Integration

## Overview

This is a simplified Midtrans Snap integration for the tobacco e-commerce application. Snap is Midtrans' payment page that allows customers to pay using various payment methods.

## Features

- ✅ Simple one-step payment integration
- ✅ Multiple payment methods (Bank Transfer, E-Wallet, Credit Card)
- ✅ Mobile-responsive payment page
- ✅ Automatic payment status handling
- ✅ No complex webhook management needed

## How It Works

### 1. Order Creation
- Customer fills checkout form
- Order is created in database
- Payment token is requested from Midtrans

### 2. Payment Process
- Snap.js loads the payment popup
- Customer completes payment on Midtrans page
- Payment result is handled automatically

### 3. Payment Completion
- Success: Order is marked as paid
- Pending: Customer notified to wait
- Failed: Customer can retry payment

## API Endpoints

### POST /api/payment/snap
Creates a Snap payment token for an order.

**Request Body:**
\`\`\`json
{
  "order_id": 123,
  "amount": 50000,
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "snap-token-here",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/...",
  "order_id": "TBS-123-1234567890"
}
\`\`\`

## Environment Variables

\`\`\`env
# Midtrans Configuration
MIDTRANS_SERVER_KEY="your-server-key"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-client-key"
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="false"
\`\`\`

## Components

### SnapPayment Component
- Loads Snap.js script
- Handles payment popup
- Manages payment callbacks

### CheckoutDialog Component
- Customer information form
- Payment method selection
- Order creation and payment initiation

## Payment Flow

1. **Customer Checkout**
   \`\`\`
   Customer fills form → Order created → Snap token requested
   \`\`\`

2. **Payment Process**
   \`\`\`
   Snap popup opens → Customer pays → Result callback
   \`\`\`

3. **Result Handling**
   \`\`\`
   Success → Clear cart → Show success message
   Pending → Clear cart → Show pending message
   Error → Keep cart → Show error message
   \`\`\`

## Testing

### Sandbox Mode
- Use sandbox credentials
- Test with dummy payment methods
- No real money transactions

### Test Cards
- **Success**: 4811 1111 1111 1114
- **Failure**: 4911 1111 1111 1113
- **Challenge**: 4411 1111 1111 1118

## Security

- Server key is kept secret on backend
- Client key is safe to expose in frontend
- All transactions are validated by Midtrans
- No sensitive payment data stored locally

## Error Handling

- Network errors are caught and displayed
- Invalid responses are handled gracefully
- User-friendly error messages
- Automatic retry mechanisms

## Advantages of Snap

1. **Simplicity**: One API call to create payment
2. **Security**: PCI-compliant payment page
3. **Mobile-friendly**: Responsive design
4. **Multiple methods**: All Indonesian payment methods
5. **No maintenance**: Midtrans handles updates

## Migration from Complex Integration

The previous complex integration included:
- ❌ Webhook handling
- ❌ Manual status updates
- ❌ Complex transaction management
- ❌ Multiple API endpoints

The new Snap integration provides:
- ✅ Single API endpoint
- ✅ Automatic status handling
- ✅ Simplified codebase
- ✅ Better user experience

## Support

For issues with Snap integration:
1. Check Midtrans documentation
2. Verify environment variables
3. Test in sandbox mode first
4. Contact Midtrans support if needed
