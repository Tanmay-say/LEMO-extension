import React, { useState } from 'react';
import { Settings, Sliders, Info } from 'lucide-react';

const SettingsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sub Tabs */}
      <div className="flex border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
                activeSubTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSubTab === 'general' && <GeneralSettings />}
        {activeSubTab === 'preferences' && <PreferencesSettings />}
        {activeSubTab === 'about' && <AboutSettings />}
      </div>
    </div>
  );
};

const GeneralSettings = () => {
  const [theme, setTheme] = useState('light');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          General Settings
        </h3>

        {/* Theme Toggle */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overlay Size
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all">
              <option>Compact</option>
              <option selected>Default</option>
              <option>Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const PreferencesSettings = () => {
  const [preferences, setPreferences] = useState({
    amazon: true,
    flipkart: true,
    ebay: true,
    currency: 'USD',
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          Comparison Sources
        </h3>

        <div className="space-y-3">
          {['Amazon', 'Flipkart', 'eBay'].map((platform) => (
            <label key={platform} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer">
              <span className="font-medium text-gray-700">{platform}</span>
              <input
                type="checkbox"
                checked={preferences[platform.toLowerCase()]}
                onChange={(e) =>
                  setPreferences({ ...preferences, [platform.toLowerCase()]: e.target.checked })
                }
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-200">
        <h3 className="font-semibold text-gray-800 mb-4">Currency</h3>
        <select
          value={preferences.currency}
          onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
        >
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="INR">INR - Indian Rupee</option>
        </select>
      </div>
    </div>
  );
};

const AboutSettings = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/30 overflow-hidden">
            <img src="/logo.png" alt="Lemo" className="w-16 h-16 rounded-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Lemo AI</h2>
            <p className="text-orange-100">Version 2.0</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-200">
        <h3 className="font-semibold text-gray-800 mb-3">Features</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>AI-powered product search</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Multi-platform price comparison</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>MetaMask wallet integration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Modern Aikiko-style UI</span>
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-200">
        <h3 className="font-semibold text-gray-800 mb-3">Links</h3>
        <div className="space-y-2">
          <a href="#" className="block text-sm text-orange-600 hover:text-orange-700 font-medium">
            🌐 Official Website
          </a>
          <a href="#" className="block text-sm text-orange-600 hover:text-orange-700 font-medium">
            📚 Documentation
          </a>
          <a href="#" className="block text-sm text-orange-600 hover:text-orange-700 font-medium">
            🐛 Report Issues
          </a>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500">
        Made with ❤️ by the Lemo Team
      </div>
    </div>
  );
};

export default SettingsTab;