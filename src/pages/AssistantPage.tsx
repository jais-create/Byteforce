import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, RotateCcw, Send, Sparkles, User } from 'lucide-react';
import { useStockSense } from '../context/StockSenseContext';

const SUGGESTED_QUESTIONS = [
  'Which products need immediate restocking?',
  'What products might run out in the next 7 days?',
  'How much inventory should I reorder?',
  'Which supplier offers the best price?',
  'What is my total estimated replenishment cost?',
];

export const AssistantPage: React.FC = () => {
  const {
    chatMessages,
    isAssistantTyping,
    sendChatMessage,
    clearChat,
    setActivePage,
    kpis,
  } = useStockSense();

  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAssistantTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAssistantTyping) return;
    sendChatMessage(input);
    setInput('');
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8.5rem)] min-h-[540px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Ask StockSense
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Conversational AI inventory advisor grounded in your live {kpis.totalProducts}-SKU catalog, supplier quotes, and open orders.
          </p>
        </div>

        <button
          onClick={clearChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 self-start sm:self-auto whitespace-nowrap"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New Conversation
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
        {/* Suggested Question Chips */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-[11px] font-medium text-slate-500 mr-1">Suggested queries:</span>
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendChatMessage(q)}
              disabled={isAssistantTyping}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={`max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {msg.actionLink && !isUser && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                      <button
                        onClick={() => setActivePage(msg.actionLink!.page)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {msg.actionLink.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1.5 ${
                      isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isAssistantTyping && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500">
                Analyzing live inventory and supplier metrics...
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2.5 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stockout risks, Wireless Mouse, reorder budgets, or suppliers..."
            className="flex-1 h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAssistantTyping}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            Ask AI
          </button>
        </form>
      </div>
    </div>
  );
};
