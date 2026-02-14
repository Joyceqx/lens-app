'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Users, Activity, Send, Check, X, BarChart3, Sparkles } from 'lucide-react';

interface PersonaOption { id: string; name: string; ageRange: string; values: string[]; selected: boolean; }

export default function PanelPage() {
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [querying, setQuerying] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/personas').then(r => r.json()).then(data => {
      setPersonas((data.personas || []).map((p: any) => ({ id: p.id, name: p.attributes?.display_name || p.attributes?.demographics?.life_stage || 'Persona', ageRange: p.attributes?.demographics?.age_range || '', values: p.attributes?.values || [], selected: false })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selected = personas.filter(p => p.selected);

  const togglePersona = (id: string) => {
    setPersonas(prev => prev.map(p => {
      if (p.id === id) { if (!p.selected && selected.length >= 5) return p; return { ...p, selected: !p.selected }; }
      return p;
    }));
  };

  const runQuery = async () => {
    if (!question.trim() || selected.length < 2 || querying) return;
    setQuerying(true); setResult(null);
    try {
      const res = await fetch('/api/chat/multi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ persona_ids: selected.map(p => p.id), message: question }) });
      setResult(await res.json());
    } catch (err) { console.error('Panel query error:', err); }
    setQuerying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 p-4 flex flex-col z-40">
        <Link href="/" className="flex items-center gap-2 mb-8"><div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></div><span className="text-lg font-semibold">Lens</span></Link>
        <nav className="flex-1 space-y-1">
          {[{ label: 'Dashboard', href: '/dashboard', icon: Activity }, { label: 'Personas', href: '/personas', icon: Users }, { label: 'Panel', href: '/panel', icon: BarChart3, active: true }].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${item.active ? 'bg-accent-light text-accent font-medium' : 'text-gray-500 hover:bg-gray-50'}`}><item.icon className="w-4 h-4" />{item.label}</Link>
          ))}
        </nav>
      </aside>

      <main className="ml-60 p-8">
        <div className="max-w-5xl">
          <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Multi-Persona Panel</h1><p className="text-gray-500 text-sm mt-1">Select 2-5 personas and ask the same question to compare perspectives</p></div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Select Personas ({selected.length}/5)</h2>
              {selected.length > 0 && <button onClick={() => setPersonas(prev => prev.map(p => ({ ...p, selected: false })))} className="text-xs text-gray-400 hover:text-gray-600">Clear All</button>}
            </div>
            {loading ? <div className="text-sm text-gray-400 animate-pulse">Loading personas...</div> : (
              <div className="flex flex-wrap gap-2">
                {personas.map(p => (
                  <button key={p.id} onClick={() => togglePersona(p.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${p.selected ? 'bg-accent-light border-accent/30 text-accent' : 'bg-white border-gray-200 text-gray-600 hover:border-accent/20'}`}>
                    {p.selected ? <Check className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}<span>{p.name}</span>{p.ageRange && <span className="text-xs text-gray-400">{p.ageRange}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-sm mb-3">Your Question</h2>
            <div className="flex gap-3">
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runQuery()} placeholder="e.g., Would you switch to an eco-friendly detergent brand that costs 20% more?" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none" />
              <button onClick={runQuery} disabled={selected.length < 2 || !question.trim() || querying} className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-40 transition flex items-center gap-2">
                {querying ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Querying...</> : <><Send className="w-4 h-4" /> Ask Panel</>}
              </button>
            </div>
            {selected.length < 2 && <p className="text-xs text-amber-500 mt-2">Select at least 2 personas to start</p>}
          </div>

          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.responses?.map((r: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center"><Users className="w-3.5 h-3.5 text-accent" /></div><span className="text-sm font-medium">{r.persona_name}</span></div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.confidence === 'high' ? 'confidence-high' : r.confidence === 'medium' ? 'confidence-medium' : 'confidence-low'}`}>{r.confidence}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">{r.response}</p>
                    {r.explanation && <p className="text-xs text-gray-400 italic">{r.explanation}</p>}
                  </div>
                ))}
              </div>

              {result.consensus?.consensus && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-accent" /><h2 className="font-semibold">Consensus Analysis</h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full ml-auto ${result.consensus.consensus.agreement_level === 'strong' ? 'bg-emerald-100 text-emerald-700' : result.consensus.consensus.agreement_level === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{result.consensus.consensus.agreement_level} agreement</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{result.consensus.consensus.summary}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {result.consensus.consensus.common_themes?.length > 0 && <div><h3 className="text-xs text-gray-400 uppercase mb-2">Common Themes</h3><div className="space-y-1">{result.consensus.consensus.common_themes.map((t: string, i: number) => <div key={i} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /><span className="text-sm text-gray-600">{t}</span></div>)}</div></div>}
                    {result.consensus.consensus.key_differences?.length > 0 && <div><h3 className="text-xs text-gray-400 uppercase mb-2">Key Differences</h3><div className="space-y-1">{result.consensus.consensus.key_differences.map((d: string, i: number) => <div key={i} className="flex items-start gap-2"><X className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" /><span className="text-sm text-gray-600">{d}</span></div>)}</div></div>}
                  </div>
                </div>
              )}

              {result.consensus?.insights?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-accent" /><h2 className="font-semibold">Key Insights</h2></div>
                  <div className="space-y-3">{result.consensus.insights.map((insight: any, i: number) => (
                    <div key={i} className="bg-accent-light/50 rounded-lg p-4"><p className="text-sm text-gray-700 mb-1">{insight.insight}</p><div className="flex items-center gap-2"><span className="text-xs text-gray-400">Supported by: {insight.supported_by?.join(', ')}</span><span className={`text-xs px-1.5 py-0.5 rounded ${insight.confidence === 'high' ? 'confidence-high' : insight.confidence === 'medium' ? 'confidence-medium' : 'confidence-low'}`}>{insight.confidence}</span></div></div>
                  ))}</div>
                </div>
              )}
            </div>
          )}

          {!result && !querying && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center"><BarChart3 className="w-12 h-12 text-gray-200 mx-auto mb-3" /><h3 className="font-medium text-gray-700 mb-1">No results yet</h3><p className="text-sm text-gray-400">Select personas and ask a question to see side-by-side responses</p></div>
          )}
        </div>
      </main>
    </div>
  );
}
