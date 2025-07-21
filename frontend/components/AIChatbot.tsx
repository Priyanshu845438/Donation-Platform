

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI, Chat } from '@google/genai';
import { FiMessageSquare, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicCampaigns } from '../services/api.ts';
import type { Campaign } from '../types.ts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const SuggestionChip = ({ text, onSelect }: { text: string; onSelect: (text: string) => void }) => (
    <button
        onClick={() => onSelect(text)}
        className="px-3 py-1.5 bg-gray-100 dark:bg-brand-dark hover:bg-gray-200 dark:hover:bg-brand-dark-200/50 text-brand-deep-blue dark:text-gray-200 text-sm rounded-full transition-colors"
    >
        {text}
    </button>
);


const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const initialSuggestions = [
    "How do I donate?",
    "Tell me about a campaign",
    "Are my donations tax-deductible?"
  ];
  
  // Load campaigns for context
  useEffect(() => {
    getPublicCampaigns().then(setCampaigns).catch(console.error);
  }, []);

  // Load chat history from sessionStorage
  useEffect(() => {
    if (isOpen) {
        try {
            const storedMessages = sessionStorage.getItem('aiChatHistory');
            if (storedMessages) {
                const parsedMessages = JSON.parse(storedMessages);
                if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
                     setMessages(parsedMessages);
                     setShowSuggestions(false); // Don't show suggestions if there's history
                }
            } else {
                 setMessages([
                    { sender: 'bot', text: "Hello! I'm the DonationHub AI Assistant. How can I help you today? You can ask me about our campaigns, how to donate, or our mission." }
                ]);
                setShowSuggestions(true);
            }
        } catch (e) {
            console.error("Failed to parse chat history", e);
            sessionStorage.removeItem('aiChatHistory');
        }
    }
  }, [isOpen]);

  // Save chat history to sessionStorage
  useEffect(() => {
      if(isOpen && messages.length > 0) {
        sessionStorage.setItem('aiChatHistory', JSON.stringify(messages));
      }
  }, [messages, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getPageContext = () => {
      if (location.pathname === '/') return 'the Homepage';
      if (location.pathname.startsWith('/campaign/')) return 'a specific Campaign Details page';
      if (location.pathname === '/explore') return 'the Explore Campaigns page';
      if (location.pathname === '/about') return 'the About Us page';
      if (location.pathname === '/donate') return 'the Donation page';
      return `the ${location.pathname.replace('/', '')} page`;
  };

  const initializeChat = () => {
    if (!chatRef.current) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const campaignInfo = campaigns.map(c => `- **${c.title}**: Goal ₹${c.goal.toLocaleString()}, Raised ₹${c.raised.toLocaleString()}. Link: /campaign/${c.id}`).join('\n');
            const pageContext = getPageContext();
            
            const systemInstruction = `You are "HubBot", a friendly and helpful AI assistant for DonationHub, a platform for charitable giving.
            Your role is to assist users by answering their questions about the platform, our mission, how to donate, information about campaigns, and our commitment to transparency.
            - The user is currently on **${pageContext}**. Tailor your suggestions and answers to be relevant to this context if possible.
            - Use **Markdown** for formatting (especially for links, lists, and bold text) to make your responses clear and actionable. When you suggest visiting a page, provide a direct Markdown link (e.g., [Explore Campaigns](/explore)).
            - Be concise, polite, and guide users to relevant pages on the website.
            - **Our Mission**: To create a transparent, secure, and accessible platform that empowers individuals and organizations to make a meaningful impact on society.
            - **Transparency**: We are 80G and 12A certified.
            - Do not provide financial advice.
            - Here is a list of current active campaigns:\n${campaignInfo}\n
            Keep your answers helpful and not too long.`;
            
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
        } catch (error) {
            console.error("Failed to initialize AI Chat:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        }
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    
    setShowSuggestions(false);
    const userMessage: Message = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    initializeChat();
    
    if (!chatRef.current) {
        setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, the chat is not available right now." }]);
        setIsLoading(false);
        return;
    }

    try {
        const stream = await chatRef.current.sendMessageStream({ message: messageText });
        
        let botMessage = '';
        setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

        for await (const chunk of stream) {
            botMessage += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = botMessage.trimStart();
                return newMessages;
            });
        }
    } catch (error) {
        console.error('Gemini API error:', error);
        setMessages(prev => {
           const newMessages = [...prev];
           if(newMessages[newMessages.length -1].sender === 'bot' && newMessages[newMessages.length-1].text === '') newMessages.pop();
           return [...newMessages, { sender: 'bot', text: "I'm sorry, I encountered an error. Please try asking in a different way." }];
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };
  
  const handleSuggestionSelect = (text: string) => {
      sendMessage(text);
  };

  const fabAnimation = { whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 } };
  const chatWindowAnimation = {
      initial: { opacity: 0, y: 50, scale: 0.5 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 50, scale: 0.5 },
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-gold text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-[9998]"
        {...fabAnimation}
        aria-label="Open AI Chat"
      >
        <FiMessageSquare size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...chatWindowAnimation}
            className="fixed bottom-24 right-6 w-full max-w-sm h-full max-h-[calc(100vh-8rem)] sm:max-h-[600px] bg-white dark:bg-brand-dark-200 rounded-xl shadow-2xl flex flex-col z-[9999] overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <header className="bg-brand-deep-blue text-white p-4 flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/20" aria-label="Close chat">
                <FiX size={20} />
              </button>
            </header>

            <div className="flex-grow p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`prose prose-sm dark:prose-invert max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm break-words ${msg.sender === 'user' ? 'bg-brand-gold text-white rounded-br-none' : 'bg-gray-200 dark:bg-brand-dark text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({node, ...props}) => <a {...props} className="text-brand-deep-blue dark:text-brand-gold font-bold hover:underline" target="_blank" rel="noopener noreferrer"/> }}>
                            {msg.text}
                        </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 dark:bg-brand-dark text-gray-800 dark:text-gray-200 rounded-bl-none flex items-center">
                        <FiLoader className="animate-spin h-5 w-5 mr-2" />
                        <span className="text-sm">Typing...</span>
                    </div>
                  </div>
                )}
                 {showSuggestions && (
                    <div className="pt-2 flex flex-wrap gap-2">
                        {initialSuggestions.map(text => <SuggestionChip key={text} text={text} onSelect={handleSuggestionSelect} />)}
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-brand-dark-200">
              <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="bg-brand-gold text-white p-3 rounded-full flex-shrink-0 disabled:bg-gray-400 transition-colors"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                >
                  <FiSend size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;