// Background service worker for Lemo AI Assistant
console.log('Lemo AI Assistant: Background script starting...');

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    console.log('Lemo AI Assistant: Extension icon clicked for tab', tab.id);
    
    // Send message to content script to toggle overlay
    await chrome.tabs.sendMessage(tab.id, {
      action: 'toggle_overlay'
    });
  } catch (error) {
    console.log('Lemo AI Assistant: Error sending message:', error);
    
    // If content script isn't loaded, inject it
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/content/index.jsx']
      });
      
      // Inject CSS
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['src/styles/globals.css']
      });
      
      // Wait and try again
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'toggle_overlay'
          });
        } catch (e) {
          console.log('Could not send message after injection:', e);
        }
      }, 500);
    } catch (injectionError) {
      console.log('Could not inject content script:', injectionError);
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'overlay_toggled') {
    // Update badge
    chrome.action.setBadgeText({
      text: request.isVisible ? 'ON' : '',
      tabId: sender.tab.id
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#667eea',
      tabId: sender.tab.id
    });
  }
  sendResponse({ success: true });
  return true;
});

// Clear badge on tab close/navigation
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.action.setBadgeText({ text: '', tabId });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

console.log('Lemo AI Assistant: Background script initialized');