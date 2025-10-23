// Simplified Wallet Bridge - Direct MetaMask access
(function() {
  'use strict';

  // Listen for messages from the content script
  window.addEventListener('message', async (event) => {
    // Only accept messages from our extension
    if (event.source !== window || !event.data || event.data.source !== 'lemo-extension') {
      return;
    }

    const { action, requestId } = event.data;

    try {
      let result = null;

      switch (action) {
        case 'CHECK_WALLET':
          if (typeof window.ethereum !== 'undefined') {
            try {
              // Check if MetaMask is installed and get accounts
              const accounts = await window.ethereum.request({ method: 'eth_accounts' });
              const networkId = await window.ethereum.request({ method: 'net_version' });
              
              result = {
                isInstalled: true,
                accounts: accounts,
                network: {
                  id: networkId,
                  name: getNetworkName(networkId)
                }
              };
            } catch (err) {
              console.error('Error checking wallet:', err);
              result = { isInstalled: true, accounts: [], error: err.message };
            }
          } else {
            result = { isInstalled: false };
          }
          break;

        case 'CONNECT_WALLET':
          if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
          }

          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const networkId = await window.ethereum.request({ method: 'net_version' });
            
            result = {
              accounts: accounts,
              network: {
                id: networkId,
                name: getNetworkName(networkId)
              }
            };
          } catch (err) {
            if (err.code === 4001) {
              throw new Error('User rejected the connection request');
            }
            throw err;
          }
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Send response back to content script
      window.postMessage({
        source: 'lemo-extension-response',
        requestId,
        result,
        success: true
      }, '*');

    } catch (error) {
      console.error('Wallet bridge error:', error);
      // Send error response back to content script
      window.postMessage({
        source: 'lemo-extension-response',
        requestId,
        error: error.message,
        success: false
      }, '*');
    }
  });

  function getNetworkName(id) {
    const networks = {
      '1': 'mainnet',
      '5': 'goerli',
      '137': 'polygon',
      '56': 'bsc',
      '11155111': 'sepolia',
      '8453': 'base',
      '42161': 'arbitrum'
    };
    return networks[id] || 'unknown';
  }

  console.log('Lemo: Wallet bridge initialized');
})();
