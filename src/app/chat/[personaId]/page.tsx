'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, Users, Activity, Send, ArrowLeft, Info, Sparkles, BarChart3, UserCircle } from 'lucide-react';

interface Message { id: string; role: 'user' | 'assistant'; content: string; confidence?: string; explanation?: string; }

export default function ChatPage() {
  const params = useParams();
  const personaId = params.personaId as string;
  const [persona, setPersona] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!personaId) return;
    fetch(`/api/personas/${personaId}`).then(r => r.json()).then(data => setPersona(data)).catch(console.error);
  }, [personaId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      // Send history from frontend as fallback in case DB chat tables don't exist
      const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_id: personaId,
          message: userMsg.content,
          session_id: sessionId,
          history: historyForApi,
        }),
      });
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);
      if (data.response) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, confidence: data.confidence, explanation: data.explanation }]);
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.error || 'No response received' }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: `Error: ${err.message || 'Something went wrong. Please try again.'}` }]);
    }
    setLoading(false);
  };

  const attrs = persona?.attributes || {};

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 p-4 flex flex-col z-40">
        <Link href="/" className="flex items-center gap-2 mb-8"><div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></div><span className="text-lg font-semibold">Lens</span></Link>
        <nav className="flex-1 space-y-1">
          {[{ label: 'Dashboard', href: '/dashboard', icon: Activity }, { label: 'My Personas', href: '/my-personas', icon: UserCircle }, { label: 'Persona Library', href: '/personas', icon: Users }, { label: 'Panel', href: '/panel', icon: BarChart3 }].map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition"><item.icon className="w-4 h-4" />{item.label}</Link>
          ))}
        </nav>
      </aside>

      <main className="ml-60 flex-1 flex flex-col h-screen">
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link href={`/personas/${personaId}`} className="text-gray-400 hover:text-gray-600 transition"><ArrowLeft className="w-4 h-4" /></Link>
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center"><Users className="w-3.5 h-3.5 text-accent" /></div>
            <div><div className="text-sm font-medium">{attrs.display_name || attrs.demographics?.life_stage || 'Persona'}</div><div className="text-xs text-gray-400">{attrs.demographics?.age_range || ''} · {attrs.decision_style || ''}</div></div>
          </div>
          <Link href={`/personas/${personaId}`} className="text-xs text-accent hover:text-accent-hover transition">View Profile</Link>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <h3 className="text-gray-600 font-medium mb-1">Start a Conversation</h3>
                <p className="text-sm text-gray-400 mb-6">Ask this persona anything about their preferences, values, or decision-making</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['What matters most when choosing a brand?', 'How do you make purchasing decisions?', 'Would you try a new eco-friendly product?'].map((q, i) => (
                    <button key={i} onClick={() => setInput(q)} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-500 hover:border-accent/30 hover:text-accent transition">{q}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-accent text-white rounded-tr-md' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-md'}`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'assistant' && msg.confidence && (
                    <div className="flex items-center gap-2 mt-1.5 ml-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${msg.confidence === 'high' ? 'confidence-high' : msg.confidence === 'medium' ? 'confidence-medium' : 'confidence-low'}`}>{msg.confidence}</span>
                      {msg.explanation && <button onClick={() => setShowExplanation(showExplanation === msg.id ? null : msg.id)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition"><Info className="w-3 h-3" /> Why?</button>}
                    </div>
                  )}
                  {showExplanation === msg.id && msg.explanation && <div className="mt-2 ml-1 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">{msg.explanation}</div>}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start"><div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3"><div className="flex gap-1"><div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="bg-white border-t border-gray-100 px-6 py-4 shrink-0">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="Ask this persona anything..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-accent focus:outline-none" />
            <button onClick={sendMessage} disabled={!input.trim() || loading} className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent-hover disabled:opacity-40 transition"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </main>
    </div>
  );
}
