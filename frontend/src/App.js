import React, { useState, useEffect } from 'react';
import './App.css';
import WalletCreation from './components/WalletCreation';
import WalletDashboard from './components/WalletDashboard';
import MetaMaskIntegration from './components/MetaMaskIntegration';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [metamaskConnected, setMetamaskConnected] = useState(false);
  const [metamaskAddress, setMetamaskAddress] = useState(null);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('cryptoWallet');
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        setWallet(walletData);
        fetchBalance(walletData.address);
        fetchTransactions(walletData.address);
      } catch (err) {
        console.error('Error loading wallet:', err);
      }
    }
  }, []);

  const [newWalletPrivateKey, setNewWalletPrivateKey] = useState(null);

  const createWallet = async () => {
    setLoading(true);
    setError(null);
    setNewWalletPrivateKey(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        // Store wallet without private key in localStorage
        const walletToStore = { ...data.wallet };
        const privateKey = walletToStore.privateKey;
        delete walletToStore.privateKey; // Remove private key before storing
        
        setWallet(walletToStore);
        localStorage.setItem('cryptoWallet', JSON.stringify(walletToStore));
        
        // Store private key separately in state (will be shown once)
        setNewWalletPrivateKey(privateKey);
        
        await fetchBalance(data.wallet.address);
        await fetchTransactions(data.wallet.address);
      } else {
        setError(data.error || 'Failed to create wallet');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (address) => {
    if (!address) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/balance/${address}`);
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const fetchTransactions = async (address) => {
    if (!address) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/transactions/${address}`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const refreshData = async () => {
    if (wallet) {
      await fetchBalance(wallet.address);
      await fetchTransactions(wallet.address);
    }
    if (metamaskAddress) {
      await fetchBalance(metamaskAddress);
      await fetchTransactions(metamaskAddress);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    localStorage.removeItem('cryptoWallet');
    setBalance('0');
    setTransactions([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔐 Crypto Wallet</h1>
        <p>Secure Ethereum Wallet Management</p>
      </header>

      <div className="container">
        <MetaMaskIntegration
          metamaskConnected={metamaskConnected}
          setMetamaskConnected={setMetamaskConnected}
          metamaskAddress={metamaskAddress}
          setMetamaskAddress={setMetamaskAddress}
          fetchBalance={fetchBalance}
          fetchTransactions={fetchTransactions}
          transactions={transactions}
          setTransactions={setTransactions}
        />

        {!wallet && !metamaskConnected ? (
          <WalletCreation
            createWallet={createWallet}
            loading={loading}
            error={error}
            newWalletPrivateKey={newWalletPrivateKey}
            setNewWalletPrivateKey={setNewWalletPrivateKey}
          />
        ) : (
          <WalletDashboard
            wallet={wallet}
            metamaskAddress={metamaskAddress}
            balance={balance}
            transactions={transactions}
            refreshData={refreshData}
            disconnectWallet={disconnectWallet}
            API_BASE_URL={API_BASE_URL}
            newWalletPrivateKey={newWalletPrivateKey}
            setNewWalletPrivateKey={setNewWalletPrivateKey}
          />
        )}
      </div>
    </div>
  );
}

export default App;

