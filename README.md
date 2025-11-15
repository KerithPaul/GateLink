# GateLink - Monetize Content with Algorand Payments

[![GitHub](https://img.shields.io/badge/GitHub-KerithPaul%2FGateLink-blue?logo=github)](https://github.com/KerithPaul/GateLink)
[![Algorand](https://img.shields.io/badge/Blockchain-Algorand-black?logo=algorand)](https://algorand.com)
[![X402 Protocol](https://img.shields.io/badge/Protocol-X402-green)](https://402.wtf)

GateLink is a full-stack Web3 application that enables creators to monetize their content through blockchain-based payments using the X402 protocol on Algorand. Upload files or share URLs, set a price, and get paid instantly when users access your content.

## 🌟 Overview

GateLink combines the power of Algorand blockchain with a modern web interface to create a seamless content monetization platform. Built on the X402 payment protocol, it provides instant, gasless transactions with minimal fees.

### Key Features

- ✅ **Instant Payments** - Get paid immediately via Algorand blockchain with instant finality
- ✅ **Gasless Transactions** - Users don't need ALGO for transaction fees (facilitator covers them)
- ✅ **Flexible Content** - Support for both file uploads and external URL links
- ✅ **Real-time Analytics** - Track earnings, payment history, and performance metrics
- ✅ **Web3 Wallet Integration** - Connect with Pera Wallet, Defly, and Lute wallets
- ✅ **Creator Dashboard** - Manage all your payment links in one place
- ✅ **Low Fees** - Minimal transaction costs thanks to Algorand's efficient blockchain

## 🔗 Important Links

- **GitHub Repository**: https://github.com/KerithPaul/GateLink
- **X402 Protocol Specification**: https://402.wtf
- **Algorand Developer Portal**: https://developer.algorand.org
- **Algorand TestNet Explorer**: https://testnet.algoexplorer.io
- **Lora (Algorand IDE)**: https://lora.algokit.io
- **TestNet Faucet**: https://bank.testnet.algorand.network

## 🏗️ Project Architecture

```
GateLink/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components (shadcn/ui)
│   │   ├── pages/         # Route pages (Home, Upload, Dashboard, Analytics)
│   │   ├── services/      # API client for backend communication
│   │   └── hooks/         # Custom React hooks
│   └── package.json
│
├── backend/               # Express + TypeScript + Prisma
│   ├── src/
│   │   ├── api/           # REST API endpoints (links, payments)
│   │   ├── middleware/    # X402 payment middleware
│   │   ├── facilitator/   # Payment verification & settlement
│   │   ├── routes/        # Dynamic payment routes
│   │   └── utils/         # File upload utilities
│   ├── prisma/            # Database schema & migrations
│   ├── paywall/           # React paywall UI
│   └── package.json
│
└── README.md              # This file
```

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **pnpm** v10.14.0+ ([Install](https://pnpm.io/installation))
- **MySQL** v8.0+ ([Download](https://dev.mysql.com/downloads/))
- **Algorand Wallet** with TestNet tokens:
  - [Pera Wallet](https://perawallet.app)
  - [Defly Wallet](https://defly.app)
  - [Lute Wallet](https://lute.app)

### Step-by-Step Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/KerithPaul/GateLink.git
cd GateLink
```

#### 2️⃣ Backend Setup

**Install Dependencies:**
```bash
cd backend
pnpm install
pnpm --filter paywall install
```

**Create Environment File:**

Create `backend/.env` with the following content:

```env
# Algorand Facilitator Account (25-word mnemonic)
# This account will pay transaction fees for gasless transactions
# IMPORTANT: Fund this account with TestNet ALGO
FACILITATOR_MNEMONIC="your 25-word mnemonic phrase here"

# Server Port
PORT=3000

# MySQL Database Connection
DATABASE_URL="mysql://root:@localhost:3306/gatelink"
```

**Create MySQL Database:**
```bash
# Option 1: Using MySQL CLI
mysql -u root -e "CREATE DATABASE gatelink;"

# Option 2: Using MySQL Workbench or phpMyAdmin
# Create a database named "gatelink"
```

**Run Database Migrations:**
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

**Build Paywall UI:**
```bash
pnpm build:paywall
```

**Start Backend Server:**
```bash
pnpm dev
```

Backend will run at: **http://localhost:3000**

#### 3️⃣ Frontend Setup

Open a new terminal window:

**Install Dependencies:**
```bash
cd frontend
pnpm install
```

**Create Environment File:**

Create `frontend/.env` with the following content:

```env
# Backend API URL
VITE_API_URL="http://localhost:3000"
```

**Start Frontend Server:**
```bash
pnpm dev
```

Frontend will run at: **http://localhost:8080**

#### 4️⃣ Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🌐 Algorand TestNet Configuration

### Network Information

| Parameter | Value |
|-----------|-------|
| **Network Name** | Algorand TestNet |
| **Network ID** | `algorand-testnet` |
| **Node URL** | https://testnet-api.algonode.cloud |
| **Explorer** | https://testnet.algoexplorer.io |
| **Faucet** | https://bank.testnet.algorand.network |

### TestNet Asset Information

| Asset | Details |
|-------|---------|
| **Asset Name** | USDC (TestNet) |
| **Asset ID** | `10458941` |
| **Decimals** | 6 |
| **Symbol** | USDC |
| **Type** | Algorand Standard Asset (ASA) |

### Getting TestNet Tokens

**1. Get TestNet ALGO (for transaction fees):**
- Visit: https://bank.testnet.algorand.network
- Enter your Algorand address
- Click "Dispense" to receive 10 ALGO
- Wait for confirmation

**2. Get TestNet USDC (for payments):**
- Use TestNet USDC dispenser
- Asset ID: `10458941`
- Or swap TestNet ALGO for USDC on TestNet DEX

**3. Opt-in to USDC Asset:**
Your wallet must opt-in to receive USDC:
- Open your wallet (Pera/Defly/Lute)
- Search for Asset ID: `10458941`
- Click "Add Asset" or "Opt-in"

### Facilitator Account Setup

The facilitator account pays transaction fees for gasless transactions.

**Create a New Wallet:**
```bash
# Using Algorand SDK (Node.js)
node -e "const algosdk = require('algosdk'); const account = algosdk.generateAccount(); console.log('Address:', account.addr); console.log('Mnemonic:', algosdk.secretKeyToMnemonic(account.sk));"
```

**Or use a wallet app:**
- Create a new account in Pera/Defly/Lute Wallet
- Export the 25-word mnemonic phrase
- Add it to `backend/.env` as `FACILITATOR_MNEMONIC`

**Fund the Facilitator Account:**
- Get TestNet ALGO from: https://bank.testnet.algorand.network
- Minimum recommended: 10 ALGO

### Example TestNet Addresses

**Facilitator Account (Example - DO NOT use in production):**
```
Address: SATISHQOPKE5WFYSLDMUTDBTWMH25LEJFOHVUEVOU3WXS2ZCFJGYIAVXME
Network: Algorand TestNet
Purpose: Fee payer for gasless transactions
```

**View on Explorer:**
https://testnet.algoexplorer.io/address/SATISHQOPKE5WFYSLDMUTDBTWMH25LEJFOHVUEVOU3WXS2ZCFJGYIAVXME

## 🔧 Smart Contract Deployment

### No Smart Contracts Required! 🎉

GateLink uses **Algorand Standard Assets (ASA)** and **Atomic Transfers**, which are **native Algorand protocol features**. No smart contract deployment is needed!

### What We Use Instead:

1. **Algorand Standard Assets (ASA)**
   - Native token standard on Algorand
   - No contract deployment required
   - USDC is an ASA (Asset ID: 10458941 on TestNet)

2. **Atomic Transfers**
   - Native Algorand feature
   - Groups up to 16 transactions
   - All-or-nothing execution
   - No contract needed

3. **Transaction Simulation**
   - Via Algorand node API
   - Pre-validates transactions
   - Built into the protocol

### Lora IDE Resources

For Algorand development and testing:

- **Lora IDE**: https://lora.algokit.io
  - Web-based Algorand IDE
  - Test smart contracts
  - Interact with TestNet

- **AlgoKit**: https://github.com/algorandfoundation/algokit-cli
  - CLI tool for Algorand development
  - Project scaffolding
  - Local network management

- **Algorand Sandbox**: https://github.com/algorand/sandbox
  - Local Algorand network
  - For testing and development

## 📖 How It Works

### For Content Creators

1. **Connect Wallet** → Connect your Algorand wallet (Pera, Defly, or Lute)
2. **Upload Content** → Upload a file or provide an external URL
3. **Set Price** → Choose your price in USD (converted to USDC)
4. **Share Link** → Get a unique payment link: `http://localhost:8080/pay/{linkId}`
5. **Get Paid** → Receive instant payments when users access your content

### For Content Consumers

1. **Click Link** → Access a GateLink payment link
2. **See Paywall** → View payment requirements and price
3. **Connect Wallet** → Connect your Algorand wallet
4. **Pay & Access** → Complete payment and instantly access content

### Technical Flow (X402 Protocol)

```
┌─────────┐                ┌─────────┐                ┌─────────────┐
│  User   │                │ Server  │                │ Facilitator │
└────┬────┘                └────┬────┘                └──────┬──────┘
     │                          │                            │
     │  1. Request Content      │                            │
     ├─────────────────────────>│                            │
     │                          │                            │
     │  2. 402 Payment Required │                            │
     │<─────────────────────────┤                            │
     │                          │                            │
     │  3. Construct Txn Group  │                            │
     │  & Sign Transactions     │                            │
     │                          │                            │
     │  4. Resend with Payment  │                            │
     ├─────────────────────────>│                            │
     │                          │  5. Verify Payment         │
     │                          ├───────────────────────────>│
     │                          │                            │
     │                          │  6. Simulate Txn           │
     │                          │<───────────────────────────┤
     │                          │                            │
     │  7. Deliver Content      │                            │
     │<─────────────────────────┤                            │
     │                          │  8. Settle Payment         │
     │                          ├───────────────────────────>│
     │                          │                            │
     │                          │  9. Txn Confirmed          │
     │                          │<───────────────────────────┤
     │                          │                            │
```

**Detailed Steps:**

1. User requests protected content → Server responds with `402 Payment Required`
2. Client constructs Algorand atomic transaction group
3. Client signs their transactions
4. Client resends request with `X-PAYMENT` header containing signed transactions
5. Facilitator verifies payment (amount, recipient, asset)
6. Facilitator simulates transaction to ensure validity
7. Server delivers content to user
8. Facilitator settles payment on Algorand blockchain
9. Payment recorded in database with instant finality

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query** - Data fetching and caching
- **React Router** - Client-side routing
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **@txnlab/use-wallet-react** - Algorand wallet integration
- **Recharts** - Analytics charts

### Backend
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM and database migrations
- **MySQL** - Relational database
- **Algorand SDK** - Blockchain integration
- **Multer** - File upload handling
- **Zod** - Schema validation

### Blockchain
- **Algorand** - Layer 1 blockchain
- **X402 Protocol** - Payment standard
- **Algorand Standard Assets (ASA)** - USDC token
- **Atomic Transfers** - Transaction grouping

## 📊 Database Schema

```prisma
model Link {
  id            String    @id @default(uuid())
  creatorWallet String    @db.VarChar(58)      // Algorand address
  contentType   String                          // "FILE" or "URL"
  contentPath   String?   @db.Text             // File path or external URL
  price         Decimal   @db.Decimal(18, 6)   // Price in USD
  network       String    @db.VarChar(20)      // "algorand" or "algorand-testnet"
  assetId       BigInt                          // ASA ID (USDC)
  decimals      Int       @default(6)          // Asset decimals
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  payments      Payment[]
}

model Payment {
  id           String   @id @default(uuid())
  linkId       String                           // Reference to Link
  payerAddress String   @db.VarChar(58)        // Payer's Algorand address
  amount       Decimal  @db.Decimal(18, 6)     // Amount paid in USD
  txnId        String?  @db.VarChar(52)        // Algorand transaction ID
  txnGroupId   String?  @db.VarChar(52)        // Transaction group ID
  timestamp    DateTime @default(now())
  link         Link     @relation(fields: [linkId], references: [id], onDelete: Cascade)
}
```

## 📈 API Endpoints

### Links Management
- `POST /api/links` - Create new payment link
- `GET /api/links?wallet={address}` - Get all links for a wallet
- `GET /api/links/:linkId` - Get specific link details

### Analytics
- `GET /api/links/:linkId/analytics` - Get link analytics (earnings, charts)
- `GET /api/links/:linkId/payments` - Get payment history

### Payment Routes
- `GET /pay/:linkId` - Dynamic payment route (X402 protected)

### Health Check
- `GET /health` - Server health check

## 🧪 Development Commands

### Backend
```bash
cd backend
pnpm dev              # Start dev server with hot reload (port 3000)
pnpm build            # Build TypeScript to JavaScript
pnpm start            # Run production build
pnpm prisma:studio    # Open Prisma Studio (DB GUI on port 5555)
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run database migrations
pnpm build:paywall    # Build paywall UI
```

### Frontend
```bash
cd frontend
pnpm dev              # Start dev server (port 8080)
pnpm build            # Build for production
pnpm build:dev        # Build in development mode
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
```

### Database Management

**View Database with Prisma Studio:**
```bash
cd backend
pnpm prisma:studio
```
Access at: http://localhost:5555

**Reset Database:**
```bash
cd backend
pnpm prisma migrate reset
```

**Create New Migration:**
```bash
cd backend
pnpm prisma migrate dev --name your_migration_name
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: Can't reach database server at `localhost:3306`
```
**Solution**: Ensure MySQL is running:
```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

**2. Prisma Client Not Generated**
```
Error: @prisma/client did not initialize yet
```
**Solution**: Generate Prisma client:
```bash
cd backend
pnpm prisma:generate
```

**3. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Kill the process or change the port in `.env`
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**4. Wallet Connection Issues**
- Ensure you're on **TestNet** in your wallet settings
- Clear browser cache and reconnect wallet
- Try a different wallet provider (Pera/Defly/Lute)

**5. Payment Verification Failed**
- Ensure facilitator account has sufficient ALGO for fees (min 1 ALGO)
- Check that the asset ID matches the network (TestNet: 10458941)
- Verify the payer has opted into the USDC asset
- Check transaction on explorer: https://testnet.algoexplorer.io

**6. File Upload Issues**
- Check `backend/uploads/` directory exists and is writable
- Verify file size limits in `backend/src/utils/upload.ts`
- Check disk space

## 🌐 Deployment

### Backend Deployment

**1. Set Production Environment Variables**
```env
FACILITATOR_MNEMONIC="your production mainnet mnemonic"
PORT=3000
DATABASE_URL="mysql://user:password@production-host:3306/gatelink"
NODE_ENV=production
```

**2. Run Database Migrations**
```bash
cd backend
pnpm prisma:migrate deploy
```

**3. Build Application**
```bash
cd backend
pnpm build:paywall
pnpm build
```

**4. Start Production Server**
```bash
cd backend
pnpm start
```

### Frontend Deployment

**1. Set Production Environment Variables**
```env
VITE_API_URL="https://api.yourdomain.com"
```

**2. Build for Production**
```bash
cd frontend
pnpm build
```

**3. Deploy `dist/` folder** to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Environment Considerations

| Environment | Network | Asset ID | Node URL |
|-------------|---------|----------|----------|
| **Development** | `algorand-testnet` | `10458941` | https://testnet-api.algonode.cloud |
| **Production** | `algorand` | `31566704` | https://mainnet-api.algonode.cloud |

**Important**:
- Use **MainNet** for production (`network: "algorand"`)
- Use **TestNet** for development (`network: "algorand-testnet"`)
- Ensure facilitator account is funded on the target network
- Configure CORS for production domains
- Never commit `.env` files with real mnemonics to Git

## 🔐 Security Best Practices

- ✅ Never commit `.env` files with real mnemonics
- ✅ Use environment variables for sensitive data
- ✅ Keep your facilitator account secure
- ✅ Regularly update dependencies
- ✅ Use TestNet for development and testing
- ✅ Validate all user inputs
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Monitor transaction logs

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- **GitHub Issues**: https://github.com/KerithPaul/GateLink/issues
- **X402 Protocol**: https://402.wtf
- **Algorand Docs**: https://developer.algorand.org
- **Algorand Discord**: https://discord.gg/algorand

## 🙏 Acknowledgments

- Built on the **X402 Protocol** specification
- **Algorand blockchain** for instant finality and low fees
- **@nullun** and team for the `exact` scheme implementation
- **shadcn/ui** for beautiful UI components
- **TxnLab** for Algorand wallet integration
- **Prisma** for database ORM
- **Vite** for blazing fast frontend tooling

## 📚 Additional Resources

- **X402 Protocol Spec**: https://402.wtf
- **Algorand Developer Portal**: https://developer.algorand.org
- **Algorand SDK Documentation**: https://developer.algorand.org/docs/sdks/
- **Prisma Documentation**: https://www.prisma.io/docs
- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **TestNet Explorer**: https://testnet.algoexplorer.io
- **Lora IDE**: https://lora.algokit.io

## 📊 Project Status

- ✅ Core payment functionality
- ✅ File upload support
- ✅ URL link support
- ✅ Analytics dashboard
- ✅ Multi-wallet support
- ✅ Gasless transactions
- 🚧 QR code generation (planned)
- 🚧 Mobile app (planned)
- 🚧 Multi-asset support (planned)

---

**Made with ❤️ for the Web3 creator economy**

**Repository**: https://github.com/KerithPaul/GateLink
