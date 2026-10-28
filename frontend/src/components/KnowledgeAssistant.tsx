import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpenText,
  Send,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Bookmark,
  Bot,
  User,
  ShieldCheck,
  X
} from 'lucide-react';
import { KnowledgeQueryResponse } from '../types';
import { queryKnowledgeBot } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  codes?: string[];
  followups?: string[];
}

export const KnowledgeAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am BuildIntel AI, your multimodal construction intelligence and structural engineering assistant. I provide authoritative guidance cross-referencing ACI 318-19, OSHA 1926, IBC 2024, and ASTM standards. How can I assist your site operations today?',
      codes: [
        'ACI 318-19 Structural Concrete',
        'OSHA 29 CFR 1926 Safety Regulations',
        'IBC 2024 International Building Code',
      ],
      followups: [
        'What is the minimum rebar lap length for Grade 60 steel?',
        'What are the OSHA trigger heights for fall protection?',
        'How do I control plastic shrinkage cracking in hot weather?',
      ],
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [imageAttachment, setImageAttachment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() && !imageAttachment) return;

    const userMsg: Message = {
      role: 'user',
      content: queryText,
      image: imageAttachment || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const currentAttachment = imageAttachment;
    setImageAttachment('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res: KnowledgeQueryResponse = await queryKnowledgeBot({
        query: queryText,
        conversation_history: history,
        image_base64: currentAttachment || undefined,
        engineering_domain: 'Structural & Site Engineering',
      });

      const assistantMsg: Message = {
        role: 'assistant',
        content: res.reply,
        codes: res.referenced_codes_and_standards,
        followups: res.suggested_followup_topics,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach knowledge engine. Please check network connection or verify API service.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BookOpenText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Construction Engineering Knowledge Assistant</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal conversational agent citing ACI, OSHA, ASTM, and IBC building code standards.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Code Verified: ACI 318 / OSHA 1926</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-amber-400" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                }`}
              >
                {/* Uploaded image if any */}
                {msg.image && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 max-w-sm mb-2">
                    <img src={msg.image} alt="Uploaded attachment" className="w-full h-40 object-cover" />
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Referenced Codes */}
                {msg.codes && msg.codes.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Referenced Codes & Standards:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.codes.map((code, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono border border-slate-700/80"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Prompts */}
                {msg.followups && msg.followups.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Recommended Engineering Verifications:
                    </span>
                    <div className="flex flex-col space-y-1">
                      {msg.followups.map((fu, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(fu)}
                          className="text-left text-[11px] text-amber-400/90 hover:text-amber-300 hover:underline flex items-center space-x-1 cursor-pointer transition"
                        >
                          <span>→</span>
                          <span>{fu}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-amber-400" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Consulting ACI 318, OSHA & Structural Engineering Guidelines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
          {/* Attachment Preview */}
          {imageAttachment && (
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 w-fit">
              <img src={imageAttachment} alt="Preview" className="w-8 h-8 object-cover rounded" />
              <span className="text-xs text-slate-300">Inspection Image Attached</span>
              <button
                onClick={() => setImageAttachment('')}
                className="text-slate-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <label className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 cursor-pointer transition">
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an engineering, code compliance, or structural question (e.g. ACI development length, OSHA heights)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !imageAttachment)}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
