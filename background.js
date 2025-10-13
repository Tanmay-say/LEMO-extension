// Background service worker for Lemo Extension
console.log('Lemo Extension background script loaded');

// Extension installation/startup
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details);
    
    if (details.reason === 'install') {
        // Set default values on first install
        chrome.storage.local.set({
            isConnected: false,
            settings: {
                theme: 'light',
                notifications: true
            }
        });
        console.log('Default settings initialized');
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'getStatus':
            handleGetStatus(sendResponse);
            break;
            
        case 'connect':
            handleConnect(request.data, sendResponse);
            break;
            
        case 'disconnect':
            handleDisconnect(sendResponse);
            break;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
    
    // Return true to indicate we will send a response asynchronously
    return true;
});

async function handleGetStatus(sendResponse) {
    try {
        const result = await chrome.storage.local.get(['isConnected']);
        sendResponse({ 
            success: true, 
            isConnected: result.isConnected || false 
        });
    } catch (error) {
        console.error('Failed to get status:', error);
        sendResponse({ error: error.message });
    }
}

async function handleConnect(data, sendResponse) {
    try {
        // Here you would implement actual connection logic
        console.log('Attempting to connect...', data);
        
        // Simulate connection process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update storage
        await chrome.storage.local.set({ isConnected: true });
        
        // Send success response
        sendResponse({ 
            success: true, 
            message: 'Connected successfully' 
        });
        
        // Notify popup if open
        notifyPopup('updateStatus', { 
            status: 'connected', 
            message: 'Connected' 
        });
        
    } catch (error) {
        console.error('Connection failed:', error);
        sendResponse({ error: error.message });
    }
}

async function handleDisconnect(sendResponse) {
    try {
        console.log('Disconnecting...');
        
        // Update storage
        await chrome.storage.local.set({ isConnected: false });
        
        // Send success response
        sendResponse({ 
            success: true, 
            message: 'Disconnected successfully' 
        });
        
        // Notify popup if open
        notifyPopup('updateStatus', { 
            status: 'ready', 
            message: 'Ready' 
        });
        
    } catch (error) {
        console.error('Disconnection failed:', error);
        sendResponse({ error: error.message });
    }
}

function notifyPopup(action, data) {
    // Try to send message to popup (will fail silently if popup is closed)
    chrome.runtime.sendMessage({ action, ...data }).catch(() => {
        // Popup is closed, ignore error
    });
}

// Handle tab updates (useful for detecting page changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('Tab updated:', tab.url);
        // Here you could implement page-specific logic
    }
});

// Cleanup on extension suspension
chrome.runtime.onSuspend.addListener(() => {
    console.log('Extension suspending...');
    // Perform cleanup if needed
});