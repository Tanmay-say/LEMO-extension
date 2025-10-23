import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Check if we're in popup context (no chrome.tabs access)
      if (typeof chrome.tabs === 'undefined') {
        // In popup context, we need to get tab info differently
        const response = await chrome.runtime.sendMessage({ action: 'CHECK_WALLET' });
        
        if (response && response.success && response.result && response.result.isInstalled) {
          if (response.result.accounts && response.result.accounts.length > 0) {
            setAccount(response.result.accounts[0]);
            setNetwork(response.result.network.name);
          }
        }
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        console.log('No active tab found');
        return;
      }
      
      const response = await chrome.runtime.sendMessage({ action: 'CHECK_WALLET', tabId: tab.id });
      
      if (response && response.success && response.result && response.result.isInstalled) {
        if (response.result.accounts && response.result.accounts.length > 0) {
          setAccount(response.result.accounts[0]);
          setNetwork(response.result.network.name);
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      // Handle extension context invalidation
      if (err.message && err.message.includes('Extension context invalidated')) {
        setError('Extension needs to be reloaded. Please refresh the page.');
      }
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if we're in popup context (no chrome.tabs access)
      if (typeof chrome.tabs === 'undefined') {
        // In popup context, send message without tabId
        const response = await chrome.runtime.sendMessage({ action: 'CONNECT_WALLET' });
        
        if (response && response.success && response.result && response.result.accounts.length > 0) {
          setAccount(response.result.accounts[0]);
          setNetwork(response.result.network.name);
          
          // Store in chrome storage
          chrome.storage.sync.set({ connectedWallet: response.result.accounts[0] });
        } else if (response && response.error) {
          setError(response.error);
        }
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        setError('No active tab found');
        return;
      }
      
      const response = await chrome.runtime.sendMessage({ action: 'CONNECT_WALLET', tabId: tab.id });
      
      if (response && response.success && response.result && response.result.accounts.length > 0) {
        setAccount(response.result.accounts[0]);
        setNetwork(response.result.network.name);
        
        // Store in chrome storage
        chrome.storage.sync.set({ connectedWallet: response.result.accounts[0] });
      } else if (response && response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      if (err.message && err.message.includes('Extension context invalidated')) {
        setError('Extension needs to be reloaded. Please refresh the page.');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setNetwork(null);
    chrome.storage.sync.remove('connectedWallet');
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {!account ? (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#FF7A00] to-[#E76500] rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Connect Your Wallet</h3>
              <p className="text-sm text-gray-600">
                Connect MetaMask to access blockchain features
              </p>
            </div>
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#FF7A00] to-[#E76500] text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all transform hover:scale-105"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </span>
              ) : (
                'Connect MetaMask'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Connected</div>
                <div className="font-mono font-semibold text-gray-800">
                  {shortenAddress(account)}
                </div>
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Disconnect"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {network && (
            <div className="bg-white/50 rounded-lg p-3 border border-green-200">
              <div className="text-xs text-gray-600 mb-1">Network</div>
              <div className="font-semibold text-gray-800 capitalize">{network}</div>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            💡
          </div>
          <div className="text-sm text-orange-900">
            <div className="font-semibold mb-1">Why connect a wallet?</div>
            <ul className="space-y-1 text-orange-800">
              <li>• Personalized product recommendations</li>
              <li>• Exclusive deals and rewards</li>
              <li>• Secure transaction history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;