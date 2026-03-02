Briq supports three payment collection methods. Each method has a dedicated endpoint.

| Payment Type | Endpoint | Key Response Field | Customer Action |
|---|---|---|---|
| **Mobile Money** | `POST /transaction/initiate` | *(none — USSD push)* | Confirm on phone |
| **Card** | `POST /transaction/initiate/card` | `payment_url` | Redirect to checkout URL |
| **Dynamic QR** | `POST /transaction/initiate/qr` | `qr_code` | Scan QR code |

All three endpoints return the same `InitiateTransactionResponse` shape. The transaction remains **incomplete** (`marked_complete: false`) until the payment is confirmed by the provider. Confirmation happens either:
- **Automatically** — via provider webhook (backend handles this)
- **Manually** — via `POST /transaction/complete` (client-initiated polling)

> ⚠️ **QR payments note:** The top-level `qr_code` field is populated from `provider_response.data.payment_qr_code`. This is a raw **EMV QR string** (not a base64 image). You must render it client-side using a QR library. A `payment_url` is also returned and can be used as a "Pay via link" alternative.

---

## 2. Common Concepts

### Authentication
All initiation endpoints require authentication. Include the token in the header:

```http
Authorization: Bearer <jwt_token>
```

### `transaction_id` vs `payment_reference`
| Field | Source | Used For |
|---|---|---|
| `transaction_id` | Internal UUID (Briq) | Local record lookup |
| `payment_reference` | Provider reference string | Provider-side status checks |

Both can be used interchangeably in `POST /transaction/complete` and `GET /transaction/{transaction_id}`.

### `marked_complete`
A boolean that becomes `true` only after the backend has verified payment success with the provider and credited the user's account balance. Never trust `marked_complete: false` alone — always call `/complete` or wait for the webhook.

### Provider Selection
The backend selects a payment provider automatically (configured default: **Snippe**, optional: **MeetPay**). You may pass an explicit `provider_name` field, but this is typically not needed. Supported values: `"snippe"`, `"meetpay"`.

---

## 3. Mobile Money (USSD Push)

The customer receives a USSD prompt on their phone and approves the payment.

### Endpoint
```
POST /api//transaction/initiate
```

### Request Body

```json
{
  "amount_paid": 10000,
  "target_phone": "255712345678",
  "buyer_email": "customer@example.com",
  "buyer_name": "Jane Doe",
  "provider_name": null
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `amount_paid` | `integer` | ✅ | Amount in TZS (whole number, no decimals) |
| `target_phone` | `string` | ✅ | Phone in international format, e.g. `255712345678` |
| `buyer_email` | `string` | ❌ | Customer email (forwarded to provider) |
| `buyer_name` | `string` | ❌ | Customer full name |
| `provider_name` | `string \| null` | ❌ | Force a specific provider (`"snippe"`, `"meetpay"`). Leave `null` for default. |

> **Note:** The network (Vodacom, Tigo, Airtel, Halotel) is auto-detected from the phone number prefix. You don't need to send it.

### Successful Response (`200 OK`)

```json
{
  "success": true,
  "message": "Check your phone to confirm payment",
  "payment_reference": "242fdb5c-5300-4448-b5aa-750b8bdb30d6",
  "transaction_id": "a1b2c3d4-...",
  "transaction_name": "TXN-XXXXXX",
  "payment_type": "mobile",
  "payment_provider": "snippe",
  "payment_url": null,
  "qr_code": null,
  "provider_response": { ... }
}
```

### Frontend Flow

```
1. Call POST /transaction/initiate
2. Show "Check your phone" UI and a loading spinner
3. Poll POST /transaction/complete every 5–10 seconds using payment_reference
   OR wait for your app's real-time notification (WebSocket / push)
