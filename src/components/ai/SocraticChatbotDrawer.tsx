'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  BookOpen,
  BrainCircuit,
  HelpCircle,
  Minimize2,
  Maximize2,
  RefreshCw,
  Zap,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

export const SocraticChatbotDrawer: React.FC = () => {
  const {
    socraticDrawerOpen,
    setSocraticDrawerOpen,
    activeAssignmentContext,
    setActiveAssignmentContext,
    assignments,
    syllabi,
    currentUser,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello ${currentUser?.full_name?.split(' ')[0] || 'Alex'}! 👋 I am your **EduWeave Socratic Academic Assistant**.\n\nI am here to guide your conceptual understanding, provide hints on tough homework steps, or generate spaced practice questions.\n\nWhat topic or assignment would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('Biology');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-update selected subject if active assignment context changes
  useEffect(() => {
    if (activeAssignmentContext) {
      setSelectedSubject(activeAssignmentContext.subject_name);
    }
  }, [activeAssignmentContext]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (socraticDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, socraticDrawerOpen]);

  if (!socraticDrawerOpen) {
    return (
      <button
        onClick={() => setSocraticDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 hover:from-emerald-500 hover:to-teal-500 text-white shadow-floating hover:shadow-2xl transition-all duration-300 active:scale-95 flex items-center gap-2.5 group"
        aria-label="Open Socratic AI Academic Assistant"
      >
        <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
        <span className="text-xs font-extrabold tracking-wide hidden sm:inline">
          Ask Socratic AI
        </span>
        {activeAssignmentContext && (
          <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />
        )}
      </button>
    );
  }

  // Get matching syllabus context
  const matchingSyllabus = syllabi.find(
    s => s.subject_name.toLowerCase() === selectedSubject.toLowerCase()
  ) || syllabi[0];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'socratic_tutor',
          studentQuery: textToSend,
          activeSubject: selectedSubject,
          assignmentContext: activeAssignmentContext ? {
            title: activeAssignmentContext.title,
            topicTag: activeAssignmentContext.topic_tag,
            description: activeAssignmentContext.description,
            keyConcepts: matchingSyllabus?.key_concepts,
            teacherNotes: matchingSyllabus?.teacher_notes_snippets,
          } : {
            title: `${selectedSubject} Core Concepts`,
            topicTag: matchingSyllabus?.topic_name || selectedSubject,
            description: matchingSyllabus?.content_text || '',
            keyConcepts: matchingSyllabus?.key_concepts,
            teacherNotes: matchingSyllabus?.teacher_notes_snippets,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source,
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `I ran into an issue connecting to the AI core. Let's reason through your question: What are the fundamental definitions or initial steps you've tried so far?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🌿 Explain Calvin Cycle vs Respiration', query: 'Explain the difference between Light-Dependent and Light-Independent reactions using my Biology notes.' },
    { label: '⏱️ Low-Stress Study Plan', query: 'Help me outline a 3-day spaced study plan for my upcoming assignments to minimize burnout.' },
    { label: '📐 Determinants & Eigenvectors', query: 'What is the intuitive geometric meaning of a matrix determinant in 2D space?' },
    { label: '💡 Socratic Practice Quiz', query: 'Give me 3 diagnostic practice questions on this topic to test my understanding.' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold tracking-tight text-white">
                Socratic AI Tutor
              </h3>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Active Guardrails
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Guided inquiry • Concept breakdown • No copy-pasting
            </p>
          </div>
        </div>

        <button
          onClick={() => setSocraticDrawerOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Context Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Biology">Biology (Unit 3.2)</option>
            <option value="Mathematics">Mathematics (Unit 4.1)</option>
            <option value="World History">World History (Unit 2.3)</option>
            <option value="Computer Science">Computer Science (Unit 5.2)</option>
            <option value="Chemistry">Chemistry (Unit 1.4)</option>
          </select>
        </div>

        {activeAssignmentContext ? (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            <BookOpen className="w-3 h-3" />
            <span className="truncate max-w-[140px]">{activeAssignmentContext.title}</span>
            <button
              onClick={() => setActiveAssignmentContext(null)}
              className="hover:text-red-500 ml-1"
              title="Clear specific assignment context"
            >
              ×
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 italic">Syllabus Mode</span>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-900 to-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4 text-emerald-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isAI
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>
                <div
                  className={`mt-1.5 text-[9px] text-right font-mono ${
                    isAI ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-200'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAI && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 mt-1">
                  <img
                    src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 italic p-2">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
            <span>Socratic assistant is formulating guidance...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-700/80 hover:bg-emerald-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask a question about ${selectedSubject}...`}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
