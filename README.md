# Crypto Wallet Application

A secure web-based cryptocurrency wallet application built with React, Node.js, and Ethereum Web3.js. This application allows users to create wallets, track balances, and send/receive cryptocurrency with features like private key encryption and MetaMask integration.

## Features

- 🔐 **Secure Wallet Creation**: Generate new Ethereum wallets with encrypted private key storage
- 💰 **Balance Tracking**: Real-time balance display for Ethereum addresses
- 📤 **Send Transactions**: Send ETH to any address with transaction confirmation
- 📥 **Receive Transactions**: View incoming transactions and transaction history
- 🔒 **Private Key Encryption**: Private keys are encrypted before storage
- 🦊 **MetaMask Integration**: Connect and use MetaMask wallet seamlessly
- 📱 **Responsive UI**: Beautiful, modern interface that works on all devices
- ⚡ **Real-time Updates**: Automatic balance and transaction updates

## Tech Stack

### Frontend
- React 18.2.0
- Web3.js / Ethers.js
- Axios for API calls
- Modern CSS with responsive design

### Backend
- Node.js with Express
- Ethers.js for Ethereum interactions
- Crypto module for encryption
- CORS enabled for cross-origin requests

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension (optional, for MetaMask integration)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `env.example`):
```bash
PORT=5000
# Optional: Custom RPC URL (recommended for production)
# RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
# Or: RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-here
```

**Note:** The application includes automatic RPC endpoint fallback. If one endpoint fails (e.g., blocked by Cloudflare), it will automatically try alternative public endpoints. For production use, it's recommended to use your own RPC provider (Infura, Alchemy, etc.).

4. Generate an encryption key (optional, for production):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### Creating a Wallet

1. Open the application in your browser
2. Click "Create New Wallet"
3. Your wallet address and public key will be displayed
4. Your private key is encrypted and stored securely

### Connecting MetaMask

1. Make sure MetaMask extension is installed
2. Click "Connect MetaMask" button
3. Approve the connection in MetaMask popup
4. Your MetaMask address and balance will be displayed

### Sending Transactions

1. Enter the recipient address
2. Enter the amount in ETH
3. Enter your private key (for created wallets) or use MetaMask
4. Click "Send Transaction"
5. Wait for transaction confirmation

### Viewing Balance and Transactions

- Balance is automatically displayed at the top
- Click "Refresh Balance" to update
- Transaction history shows recent transactions
- Transactions are automatically fetched and displayed

## Security Considerations

⚠️ **Important Security Notes:**

1. **Private Keys**: Never share your private key with anyone. This application encrypts private keys, but you should still be cautious.

2. **Test Network**: This application is configured for Ethereum mainnet by default. For testing, use a test network like Sepolia or Goerli.

3. **Production Use**: 
   - Use a secure database instead of in-memory storage
   - Implement proper authentication
   - Use HTTPS in production
   - Store encryption keys securely
   - Implement rate limiting

4. **RPC Endpoints**: The application includes automatic fallback to multiple public RPC endpoints. If you encounter 403 errors or rate limits, the app will automatically try alternative endpoints. For production, it's highly recommended to use your own RPC provider:
   - **Infura**: Sign up at https://infura.io and get a free API key
   - **Alchemy**: Sign up at https://alchemy.com and get a free API key
   - Add your RPC URL to the `.env` file as `RPC_URL`

## API Endpoints

### POST `/api/wallet/create`
Creates a new wallet
- Response: `{ success: true, wallet: { address, publicKey, createdAt } }`

### GET `/api/wallet/balance/:address`
Gets balance for an address
- Response: `{ success: true, address, balance, balanceWei }`

### GET `/api/wallet/transactions/:address`
Gets transaction history for an address
- Response: `{ success: true, transactions: [...] }`

### POST `/api/wallet/send`
Sends a transaction
- Body: `{ fromAddress, toAddress, amount, privateKey }`
- Response: `{ success: true, transactionHash, from, to, amount }`

### GET `/api/health`
Health check endpoint
- Response: `{ success: true, message: 'Server is running' }`

## Project Structure

```
blockchain/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── App.js          # Main application component
│   │   ├── App.css         # Application styles
│   │   ├── index.js        # React entry point
│   │   ├── index.css       # Global styles
│   │   └── components/
│   │       ├── WalletCreation.js        # Wallet creation component
│   │       ├── WalletDashboard.js       # Main dashboard
│   │       └── MetaMaskIntegration.js   # MetaMask integration
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## Development

### Running Both Servers

In separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

## Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask extension is installed and unlocked
- Check that you're on the correct network
- Try refreshing the page

### Transaction Failures
- Ensure you have sufficient balance
- Check that the recipient address is valid
- Verify you're on the correct network
- Check gas prices and network congestion

### API Connection Issues
- Ensure backend server is running
- Check CORS settings
- Verify API_BASE_URL in frontend .env

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!

## Disclaimer

This is a demonstration application. Use at your own risk. Always test with small amounts on test networks before using with real funds.

