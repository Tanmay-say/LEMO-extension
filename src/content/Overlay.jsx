import React, { useState } from 'react';
import { X, Minus, MessageSquare, Settings, Wallet } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import SettingsTab from '../components/SettingsTab';
import WalletPopup from '../components/WalletPopup';

const Overlay = ({ onClose, onMinimize }) => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="lemo-overlay-container">
      {/* Header */}
      <div className="lemo-overlay-header">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-lg">
              🚀
            </div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-800">Lemo AI</h3>
            <p className="text-xs text-gray-500">Smart Assistant</p>
          </div>
        </div>

        {/* Tab Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`p-2 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`p-2 rounded-lg transition-all ${
              activeTab === 'wallet'
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Wallet"
          >
            <Wallet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Control Buttons */}
          <button
            onClick={onMinimize}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="lemo-overlay-content">
        {activeTab === 'chat' && <ChatWindow />}
        {activeTab === 'wallet' && <WalletPopup />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default Overlay;