// Session management utilities for LEMO Extension
import { getBackendUrl } from './auth.js';

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    // Remove www. prefix if present
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    console.error('Error extracting domain:', error);
    return 'unknown';
  }
};

/**
 * Get current tab URL and domain
 * @returns {Promise<{url: string, domain: string}>}
 */
export const getCurrentTabInfo = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      return {
        url: tab.url,
        domain: extractDomain(tab.url),
      };
    }
    return {
      url: 'chrome://extensions',
      domain: 'chrome',
    };
  } catch (error) {
    console.error('Error getting current tab info:', error);
    return {
      url: 'chrome://extensions',
      domain: 'chrome',
    };
  }
};

/**
 * Create a new chat session
 * @param {string} userId - User's wallet address
 * @param {string} currentUrl - Current page URL
 * @param {string} currentDomain - Current page domain
 * @returns {Promise<object>} Session data
 */
export const createSession = async (userId, currentUrl, currentDomain) => {
  try {
    const backendUrl = await getBackendUrl();
    const response = await fetch(`${backendUrl}/sessions/`, {
      method: 'POST',
      headers: {
        'Authorization': userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_url: currentUrl,
        current_domain: currentDomain,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to create session');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Get session details including chat history
 * @param {string} userId - User's wallet address
 * @param {string} sessionId - Session ID
 * @returns {Promise<object>} Session data with chat messages
 */
export const getSessionDetails = async (userId, sessionId) => {
  try {
    const backendUrl = await getBackendUrl();
    const response = await fetch(`${backendUrl}/sessions/data?id=${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': userId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to get session details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting session details:', error);
    throw error;
  }
};

/**
 * Send a chat message and get AI response
 * @param {string} userId - User's wallet address
 * @param {string} sessionId - Session ID
 * @param {string} userQuery - User's message
 * @returns {Promise<{answer: string}>} AI response
 */
export const sendChatMessage = async (userId, sessionId, userQuery) => {
  try {
    const backendUrl = await getBackendUrl();
    const response = await fetch(`${backendUrl}/query?session_id=${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_query: userQuery,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to send message');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Store current session ID
 * @param {string} sessionId - Session ID to store
 */
export const saveCurrentSession = async (sessionId) => {
  try {
    await chrome.storage.local.set({ currentSessionId: sessionId });
  } catch (error) {
    console.error('Error saving current session:', error);
    throw error;
  }
};

/**
 * Get current session ID
 * @returns {Promise<string|null>} Session ID or null
 */
export const getCurrentSession = async () => {
  try {
    const result = await chrome.storage.local.get(['currentSessionId']);
    return result.currentSessionId || null;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

/**
 * Clear current session ID
 */
export const clearCurrentSession = async () => {
  try {
    await chrome.storage.local.remove(['currentSessionId']);
  } catch (error) {
    console.error('Error clearing current session:', error);
    throw error;
  }
};

