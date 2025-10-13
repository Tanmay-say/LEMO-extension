// Lemo AI Chatbot functionality for EthOnline Hackathon
class LemoChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearChatButton = document.getElementById('clearChat');
        this.charCounter = document.getElementById('charCounter');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        this.conversations = [];
        this.responses = this.initializeResponses();
        
        this.init();
    }

    init() {
        this.loadStoredConversations();
        this.bindEvents();
        this.updateSendButton();
    }

    bindEvents() {
        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input validation and character counter
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateCharCounter();
            this.updateSendButton();
        });

        // Clear chat
        this.clearChatButton.addEventListener('click', () => this.clearChat());

        // Auto-focus input
        this.messageInput.focus();
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    updateCharCounter() {
        const length = this.messageInput.value.length;
        this.charCounter.textContent = `${length}/500`;
        
        if (length > 400) {
            this.charCounter.style.color = '#dc3545';
        } else if (length > 300) {
            this.charCounter.style.color = '#fd7e14';
        } else {
            this.charCounter.style.color = '#6c757d';
        }
    }

    updateSendButton() {
        const hasContent = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasContent;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.updateCharCounter();
        this.updateSendButton();

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate thinking time
        await this.delay(800 + Math.random() * 1200);

        // Generate and add bot response
        const response = this.generateResponse(message);
        this.hideTypingIndicator();
        this.addMessage(response, 'bot');

        // Save conversation
        this.saveConversations();
    }

    addMessage(text, sender) {
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
                    <p>${this.escapeHtml(text)}</p>
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Store in conversations
        this.conversations.push({
            text: text,
            sender: sender,
            timestamp: new Date().toISOString()
        });
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'block';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Check for specific patterns and keywords
        for (const [pattern, responses] of Object.entries(this.responses)) {
            if (this.matchesPattern(message, pattern)) {
                return this.getRandomResponse(responses);
            }
        }

        // Default responses if no pattern matches
        const defaultResponses = [
            "That's interesting! Can you tell me more about that?",
            "I understand. How can I help you with this?",
            "Thanks for sharing! What would you like to do next?",
            "I see. Is there anything specific you'd like assistance with?",
            "That's a great question! Let me think about how I can help.",
            "I appreciate you reaching out! What can I do for you today?"
        ];

        return this.getRandomResponse(defaultResponses);
    }

    matchesPattern(message, pattern) {
        const keywords = pattern.split('|');
        return keywords.some(keyword => message.includes(keyword.toLowerCase()));
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    initializeResponses() {
        return {
            'hello|hi|hey|good morning|good afternoon|good evening': [
                "Hello! Great to see you today! I'm Lemo AI, ready to help with your EthOnline project!",
                "Hi there! I'm excited to help you with blockchain development. What's on your mind?",
                "Hey! Welcome to Lemo AI! How can I assist with your hackathon project today?",
                "Good to see you! Ready to build something amazing for EthOnline?",
                "Hello! Let's tackle some blockchain challenges together!"
            ],
            'how are you|how do you do|what\'s up': [
                "I'm doing great! Ready to help with your EthOnline project. How are you progressing?",
                "I'm fantastic and ready to assist with blockchain development! How are you doing?",
                "I'm doing well! Excited to help you build the next big Web3 project.",
                "I'm great! What blockchain challenge can we solve today?",
                "Doing wonderful! How can I help make your hackathon project successful?"
            ],
            'what can you do|what are your capabilities|help me|what do you offer': [
                "I'm your blockchain development assistant! I can help with smart contracts, DeFi protocols, Web3 integration, gas optimization, and hackathon strategy. What specific area interests you?",
                "I'm here to assist with Solidity development, blockchain architecture, tokenomics design, NFT implementation, and more! What would you like to work on?",
                "Great question! I specialize in Ethereum development, Layer 2 solutions, DeFi mechanics, smart contract security, and hackathon best practices. What shall we explore?",
                "I'm designed to help with all things blockchain! From smart contracts to frontend integration, I've got you covered. What's your focus area?"
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
            'nft|token|erc721|erc1155|opensea': [
                "NFTs and tokens are core to Web3! I can help with ERC standards, metadata handling, marketplace integration, and royalty mechanisms. What's your project focus?",
                "Token standards like ERC-20, ERC-721, and ERC-1155 each serve different purposes. What type of token are you planning to create?",
                "NFT development involves smart contracts, metadata management, and marketplace considerations. I can guide you through the entire process!",
                "Whether it's fungible or non-fungible tokens, I can help with implementation, optimization, and best practices."
            ],
            'gas|optimization|layer 2|polygon|arbitrum': [
                "Gas optimization is crucial for user adoption! I can help with efficient contract design, batch operations, proxy patterns, and Layer 2 deployment strategies.",
                "Layer 2 solutions like Polygon and Arbitrum offer great scalability! Let's discuss deployment strategies and cross-chain considerations.",
                "Gas costs can make or break a project! I know various optimization techniques from storage packing to function modifiers.",
                "Scaling solutions are essential for Web3 success! Whether it's rollups, sidechains, or state channels, I can help you choose the right approach."
            ],
            'hackathon|ethonline|project|idea|build': [
                "EthOnline is an amazing opportunity! I can help you brainstorm ideas, validate concepts, choose the right tech stack, and plan your development timeline.",
                "Hackathon success comes from good planning and execution! What's your project idea? Let's refine it and create a winning strategy.",
                "Building for hackathons requires focus and speed! I can help you scope your project realistically and suggest quick implementation approaches.",
                "EthOnline projects should solve real problems! Let's discuss current market needs and how your solution can stand out."
            ],
            'web3|frontend|integration|wallet|metamask': [
                "Web3 frontend development is essential for user adoption! I can help with wallet integration, transaction handling, and user experience design.",
                "Connecting smart contracts to frontends requires careful consideration. Let's discuss Web3 libraries, wallet connectivity, and error handling.",
                "MetaMask and other wallet integrations can be tricky! I know the best practices for smooth user experiences and transaction flows.",
                "Web3 UX is still evolving! I can help you create intuitive interfaces that make blockchain interactions feel natural."
            ],
            'thanks|thank you|appreciate': [
                "You're very welcome! Happy to help you succeed in EthOnline!",
                "My pleasure! Building the future of Web3 together is what I'm here for.",
                "You're welcome! Feel free to ask anything about blockchain development.",
                "Glad I could help! Don't hesitate to reach out with more questions.",
                "Anytime! Let's keep building amazing Web3 projects!"
            ],
            'bye|goodbye|see you|farewell': [
                "Goodbye! Best of luck with your EthOnline project! 🚀",
                "See you later! Keep building awesome Web3 solutions!",
                "Take care! I'll be here whenever you need blockchain development help.",
                "Farewell! Hope to help you again soon with your Web3 journey!",
                "Bye for now! Wishing you success in the hackathon! 🏆"
            ]
        };
    }

    clearChat() {
        // Remove all messages except the welcome message
        const messages = this.chatMessages.querySelectorAll('.message');
        messages.forEach((message, index) => {
            if (index > 0) { // Keep the first welcome message
                message.remove();
            }
        });

        // Clear stored conversations except welcome
        this.conversations = this.conversations.slice(0, 1);
        this.saveConversations();

        // Focus back on input
        this.messageInput.focus();
    }

    getCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const isToday = this.isToday(now);
        if (isToday) {
            return timeString;
        } else {
            return `${now.toLocaleDateString()} ${timeString}`;
        }
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Storage functionality
    saveConversations() {
        try {
            chrome.storage.local.set({
                'lemoChat_conversations': this.conversations
            });
        } catch (error) {
            // Fallback to localStorage if chrome.storage is not available
            localStorage.setItem('lemoChat_conversations', JSON.stringify(this.conversations));
        }
    }

    loadStoredConversations() {
        try {
            chrome.storage.local.get(['lemoChat_conversations'], (result) => {
                if (result.lemoChat_conversations && result.lemoChat_conversations.length > 1) {
                    this.restoreConversations(result.lemoChat_conversations);
                }
            });
        } catch (error) {
            // Fallback to localStorage
            const stored = localStorage.getItem('lemoChat_conversations');
            if (stored) {
                const conversations = JSON.parse(stored);
                if (conversations.length > 1) {
                    this.restoreConversations(conversations);
                }
            }
        }
    }

    restoreConversations(conversations) {
        // Clear existing messages first (except welcome)
        const existingMessages = this.chatMessages.querySelectorAll('.message');
        existingMessages.forEach((message, index) => {
            if (index > 0) {
                message.remove();
            }
        });

        // Restore conversations (skip the first welcome message)
        conversations.slice(1).forEach(conv => {
            this.addMessageFromStorage(conv.text, conv.sender, conv.timestamp);
        });

        this.conversations = conversations;
    }

    addMessageFromStorage(text, sender, timestamp) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'bot' ? '🤖' : '👤';
        const avatarClass = sender === 'bot' ? 'bot-avatar' : 'user-avatar';
        const timeDisplay = this.formatStoredTime(timestamp);
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <span class="${avatarClass}">${avatar}</span>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <p>${this.escapeHtml(text)}</p>
                    <span class="message-time">${timeDisplay}</span>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
    }

    formatStoredTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        
        if (this.isToday(date)) {
            return date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
        }
    }
}

// Initialize the chatbot when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LemoChatbot();
});

// Handle extension popup resizing
window.addEventListener('resize', () => {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});