import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Globe, Shield, RefreshCw, Mail, Phone, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { Message } from '../types';
import { saveContactRequest } from '../firebase';

interface ChatbotWidgetProps {
  defaultWelcome?: string;
  defaultRoleInstruction?: string;
}

export default function ChatbotWidget({
  defaultWelcome = "Hello! I am the AYD AI Assistant. I can help you research universities, analyze scholarships, check visa timelines, and prepare study plans. How can I help you today?",
  defaultRoleInstruction = "You are a professional study abroad advisor for AYD Education Consultancy. Assist students and agents with admissions, visa, scholarships, and general academic planning. Be highly encouraging, informative, and professional."
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: defaultWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom chatbot settings
  const [model, setModel] = useState<'flash' | 'pro' | 'flash-lite'>('flash');
  const [grounding, setGrounding] = useState(true); // Search grounding active by default
  const [systemInstruction, setSystemInstruction] = useState(defaultRoleInstruction);
  const [showSettings, setShowSettings] = useState(false);

  // Question count and Human Form states
  const [userQuestionCount, setUserQuestionCount] = useState(0);
  const [showHumanForm, setShowHumanForm] = useState(false);
  const [humanFormSubmitted, setHumanFormSubmitted] = useState(false);
  const [humanEmail, setHumanEmail] = useState('');
  const [humanPhone, setHumanPhone] = useState('');
  const [humanIssue, setHumanIssue] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const nextCount = userQuestionCount + 1;
    setUserQuestionCount(nextCount);

    // If user has asked MORE than 10 questions (i.e. this is the 11th user message sent)
    if (nextCount > 10) {
      setTimeout(() => {
        const botMsg: Message = {
          id: `msg-${Date.now()}-bot-prompt`,
          sender: 'bot',
          text: "I noticed you've asked more than 10 questions! To ensure you get the most precise and personalized support for your application journey, would you like to speak directly with an expert human advisor, or chat with us on WhatsApp?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isHumanPrompt: true
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      // Send message thread with full history and custom configuration
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ sender: m.sender, text: m.text })),
          model,
          grounding,
          systemInstruction,
        }),
      });

      if (!response.ok) {
        throw new Error('Chatbot service responded with an error.');
      }

      const data = await response.json();

      const botMsg: Message = {
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Failed to get chatbot response:', err);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        sender: 'bot',
        text: "I'm having trouble connecting right now. Please verify your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: defaultWelcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setUserQuestionCount(0);
    setShowHumanForm(false);
    setHumanFormSubmitted(false);
    setHumanEmail('');
    setHumanPhone('');
    setHumanIssue('');
    setFormSubmitError(null);
  };

  const handleHumanFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanEmail.trim() || !humanPhone.trim() || !humanIssue.trim()) {
      setFormSubmitError("Please fill out all required fields.");
      return;
    }

    setIsSubmittingForm(true);
    setFormSubmitError(null);

    try {
      await saveContactRequest({
        email: humanEmail.trim(),
        phone: humanPhone.trim(),
        issue: humanIssue.trim(),
        submittedAt: new Date().toISOString()
      });
      setHumanFormSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit contact request:', err);
      setFormSubmitError('Could not process request. Please try again or reach out on WhatsApp.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 flex items-center justify-center shadow-2xl shadow-amber-500/20 hover:scale-110 active:scale-95 transition cursor-pointer pulse-glow group"
        >
          <MessageSquare className="w-8 h-8 text-slate-900 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-[380px] sm:w-[420px] h-[550px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          
          {/* Custom Google-Form-style overlay if showHumanForm is active */}
          {showHumanForm ? (
            <div className="flex-1 flex flex-col h-full bg-slate-900">
              {/* Purple top strip mimicking Google Forms header banner */}
              <div className="h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 w-full" />
              
              {/* Form Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">Admissions Assessment Form</p>
                    <p className="text-[9px] text-gray-400">Submit your background details</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowHumanForm(false);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Google Form Embedded Iframe */}
              <div className="flex-1 w-full bg-slate-950 overflow-hidden relative">
                <iframe 
                  src="https://docs.google.com/forms/d/e/1FAIpQLSdUHZdX7bRRvdbuenZaYm3S3GWbBrobmrL4WfWTGk7pTycFlQ/viewform?embedded=true" 
                  className="w-full h-full border-0 absolute inset-0"
                  title="Admissions Help Desk Google Form"
                >
                  Loading…
                </iframe>
              </div>

              {/* Form Footer Controls */}
              <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-col gap-2 flex-shrink-0">
                <div className="flex gap-2">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdUHZdX7bRRvdbuenZaYm3S3GWbBrobmrL4WfWTGk7pTycFlQ/viewform?usp=publish-editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white text-center text-[10px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Open Form in New Tab <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://wa.me/2348148911391"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-center text-[10px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Phone className="w-3 h-3" /> WhatsApp Support
                  </a>
                </div>
                <button
                  onClick={() => {
                    setShowHumanForm(false);
                    setUserQuestionCount(0);
                  }}
                  className="text-center text-[10px] text-purple-400 hover:text-purple-300 underline transition py-1 cursor-pointer"
                >
                  Back to AI Advisor Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">AYD AI Advisor</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[10px] text-gray-400 font-medium">Gemini Powered</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-1.5 rounded-lg text-xs font-semibold border transition ${
                      showSettings 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                        : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                    title="AI Settings"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition"
                    title="Reset Chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Settings Sub-Panel */}
              {showSettings && (
                <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3.5 text-xs text-gray-300">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-400 uppercase tracking-wider text-[9px]">Select Model Intelligence</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setModel('flash-lite')}
                        className={`py-1.5 px-2 rounded-lg border text-center font-medium transition ${
                          model === 'flash-lite'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                            : 'bg-slate-900 border-slate-800 text-gray-400'
                        }`}
                      >
                        Flash Lite (Fast)
                      </button>
                      <button
                        onClick={() => setModel('flash')}
                        className={`py-1.5 px-2 rounded-lg border text-center font-medium transition ${
                          model === 'flash'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                            : 'bg-slate-900 border-slate-800 text-gray-400'
                        }`}
                      >
                        Flash (General)
                      </button>
                      <button
                        onClick={() => setModel('pro')}
                        className={`py-1.5 px-2 rounded-lg border text-center font-medium transition ${
                          model === 'pro'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                            : 'bg-slate-900 border-slate-800 text-gray-400'
                        }`}
                      >
                        Pro (Complex)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <p className="font-semibold text-gray-200 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        Google Search Grounding
                      </p>
                      <p className="text-[10px] text-gray-400">Gets accurate, real-time facts using Google Search</p>
                    </div>
                    <button
                      onClick={() => setGrounding(!grounding)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${grounding ? 'bg-amber-500' : 'bg-slate-800'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${grounding ? 'translate-x-5' : ''}`}></span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-semibold text-gray-200 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      Custom Advisor Persona (System Rule)
                    </p>
                    <textarea
                      value={systemInstruction}
                      onChange={(e) => setSystemInstruction(e.target.value)}
                      className="w-full h-16 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 resize-none"
                      placeholder="Set chatbot guidelines..."
                    />
                  </div>
                </div>
              )}

              {/* Messages Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20 animate-in fade-in duration-200">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] text-sm ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 rounded-tr-none font-medium'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      
                      {/* Injected Human Consultation Handoff Buttons */}
                      {m.isHumanPrompt && (
                        <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
                          <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSdUHZdX7bRRvdbuenZaYm3S3GWbBrobmrL4WfWTGk7pTycFlQ/viewform?usp=publish-editor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-center"
                          >
                            <Mail className="w-3.5 h-3.5" /> Open Google Form (New Tab)
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setShowHumanForm(true);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-400" /> View Form Inside Chat
                          </button>
                          
                          <a
                            href="https://wa.me/2348148911391"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-center"
                          >
                            <Phone className="w-3.5 h-3.5" /> Reach out on WhatsApp (+234 8148911391)
                          </a>
                        </div>
                      )}

                      {/* Sources Grounding Info */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5">
                          <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase flex items-center gap-1">
                            <Globe className="w-3 h-3 text-cyan-400" />
                            Web Sources Grounding:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.sources.slice(0, 3).map((src, idx) => (
                              <a
                                key={idx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full text-cyan-300 hover:text-white hover:border-cyan-500/30 transition max-w-[150px] truncate"
                              >
                                {src.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <span
                        className={`block text-[9px] mt-1 text-right ${
                          m.sender === 'user' ? 'text-slate-800/80 font-bold' : 'text-gray-500'
                        }`}
                      >
                        {m.timestamp} {m.modelUsed && `• ${m.modelUsed}`}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="p-4 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-100"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                <div ref={threadEndRef} />
              </div>

              {/* Chat Input Form / Question Limit Guard */}
              {userQuestionCount > 10 ? (
                <div className="p-4 bg-slate-950 border-t border-slate-800 text-center space-y-1">
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">AI Question Limit Reached</p>
                  <p className="text-[11px] text-gray-400">
                    Please use the buttons above to connect with a human advisor.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about admissions, visas, or country tips..."
                    className="flex-1 px-4 py-3 rounded-full bg-slate-900 border border-slate-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400 transition"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-900 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition cursor-pointer flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
}
