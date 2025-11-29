import React, { useState } from 'react';
import axios from 'axios';

const WalletDashboard = ({
  wallet,
  metamaskAddress,
  balance,
  transactions,
  refreshData,
  disconnectWallet,
  API_BASE_URL,
  setLoading
}) => {
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const activeAddress = metamaskAddress || wallet?.address;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!sendTo || !sendAmount || !privateKey) {
      setError('Please fill in all fields');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/wallet/send`, {
        fromAddress: activeAddress,
        toAddress: sendTo,
        amount: sendAmount,
        privateKey: privateKey
      });

      if (response.data.success) {
        setSuccess(`Transaction sent! Hash: ${response.data.transactionHash}`);
        setSendTo('');
        setSendAmount('');
        setPrivateKey('');
        setTimeout(() => {
          refreshData();
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to send transaction');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send transaction');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Balance Display */}
      <div className="balance-display">
        <h2>{parseFloat(balance).toFixed(6)} ETH</h2>
        <p>Current Balance</p>
      </div>

      {/* Wallet Info */}
      <div className="card">
        <h2 className="card-title">📋 Wallet Information</h2>
        <div className="input-group">
          <label>Wallet Address</label>
          <div className="address-display">{activeAddress}</div>
        </div>
        
        {wallet && (
          <div className="input-group">
            <label>Public Key</label>
            <div className="address-display">{wallet.publicKey}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={refreshData}>
            🔄 Refresh Balance
          </button>
          {wallet && (
            <button className="btn btn-danger" onClick={disconnectWallet}>
              Disconnect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Send Transaction */}
      <div className="card">
        <h2 className="card-title">💸 Send Transaction</h2>
        <form onSubmit={handleSend}>
          <div className="input-group">
            <label>To Address</label>
            <input
              type="text"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              placeholder="0x..."
              required
            />
          </div>
          
          <div className="input-group">
            <label>Amount (ETH)</label>
            <input
              type="number"
              step="0.000001"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder="0.0"
              required
              min="0"
            />
          </div>

          <div className="input-group">
            <label>
              Private Key
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  fontSize: '0.8rem',
                  background: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {showPrivateKey ? 'Hide' : 'Show'}
              </button>
            </label>
            <input
              type={showPrivateKey ? 'text' : 'password'}
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter private key"
              required
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              ⚠️ Never share your private key. This is only for sending transactions.
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending}
            style={{ width: '100%' }}
          >
            {sending ? 'Sending...' : 'Send Transaction'}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="card-title">📜 Transaction History</h2>
        {transactions.length > 0 ? (
          <div className="transactions-list">
            {transactions.map((tx, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-hash">
                    {tx.hash.slice(0, 20)}...{tx.hash.slice(-10)}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                    {tx.from === activeAddress ? 'Sent to' : 'Received from'}: {tx.to === activeAddress ? tx.from : tx.to}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="transaction-amount">
                  {tx.from === activeAddress ? '-' : '+'}{parseFloat(tx.value).toFixed(6)} ETH
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No transactions found
          </p>
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;

