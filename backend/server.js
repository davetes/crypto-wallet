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
    
    // Use a public RPC endpoint (you can replace with your own)
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || 'https://eth.llamarpc.com'
    );
    
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    
    res.json({
      success: true,
      address,
      balance: balanceInEth,
      balanceWei: balance.toString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction history
app.get('/api/wallet/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || 'https://eth.llamarpc.com'
    );
    
    // Get recent transactions (simplified - in production, use a service like Etherscan API)
    const blockNumber = await provider.getBlockNumber();
    const transactions = [];
    
    // Get last 10 blocks for transactions
    for (let i = 0; i < 10; i++) {
      const block = await provider.getBlock(blockNumber - i, true);
      if (block && block.transactions) {
        block.transactions.forEach(tx => {
          if (tx.from === address || tx.to === address) {
            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: ethers.formatEther(tx.value),
              timestamp: new Date(block.timestamp * 1000).toISOString(),
              blockNumber: block.number
            });
          }
        });
      }
    }
    
    res.json({
      success: true,
      transactions: transactions.slice(0, 20) // Limit to 20 most recent
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || 'https://eth.llamarpc.com'
    );
    
    // Decrypt private key if stored
    let decryptedKey = privateKey;
    if (wallets.has(fromAddress)) {
      decryptedKey = decrypt(wallets.get(fromAddress).privateKey);
    }
    
    const wallet = new ethers.Wallet(decryptedKey, provider);
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount.toString())
    });
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      from: fromAddress,
      to: toAddress,
      amount: amount.toString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

