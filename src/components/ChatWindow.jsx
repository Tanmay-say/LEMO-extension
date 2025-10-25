import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import AssistantInput from './AssistantInput';
import { AlertCircle, WalletIcon } from 'lucide-react';
import { getConnectedWallet } from '../utils/auth.js';
import { createSession, getCurrentSession, saveCurrentSession, getCurrentTabInfo, sendChatMessage, getSessionDetails } from '../utils/session.js';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Check if wallet is connected
      const wallet = await getConnectedWallet();
      
      if (!wallet) {
        setIsAuthenticated(false);
        setIsLoadingSession(false);
        setMessages([{
          id: 'welcome',
          type: 'bot',
          content: 'Please connect your wallet from the Wallet tab to start chatting.',
          timestamp: new Date().toISOString(),
        }]);
        return;
      }

      // Wallet is connected - enable chat
      setWalletAddress(wallet);
      setIsAuthenticated(true);

      // Try to load existing session (gracefully fail if backend unavailable)
      const existingSessionId = await getCurrentSession();
      
      if (existingSessionId) {
        // Try to load chat history from backend
        try {
          const sessionData = await getSessionDetails(wallet, existingSessionId);
          setSessionId(existingSessionId);
          setIsBackendAvailable(true);
          
          if (sessionData.session && sessionData.session.chat_messages) {
            // Convert backend messages to our format
            const formattedMessages = sessionData.session.chat_messages.map(msg => ({
              id: msg.id,
              type: msg.message_type === 'user' ? 'user' : 'bot',
              content: msg.message,
              timestamp: msg.created_at,
            }));
            setMessages(formattedMessages);
          }
        } catch (err) {
          console.error('Error loading session from backend:', err);
          // Backend unavailable, but chat still works
          setIsBackendAvailable(false);
          setError('Backend unavailable. Chat will work but history won\'t be saved.');
          setMessages([{
            id: 'welcome',
            type: 'bot',
            content: 'Hello! I\'m your Lemo AI Assistant. (⚠️ Backend offline - responses may be limited)',
            timestamp: new Date().toISOString(),
          }]);
        }
      } else {
        // No existing session, show welcome message
        setMessages([{
          id: 'welcome',
          type: 'bot',
          content: 'Hello! I\'m your Lemo AI Assistant. I can help you find products and compare prices across platforms. Try asking me about a product!',
          timestamp: new Date().toISOString(),
        }]);
      }
      
      setIsLoadingSession(false);
    } catch (err) {
      console.error('Error initializing chat:', err);
      setIsLoadingSession(false);
      setError('Failed to initialize chat. Please try again.');
    }
  };

  const handleSendMessage = async (inputValue) => {
    if (!inputValue.trim()) return;

    if (!isAuthenticated || !walletAddress) {
      setError('Please connect your wallet first.');
      return;
    }

    // Create user message
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      // Try to use backend
      let currentSessionId = sessionId;
      
      if (!currentSessionId) {
        try {
          console.log('[CHAT] ============================================');
          console.log('[CHAT] Creating new session...');
          console.log('[CHAT] Wallet Address:', walletAddress);
          
          const tabInfo = await getCurrentTabInfo();
          console.log('[CHAT] ✓ Got tab info:', tabInfo);
          console.log('[CHAT]   - URL:', tabInfo.url);
          console.log('[CHAT]   - Domain:', tabInfo.domain);
          
          console.log('[CHAT] Calling createSession API...');
          const newSession = await createSession(walletAddress, tabInfo.url, tabInfo.domain);
          console.log('[CHAT] ✓ Session created:', newSession);
          
          currentSessionId = newSession.id || newSession.session_id;
          console.log('[CHAT] ✓ Session ID:', currentSessionId);
          
          setSessionId(currentSessionId);
          await saveCurrentSession(currentSessionId);
          console.log('[CHAT] ✓ Session saved to storage');
          console.log('[CHAT] ============================================');
        } catch (sessionError) {
          console.error('[CHAT] ✗✗✗ Failed to create session:', sessionError);
          console.error('[CHAT] Error details:', {
            message: sessionError.message,
            stack: sessionError.stack,
          });
          // Continue without session - backend unavailable
        }
      }

      if (currentSessionId) {
        // Try to send message to backend
        try {
          const response = await sendChatMessage(walletAddress, currentSessionId, inputValue);
          
          // Add bot response from backend
          const botMessage = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: response.answer,
            timestamp: new Date().toISOString(),
          };

          setMessages(prev => [...prev, botMessage]);
          setIsBackendAvailable(true);
        } catch (apiError) {
          console.error('Backend API error:', apiError);
          throw apiError; // Let outer catch handle it
        }
      } else {
        // No backend session - fallback message
        throw new Error('Backend service unavailable. Please check your settings and ensure the backend is running.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setIsBackendAvailable(false);
      
      // Show error but don't completely break
      const errorDetails = err.message.includes('403') 
        ? 'Your account may be inactive. Please contact support or check your registration status.'
        : err.message;
      
      setError(`Backend error: ${errorDetails}`);
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: `⚠️ **Backend Service Error**\n\nI couldn't process your request. ${errorDetails}\n\n**Troubleshooting:**\n- Check Settings → Backend Configuration\n- Ensure backend server is running\n- Verify your account is active`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    // Clear session
    setSessionId(null);
    await saveCurrentSession(null);
    
    // Reset messages
    setMessages([{
      id: 'welcome',
      type: 'bot',
      content: 'Hello! I\'m your Lemo AI Assistant. I can help you find products and compare prices across platforms. Try asking me about a product!',
      timestamp: new Date().toISOString(),
    }]);
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return '';
    }
  };

  // Check if content is markdown
  const isMarkdown = (content) => {
    return /[#*_`\[\]]/g.test(content) || content.includes('\n\n');
  };

  if (isLoadingSession) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Backend Status Warning */}
      {!isBackendAvailable && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <span className="text-sm text-yellow-800">
            Backend service is unavailable. Check your settings and backend connection.
          </span>
        </div>
      )}

      {/* Not Authenticated Warning */}
      {!isAuthenticated && (
        <div className="bg-orange-50 border-b border-orange-200 p-4 flex items-center justify-center gap-3">
          <WalletIcon className="w-5 h-5 text-orange-600" />
          <span className="text-sm text-orange-800 font-medium">
            Please connect your wallet from the Wallet tab to start chatting
          </span>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-slide-in-up ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                message.type === 'bot'
                  ? message.isError 
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-orange-500 to-orange-600'
                  : 'bg-gradient-to-br from-blue-400 to-cyan-400'
              }`}
            >
              {message.type === 'bot' ? (
                <img src={chrome.runtime.getURL('logo.png')} alt="Lemo" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                '👤'
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[75%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  message.type === 'bot'
                    ? message.isError
                      ? 'bg-red-50 border border-red-200 rounded-tl-sm text-gray-800'
                      : 'bg-white border border-orange-200 rounded-tl-sm text-gray-800'
                    : 'bg-gradient-to-r from-[#FF7A00] to-[#E76500] text-white rounded-tr-sm'
                }`}
              >
                {isMarkdown(message.content) && message.type === 'bot' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-current whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 mt-1 block px-2">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center overflow-hidden">
              <img src={chrome.runtime.getURL('logo.png')} alt="Lemo" className="w-6 h-6 rounded-full object-cover" />
            </div>
            <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <AssistantInput 
          onSendMessage={handleSendMessage}
          disabled={!isAuthenticated || isTyping}
        />
        <div className="flex justify-between mt-2 text-xs px-1">
          {sessionId && (
            <button
              onClick={clearChat}
              className="text-gray-400 hover:text-orange-600 transition-colors"
            >
              New Chat
            </button>
          )}
          <span className="text-gray-400 opacity-70 ml-auto">Powered by Lemo AI</span>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
