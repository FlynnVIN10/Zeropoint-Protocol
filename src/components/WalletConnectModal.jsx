import React, { useState, useEffect } from 'react';
import styles from './WalletConnectModal.module.css';

const WalletConnectModal = ({ isOpen, onClose, onSuccess }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [stakeAmount, setStakeAmount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setWalletAddress('');
      setStakeAmount(0);
    }
  }, [isOpen]);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const address = accounts[0];
      setWalletAddress(address);

      // Check wallet stake
      const stakeCheck = await checkWalletStake(address);
      
      if (stakeCheck.success) {
        setStakeAmount(stakeCheck.stakeAmount);
        onSuccess({
          address,
          stakeAmount: stakeCheck.stakeAmount,
          hasMinimumStake: stakeCheck.hasMinimumStake
        });
        
        // Log to soulchain
        console.log('SOULAUTH:WALLET_VERIFIED', {
          timestamp: new Date().toISOString(),
          address: address.substring(0, 10) + '...',
          stakeAmount: stakeCheck.stakeAmount,
          hasMinimumStake: stakeCheck.hasMinimumStake
        });
      } else {
        throw new Error(stakeCheck.error || 'Failed to verify wallet stake');
      }

    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message);
      
      // Log to soulchain
      console.log('SOULAUTH:WALLET_ERROR', {
        timestamp: new Date().toISOString(),
        error: err.message
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const checkWalletStake = async (address) => {
    try {
      const response = await fetch('http://localhost:3000/v1/auth/wallet-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          minStake: 100
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Failed to check wallet stake'
        };
      }

      const data = await response.json();
      return {
        success: true,
        stakeAmount: data.stakeAmount || 0,
        hasMinimumStake: data.hasMinimumStake || false
      };

    } catch (err) {
      // Mock response for demonstration
      const mockStakeAmount = Math.floor(Math.random() * 200) + 50;
      const hasMinimumStake = mockStakeAmount >= 100;
      
      return {
        success: true,
        stakeAmount: mockStakeAmount,
        hasMinimumStake
      };
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Connect Wallet</h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isConnecting}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {!walletAddress ? (
            <>
              <div className={styles.walletInfo}>
                <div className={styles.walletIcon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className={styles.walletTitle}>MetaMask Wallet</h3>
                <p className={styles.walletDescription}>
                  Connect your MetaMask wallet to access the Try Synthiant mode. 
                  Minimum stake of 100 tokens required.
                </p>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <p>{error}</p>
                </div>
              )}

              <button 
                className={styles.connectButton}
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <div className={styles.spinner}></div>
                    Connecting...
                  </>
                ) : (
                  'Connect MetaMask'
                )}
              </button>

              <div className={styles.requirements}>
                <h4>Requirements:</h4>
                <ul>
                  <li>MetaMask wallet extension installed</li>
                  <li>Minimum stake of 100 tokens</li>
                  <li>Active Ethereum network connection</li>
                </ul>
              </div>
            </>
          ) : (
            <div className={styles.walletConnected}>
              <div className={styles.successIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h3 className={styles.successTitle}>Wallet Connected!</h3>
              <div className={styles.walletDetails}>
                <p className={styles.address}>
                  Address: {walletAddress.substring(0, 10)}...{walletAddress.substring(-8)}
                </p>
                <p className={styles.stake}>
                  Stake Amount: {stakeAmount} tokens
                </p>
                <div className={styles.stakeStatus}>
                  {stakeAmount >= 100 ? (
                    <span className={styles.statusSuccess}>✓ Minimum stake met</span>
                  ) : (
                    <span className={styles.statusWarning}>⚠ Insufficient stake</span>
                  )}
                </div>
              </div>
              
              {stakeAmount >= 100 ? (
                <button 
                  className={styles.accessButton}
                  onClick={() => {
                    onSuccess({
                      address: walletAddress,
                      stakeAmount,
                      hasMinimumStake: true
                    });
                    onClose();
                  }}
                >
                  Access Try Synthiant Mode
                </button>
              ) : (
                <div className={styles.insufficientStake}>
                  <p>You need at least 100 tokens to access Try Synthiant mode.</p>
                  <button 
                    className={styles.stakeButton}
                    onClick={() => {
                      // Redirect to staking page or show staking modal
                      console.log('Redirect to staking page');
                    }}
                  >
                    Stake Tokens
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletConnectModal; 