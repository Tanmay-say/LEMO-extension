// Enhanced Wallet Bridge - Direct MetaMask access with token balances
(function() {
  'use strict';

  // Token contract addresses on different networks
  const TOKEN_CONTRACTS = {
    '11155111': { // Sepolia
      USDC: '0x1C7D4B196Cb0C7B01A1A31B44Ad6F14dC0bF36c7', // USDC on Sepolia
      PYUSD: '0x2B4B2eDeEB25fC77A7E8A34c3cEbb9E8bF5bB3E8'  // PYUSD on Sepolia
    },
    '314159': { // Filecoin Calibration
      TFIL: '0x6f14C02fC1F78322cFd7d707aB90f18baD3B54f5'  // TFIL on Filecoin Calibration
    }
  };

  // ERC-20 ABI for balanceOf function
  const ERC20_ABI = [
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [{"name": "", "type": "uint8"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [{"name": "", "type": "string"}],
      "type": "function"
    }
  ];

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

        case 'GET_TOKEN_BALANCES':
          if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
          }

          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
              throw new Error('No accounts connected');
            }

            const networkId = await window.ethereum.request({ method: 'net_version' });
            const userAddress = accounts[0];
            
            // Get ETH balance
            const ethBalance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [userAddress, 'latest']
            });

            // Get token balances
            const tokenBalances = await getTokenBalances(userAddress, networkId);

            result = {
              ethBalance: ethBalance,
              tokenBalances: tokenBalances,
              network: {
                id: networkId,
                name: getNetworkName(networkId)
              }
            };
          } catch (err) {
            throw err;
          }
          break;

        case 'GET_SPECIFIC_TOKEN_BALANCE':
          if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
          }

          try {
            const { tokenSymbol, account } = event.data;
            console.log('Wallet bridge: Processing token balance request for:', tokenSymbol, 'account:', account);
            
            if (!tokenSymbol) {
              throw new Error('Token symbol is required');
            }
            
            if (!account) {
              throw new Error('Account address is required');
            }
            
            const networkId = await window.ethereum.request({ method: 'net_version' });
            
            let balance;
            if (tokenSymbol === 'ETH' || tokenSymbol === 'FIL') {
              // Native token balance
              balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest']
              });
              result = {
                balance: balance,
                decimals: 18,
                symbol: tokenSymbol
              };
            } else {
              // ERC-20 token balance using direct contract calls
              const tokenAddress = TOKEN_CONTRACTS[networkId]?.[tokenSymbol];
              if (!tokenAddress) {
                throw new Error(`Token ${tokenSymbol} not supported on this network`);
              }

              // Use direct contract call instead of ethers.js
              const balanceOfData = '0x70a08231' + account.slice(2).padStart(64, '0');
              const decimalsData = '0x313ce567';
              
              try {
                const [balanceHex, decimalsHex] = await Promise.all([
                  window.ethereum.request({
                    method: 'eth_call',
                    params: [{ to: tokenAddress, data: balanceOfData }, 'latest']
                  }),
                  window.ethereum.request({
                    method: 'eth_call',
                    params: [{ to: tokenAddress, data: decimalsData }, 'latest']
                  })
                ]);

                result = {
                  balance: balanceHex,
                  decimals: parseInt(decimalsHex, 16),
                  symbol: tokenSymbol
                };
              } catch (contractError) {
                console.error('Contract call error:', contractError);
                result = {
                  balance: '0x0',
                  decimals: 18,
                  symbol: tokenSymbol,
                  error: 'Failed to fetch token balance'
                };
              }
            }
          } catch (err) {
            console.error('Balance fetch error:', err);
            result = {
              balance: '0x0',
              decimals: 18,
              symbol: event.data.tokenSymbol,
              error: err.message
            };
          }
          break;

        case 'SWITCH_TO_SEPOLIA':
          if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
          }

          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
            });
            
            result = { success: true, message: 'Switched to Sepolia network' };
          } catch (err) {
            if (err.code === 4902) {
              // Chain not added, try to add it
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia',
                    nativeCurrency: {
                      name: 'SepoliaETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  }],
                });
                result = { success: true, message: 'Added and switched to Sepolia network' };
              } catch (addErr) {
                throw addErr;
              }
            } else {
              throw err;
            }
          }
          break;

        case 'SWITCH_TO_FILECOIN':
          if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
          }

          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x4cb2f' }], // Filecoin Calibration chain ID
            });
            
            result = { success: true, message: 'Switched to Filecoin Calibration network' };
          } catch (err) {
            if (err.code === 4902) {
              // Chain not added, try to add it
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x4cb2f',
                    chainName: 'Filecoin Calibration',
                    nativeCurrency: {
                      name: 'Filecoin',
                      symbol: 'FIL',
                      decimals: 18,
                    },
                    rpcUrls: ['https://api.calibration.node.glif.io/rpc/v1'],
                    blockExplorerUrls: ['https://calibration.filscan.io'],
                  }],
                });
                result = { success: true, message: 'Added and switched to Filecoin Calibration network' };
              } catch (addErr) {
                throw addErr;
              }
            } else {
              throw err;
            }
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

  async function getTokenBalances(userAddress, networkId) {
    const tokens = TOKEN_CONTRACTS[networkId];
    if (!tokens) {
      return {};
    }

    const balances = {};
    
    for (const [tokenName, contractAddress] of Object.entries(tokens)) {
      try {
        // ERC-20 balanceOf function
        const balance = await window.ethereum.request({
          method: 'eth_call',
          params: [{
            to: contractAddress,
            data: `0x70a08231000000000000000000000000${userAddress.slice(2)}`
          }, 'latest']
        });

        // Convert hex to decimal (assuming 18 decimals for most tokens)
        const decimals = tokenName === 'USDC' ? 6 : 18; // USDC has 6 decimals
        const balanceDecimal = parseInt(balance, 16) / Math.pow(10, decimals);
        
        balances[tokenName] = {
          balance: balanceDecimal,
          contractAddress: contractAddress,
          decimals: decimals
        };
      } catch (err) {
        console.error(`Error fetching ${tokenName} balance:`, err);
        balances[tokenName] = {
          balance: 0,
          contractAddress: contractAddress,
          decimals: tokenName === 'USDC' ? 6 : 18,
          error: err.message
        };
      }
    }

    return balances;
  }

  function getNetworkName(id) {
    const networks = {
      '1': 'mainnet',
      '5': 'goerli',
      '137': 'polygon',
      '56': 'bsc',
      '11155111': 'sepolia',
      '314159': 'filecoin-calibration',
      '8453': 'base',
      '42161': 'arbitrum'
    };
    return networks[id] || 'unknown';
  }

  console.log('Lemo: Wallet bridge initialized with token support');
})();
