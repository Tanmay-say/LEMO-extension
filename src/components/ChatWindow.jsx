import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import ProductCard from './ProductCard';
import ComparisonTable from './ComparisonTable';
import AssistantInput from './AssistantInput';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your Lemo AI Assistant. I can help you find products and compare prices across platforms. Try asking me about a product!',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Check for product-related queries
    if (input.includes('product') || input.includes('buy') || input.includes('price') || input.includes('compare')) {
      if (input.includes('compare')) {
        return {
          id: Date.now(),
          type: 'bot',
          messageType: 'comparison',
          content: 'Here\'s a price comparison across different platforms:',
          timestamp: new Date(),
        };
      } else {
        return {
          id: Date.now(),
          type: 'bot',
          messageType: 'product',
          content: 'I found this product that might interest you:',
          timestamp: new Date(),
        };
      }
    }

    // Default responses
    const responses = {
      hello: 'Hello! How can I help you find products today?',
      help: 'I can help you find products, compare prices, and connect your wallet. Just ask me anything!',
      default: 'That\'s interesting! You can ask me to find products or compare prices across platforms.',
    };

    if (input.includes('hello') || input.includes('hi')) {
      return { id: Date.now(), type: 'bot', content: responses.hello, timestamp: new Date() };
    }
    if (input.includes('help')) {
      return { id: Date.now(), type: 'bot', content: responses.help, timestamp: new Date() };
    }

    return { id: Date.now(), type: 'bot', content: responses.default, timestamp: new Date() };
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white">
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
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600'
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
                    ? 'bg-white border border-orange-200 rounded-tl-sm text-gray-800'
                    : 'bg-gradient-to-r from-[#FF7A00] to-[#E76500] text-white rounded-tr-sm'
                }`}
              >
                <p className="text-sm leading-relaxed text-current">{message.content}</p>
                
                {/* Product Card */}
                {message.messageType === 'product' && (
                  <div className="mt-3">
                    <ProductCard
                      title="Wireless Headphones Pro"
                      price="$129.99"
                      platform="Amazon"
                      rating={4.5}
                      imageUrl="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"
                      link="#"
                    />
                  </div>
                )}

                {/* Comparison Table */}
                {message.messageType === 'comparison' && (
                  <div className="mt-3">
                    <ComparisonTable />
                  </div>
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
        <AssistantInput />
        <div className="flex justify-end mt-2 text-xs text-gray-400 px-1">
          <span className="opacity-70">Powered by Lemo AI</span>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;