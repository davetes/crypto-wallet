import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const MetaMaskIntegration = ({
  metamaskConnected,
  setMetamaskConnected,
  metamaskAddress,
  setMetamaskAddress,
  fetchBalance,
  fetchTransactions,
  transactions,
  setTransactions
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      // Check if already connected
      checkConnection();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const checkConnection = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setMetamaskAddress(accounts[0].address);
        setMetamaskConnected(true);
        fetchBalance(accounts[0].address);
        fetchTransactions(accounts[0].address);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setMetamaskConnected(false);
      setMetamaskAddress(null);
    } else {
      setMetamaskAddress(accounts[0]);
      fetchBalance(accounts[0]);
      fetchTransactions(accounts[0]);
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask extension.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setMetamaskAddress(accounts[0]);
        setMetamaskConnected(true);
        await fetchBalance(accounts[0]);
        await fetchTransactions(accounts[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to MetaMask');
      setMetamaskConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnectMetaMask = () => {
    setMetamaskConnected(false);
    setMetamaskAddress(null);
    setTransactions([]);
  };

  const sendTransactionViaMetaMask = async (toAddress, amount) => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed');
      return;
    }

    if (!metamaskConnected) {
      setError('Please connect MetaMask first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amount.toString())
      });
      
      setError(null);
      return { success: true, hash: tx.hash };
    } catch (err) {
      setError(err.message || 'Transaction failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card metamask-section">
      <h2 className="card-title">🦊 MetaMask Integration</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {!metamaskConnected ? (
        <div>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Connect your MetaMask wallet to view balance and transactions
          </p>
          <button
            className="btn btn-primary"
            onClick={connectMetaMask}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '15px', color: '#28a745', fontWeight: 'bold' }}>
            ✓ MetaMask Connected
          </p>
          <div className="address-display" style={{ marginBottom: '15px' }}>
            {metamaskAddress}
          </div>
          <button
            className="btn btn-secondary"
            onClick={disconnectMetaMask}
            style={{ width: '100%' }}
          >
            Disconnect MetaMask
          </button>
        </div>
      )}
    </div>
  );
};

export default MetaMaskIntegration;