4. On success → show confirmation screen and update balance
```

---

## 4. Pay with Card (Redirect Flow)

The customer is redirected to a hosted checkout page (Selcom / MeetPay gateway) to enter their card details.

### Endpoint
```
POST /api//transaction/initiate/card
```

### Request Body

```json
{
  "amount_paid": 50000,
  "target_phone": "255712345678",
  "buyer_email": "customer@example.com",
  "buyer_name": "Jane Doe",
  "address": "123 Uhuru St",
  "city": "Dar es Salaam",
  "state": "DSM",
  "postcode": "14101",
  "country": "TZ",
  "redirect_url": "https://app.briq.tz/payment/success",
  "cancel_url": "https://app.briq.tz/payment/cancel",
  "callback_url": null,
  "provider_name": null
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `amount_paid` | `integer` | ✅ | Amount in TZS |
| `target_phone` | `string` | ✅ | Customer phone number |
| `buyer_email` | `string` | ✅ | Required by card providers |
| `buyer_name` | `string` | ✅ | Customer full name; required by card providers |
| `address` | `string` | ⚠️ | Billing street address. Recommended for card approval |
| `city` | `string` | ⚠️ | Billing city |
| `state` | `string` | ⚠️ | State/region code, e.g. `"DSM"` |
| `postcode` | `string` | ⚠️ | Postal code, e.g. `"14101"` |
| `country` | `string` | ⚠️ | ISO-3166 alpha-2 country code, e.g. `"TZ"` |
| `redirect_url` | `string` | ✅ | Where to send customer after **successful** payment |
| `cancel_url` | `string` | ✅ | Where to send customer if payment is **cancelled/failed** |
| `callback_url` | `string \| null` | ❌ | Server-to-server callback (backend use only) |
| `provider_name` | `string \| null` | ❌ | Force specific provider |
| `customer` | `object` | ✅ | **Required by backend.** Nested billing: `{ address, city, state, postcode, country }` (all strings). |

> ⚠️ `redirect_url` and `cancel_url` are **critical** — without them the customer will have no way to return to your app after paying.
> ⚠️ The live API requires a nested **`customer`** object with `address`, `city`, `state`, `postcode`, and `country`. The frontend sends this shape in addition to (or instead of) top-level billing fields.

### Successful Response (`200 OK`)

```json
{
  "success": true,
  "message": "Redirect to complete card payment",
  "payment_reference": "2e0bcc5f-92ca-44f9-8c1b-4d2966d9921f",
  "transaction_id": "a1b2c3d4-...",
  "transaction_name": "TXN-XXXXXX",
  "payment_type": "card",
  "payment_provider": "snippe",
  "payment_url": "https://tz.selcom.online/paymentgw/checkout/...",
  "qr_code": null,
  "provider_response": { ... }
}
```

### `payment_url`
This is the hosted payment page. **Redirect the customer here immediately.** Never cache or reuse this URL — it is single-use and time-limited.

### Frontend Flow

```
1. Call POST /transaction/initiate/card
2. Store transaction_id and payment_reference locally
3. Redirect to payment_url (window.location.href or open in new tab)
   Customer fills card details on the provider's page
4. Provider redirects back to your redirect_url or cancel_url
5. On redirect_url page → call POST /transaction/complete with
   the stored payment_reference or transaction_id
6. On success → show confirmation. On failure → show error.
```

> **Tip:** Pass `transaction_id` as a query param in your `redirect_url` so you know which transaction to complete upon return:
> ```
> redirect_url: "https://app.briq.tz/payment/success?txn_id=a1b2c3d4-..."
> ```

---

## 5. Dynamic QR Code (Scan-to-Pay)

A QR code is generated for the customer to scan with their mobile banking app.

### Endpoint
```
POST /api//transaction/initiate/qr
```

### Request Body

```json
{
  "amount_paid": 20000,
  "target_phone": "255712345678",
  "buyer_email": "customer@example.com",
  "buyer_name": "Jane Doe",
  "provider_name": null
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `amount_paid` | `integer` | ✅ | Amount in TZS |
| `target_phone` | `string` | ✅ | Customer phone number |
| `buyer_email` | `string` | ❌ | Optional |
| `buyer_name` | `string` | ❌ | Optional |
| `provider_name` | `string \| null` | ❌ | Force specific provider |

### Successful Response (`200 OK`) — Live Example

```json
{
  "success": true,
  "message": "success",
  "payment_reference": "01b2e843-76ef-4fec-8efc-1c656874a0fd",
  "transaction_id": "40c3212c-b6e9-46ba-9fe6-359ddd27e305",
  "transaction_name": "CheeryWhale-SG74EB",
  "payment_type": "dynamic-qr",
  "payment_provider": "snippe",
  "payment_url": "https://tz.selcom.online/paymentgw/checkout/...",
  "qr_code": null,
  "provider_response": {
    "status": "success",
    "code": 201,
    "data": {
      "reference": "01b2e843-76ef-4fec-8efc-1c656874a0fd",
      "status": "pending",
      "payment_type": "dynamic-qr",
      "payment_qr_code": "000201010212041552545429990002...",
      "payment_token": "63808132",
      "payment_url": "https://tz.selcom.online/paymentgw/checkout/...",
      "expires_at": "2026-04-27T05:58:51.76210021Z"
    }
  }
}
```

### Key Fields for QR Payments

| Field | Location | Type | Description |
|---|---|---|---|
| `payment_qr_code` | `provider_response.data.payment_qr_code` | EMV string | Raw QR data — **render this** |
| `payment_url` | Top-level & `provider_response.data.payment_url` | URL | Fallback link for mobile users |
| `qr_code` | Top-level | `null` | Always `null` for Snippe QR — use `payment_qr_code` instead |
| `expires_at` | `provider_response.data.expires_at` | ISO datetime | QR expiry time — display a countdown |

### Rendering the QR Code

The `payment_qr_code` is a raw **EMV QR string** (starts with `000201...`). You must render it client-side using a QR code library:

**JavaScript (using [qrcode](https://www.npmjs.com/package/qrcode)):**
```bash
npm install qrcode
```
```javascript
import QRCode from 'qrcode';

const emvString = response.provider_response.data.payment_qr_code;
const canvas = document.getElementById('qr-canvas');
await QRCode.toCanvas(canvas, emvString, { width: 256 });
```

**React (using [react-qr-code](https://www.npmjs.com/package/react-qr-code)):**
```bash
npm install react-qr-code
```
```jsx
import QRCode from 'react-qr-code';

const emvString = response.provider_response.data.payment_qr_code;

<QRCode value={emvString} size={256} />
```

**Vue (using [qrcode.vue](https://www.npmjs.com/package/qrcode.vue)):**
```jsx
<qrcode-vue :value="emvString" :size="256" />
```

### Payment URL (Alternative / Mobile Fallback)

The top-level `payment_url` is also returned for QR payments. Use it as a:
- **"Pay via link"** button for users who cannot scan QR codes
- **Deep link** that opens the payment on mobile browsers directly

```jsx
<a href={response.payment_url} target="_blank">Open Payment Page</a>
```

### Frontend Flow

```
1. Call POST /transaction/initiate/qr
2. Extract emvString from response.provider_response.data.payment_qr_code
3. Render emvString using a QR library (qrcode, react-qr-code, etc.)
4. Display payment_url as a fallback link/button
5. Show expires_at countdown from provider_response.data.expires_at
6. Poll POST /transaction/complete every 5–10 seconds
   OR wait for real-time notification
7. On success → hide QR, show confirmation and updated balance
```

---

## 6. Checking Transaction Status

Retrieve a single transaction's current state by `transaction_id`.

### Endpoint
```
GET /api//transaction/{transaction_id}
```

### Response

```json
{
  "transaction_id": "a1b2c3d4-...",
  "user_id": "user-uuid",
  "total_amount_paid": 10000,
  "units_purchased": 10000,
  "payment_method": "mobile_money",
  "payment_reference": "242fdb5c-...",
  "transaction_name": "TXN-XXXXXX",
  "transaction_date": "2026-02-26T07:00:00",
  "marked_complete": false,
  "payment_provider": "snippe",
  "payment_type": "mobile",
  "payment_url": null,
  "qr_code": null
}
```

Use `marked_complete` to know if the transaction has been settled. This does **not** call the provider directly — use `/complete` for that.

---

## 7. Completing a Transaction (Manual Polling)

Verifies payment with the provider and credits the user's account if successful.

### Endpoint
```
POST /api//transaction/complete
```

### Request Body

Send **either** `payment_reference` or `transaction_id` (or both):

```json
{
  "payment_reference": "242fdb5c-5300-4448-b5aa-750b8bdb30d6",
  "transaction_id": "a1b2c3d4-..."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `payment_reference` | `string \| null` | ⚠️ | Provider's reference string |
| `transaction_id` | `string \| null` | ⚠️ | Internal Briq transaction UUID |

> At least one of `payment_reference` or `transaction_id` must be provided.

### Success Response (`200 OK`) — Payment Confirmed

```json
{
  "success": true,
  "message": "Credits added to account",
  "payment_reference": "242fdb5c-5300-4448-b5aa-750b8bdb30d6",
  "credits_added": 10000,
  "updated_balance": 35000
}
```

### Pending / Not Yet Completed

```json
{
  "success": false,
  "message": "Payment not completed",
  "payment_reference": "242fdb5c-...",
  "credits_added": null,
  "updated_balance": null
}
```

### Already Processed (Idempotent)

If called again after a transaction has already been completed:

```json
{
  "success": true,
  "message": "Transaction already processed",
  "payment_reference": "242fdb5c-...",
  "credits_added": 10000,
  "updated_balance": 35000
}
```

This is safe to call multiple times — it's idempotent.

### Recommended Polling Strategy

```javascript
async function pollPaymentComplete(paymentReference, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(6000); // 6 second intervals
    const res = await api.post('/transaction/complete', {
      payment_reference: paymentReference,
    });
    if (res.success) {
      return res; // Done ✅
    }
    // Keep polling if message is "Payment not completed"
  }
  throw new Error('Payment timed out');
}
```

---

## 8. Listing Transactions

### Endpoint
```
GET /api//transaction
```

### Query Parameters

| Param | Type | Description |
|---|---|---|
| `start_date` | `datetime` | Filter from date (ISO 8601) |
| `end_date` | `datetime` | Filter to date (ISO 8601) |
| `skip` | `integer` | Pagination offset (default: 0) |
| `limit` | `integer` | Results per page (default: 100, max: 100) |

### Example Request

```
GET /api//transaction?limit=20&skip=0&start_date=2026-02-01T00:00:00
```

### Response

```json
[
  {
    "transaction_id": "a1b2c3d4-...",
    "user_id": "user-uuid",
    "total_amount_paid": 10000,
    "units_purchased": 10000,
    "payment_method": "mobile_money",
    "payment_reference": "242fdb5c-...",
    "transaction_name": "TXN-XXXXXX",
    "transaction_date": "2026-02-26T07:00:00",
    "marked_complete": true,
    "payment_provider": "snippe",
    "payment_type": "mobile",
    "payment_url": null,
    "qr_code": null
  }
]
```

---

## 9. Payment Status Reference

The normalised `payment_type` and status values returned across all endpoints:

### `payment_type` Values

| Value | Meaning |
|---|---|
| `"mobile"` | Mobile money USSD push |
| `"card"` | Visa/Mastercard hosted checkout |
| `"dynamic-qr"` | QR scan-to-pay |

### `payment_provider` Values

| Value | Meaning |
|---|---|
| `"snippe"` | Snippe (default) |
| `"meetpay"` | MeetPay (optional) |

### Provider Payment Statuses (from `/complete`)

| Status String | Meaning |
|---|---|
| `"PENDING"` | Payment initiated, awaiting customer action |
| `"PROCESSING"` | Payment is being processed |
| `"COMPLETED"` | Payment successful — credits will be added |
| `"FAILED"` | Payment failed |
| `"EXPIRED"` | Payment timed out |
| `"CANCELLED"` | Customer cancelled |
| `"UNKNOWN"` | Status cannot be determined |

> Note: For Snippe, `"voided"` from the provider is mapped to `"CANCELLED"`.

---

## 10. Error Handling

### HTTP Error Codes

| Code | Meaning | When |
|---|---|---|
| `400 Bad Request` | Invalid input | Missing required fields, invalid phone, bad amount |
| `401 Unauthorized` | No or invalid JWT | Missing/expired token |
| `404 Not Found` | Resource not found | Transaction ID doesn't exist or belongs to another user |
| `422 Unprocessable Entity` | Validation error | Schema validation failed (FastAPI) |
| `500 Internal Server Error` | Backend error | Provider unreachable, DB error |

### Error Response Shape

```json
{
  "detail": "Human readable error message here"
}
```

FastAPI validation errors return a structured `detail` array:

```json
{
  "detail": [
    {
      "loc": ["body", "amount_paid"],
      "msg": "ensure this value is greater than or equal to 0",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

### Failed Initiation Response

When `success: false` is returned from an initiate endpoint:

```json
{
  "success": false,
  "message": "Failed to create payment",
  "payment_reference": null,
  "transaction_id": null,
  "payment_type": null,
  "payment_provider": null,
  "payment_url": null,
  "qr_code": null,
  "provider_response": null
}
```

Always check `success` **first** before accessing `payment_url` or `qr_code`.

---

## 11. Provider Notes

### Snippe
- **Reference field:** `payment_reference` is a UUID string (e.g. `"242fdb5c-..."`)
- **QR code:** Returned as base64 PNG in the `qr_code` field of the response
- **Card redirect URLs:** Passed inside `details.redirect_url` and `details.cancel_url` in the Snippe payload — the backend handles this automatically
- **Webhooks:** Snippe sends webhooks to `/transaction/webhook/{transaction_id}` — no action needed on the frontend

### MeetPay
- **Reference field:** `payment_reference` is a provider ID string (e.g. `"pay_xxxxx"`)
- **Card redirect/cancel URLs:** Passed via `metadata.redirect_url` and `metadata.cancel_url` — the backend handles this automatically
- **Webhooks:** MeetPay sends webhooks to `/meetpay/webhook/{transaction_id}` — no action needed on the frontend
- **Webhook signature:** Currently skipped (MeetPay doesn't consistently send signature headers)

### Failover
If the primary provider fails, the system automatically retries with the fallback provider (when `PAYMENT_FAILOVER_ENABLED=true`). The `payment_provider` field in the response will reflect the **actual** provider used.

---

## 12. Flow Diagrams

### Mobile Money Flow

```
Frontend                    API                     Provider
   │                          │                          │
   │  POST /initiate           │                          │
   │──────────────────────────▶│                          │
   │                          │  create_payment(mobile)  │
   │                          │─────────────────────────▶│
   │                          │  {status:"pending"}      │
   │                          │◀─────────────────────────│
   │  {success:true,          │                          │
   │   message:"Check phone"} │                          │
   │◀──────────────────────────│         USSD push ──────▶ Customer phone
   │                          │                          │
   │  poll: POST /complete     │                          │
   │──────────────────────────▶│  get_status(ref)        │
   │                          │─────────────────────────▶│
   │                          │  {status:"completed"}    │
   │                          │◀─────────────────────────│
   │  {success:true,          │                          │
   │   credits_added:10000}   │                          │
   │◀──────────────────────────│                          │
```

### Card Payment Flow

```
Frontend                    API                     Provider/Gateway
   │                          │                          │
   │  POST /initiate/card      │                          │
   │──────────────────────────▶│                          │
   │                          │  create_payment(card)    │
   │                          │─────────────────────────▶│
   │                          │  {payment_url:"https://…"}│
   │                          │◀─────────────────────────│
   │  {success:true,          │                          │
   │   payment_url:"https://…"}│                          │
   │◀──────────────────────────│                          │
   │                          │                          │
   │  redirect to payment_url  │                          │
   │─────────────────────────────────────────────────────▶│
   │                          │          Card entry      │
   │◀──── redirect to redirect_url ──────────────────────│
   │                          │                          │
   │  POST /complete           │                          │
   │──────────────────────────▶│  get_status(ref)        │
   │                          │─────────────────────────▶│
   │  {success:true,          │                          │
   │   credits_added:50000}   │◀─────────────────────────│
   │◀──────────────────────────│                          │
```

### QR Code Flow

```
Frontend                    API                     Provider
   │                          │                          │
   │  POST /initiate/qr        │                          │
   │──────────────────────────▶│                          │
   │                          │  create_payment(qr)      │
   │                          │─────────────────────────▶│
   │                          │  {payment_qr_code:"000201│
   │                          │   …", payment_url:"…"}   │
   │                          │◀─────────────────────────│
   │  {success:true,          │                          │
   │   payment_url:"https://…"│                          │
   │   provider_response:{    │                          │
   │    data.payment_qr_code  │                          │
   │    data.payment_url}}    │                          │
   │◀──────────────────────────│                          │
   │                          │                          │
   │  render EMV QR string     │                          │
   │  via qrcode library       │                          │
   │                          │       Customer scans QR  │
   │                          │◀─────── webhook ─────────│
   │  poll: POST /complete     │                          │
   │──────────────────────────▶│                          │
   │  {success:true,          │                          │
   │   credits_added:20000}   │                          │
   │◀──────────────────────────│                          │
```

---

## Quick Reference

```
# Mobile Money
POST /api//transaction/initiate
Body: { amount_paid, target_phone, buyer_email?, buyer_name?, provider_name? }
Response key: message = "Check your phone to confirm payment"

# Card Payment  
POST /api//transaction/initiate/card
Body: { amount_paid, target_phone, buyer_email, buyer_name, address?, city?,
        state?, postcode?, country?, redirect_url, cancel_url }
Response key: payment_url → redirect customer here

# QR Payment
POST /api//transaction/initiate/qr
Body: { amount_paid, target_phone, buyer_email?, buyer_name? }
Response keys:
  - provider_response.data.payment_qr_code → EMV string → render via QR library
  - payment_url → fallback link for mobile / non-scanner users
  - provider_response.data.expires_at → show countdown

# Complete / Poll
POST /api//transaction/complete
Body: { payment_reference?, transaction_id? }
Response: { success, credits_added, updated_balance }

# Get Transaction
GET /api//transaction/{transaction_id}

# List Trans
GET /api//transaction?limit=20&skip=0
```
