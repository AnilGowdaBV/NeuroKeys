import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, SendHorizonal, Bot, User } from 'lucide-react';
import { generateChatbotResponse } from '../../services/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am NeuroCoach. How can I help you improve your typing today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    const apiHistory = newMessages.map(m => ({ role: m.role, content: m.content }));
    const responseText = await generateChatbotResponse(apiHistory);

    setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    setIsTyping(false);
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 group">
        <AnimatePresence>
          {!isOpen && (
            <>
              {/* Tooltip */}
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-full top-1/2 -translate-y-1/2 mr-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div className="bg-black/80 backdrop-blur-md border border-white/15 text-violet-100 text-sm font-medium px-3.5 py-2 rounded-lg whitespace-nowrap shadow-xl">
                  hey im here to help u !!
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="relative"
              >
                {/* Glowing Aura */}
                <div className="absolute inset-0 rounded-full bg-fuchsia-500 opacity-40 blur-xl animate-pulse"></div>
                
                {/* Continuous Ping Ring */}
                <div className="absolute -inset-1 rounded-full border border-fuchsia-400 animate-ping opacity-30 [animation-duration:2s]"></div>

                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(true)}
                  className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full shadow-[0_0_20px_rgba(167,139,250,0.6)] text-white relative z-10"
                >
                  <MessageCircle className="w-6 h-6" />
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-8 z-50 w-[350px] max-h-[75vh] h-[550px] flex flex-col bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/30 text-violet-300">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">NeuroCoach</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full ${msg.role === 'user' ? 'bg-sky-500/30 text-sky-300' : 'bg-violet-500/30 text-violet-300'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-sky-500/20 border border-sky-500/30 text-sky-50 rounded-tr-sm'
                        : 'bg-zinc-800/60 border border-white/5 text-zinc-100 rounded-tl-sm'
                    }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2.5 flex-row"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-violet-500/30 text-violet-300">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-zinc-800/60 border border-white/5 p-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 min-w-[50px] min-h-[44px]">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 w-8 h-8 flex items-center justify-center text-violet-400 hover:text-violet-300 hover:bg-violet-500/20 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg transition-all"
                >
                  <SendHorizonal className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
