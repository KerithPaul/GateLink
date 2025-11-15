# GateLink Backend

Express.js backend server implementing the X402 payment protocol on Algorand for content monetization.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── api/              # REST API endpoints
│   │   ├── links.ts      # Link management (CRUD)
│   │   └── payments.ts   # Payment history & analytics
│   ├── facilitator/      # Payment verification & settlement
│   │   └── index.ts      # Algorand transaction handling
│   ├── middleware/       # X402 payment middleware
│   │   ├── index.ts      # Main middleware logic
│   │   ├── helpers.ts    # Utility functions
│   │   ├── types.ts      # TypeScript types
│   │   └── paywall/      # Paywall UI generation
│   ├── routes/           # Dynamic routes
│   │   └── pay.ts        # Payment route handler
│   ├── utils/            # Utilities
│   │   └── upload.ts     # File upload handling
│   ├── db.ts             # Prisma client instance
│   └── index.ts          # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── paywall/              # React paywall UI source
├── public/               # Static files (built paywall)
├── uploads/              # Uploaded files storage
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- pnpm v10.14.0+
- MySQL v8.0+
- Algorand wallet with TestNet ALGO

### Installation

**1. Install Dependencies**
```bash
cd backend
pnpm install
pnpm --filter paywall install
```

**2. Configure Environment**

Create `.env` file:
```env
# Algorand Facilitator Account (25-word mnemonic)
FACILITATOR_MNEMONIC="your 25-word mnemonic phrase here"

# Server Port
PORT=3000

# MySQL Database Connection
DATABASE_URL="mysql://root:@localhost:3306/gatelink"
```

**3. Setup Database**
```bash
# Create database
mysql -u root -e "CREATE DATABASE gatelink;"

# Run migrations
pnpm prisma:generate
pnpm prisma:migrate
```

**4. Build Paywall**
```bash
pnpm build:paywall
```

**5. Start Server**
```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

Server runs at: **http://localhost:3000**

## 📡 API Endpoints

### Links Management

**Create Link**
```http
POST /api/links
Content-Type: multipart/form-data

{
  "wallet": "ALGORAND_ADDRESS",
  "price": "0.50",
  "contentType": "FILE" | "URL",
  "network": "algorand-testnet",
  "file": <file> (if FILE),
  "url": "https://..." (if URL)
}

