// Content script for Lemo AI Assistant Overlay
(function() {
    'use strict';

    let chatOverlay = null;
    let toggleButton = null;
    let isVisible = false;
    let isMinimized = false;

    // Initialize the chatbot overlay
    function initializeChatbot() {
        if (chatOverlay) return; // Already initialized

        createOverlay();
        createToggleButton();
        loadChatbotContent();
        
        // Set initial state
        hideOverlay();
    }

    function createOverlay() {
        // Create the main overlay container
        chatOverlay = document.createElement('div');
        chatOverlay.className = 'lemo-chat-overlay hidden';
        chatOverlay.innerHTML = `
            <button class="lemo-minimize-btn" title="Minimize">−</button>
            <button class="lemo-close-btn" title="Close">×</button>
            <div class="lemo-chat-content"></div>
        `;

        // Add event listeners for overlay controls
        const minimizeBtn = chatOverlay.querySelector('.lemo-minimize-btn');
        const closeBtn = chatOverlay.querySelector('.lemo-close-btn');

        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeOverlay();
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hideOverlay();
        });

        document.body.appendChild(chatOverlay);
    }

    function createToggleButton() {
        toggleButton = document.createElement('button');
        toggleButton.className = 'lemo-toggle-btn';
        toggleButton.innerHTML = '🤖';
        toggleButton.title = 'Open Lemo AI Assistant';

        toggleButton.addEventListener('click', () => {
            if (isMinimized) {
                maximizeOverlay();
            } else {
                showOverlay();
            }
        });

        document.body.appendChild(toggleButton);
    }

    function loadChatbotContent() {
        const contentContainer = chatOverlay.querySelector('.lemo-chat-content');
        
        // Create the chatbot HTML structure
        contentContainer.innerHTML = `
            <div class="chat-container">
                <!-- Header -->
                <div class="chat-header">
                    <div class="header-avatar">
                        <div class="avatar-circle">
                            <span class="avatar-icon">🤖</span>
                        </div>
                        <div class="status-indicator"></div>
                    </div>
                    <div class="header-info">
                        <h3 class="assistant-name">Lemo AI</h3>
                        <p class="assistant-status">Online - EthOnline</p>
                    </div>
                    <div class="header-actions">
                        <button class="action-btn" id="clearChatOverlay" title="Clear chat">
                            <span class="clear-icon">🗑️</span>
                        </button>
                    </div>
                </div>

                <!-- Chat Messages Area -->
                <div class="chat-messages" id="chatMessagesOverlay">
                    <!-- Welcome message -->
                    <div class="message bot-message">
                        <div class="message-avatar">
                            <span class="bot-avatar">🤖</span>
                        </div>
                        <div class="message-content">
                            <div class="message-bubble">
                                <p>Hello! I'm Lemo AI, your blockchain assistant for the EthOnline hackathon. How can I help you today?</p>
                                <span class="message-time">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Typing Indicator -->
                <div class="typing-indicator" id="typingIndicatorOverlay" style="display: none;">
                    <div class="message bot-message">
                        <div class="message-avatar">
                            <span class="bot-avatar">🤖</span>
                        </div>
                        <div class="message-content">
                            <div class="typing-bubble">
                                <div class="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="chat-input">
                    <div class="input-container">
                        <textarea 
                            id="messageInputOverlay" 
                            placeholder="Ask me anything about blockchain, DeFi, or smart contracts..." 
                            rows="1"
                            maxlength="500"
                        ></textarea>
                        <button id="sendButtonOverlay" class="send-button" disabled>
                            <span class="send-icon">➤</span>
                        </button>
                    </div>
                    <div class="input-footer">
                        <span class="char-counter" id="charCounterOverlay">0/500</span>
                        <span class="powered-by">Powered by Lemo AI • EthOnline</span>
                    </div>
                </div>
            </div>
        `;

        // Initialize chatbot functionality
        initializeChatbotLogic();
    }

    function initializeChatbotLogic() {
        // Initialize the chatbot with the same logic as popup.js, but adapted for overlay
        const messageInput = document.getElementById('messageInputOverlay');
        const sendButton = document.getElementById('sendButtonOverlay');
        const clearButton = document.getElementById('clearChatOverlay');
        const charCounter = document.getElementById('charCounterOverlay');
        const chatMessages = document.getElementById('chatMessagesOverlay');
        const typingIndicator = document.getElementById('typingIndicatorOverlay');

        let conversations = [{
            text: "Hello! I'm Lemo AI, your blockchain assistant for the EthOnline hackathon. How can I help you today?",
            sender: "bot",
            timestamp: new Date().toISOString()
        }];

        const responses = {
            'hello|hi|hey|good morning|good afternoon|good evening': [
                "Hello! Great to see you today! I'm Lemo AI, ready to help with your EthOnline project!",
                "Hi there! I'm excited to help you with blockchain development. What's on your mind?",
                "Hey! Welcome to Lemo AI! How can I assist with your hackathon project today?",
                "Good to see you! Ready to build something amazing for EthOnline?",
                "Hello! Let's tackle some blockchain challenges together!"
            ],
            'smart contract|solidity|ethereum|blockchain': [
                "Smart contracts are the backbone of Web3! I can help with Solidity development, contract architecture, security best practices, and deployment strategies. What's your specific need?",
                "Ethereum development is exciting! Are you working on DeFi, NFTs, DAOs, or something else? I can guide you through the process.",
                "Blockchain technology offers endless possibilities! Let's discuss your project requirements and build something amazing together.",
                "Solidity is a powerful language! I can help with contract logic, optimization techniques, and integration patterns. What are you building?"
            ],
            'defi|decentralized finance|yield|liquidity|amm': [
                "DeFi is revolutionizing finance! I can explain AMMs, yield farming strategies, liquidity provision, governance mechanisms, and protocol design. What interests you most?",
                "Decentralized finance opens up incredible opportunities! Whether it's building AMMs, yield protocols, or lending platforms, I'm here to help.",
                "DeFi protocols are complex but rewarding to build! Let's discuss tokenomics, liquidity incentives, and protocol sustainability.",
                "The DeFi space is rapidly evolving! I can help with protocol mechanics, risk management, and user experience design."
            ],
            'hackathon|ethonline|project|idea|build': [
                "EthOnline is an amazing opportunity! I can help you brainstorm ideas, validate concepts, choose the right tech stack, and plan your development timeline.",
                "Hackathon success comes from good planning and execution! What's your project idea? Let's refine it and create a winning strategy.",
                "Building for hackathons requires focus and speed! I can help you scope your project realistically and suggest quick implementation approaches.",
                "EthOnline projects should solve real problems! Let's discuss current market needs and how your solution can stand out."
            ]
        };

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        messageInput.addEventListener('input', () => {
            autoResizeTextarea();
            updateCharCounter();
            updateSendButton();
        });

        clearButton.addEventListener('click', clearChat);
        messageInput.focus();

        function autoResizeTextarea() {
            messageInput.style.height = 'auto';
            messageInput.style.height = messageInput.scrollHeight + 'px';
        }

        function updateCharCounter() {
            const length = messageInput.value.length;
            charCounter.textContent = `${length}/500`;
            
            if (length > 400) {
                charCounter.style.color = '#dc3545';
            } else if (length > 300) {
                charCounter.style.color = '#fd7e14';
            } else {
                charCounter.style.color = '#6c757d';
            }
        }

        function updateSendButton() {
            const hasContent = messageInput.value.trim().length > 0;
            sendButton.disabled = !hasContent;
        }

        async function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            addMessage(message, 'user');
            messageInput.value = '';
            messageInput.style.height = 'auto';
            updateCharCounter();
            updateSendButton();

            showTypingIndicator();

            await delay(800 + Math.random() * 1200);

            const response = generateResponse(message);
            hideTypingIndicator();
            addMessage(response, 'bot');
        }

        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            
            const avatar = sender === 'bot' ? '🤖' : '👤';
            const avatarClass = sender === 'bot' ? 'bot-avatar' : 'user-avatar';
            
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <span class="${avatarClass}">${avatar}</span>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${escapeHtml(text)}</p>
                        <span class="message-time">${getCurrentTime()}</span>
                    </div>
                </div>
            `;

            chatMessages.appendChild(messageDiv);
            scrollToBottom();

            conversations.push({
                text: text,
                sender: sender,
                timestamp: new Date().toISOString()
            });
        }

        function showTypingIndicator() {
            typingIndicator.style.display = 'block';
            scrollToBottom();
        }

        function hideTypingIndicator() {
            typingIndicator.style.display = 'none';
        }

        function scrollToBottom() {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }

        function generateResponse(userMessage) {
            const message = userMessage.toLowerCase();
            
            for (const [pattern, responseArray] of Object.entries(responses)) {
                const keywords = pattern.split('|');
                if (keywords.some(keyword => message.includes(keyword.toLowerCase()))) {
                    return responseArray[Math.floor(Math.random() * responseArray.length)];
                }
            }

            const defaultResponses = [
                "That's interesting! Can you tell me more about that?",
                "I understand. How can I help you with this blockchain project?",
                "Thanks for sharing! What would you like to explore next in Web3?",
                "I see. Is there anything specific about blockchain development you'd like assistance with?",
                "That's a great question! Let me think about how I can help with your EthOnline project.",
                "I appreciate you reaching out! What blockchain challenge can we tackle together?"
            ];

            return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }

        function clearChat() {
            const messages = chatMessages.querySelectorAll('.message');
            messages.forEach((message, index) => {
                if (index > 0) {
                    message.remove();
                }
            });

            conversations = conversations.slice(0, 1);
            messageInput.focus();
        }

        function getCurrentTime() {
            const now = new Date();
            return now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // Overlay control functions
    function showOverlay() {
        if (!chatOverlay) return;
        
        chatOverlay.classList.remove('hidden');
        chatOverlay.classList.add('entering');
        toggleButton.classList.remove('visible');
        isVisible = true;
        isMinimized = false;

        setTimeout(() => {
            chatOverlay.classList.remove('entering');
        }, 400);

        // Focus on input
        const messageInput = document.getElementById('messageInputOverlay');
        if (messageInput) {
            setTimeout(() => messageInput.focus(), 500);
        }

        // Notify background script
        try {
            if (chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: "chatbot_toggled",
                    isVisible: true
                });
            }
        } catch (error) {
            console.log('Lemo AI: Could not send message to background:', error);
        }
    }

    function hideOverlay() {
        if (!chatOverlay) return;
        
        chatOverlay.classList.add('hidden');
        chatOverlay.classList.remove('minimized');
        toggleButton.classList.add('visible');
        isVisible = false;
        isMinimized = false;

        // Notify background script
        try {
            if (chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: "chatbot_toggled",
                    isVisible: false
                });
            }
        } catch (error) {
            console.log('Lemo AI: Could not send message to background:', error);
        }
    }

    function minimizeOverlay() {
        if (!chatOverlay) return;
        
        chatOverlay.classList.add('minimized');
        toggleButton.classList.add('visible');
        isMinimized = true;

        // Notify background script
        try {
            if (chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: "chatbot_toggled",
                    isVisible: false
                });
            }
        } catch (error) {
            console.log('Lemo AI: Could not send message to background:', error);
        }
    }

    function maximizeOverlay() {
        if (!chatOverlay) return;
        
        chatOverlay.classList.remove('minimized');
        toggleButton.classList.remove('visible');
        isMinimized = false;

        // Focus on input
        const messageInput = document.getElementById('messageInputOverlay');
        if (messageInput) {
            setTimeout(() => messageInput.focus(), 100);
        }

        // Notify background script
        try {
            if (chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: "chatbot_toggled",
                    isVisible: true
                });
            }
        } catch (error) {
            console.log('Lemo AI: Could not send message to background:', error);
        }
    }

    // Listen for messages from background script
    if (chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            try {
                if (request.action === "toggle_chatbot") {
                    if (!chatOverlay) {
                        initializeChatbot();
                        setTimeout(() => showOverlay(), 100);
                    } else if (isVisible && !isMinimized) {
                        hideOverlay();
                    } else if (isMinimized) {
                        maximizeOverlay();
                    } else {
                        showOverlay();
                    }
                    sendResponse({success: true});
                }
            } catch (error) {
                console.log('Lemo AI: Error handling message:', error);
                sendResponse({success: false, error: error.message});
            }
        });
    }

    // Initialize when DOM is ready
    function safeInitialize() {
        try {
            initializeChatbot();
            console.log('Lemo AI: Initialized successfully');
        } catch (error) {
            console.log('Lemo AI: Initialization error, retrying...', error);
            setTimeout(safeInitialize, 1000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInitialize);
    } else {
        safeInitialize();
    }

})();