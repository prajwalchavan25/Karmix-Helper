import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface KarmixAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface Message {
  sender: 'USER' | 'ASSISTANT';
  content: string;
  referencedSchemes?: {
    id: string;
    slug: string;
    title: string;
    benefit: string;
    officialUrl: string;
    portalName: string;
  }[];
  suggestedFollowUps?: string[];
}

export const KarmixAIChatModal: React.FC<KarmixAIChatModalProps> = ({ isOpen, onClose, initialQuery }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ASSISTANT',
      content:
        language === 'mr'
          ? 'नमस्कार! मी **कार्मिक्स AI** आहे — शासकीय योजना, शिष्यवृत्ती आणि सार्वजनिक अनुदानांसाठी तुमचा अधिकृत साहाय्यक. आज मी तुम्हाला कोणती शासकीय मदत शोधण्यात साहाय्य करू?'
          : language === 'hi'
          ? 'नमस्ते! मैं **कार्मिक्स AI** हूँ — सरकारी योजनाओं, छात्रवृत्तियों और सब्सिडी के लिए आपका डिजिटल मार्गदर्शक। आप किस सरकारी योजना के बारे में जानना चाहते हैं?'
          : 'Hello! I am **Karmix AI** — your verified civic-tech guide for Indian government schemes, scholarships, loans, and subsidies. What benefit or support are you looking for today?',
      suggestedFollowUps: [
        language === 'mr' ? 'महाराष्ट्रातील विद्यार्थ्यांसाठी शिष्यवृत्ती' : 'Scholarships for students in Maharashtra',
        language === 'mr' ? 'लघु उद्योगासाठी मुद्रा कर्ज योजना' : 'Collateral-free business loans under MUDRA',
        language === 'mr' ? 'शेतकऱ्यांसाठी ५ लाखांपर्यंत आरोग्य विमा' : 'Free ₹5 Lakh health card under Ayushman Bharat',
      ],
    },
  ]);

  const [input, setInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = { sender: 'USER', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await ApiClient.chatAI(query, conversationId, language);
      if (res.success) {
        if (res.conversationId) {
          setConversationId(res.conversationId);
        }
        const assistantMsg: Message = {
          sender: 'ASSISTANT',
          content: res.reply,
          referencedSchemes: res.referencedSchemes,
          suggestedFollowUps: res.suggestedFollowUps,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ASSISTANT',
            content: 'I encountered an unexpected issue while retrieving verified government data. Please try asking again.',
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ASSISTANT',
          content: 'Unable to reach the civic assistance service. Please check your network or try again shortly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[90vh] sm:h-[82vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gov-navy text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gov-blue/40 border border-blue-400/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Karmix AI Assistant</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full">
                  Official Grounding
                </span>
              </div>
              <p className="text-xs text-slate-300">{t('aiAssistantSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([
                  {
                    sender: 'ASSISTANT',
                    content: 'Chat session restarted. How can I guide you with government schemes?',
                    suggestedFollowUps: [
                      'Scholarships for students in Maharashtra',
                      'PM Mudra loan for business',
                      'Ayushman Bharat health card',
                    ],
                  },
                ]);
                setConversationId(undefined);
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ASSISTANT' && (
                <div className="w-8 h-8 rounded-xl bg-gov-navy text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4 text-amber-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                  msg.sender === 'USER'
                    ? 'bg-gov-navy text-white rounded-tr-none shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>

                {/* Referenced Scheme Cards */}
                {msg.referencedSchemes && msg.referencedSchemes.length > 0 && (
                  <div className="pt-2 space-y-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Verified Matching Schemes:
                    </span>
                    {msg.referencedSchemes.map((s, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 max-w-sm">
                          <h5 className="font-bold text-slate-900 text-xs">{s.title}</h5>
                          <p className="text-[11px] text-slate-600 line-clamp-1">{s.benefit}</p>
                          <span className="text-[10px] text-gov-blue font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {s.portalName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            to={`/schemes/${s.slug}`}
                            onClick={onClose}
                            className="px-2.5 py-1 bg-gov-navy text-white text-[11px] font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          {s.officialUrl && (
                            <a
                              href={s.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-slate-700 rounded"
                              title="Official Website"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-100">
                    {msg.suggestedFollowUps.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(fu)}
                        className="text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-gov-blue px-2.5 py-1 rounded-full border border-blue-200/80 transition-colors text-left"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'USER' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gov-navy text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-amber-400" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-4 shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gov-blue animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-gov-blue animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-gov-blue animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-slate-500 font-medium ml-1">Verifying official gazettes...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex-shrink-0 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('aiAskPlaceholder')}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-gov-blue"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 sm:px-5 bg-gov-navy hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Grounded in verified central & state portal databases</span>
            </span>
            <span className="hidden sm:inline">English • मराठी • हिन्दी</span>
          </div>
        </div>
      </div>
    </div>
  );
};
