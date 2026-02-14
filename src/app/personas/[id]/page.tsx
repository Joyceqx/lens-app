'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, Users, Activity, ArrowLeft, MessageCircle, BarChart3 } from 'lucide-react';

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value * 100}%`, background: value > 0.7 ? '#059669' : value > 0.4 ? '#D97706' : '#DC2626' }} />
      </div>
      <span className="text-xs text-gray-500 w-10 text-right">{Math.round(value * 100)}%</span>
    </div>
  );
}

export default function PersonaProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [persona, setPersona] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/personas/${id}`).then(r => r.json()).then(data => { setPersona(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400 animate-pulse">Loading persona...</div></div>;
  if (!persona || persona.error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><h2 className="text-lg font-medium text-gray-700 mb-2">Persona not found</h2><Link href="/personas" className="text-sm text-accent hover:text-accent-hover">Back to library</Link></div></div>;

  const attrs = persona.attributes || {};
  const confidence = persona.confidence || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 p-4 flex flex-col z-40">
        <Link href="/" className="flex items-center gap-2 mb-8"><div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></div><span className="text-lg font-semibold">Lens</span></Link>
        <nav className="flex-1 space-y-1">
          {[{ label: 'Dashboard', href: '/dashboard', icon: Activity }, { label: 'Personas', href: '/personas', icon: Users, active: true }, { label: 'Panel', href: '/panel', icon: BarChart3 }].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${item.active ? 'bg-accent-light text-accent font-medium' : 'text-gray-500 hover:bg-gray-50'}`}><item.icon className="w-4 h-4" />{item.label}</Link>
          ))}
        </nav>
      </aside>

      <main className="ml-60 p-8">
        <div className="max-w-4xl">
          <Link href="/personas" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"><ArrowLeft className="w-3.5 h-3.5" /> Back to Library</Link>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center"><Users className="w-6 h-6 text-accent" /></div>
                <div><h1 className="text-xl font-bold text-gray-900">{attrs.display_name || attrs.demographics?.life_stage || 'Persona Profile'}</h1><p className="text-sm text-gray-400">{attrs.demographics?.age_range || ''} · {attrs.demographics?.location_type || ''} · {attrs.demographics?.household || ''}</p></div>
              </div>
              <Link href={`/chat/${id}`} className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition"><MessageCircle className="w-4 h-4" /> Chat with Persona</Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6"><h2 className="font-semibold text-gray-900 mb-3">Narrative</h2><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{persona.narrative}</p></div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Values & Patterns</h2>
                <div className="grid grid-cols-2 gap-4">
                  {attrs.values?.length > 0 && <div><h3 className="text-xs text-gray-400 uppercase mb-2">Core Values</h3><div className="flex flex-wrap gap-1.5">{attrs.values.map((v: string, i: number) => <span key={i} className="text-xs bg-accent-light text-accent px-2.5 py-1 rounded-full">{v}</span>)}</div></div>}
                  {attrs.behavioral_patterns?.length > 0 && <div><h3 className="text-xs text-gray-400 uppercase mb-2">Behavioral Patterns</h3><div className="flex flex-wrap gap-1.5">{attrs.behavioral_patterns.map((b: string, i: number) => <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">{b}</span>)}</div></div>}
                  {attrs.interests?.length > 0 && <div><h3 className="text-xs text-gray-400 uppercase mb-2">Interests</h3><div className="flex flex-wrap gap-1.5">{attrs.interests.map((v: string, i: number) => <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{v}</span>)}</div></div>}
                  {attrs.life_context?.length > 0 && <div><h3 className="text-xs text-gray-400 uppercase mb-2">Life Context</h3><div className="flex flex-wrap gap-1.5">{attrs.life_context.map((c: string, i: number) => <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{c}</span>)}</div></div>}
                </div>
              </div>

              {attrs.taste_signals && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Taste Signals</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {attrs.taste_signals.brands_mentioned?.length > 0 && <div><h3 className="text-xs text-gray-400 uppercase mb-2">Brands</h3>{attrs.taste_signals.brands_mentioned.map((b: string, i: number) => <div key={i} className="text-sm text-gray-600">{b}</div>)}</div>}
                    {attrs.taste_signals.preferences?.length > 0 && <div><h3 className="text-xs text-gray-400 uppercase mb-2">Preferences</h3>{attrs.taste_signals.preferences.map((p2: string, i: number) => <div key={i} className="text-sm text-gray-600">{p2}</div>)}</div>}
                    {attrs.taste_signals.dislikes?.length > 0 && <div><h3 className="text-xs text-gray-400 uppercase mb-2">Dislikes</h3>{attrs.taste_signals.dislikes.map((d: string, i: number) => <div key={i} className="text-sm text-gray-600">{d}</div>)}</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Confidence Scores</h2>
                <div className="space-y-3">
                  {Object.entries(confidence).filter(([k]) => k !== 'overall').map(([key, value]) => <ConfidenceBar key={key} label={key} value={value as number} />)}
                  {confidence.overall && <div className="pt-3 border-t border-gray-100"><ConfidenceBar label="Overall" value={confidence.overall} /></div>}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Profile Info</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Decision Style</span><span className="text-gray-700 font-medium">{attrs.decision_style || '\u2014'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Communication</span><span className="text-gray-700 font-medium">{attrs.communication_style || '\u2014'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Version</span><span className="text-gray-700 font-medium">v{persona.version || 1}</span></div>
                </div>
              </div>
              {/* Single chat button is in the header */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
