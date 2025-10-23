// Wallet Bridge - Injected into page context to access window.ethereum
// This script runs in the page context, not the extension context

(function() {
  'use strict';

  // Wait for ethers to be available
  const waitForEthers = () => {
    return new Promise((resolve) => {
      if (typeof ethers !== 'undefined') {
        resolve();
        return;
      }
      
      // Try to load ethers.js
      const script = document.createElement('script');
      script.src = 'https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js';
      script.onload = () => {
        console.log('Lemo: Ethers.js loaded for wallet bridge');
        resolve();
      };
      script.onerror = () => {
        console.error('Lemo: Failed to load ethers.js');
        resolve(); // Continue anyway
      };
      document.head.appendChild(script);
    });
  };

  // Listen for messages from the content script
  window.addEventListener('message', async (event) => {
    // Only accept messages from our extension
    if (event.source !== window || !event.data || event.data.source !== 'lemo-extension') {
      return;
    }

    const { action, requestId } = event.data;

    try {
      await waitForEthers();
      
      let result = null;

      switch (action) {
        case 'CHECK_WALLET':
          if (typeof window.ethereum !== 'undefined') {
            try {
              // Use ethers v5 syntax for compatibility
              const provider = new ethers.providers.Web3Provider(window.ethereum);
              const accounts = await provider.listAccounts();
              const network = await provider.getNetwork();
              
              result = {
                isInstalled: true,
                accounts: accounts.map(acc => acc),
                network: {
                  name: network.name,
                  chainId: network.chainId.toString()
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
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            const network = await provider.getNetwork();
            
            result = {
              accounts: accounts,
              network: {
                name: network.name,
                chainId: network.chainId.toString()
              }
            };
          } catch (err) {
            if (err.code === 4001) {
              throw new Error('User rejected the connection request');
            }
            throw err;
          }
          break;

        case 'GET_NETWORK':
          if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            result = {
              name: network.name,
              chainId: network.chainId.toString()
            };
          } else {
            throw new Error('MetaMask is not installed');
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

  console.log('Lemo: Wallet bridge initialized');
})();
