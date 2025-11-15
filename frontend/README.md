# GateLink Frontend

React + TypeScript frontend application for content monetization with Algorand payments.

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   ├── WalletProvider.tsx        # Wallet context
│   │   └── WalletConnectModal.tsx    # Wallet connection UI
│   ├── pages/            # Route pages
│   │   ├── Home.tsx      # Landing page
│   │   ├── Upload.tsx    # Content upload page
│   │   ├── Dashboard.tsx # Creator dashboard
│   │   ├── LinkAnalytics.tsx  # Analytics page
│   │   ├── Protected.tsx # Demo protected route
│   │   └── NotFound.tsx  # 404 page
│   ├── services/         # API services
│   │   └── api.ts        # Backend API client
│   ├── hooks/            # Custom React hooks
│   │   ├── use-toast.ts  # Toast notifications
│   │   └── use-mobile.tsx # Mobile detection
│   ├── lib/              # Utilities
│   │   └── utils.ts      # Helper functions
│   ├── assets/           # Static assets
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Public assets
├── .env                  # Environment variables
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS config
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- pnpm v10.14.0+
- Backend server running

### Installation

**1. Install Dependencies**
```bash
cd frontend
pnpm install
```

**2. Configure Environment**

Create `.env` file:
```env
# Backend API URL
VITE_API_URL="http://localhost:3000"
```

**3. Start Development Server**
```bash
pnpm dev
```

Application runs at: **http://localhost:8080**

## 🎨 Features

### Pages

**Home (`/`)**
- Landing page with hero section
- Feature showcase
- How it works guide
- Call-to-action sections

**Upload (`/upload`)**
- File upload interface
- URL link input
- Price configuration
- Network selection (TestNet/MainNet)
- Wallet connection required

**Dashboard (`/dashboard`)**
- View all created links
- Earnings summary
- Payment count
- Quick actions (copy link, view analytics)
- Wallet connection required

**Link Analytics (`/analytics/:linkId`)**
- Detailed earnings data
- Payment history table
- Daily earnings chart
- Transaction details
- Payer addresses

**Protected (`/protected`)**
- Demo X402 protected route
- Shows payment flow
- For testing purposes

### Components

**Navbar**
- Logo and branding
- Navigation links
- Wallet connection button
- Responsive mobile menu

**WalletProvider**
- Algorand wallet integration
- Supports Pera, Defly, Lute wallets
- Network configuration (TestNet/MainNet)
- Wallet state management

**WalletConnectModal**
- Wallet selection UI
- Connection status
- Error handling
- Responsive design

**UI Components (shadcn/ui)**
- Button, Card, Input, Label
- Dialog, Toast, Tooltip
- Table, Tabs, Select
- And more...

## 🔌 API Integration

### API Client (`src/services/api.ts`)

**Create Link**
```typescript
import { api } from '@/services/api';

const link = await api.createLink({
  wallet: 'ALGORAND_ADDRESS',
  price: '0.50',
  contentType: 'FILE',
  file: fileObject,
  network: 'algorand-testnet'
});
```

**Get Links**
```typescript
const links = await api.getLinks('ALGORAND_ADDRESS');
```

**Get Analytics**
```typescript
const analytics = await api.getLinkAnalytics('linkId');
```

**Get Payments**
```typescript
const payments = await api.getLinkPayments('linkId');
```

### Error Handling

```typescript
try {
  const links = await api.getLinks(wallet);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.message, error.status);
  }
}
```

## 🎨 Styling

### Tailwind CSS

**Configuration** (`tailwind.config.ts`):
- Custom color palette
- Typography plugin
- Animation utilities
- Responsive breakpoints

**Custom Classes:**
```css
.bg-gradient-hero      /* Hero section gradient */
.bg-gradient-primary   /* Primary gradient */
.bg-gradient-card      /* Card gradient */
.text-gradient-primary /* Text gradient */
```

### Theme

**Colors:**
- Primary: Purple/Blue gradient
- Accent: Cyan
- Background: Dark theme
- Muted: Gray tones

**Fonts:**
- System font stack
- Optimized for readability

## 🔗 Wallet Integration

### Supported Wallets

1. **Pera Wallet**
   - Mobile and web
   - WalletConnect support
   - Most popular Algorand wallet

2. **Defly Wallet**
   - Mobile and browser extension
   - Advanced features
   - DeFi focused

3. **Lute Wallet**
   - Browser extension
   - Developer friendly
   - TestNet support

### Wallet Configuration

**Provider Setup** (`src/components/WalletProvider.tsx`):
```typescript
const walletManager = new WalletManager({
  wallets: [
    PeraWallet,
    DeflyWallet,
    LuteWallet
  ],
  network: NetworkId.TESTNET // or NetworkId.MAINNET
});
```

