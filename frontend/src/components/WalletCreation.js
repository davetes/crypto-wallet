import React from 'react';

const WalletCreation = ({ createWallet, loading, error }) => {
  return (
    <div className="card">
      <h2 className="card-title">Create New Wallet</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Generate a new secure Ethereum wallet. Your private key will be encrypted and stored securely.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
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
          <li>Your private key is encrypted before storage</li>
          <li>Never share your private key with anyone</li>
          <li>Keep your wallet credentials secure</li>
          <li>This is a demo wallet - use test networks for development</li>
        </ul>
      </div>
    </div>
  );
};

export default WalletCreation;

