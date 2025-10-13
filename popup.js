// Lemo AI Chatbot functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearChatBtn = document.getElementById('clearChat');
    const settingsBtn = document.getElementById('settingsBtn');
    const charCounter = document.getElementById('charCounter');

    // Chat state
    let isTyping = false;
    let messageHistory = [];

    // Initialize chatbot
    init();

    function init() {
        console.log('Lemo AI Chatbot initialized');
        loadChatHistory();
        attachEventListeners();
        autoResize();
    }

    function attachEventListeners() {
        sendButton.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keydown', handleKeyDown);
        messageInput.addEventListener('input', handleInputChange);
        clearChatBtn.addEventListener('click', handleClearChat);
        settingsBtn.addEventListener('click', handleSettings);
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                // Allow new line with Shift+Enter
                return;
            } else {
                event.preventDefault();
                handleSendMessage();
            }
        }
    }

    function handleInputChange() {
        const text = messageInput.value;
        const charCount = text.length;
        
        // Update character counter
        charCounter.textContent = `${charCount}/500`;
        
        // Enable/disable send button
        sendButton.disabled = text.trim().length === 0 || isTyping;
        
        // Auto-resize textarea
        autoResize();
    }

    function autoResize() {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    }

    async function handleSendMessage() {
        const message = messageInput.value.trim();
        if (!message || isTyping) return;

        // Add user message
        addMessage(message, 'user');
        messageInput.value = '';
        handleInputChange();
        
        // Store in history
        messageHistory.push({ role: 'user', content: message, timestamp: Date.now() });
        saveChatHistory();

        // Show typing indicator and get AI response
        await generateAIResponse(message);
    }

    function addMessage(content, type = 'bot') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = `<span class="${type}-avatar">${type === 'bot' ? '🤖' : '👤'}</span>`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const text = document.createElement('p');
        text.textContent = content;
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = formatTime(new Date());
        
        bubble.appendChild(text);
        bubble.appendChild(time);
        messageContent.appendChild(bubble);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        
        return messageDiv;
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
        scrollToBottom();
        isTyping = true;
        sendButton.disabled = true;
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
        isTyping = false;
        sendButton.disabled = messageInput.value.trim().length === 0;
    }

    async function generateAIResponse(userMessage) {
        showTypingIndicator();
        
        try {
            // Simulate AI thinking time
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            
            const response = getAIResponse(userMessage);
            
            hideTypingIndicator();
            addMessage(response, 'bot');
            
            // Store in history
            messageHistory.push({ role: 'bot', content: response, timestamp: Date.now() });
            saveChatHistory();
            
        } catch (error) {
            console.error('AI response error:', error);
            hideTypingIndicator();
            addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }

    function getAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Blockchain/DeFi specific responses
        if (lowerMessage.includes('wallet') || lowerMessage.includes('connect')) {
            return "I can help you with wallet connections! For Web3 development, you'll typically use libraries like Web3.js or Ethers.js. Would you like me to explain how to implement wallet connectivity?";
        }
        
        if (lowerMessage.includes('smart contract') || lowerMessage.includes('solidity')) {
            return "Smart contracts are self-executing contracts with terms directly written into code. I can help you with Solidity development, deployment strategies, or contract security best practices. What specific aspect interests you?";
        }
        
        if (lowerMessage.includes('defi') || lowerMessage.includes('decentralized finance')) {
            return "DeFi is revolutionizing finance! I can discuss AMMs, yield farming, liquidity pools, governance tokens, or protocol mechanics. What DeFi concept would you like to explore?";
        }
        
        if (lowerMessage.includes('nft') || lowerMessage.includes('token')) {
            return "NFTs and tokens are core to the Web3 ecosystem. I can explain ERC standards (ERC-20, ERC-721, ERC-1155), minting processes, or marketplace integration. What would you like to learn?";
        }
        
        if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
            return "Ethereum is the leading smart contract platform! I can help with gas optimization, Layer 2 solutions, EIP standards, or development frameworks like Hardhat and Truffle. What's your focus area?";
        }
        
        if (lowerMessage.includes('hackathon') || lowerMessage.includes('ethonline')) {
            return "Exciting! EthOnline is a fantastic hackathon. I can help you brainstorm ideas, suggest tech stacks, provide development tips, or review your project architecture. How can I assist with your submission?";
        }
        
        if (lowerMessage.includes('gas') || lowerMessage.includes('fee')) {
            return "Gas fees are crucial in Ethereum development. I can explain gas optimization techniques, discuss Layer 2 solutions like Polygon or Arbitrum, or help with cost-effective contract design. What specific gas-related challenge are you facing?";
        }
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! I'm here to help with your blockchain development journey. Whether you need help with smart contracts, DeFi protocols, NFTs, or hackathon strategies, I'm ready to assist!";
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            return "I'm your blockchain development assistant! I can help with:\n\n• Smart contract development & security\n• DeFi protocols & mechanisms\n• NFT implementation & standards\n• Web3 frontend integration\n• Gas optimization strategies\n• Hackathon project guidance\n\nWhat would you like to explore?";
        }
        
        // Default responses
        const responses = [
            "That's an interesting question! Could you provide more context about your blockchain project?",
            "I'd love to help! Can you tell me more about what you're trying to build?",
            "Great question! Are you working on a specific Web3 or DeFi project?",
            "I'm here to assist with your blockchain development. What specific challenge are you facing?",
            "Interesting! Let me know more details about your use case and I can provide better guidance."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function handleClearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            chatMessages.innerHTML = '';
            messageHistory = [];
            saveChatHistory();
            
            // Add welcome message back
            setTimeout(() => {
                addMessage("Hello! I'm Lemo AI, your blockchain assistant for the EthOnline hackathon. How can I help you today?", 'bot');
            }, 100);
        }
    }

    function handleSettings() {
        const settings = {
            theme: 'default',
            autoScroll: true,
            notifications: true
        };
        
        addMessage("Settings:\n• Theme: Default\n• Auto-scroll: Enabled\n• Notifications: Enabled\n\nSettings panel coming soon in the next update!", 'bot');
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    async function saveChatHistory() {
        try {
            await chrome.storage.local.set({ 
                chatHistory: messageHistory,
                lastUpdated: Date.now()
            });
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    async function loadChatHistory() {
        try {
            const result = await chrome.storage.local.get(['chatHistory']);
            if (result.chatHistory && result.chatHistory.length > 1) {
                messageHistory = result.chatHistory;
                
                // Clear existing messages except welcome
                const messages = chatMessages.querySelectorAll('.message');
                if (messages.length > 1) {
                    for (let i = 1; i < messages.length; i++) {
                        messages[i].remove();
                    }
                }
                
                // Restore chat history
                messageHistory.forEach(msg => {
                    if (msg.role !== 'system') {
                        addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    // Handle messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'newMessage') {
            addMessage(request.content, 'bot');
        }
        sendResponse({ success: true });
    });
});
