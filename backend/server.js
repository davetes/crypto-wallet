const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
const wallets = new Map();

// Encryption utilities
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// RPC endpoints with fallback
const RPC_ENDPOINTS = [
  process.env.RPC_URL, // Custom RPC URL from env
  'https://ethereum.publicnode.com',
  'https://rpc.ankr.com/eth',
  'https://eth.llamarpc.com',
  'https://1rpc.io/eth',
  'https://rpc.flashbots.net'
].filter(Boolean); // Remove undefined values

// Create provider with fallback
async function createProvider() {
  // If custom RPC URL is provided, use it first
  if (process.env.RPC_URL) {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      await provider.getBlockNumber(); // Test connection
      return provider;
    } catch (error) {
      console.warn(`Custom RPC failed: ${error.message}, trying fallbacks...`);
    }
  }

  // Try fallback endpoints
  for (const endpoint of RPC_ENDPOINTS) {
    if (endpoint === process.env.RPC_URL) continue; // Skip if already tried
    
    try {
      const provider = new ethers.JsonRpcProvider(endpoint);
      await provider.getBlockNumber(); // Test connection
      console.log(`Using RPC endpoint: ${endpoint}`);
      return provider;
    } catch (error) {
      console.warn(`RPC endpoint ${endpoint} failed: ${error.message}`);
      continue;
    }
  }

  throw new Error('All RPC endpoints failed. Please check your internet connection or configure a custom RPC_URL.');
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey.slice(0, 32), 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey.slice(0, 32), 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Routes

// Create a new wallet
app.post('/api/wallet/create', (req, res) => {
  try {
    const wallet = ethers.Wallet.createRandom();
    const walletData = {
      address: wallet.address,
      privateKey: encrypt(wallet.privateKey),
      publicKey: wallet.publicKey,
      createdAt: new Date().toISOString()
    };
    
    wallets.set(wallet.address, walletData);
    
    res.json({
      success: true,
      wallet: {
        address: wallet.address,
        publicKey: wallet.publicKey,
        createdAt: walletData.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet balance
app.get('/api/wallet/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Ethereum address' 
      });
    }
    
    const provider = await createProvider();
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    
    res.json({
      success: true,
      address,
      balance: balanceInEth,
      balanceWei: balance.toString()
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch balance. Please try again later.' 
    });
  }
});

// Get transaction history
app.get('/api/wallet/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Ethereum address' 
      });
    }
    
    const provider = await createProvider();
    
    // Get recent transactions (simplified - in production, use a service like Etherscan API)
    const blockNumber = await provider.getBlockNumber();
    const transactions = [];
    
    // Get last 5 blocks for transactions (reduced to avoid timeouts)
    const maxBlocks = 5;
    for (let i = 0; i < maxBlocks && i < blockNumber; i++) {
      try {
        const block = await provider.getBlock(blockNumber - i, true);
        if (block && block.transactions) {
          block.transactions.forEach(tx => {
            if (tx.from && tx.to && (tx.from.toLowerCase() === address.toLowerCase() || tx.to.toLowerCase() === address.toLowerCase())) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value || 0),
                timestamp: new Date(block.timestamp * 1000).toISOString(),
                blockNumber: block.number
              });
            }
          });
        }
      } catch (blockError) {
        console.warn(`Error fetching block ${blockNumber - i}:`, blockError.message);
        // Continue with next block
      }
    }
    
    res.json({
      success: true,
      transactions: transactions.slice(0, 20) // Limit to 20 most recent
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch transactions. Please try again later.' 
    });
  }
});

// Send transaction
app.post('/api/wallet/send', async (req, res) => {
  try {
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    
    if (!fromAddress || !toAddress || !amount || !privateKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Validate addresses
    if (!ethers.isAddress(fromAddress)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid sender address' 
      });
    }
    
    if (!ethers.isAddress(toAddress)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid recipient address' 
      });
    }
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount' 
      });
    }
    
    const provider = await createProvider();
    
    // Decrypt private key if stored
    let decryptedKey = privateKey;
    if (wallets.has(fromAddress)) {
      try {
        decryptedKey = decrypt(wallets.get(fromAddress).privateKey);
      } catch (decryptError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Failed to decrypt private key' 
        });
      }
    }
    
    // Validate private key format
    if (!decryptedKey.startsWith('0x') || decryptedKey.length !== 66) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid private key format' 
      });
    }
    
    const wallet = new ethers.Wallet(decryptedKey, provider);
    
    // Check balance before sending
    const balance = await provider.getBalance(fromAddress);
    const amountWei = ethers.parseEther(amount.toString());
    
    // Estimate gas (rough estimate, in production use proper gas estimation)
    const gasPrice = await provider.getFeeData();
    const estimatedGas = 21000; // Standard ETH transfer gas
    const totalCost = amountWei + (gasPrice.gasPrice * BigInt(estimatedGas));
    
    if (balance < totalCost) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient balance. Need ${ethers.formatEther(totalCost)} ETH, have ${ethers.formatEther(balance)} ETH` 
      });
    }
    
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: amountWei
    });
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      from: fromAddress,
      to: toAddress,
      amount: amount.toString()
    });
  } catch (error) {
    console.error('Send transaction error:', error);
    
    // Provide more user-friendly error messages
    let errorMessage = error.message;
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient balance for this transaction';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('nonce')) {
      errorMessage = 'Transaction nonce error. Please try again.';
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

