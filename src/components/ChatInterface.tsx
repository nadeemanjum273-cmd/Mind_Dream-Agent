'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, FileText, Table, ShieldCheck, CreditCard, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ChatMessage } from '@/lib/types';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content: `👋 **Welcome to Mind_Dreams Customer Support!**\n\nI am **Mind_Dreams AI Agent**, your 24/7 intelligent assistant. I am connected directly to our **Policy RAG Vector Index** (\`policy.txt\`) and **Google Sheets Sync** across 3 distinct portions:\n\n1. **Portion 1 (Orders):** Product lookup & placing new customer orders.\n2. **Portion 2 (Refund Eligibility):** Verifying purchase dates against 30-day (15-day for electronics) policy.\n3. **Portion 3 (Bank Details):** Gathering and logging customer bank info for approved refunds.\n\n*How can I assist you today? Choose a quick prompt below or type your question!*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const QUICK_PROMPTS = [
  { label: '📋 Return Policy', query: 'What is the return policy for electronics vs regular items?' },
  { label: '🔍 Check Refund ORD-9021', query: 'Check refund eligibility for Order ID ORD-9021' },
  { label: '🛍️ Buy DreamPad Laptop', query: 'I want to buy the DreamPad Pro Laptop 16-inch for $1299.99' },
  { label: '💳 Submit Refund Bank Info', query: 'I qualify for a refund on ORD-9021. My bank is Chase, Account 987654321, Routing 122000031 under Alex Johnson.' },
  { label: '🚚 Shipping Rates & Speeds', query: 'What are the shipping options, prices, and cutoff times?' },
];

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customQuery) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          sources: data.sources,
          toolAction: data.toolAction,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Server response failed');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Connection Notice:** I encountered a temporary issue processing your request (${err.message}). Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-130px)] bg-white rounded-2xl shadow-card border border-slate-200/80 overflow-hidden my-4">
      
      {/* Top Controls Bar */}
      <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold text-slate-700">Mind_Dreams Agent Ready</span>
          <span className="text-slate-300">|</span>
          <span>App Router &bull; Gemini RAG</span>
        </div>
        
        <button
          onClick={handleClearChat}
          className="flex items-center gap-1 hover:text-slate-900 transition-colors font-medium text-[11px]"
        >
          <RefreshCw className="w-3 h-3" />
          Clear Conversation
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Bot Avatar */}
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            {/* Bubble Container */}
            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Tool Execution Tag */}
              {msg.toolAction && (
                <div className="mb-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-mono font-semibold flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  Executed Tool: <code className="font-bold">{msg.toolAction}</code>
                </div>
              )}

              {/* Main Content Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs font-normal'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>
              </div>

              {/* Source Badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.sources.map((src, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-medium flex items-center gap-1.5 shadow-2xs"
                    >
                      {src.type === 'rag' && <FileText className="w-3.5 h-3.5 text-emerald-600" />}
                      {src.type === 'sheet_orders' && <Table className="w-3.5 h-3.5 text-sky-600" />}
                      {src.type === 'sheet_refund' && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                      {src.type === 'sheet_bank' && <CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{src.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <span className="mt-1 text-[10px] text-slate-400 font-medium px-1">
                {msg.timestamp}
              </span>

            </div>

            {/* User Avatar */}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 font-semibold text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Animated State */}
        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="font-medium">Mind_Dreams Agent is searching RAG & Google Sheets...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Quick Prompts:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt.query)}
            disabled={loading}
            className="px-3 py-1 rounded-full bg-white hover:bg-sky-50 hover:border-sky-300 text-slate-700 hover:text-sky-700 border border-slate-200 text-xs font-medium shrink-0 transition-colors shadow-2xs"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about returns, check refund eligibility, place orders, or provide bank details..."
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
          <span>Mind_Dreams AI strictly enforces policy rules indexed from</span>
          <span className="font-mono text-slate-600 font-semibold">policy.txt</span>
        </div>
      </div>

    </div>
  );
};
