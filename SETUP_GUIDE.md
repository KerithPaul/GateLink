# GateLink - Complete Setup Guide

Quick reference guide for setting up and running GateLink locally.

## 📋 Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] pnpm v10.14.0+ installed
- [ ] MySQL v8.0+ installed and running
- [ ] Algorand wallet (Pera/Defly/Lute) with TestNet access
- [ ] Git installed

## 🚀 Quick Setup (5 Minutes)

### Step 1: Clone Repository
```bash
git clone https://github.com/KerithPaul/GateLink.git
cd GateLink
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
pnpm install
pnpm --filter paywall install

# Create .env file
cat > .env << EOF
FACILITATOR_MNEMONIC="your 25-word mnemonic phrase here"
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/gatelink"
EOF

# Create database
mysql -u root -e "CREATE DATABASE gatelink;"

# Run migrations
pnpm prisma:generate
pnpm prisma:migrate

# Build paywall
pnpm build:paywall

# Start server
pnpm dev
```

### Step 3: Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
pnpm install

# Create .env file
cat > .env << EOF
VITE_API_URL="http://localhost:3000"
EOF

# Start server
pnpm dev
```

### Step 4: Access Application
- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- Health Check: http://localhost:3000/health

## 🌐 TestNet Configuration

### Get TestNet Tokens

**1. ALGO (for fees):**
- Visit: https://bank.testnet.algorand.network
- Enter your address
- Click "Dispense"

**2. USDC (for payments):**
- Asset ID: `10458941`
- Get from TestNet faucet or DEX

### Important TestNet Info

| Item | Value |
|------|-------|
| Network | `algorand-testnet` |
| USDC Asset ID | `10458941` |
| Node URL | https://testnet-api.algonode.cloud |
| Explorer | https://testnet.algoexplorer.io |

## 🔑 Environment Variables

### Backend (.env)
```env
FACILITATOR_MNEMONIC="word1 word2 ... word25"
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/gatelink"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000"
```

## 🧪 Testing the Application

### 1. Create a Payment Link
1. Go to http://localhost:8080/upload
2. Connect your wallet
3. Upload a file or enter URL
4. Set price (e.g., 0.50)
5. Click "Create Link"
6. Copy the generated link

### 2. Test Payment Flow
1. Open the payment link in a new browser/incognito
2. You'll see the paywall
3. Connect a different wallet (payer)
4. Approve the payment
5. Access the content

### 3. View Analytics
1. Go to http://localhost:8080/dashboard
2. Connect your wallet
3. Click on a link
4. View earnings and payment history

## 🐛 Common Issues & Solutions

### Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -e "SELECT 1;"

# Create database if missing
mysql -u root -e "CREATE DATABASE gatelink;"
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Error
```bash
cd backend
pnpm prisma:generate
```

### Wallet Connection Issues
- Ensure wallet is on TestNet
- Clear browser cache
- Try different wallet provider

## 📚 Additional Resources

- **Full Documentation**: See README.md files in root, backend, and frontend
- **X402 Protocol**: https://402.wtf
- **Algorand Docs**: https://developer.algorand.org
- **TestNet Explorer**: https://testnet.algoexplorer.io
- **Lora IDE**: https://lora.algokit.io

## 🔗 Important Links

- **Repository**: https://github.com/KerithPaul/GateLink
- **TestNet Faucet**: https://bank.testnet.algorand.network
- **Pera Wallet**: https://perawallet.app
- **Defly Wallet**: https://defly.app
- **Lute Wallet**: https://lute.app

## 📞 Need Help?

- Check the detailed README files
- Open an issue on GitHub
- Review Algorand documentation
- Join Algorand Discord

---

**Ready to monetize your content!** 🚀
