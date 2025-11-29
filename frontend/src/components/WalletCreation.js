import React, { useState } from 'react';

const WalletCreation = ({ createWallet, loading, error, newWalletPrivateKey, setNewWalletPrivateKey }) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKeyCopied, setPrivateKeyCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setPrivateKeyCopied(true);
      setTimeout(() => setPrivateKeyCopied(false), 2000);
    });
  };

  const handleAcknowledge = () => {
    setNewWalletPrivateKey(null);
    setShowPrivateKey(false);
  };

  return (
    <div className="card">
      <h2 className="card-title">Create New Wallet</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Generate a new secure Ethereum wallet. Your private key will be encrypted and stored securely.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      {newWalletPrivateKey ? (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            padding: '20px', 
            background: '#fff3cd', 
            border: '2px solid #ffc107', 
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '15px', fontSize: '1.1rem' }}>
              ⚠️ IMPORTANT: Save Your Private Key
            </h3>
            <p style={{ color: '#856404', marginBottom: '15px', fontSize: '0.95rem' }}>
              Your private key is shown below. <strong>Save it securely!</strong> You will need it to send transactions. 
              This is the only time it will be displayed.
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#856404', fontWeight: '600' }}>
                Private Key:
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  style={{
                    marginLeft: '10px',
                    padding: '5px 10px',
                    fontSize: '0.8rem',
                    background: '#856404',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {showPrivateKey ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(newWalletPrivateKey)}
                  style={{
                    marginLeft: '10px',
                    padding: '5px 10px',
                    fontSize: '0.8rem',
                    background: '#856404',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {privateKeyCopied ? '✓ Copied!' : 'Copy'}
                </button>
              </label>
              <div style={{
                background: '#fff',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #ffc107',
                fontFamily: 'Courier New, monospace',
                wordBreak: 'break-all',
                fontSize: '0.9rem',
                color: showPrivateKey ? '#333' : 'transparent',
                textShadow: showPrivateKey ? 'none' : '0 0 8px rgba(0,0,0,0.5)',
                userSelect: 'all'
              }}>
                {showPrivateKey ? newWalletPrivateKey : '•'.repeat(66)}
              </div>
            </div>
            
            <button
              className="btn btn-primary"
              onClick={handleAcknowledge}
              style={{ width: '100%' }}
            >
              I've Saved My Private Key - Continue
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            className="btn btn-primary"
            onClick={createWallet}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Wallet...' : 'Create New Wallet'}
          </button>
          
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1rem' }}>⚠️ Security Notice</h3>
            <ul style={{ paddingLeft: '20px', color: '#666', fontSize: '0.9rem' }}>
              <li>Your private key will be shown once after wallet creation</li>
              <li>Save it securely - you'll need it to send transactions</li>
              <li>Never share your private key with anyone</li>
              <li>This is a demo wallet - use test networks for development</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletCreation;