Response: 201 Created
{
  "id": "uuid",
  "creatorWallet": "...",
  "contentType": "FILE",
  "price": "0.50",
  "network": "algorand-testnet",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Get Links by Wallet**
```http
GET /api/links?wallet=ALGORAND_ADDRESS

Response: 200 OK
[
  {
    "id": "uuid",
    "creatorWallet": "...",
    "contentType": "FILE",
    "contentPath": "filename.pdf",
    "price": "0.50",
    "network": "algorand-testnet",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "totalEarnings": "5.00",
    "paymentCount": 10
  }
]
```

**Get Link Details**
```http
GET /api/links/:linkId

Response: 200 OK
{
  "id": "uuid",
  "creatorWallet": "...",
  "contentType": "FILE",
  "contentPath": "filename.pdf",
  "price": "0.50",
  "network": "algorand-testnet",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "totalEarnings": "5.00",
  "paymentCount": 10
}
```

### Analytics

**Get Link Analytics**
```http
GET /api/links/:linkId/analytics

Response: 200 OK
{
  "link": { ... },
  "stats": {
    "totalEarnings": "5.00",
    "paymentCount": 10,
    "averagePayment": "0.50"
  },
  "payments": [
    {
      "id": "uuid",
      "payerAddress": "...",
      "amount": "0.50",
      "txnId": "...",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "chartData": [
    { "date": "2024-01-01", "amount": "2.50" }
  ]
}
```

**Get Payment History**
```http
GET /api/links/:linkId/payments

Response: 200 OK
[
  {
    "id": "uuid",
    "payerAddress": "...",
    "amount": "0.50",
    "txnId": "...",
    "txnGroupId": "...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

### Payment Routes

**Access Protected Content**
```http
GET /pay/:linkId
X-PAYMENT: <base64-encoded-payment-payload>

Response: 200 OK (with content)
or
Response: 402 Payment Required (with paywall HTML)
```

### Health Check

```http
GET /health

Response: 200 OK
{
  "status": "ok"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `FACILITATOR_MNEMONIC` | 25-word Algorand mnemonic | Yes | - |
| `PORT` | Server port | No | 3000 |
| `DATABASE_URL` | MySQL connection string | Yes | - |
| `NODE_ENV` | Environment mode | No | development |

### Database Configuration

**Connection String Format:**
```
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Examples:**
```env
# Local MySQL (no password)
DATABASE_URL="mysql://root:@localhost:3306/gatelink"

# Local MySQL (with password)
DATABASE_URL="mysql://root:password123@localhost:3306/gatelink"

# Remote MySQL
DATABASE_URL="mysql://user:pass@db.example.com:3306/gatelink"
```

### Algorand Configuration

The facilitator automatically connects to:
- **TestNet**: https://testnet-api.algonode.cloud
- **MainNet**: https://mainnet-api.algonode.cloud

Network is determined by the `network` field in link creation.

## 🗄️ Database Schema

```prisma
model Link {
  id            String    @id @default(uuid())
  creatorWallet String    @db.VarChar(58)
  contentType   String    // "FILE" or "URL"
  contentPath   String?   @db.Text
  price         Decimal   @db.Decimal(18, 6)
  network       String    @db.VarChar(20)
  assetId       BigInt
  decimals      Int       @default(6)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  payments      Payment[]
}

model Payment {
  id           String   @id @default(uuid())
  linkId       String
  payerAddress String   @db.VarChar(58)
  amount       Decimal  @db.Decimal(18, 6)
  txnId        String?  @db.VarChar(52)
  txnGroupId   String?  @db.VarChar(52)
  timestamp    DateTime @default(now())
  link         Link     @relation(fields: [linkId], references: [id], onDelete: Cascade)
}
```

## 🔐 X402 Payment Flow

### 1. Request Without Payment
```
Client → GET /pay/:linkId
Server → 402 Payment Required + paymentRequirements
```

### 2. Payment Construction
```javascript
{
  "scheme": "exact",
  "network": "algorand-testnet",
  "maxAmountRequired": "500000", // 0.50 USDC (6 decimals)
  "payTo": "CREATOR_ADDRESS",
  "asset": "10458941", // TestNet USDC
  "extra": {
    "feePayer": "FACILITATOR_ADDRESS"
  }
}
```

### 3. Request With Payment
```
Client → GET /pay/:linkId
         X-PAYMENT: <signed-transaction-group>
Server → Verify → Deliver Content → Settle
```

### 4. Verification Steps
1. Decode transaction group
2. Validate payment amount and recipient
3. Check facilitator fee transaction
4. Simulate transaction on Algorand node
5. Return verification result

### 5. Settlement
1. Submit transaction group to Algorand
2. Wait for confirmation (instant finality)
3. Record payment in database
4. Return transaction ID

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start with hot reload

# Building
pnpm build            # Build TypeScript
pnpm build:paywall    # Build paywall UI

# Production
pnpm start            # Run production build

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open DB GUI (port 5555)

# Testing
pnpm test             # Run tests (if configured)
```

### Project Structure

**Core Files:**
- `src/index.ts` - Server entry point, middleware setup
- `src/db.ts` - Prisma client singleton
- `src/facilitator/index.ts` - Payment verification & settlement
- `src/middleware/index.ts` - X402 middleware implementation

**API Routes:**
- `src/api/links.ts` - Link CRUD operations
- `src/api/payments.ts` - Payment queries
- `src/routes/pay.ts` - Dynamic payment route

**Utilities:**
- `src/utils/upload.ts` - Multer file upload config
- `src/middleware/helpers.ts` - Helper functions
- `src/middleware/types.ts` - TypeScript definitions

## 🧪 Testing

### Manual Testing

**1. Health Check**
```bash
curl http://localhost:3000/health
```

**2. Create Link**
```bash
curl -X POST http://localhost:3000/api/links \
  -F "wallet=YOUR_ALGORAND_ADDRESS" \
  -F "price=0.50" \
  -F "contentType=URL" \
  -F "url=https://example.com" \
  -F "network=algorand-testnet"
```

**3. Get Links**
```bash
curl "http://localhost:3000/api/links?wallet=YOUR_ALGORAND_ADDRESS"
```

**4. Access Payment Link**
```bash
curl http://localhost:3000/pay/LINK_ID
```

### Database Testing

**View Data:**
```bash
pnpm prisma:studio
```
Access at: http://localhost:5555

**Reset Database:**
```bash
pnpm prisma migrate reset
```

## 🐛 Troubleshooting

### Database Issues

**Connection Failed:**
```bash
# Check MySQL is running
mysql -u root -e "SELECT 1;"

# Verify database exists
mysql -u root -e "SHOW DATABASES LIKE 'gatelink';"

# Create if missing
mysql -u root -e "CREATE DATABASE gatelink;"
```

**Migration Errors:**
```bash
# Reset and re-run
pnpm prisma migrate reset
pnpm prisma:generate
pnpm prisma:migrate
```

### Algorand Issues

**Facilitator Account:**
- Ensure account has TestNet ALGO (min 1 ALGO)
- Get from: https://bank.testnet.algorand.network
- Check balance on: https://testnet.algoexplorer.io

**Transaction Failures:**
- Verify asset ID matches network (TestNet: 10458941)
- Check payer opted into USDC asset
- Ensure sufficient balance for payment + fees

### File Upload Issues

**Upload Directory:**
```bash
# Create if missing
mkdir -p uploads

# Check permissions
chmod 755 uploads
```

**File Size Limits:**
Edit `src/utils/upload.ts`:
```typescript
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
```

## 📦 Dependencies

### Core
- `express` - Web framework
- `@prisma/client` - Database ORM
- `algosdk` - Algorand SDK
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `multer` - File upload handling

### Development
- `typescript` - Type safety
- `ts-node-dev` - Development server
- `prisma` - Database toolkit
- `@types/*` - TypeScript definitions

## 🔒 Security

### Best Practices
- ✅ Never expose facilitator mnemonic
- ✅ Validate all user inputs
- ✅ Use parameterized database queries (Prisma)
- ✅ Implement rate limiting (recommended)
- ✅ Use HTTPS in production
- ✅ Sanitize file uploads
- ✅ Validate Algorand addresses
- ✅ Check transaction simulation before settlement

### Production Checklist
- [ ] Change facilitator to MainNet account
- [ ] Update asset ID to MainNet USDC (31566704)
- [ ] Enable CORS for production domains
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Backup database regularly
- [ ] Use environment-specific configs

## 📝 License

MIT License

## 🔗 Links

- **Main Repository**: https://github.com/KerithPaul/GateLink
- **X402 Protocol**: https://402.wtf
- **Algorand Docs**: https://developer.algorand.org
- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com

---

**Part of the GateLink project** - Monetize content with Algorand payments
