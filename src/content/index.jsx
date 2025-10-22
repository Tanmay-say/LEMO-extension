import React from 'react';
import ReactDOM from 'react-dom/client';
import Overlay from './Overlay';
import { injectOverlayStyles } from './OverlayStyles';
import '../styles/globals.css';

let overlayRoot = null;
let isVisible = false;

// Initialize overlay
const initializeOverlay = () => {
  if (overlayRoot) return;

  console.log('Lemo AI: Initializing overlay...');

  // Inject styles
  injectOverlayStyles();

  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.id = 'lemo-overlay-root';
  wrapper.className = 'lemo-overlay-wrapper hidden';
  document.body.appendChild(wrapper);

  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'lemo-toggle-btn';
  toggleButton.className = 'lemo-toggle-button';
  toggleButton.innerHTML = '🤖';
  toggleButton.onclick = showOverlay;
  document.body.appendChild(toggleButton);

  // Create React root
  overlayRoot = ReactDOM.createRoot(wrapper);

  // Render overlay
  renderOverlay();
};

const renderOverlay = () => {
  if (!overlayRoot) return;

  overlayRoot.render(
    <React.StrictMode>
      <Overlay onClose={hideOverlay} onMinimize={minimizeOverlay} />
    </React.StrictMode>
  );
};

const showOverlay = () => {
  const wrapper = document.getElementById('lemo-overlay-root');
  const toggleButton = document.getElementById('lemo-toggle-btn');

  if (wrapper) {
    wrapper.classList.remove('hidden');
    document.body.classList.add('lemo-overlay-active');
    isVisible = true;
  }

  if (toggleButton) {
    toggleButton.classList.add('hidden');
  }

  // Notify background
  chrome.runtime.sendMessage({ action: 'overlay_toggled', isVisible: true });
};

const hideOverlay = () => {
  const wrapper = document.getElementById('lemo-overlay-root');
  const toggleButton = document.getElementById('lemo-toggle-btn');

  if (wrapper) {
    wrapper.classList.add('hidden');
    document.body.classList.remove('lemo-overlay-active');
    isVisible = false;
  }

  if (toggleButton) {
    toggleButton.classList.remove('hidden');
  }

  // Notify background
  chrome.runtime.sendMessage({ action: 'overlay_toggled', isVisible: false });
};

const minimizeOverlay = () => {
  const wrapper = document.getElementById('lemo-overlay-root');
  const toggleButton = document.getElementById('lemo-toggle-btn');

  if (wrapper) {
    wrapper.classList.add('hidden');
    document.body.classList.remove('lemo-overlay-active');
    isVisible = false;
  }

  if (toggleButton) {
    toggleButton.classList.remove('hidden');
  }

  // Notify background
  chrome.runtime.sendMessage({ action: 'overlay_toggled', isVisible: false });
};

const toggleOverlay = () => {
  if (isVisible) {
    minimizeOverlay();
  } else {
    showOverlay();
  }
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle_overlay') {
    if (!overlayRoot) {
      initializeOverlay();
      setTimeout(showOverlay, 100);
    } else {
      toggleOverlay();
    }
    sendResponse({ success: true });
  }
});

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOverlay);
} else {
  initializeOverlay();
}

console.log('Lemo AI: Content script loaded');