### Usage in Components

```typescript
import { useWallet } from '@txnlab/use-wallet-react';

function MyComponent() {
  const { activeAccount, providers, signTransactions } = useWallet();
  
  // Check if connected
  if (!activeAccount) {
    return <div>Please connect wallet</div>;
  }
  
  // Use wallet address
  const address = activeAccount.address;
  
  // Sign transactions
  const signedTxns = await signTransactions(txnGroup);
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (port 8080)

# Building
pnpm build            # Production build
pnpm build:dev        # Development build

# Preview
pnpm preview          # Preview production build

# Linting
pnpm lint             # Run ESLint
```

### Development Server

**Configuration** (`vite.config.ts`):
```typescript
{
  server: {
    host: "::",
    port: 8080,
  }
}
```

**Features:**
- Hot Module Replacement (HMR)
- Fast refresh
- TypeScript support
- Path aliases (`@/`)

### Building for Production

```bash
pnpm build
```

**Output:**
- `dist/` directory
- Optimized assets
- Code splitting
- Minified bundles

**Deploy `dist/` to:**
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting

## 📱 Responsive Design

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile Optimization

- Responsive navigation
- Touch-friendly buttons
- Mobile wallet support
- Optimized images
- Fast loading

## 🧪 Testing

### Manual Testing

**1. Start Backend**
```bash
cd backend
pnpm dev
```

**2. Start Frontend**
```bash
cd frontend
pnpm dev
```

**3. Test Flows**

**Upload Flow:**
1. Navigate to `/upload`
2. Connect wallet
3. Upload file or enter URL
4. Set price
5. Create link
6. Copy payment link

**Dashboard Flow:**
1. Navigate to `/dashboard`
2. Connect wallet
3. View created links
4. Click analytics
5. View earnings and payments

**Payment Flow:**
1. Open payment link (`/pay/:linkId`)
2. See paywall
3. Connect wallet
4. Approve payment
5. Access content

## 🐛 Troubleshooting

### Common Issues

**1. Wallet Connection Failed**
```
Error: Failed to connect wallet
```
**Solution:**
- Ensure wallet extension is installed
- Check wallet is on correct network (TestNet)
- Try different wallet provider
- Clear browser cache

**2. API Connection Error**
```
Error: Failed to fetch
```
**Solution:**
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Check CORS configuration in backend
- Verify network connectivity

**3. Build Errors**
```
Error: Cannot find module '@/...'
```
**Solution:**
- Check `tsconfig.json` paths configuration
- Verify `vite.config.ts` alias setup
- Run `pnpm install` again

**4. Wallet Not Detected**
```
Wallet provider not found
```
**Solution:**
- Install wallet extension/app
- Refresh page after installation
- Check browser compatibility
- Try different browser

### Development Tips

**Hot Reload Issues:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
pnpm dev
```

**TypeScript Errors:**
```bash
# Regenerate types
pnpm build

# Check for errors
npx tsc --noEmit
```

## 📦 Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching
- `@txnlab/use-wallet-react` - Wallet integration

### UI Components
- `@radix-ui/*` - Headless UI primitives
- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icon library
- `recharts` - Charts library
- `sonner` - Toast notifications

### Wallet Providers
- `@perawallet/connect` - Pera Wallet
- `@blockshake/defly-connect` - Defly Wallet
- `lute-connect` - Lute Wallet

### Development
- `vite` - Build tool
- `typescript` - Type safety
- `eslint` - Linting
- `@vitejs/plugin-react-swc` - React plugin

## 🎯 Best Practices

### Code Organization
- ✅ Component-based architecture
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Custom hooks for logic
- ✅ Type-safe API calls

### Performance
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Bundle size optimization
- ✅ React Query caching

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management

### Security
- ✅ Input validation
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Secure wallet integration
- ✅ Environment variables

## 🚀 Deployment

### Environment Variables

**Development:**
```env
VITE_API_URL="http://localhost:3000"
```

**Production:**
```env
VITE_API_URL="https://api.yourdomain.com"
```

### Build & Deploy

**1. Build**
```bash
pnpm build
```

**2. Test Build**
```bash
pnpm preview
```

**3. Deploy**

**Vercel:**
```bash
vercel deploy
```

**Netlify:**
```bash
netlify deploy --prod
```

**Manual:**
- Upload `dist/` folder to hosting
- Configure redirects for SPA routing
- Set environment variables

### SPA Routing

**Netlify** (`_redirects`):
```
/*    /index.html   200
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## 📝 License

MIT License

## 🔗 Links

- **Main Repository**: https://github.com/KerithPaul/GateLink
- **Backend README**: ../backend/README.md
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com

---

**Part of the GateLink project** - Monetize content with Algorand payments
