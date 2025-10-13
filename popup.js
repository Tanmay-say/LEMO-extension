// Popup functionality for Lemo Extension
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const connectBtn = document.getElementById('connectBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');

    // Initialize popup
    init();

    function init() {
        console.log('Lemo Extension popup initialized');
        loadStoredData();
        attachEventListeners();
    }

    function attachEventListeners() {
        connectBtn.addEventListener('click', handleConnectWallet);
        settingsBtn.addEventListener('click', handleSettings);
    }

    async function handleConnectWallet() {
        try {
            updateStatus('connecting', 'Connecting...');
            connectBtn.disabled = true;
            
            // Simulate connection process
            await simulateConnection();
            
            // Update UI on successful connection
            updateStatus('connected', 'Connected');
            connectBtn.textContent = 'Disconnect';
            connectBtn.disabled = false;
            
            // Store connection state
            await chrome.storage.local.set({ isConnected: true });
            
        } catch (error) {
            console.error('Connection failed:', error);
            updateStatus('error', 'Connection Failed');
            connectBtn.disabled = false;
        }
    }

    function handleSettings() {
        console.log('Opening settings...');
        // For now, just show an alert
        alert('Settings functionality coming soon!');
    }

    function updateStatus(status, text) {
        statusText.textContent = text;
        statusDot.className = 'status-dot';
        
        switch(status) {
            case 'connecting':
                statusDot.style.background = '#f59e0b';
                break;
            case 'connected':
                statusDot.style.background = '#10b981';
                break;
            case 'error':
                statusDot.style.background = '#ef4444';
                break;
            default:
                statusDot.style.background = '#64748b';
        }
    }

    async function simulateConnection() {
        // Simulate async connection process
        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    }

    async function loadStoredData() {
        try {
            const result = await chrome.storage.local.get(['isConnected']);
            if (result.isConnected) {
                updateStatus('connected', 'Connected');
                connectBtn.textContent = 'Disconnect';
            }
        } catch (error) {
            console.error('Failed to load stored data:', error);
        }
    }

    // Handle messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateStatus') {
            updateStatus(request.status, request.message);
        }
        sendResponse({ success: true });
    });
});