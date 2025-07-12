
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { FiMessageSquare, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicCampaigns } from '../services/api.ts';
import type { Campaign } from '../types.ts';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch campaigns to provide context to the bot
    getPublicCampaigns().then(setCampaigns).catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { sender: 'bot', text: "Hello! I'm the DonationHub AI Assistant. How can I help you today? You can ask me about our campaigns, how to donate, or our mission." }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const initializeChat = () => {
    if (!chatRef.current) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const campaignInfo = campaigns.map(c => `- ${c.title} (Goal: ₹${c.goal.toLocaleString()}, Raised: ₹${c.raised.toLocaleString()})`).join('\n');
            const systemInstruction = `You are a friendly and helpful AI assistant for DonationHub, a platform for charitable giving. Your role is to assist users by answering their questions about the platform, our mission, how to donate, information about campaigns, and our commitment to transparency. Be concise, polite, and guide users to relevant pages on the website when appropriate. Do not provide financial advice. Here is a list of current active campaigns:\n${campaignInfo}\nKeep your answers helpful and not too long.`;
            
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                }
            });
        } catch (error) {
            console.error("Failed to initialize AI Chat:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        }
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
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
        const stream = await chatRef.current.sendMessageStream({ message: inputValue });
        
        let botMessage = '';
        setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

        for await (const chunk of stream) {
            botMessage += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = botMessage;
                return newMessages;
            });
        }
    } catch (error) {
        console.error('Gemini API error:', error);
        setMessages(prev => {
           const newMessages = [...prev];
           // If the last message was an empty bot message, remove it before adding the error
           if(newMessages[newMessages.length -1].sender === 'bot' && newMessages[newMessages.length-1].text === '') {
               newMessages.pop();
           }
           return [...newMessages, { sender: 'bot', text: "I'm sorry, I encountered an error. Please try asking in a different way." }];
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-gold text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-[9998]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open AI Chat"
      >
        <FiMessageSquare size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 w-full max-w-sm h-full max-h-[calc(100vh-8rem)] sm:max-h-[600px] bg-white dark:bg-brand-dark-200 rounded-xl shadow-2xl flex flex-col z-[9999] overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <header className="bg-brand-deep-blue text-white p-4 flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/20" aria-label="Close chat">
                <FiX size={20} />
              </button>
            </header>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-brand-gold text-white rounded-br-none' : 'bg-gray-200 dark:bg-brand-dark text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                      <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
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
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-brand-dark-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
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
