'use client';
import React, { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

const N8N_WEBHOOK = 'https://n8n.srv1187720.hstgr.cloud/webhook/1725138e-0a87-42a7-a676-2404757d867d';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Neural link established. Query the archive.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isLoading && isOpen) {
      inputRef.current?.focus();
    }
  }, [isLoading, isOpen]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (isMaximized) setIsMaximized(false);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const currentInput = inputValue.trim();
    if (!currentInput || isLoading) return;

    setInputValue('');
    setIsLoading(true);

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: currentInput };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: currentInput,
          message: currentInput,
          sessionId: sessionId.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const text = await response.text();

      let botReply = '⚠ Empty response from agent. Review N8N node configuration.';
      if (text && text.trim()) {
        try {
          const data = JSON.parse(text);
          const extracted =
            data.output ??
            data.message ??
            data.text ??
            data.reply ??
            data.answer ??
            data.response ??
            (Array.isArray(data) && data[0]?.output) ??
            (Array.isArray(data) && data[0]?.message) ??
            null;
          botReply = typeof extracted === 'string' && extracted.trim()
            ? extracted
            : `⚠ Unexpected format: ${text.slice(0, 200)}`;
        } catch {
          botReply = text.slice(0, 500);
        }
      }

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '⚠ Network fault — could not reach n8n agent node.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const windowClasses = isMaximized
    ? 'fixed inset-4 z-50 mb-0'
    : 'mb-4 w-[420px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[80vh]';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end ${isMaximized ? 'inset-0' : ''}`}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`${windowClasses} glass-card rounded-[2rem] flex flex-col overflow-hidden shadow-2xl transition-all duration-200`}
          style={isMaximized ? { position: 'fixed', inset: '16px', margin: 0 } : {}}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full bg-primary opacity-40 rounded-full"></span>
                <span className="relative inline-flex h-2 w-2 bg-primary rounded-full"></span>
              </span>
              <div>
                <span className="text-sm font-black text-on-surface tracking-tight">Forensic Agent</span>
                <span className="text-[9px] font-bold text-on-surface-variant opacity-30 ml-2 uppercase tracking-widest">v1.0</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMaximized((prev) => !prev)}
                title={isMaximized ? 'Minimize' : 'Maximize'}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  {isMaximized ? 'close_fullscreen' : 'open_in_full'}
                </span>
              </button>
              <button
                onClick={toggleChat}
                title="Close"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-black/20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xs">smart_toy</span>
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-primary/10 text-primary border border-primary/20 rounded-br-sm'
                      : 'bg-white/[0.04] text-on-surface-variant border border-white/5 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xs">smart_toy</span>
                </div>
                <div className="bg-white/[0.04] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/5 px-4 py-4 flex-shrink-0 bg-white/[0.02]">
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Query the archive..."
                disabled={isLoading}
                className="flex-1 bg-white/5 border border-white/5 rounded-xl focus:border-primary/30 px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/20 outline-none disabled:opacity-40 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="h-10 px-4 rounded-xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-20 cursor-pointer hover:scale-[1.02] transition-all active:scale-[0.96]"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
            <p className="text-[9px] font-bold text-on-surface-variant opacity-20 uppercase tracking-[0.2em] mt-2 text-right">
              SESSION::{sessionId.current.slice(0, 8)}
            </p>
          </div>
        </div>
      )}

      {/* FAB */}
      {!isMaximized && (
        <button
          onClick={toggleChat}
          aria-label="Toggle Forensic Agent Chat"
          className="w-14 h-14 rounded-2xl bg-primary shadow-[0_0_20px_rgba(195,192,255,0.25)] hover:shadow-[0_0_40px_rgba(195,192,255,0.45)] transition-all duration-300 flex items-center justify-center group cursor-pointer relative"
        >
          {!isOpen && (
            <span className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-ping opacity-20"></span>
          )}
          <span className="material-symbols-outlined text-on-primary text-xl group-hover:scale-110 transition-transform duration-200">
            {isOpen ? 'keyboard_arrow_down' : 'smart_toy'}
          </span>
        </button>
      )}
    </div>
  );
}
