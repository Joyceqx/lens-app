'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Users, Activity, Search, Filter, X, BarChart3 } from 'lucide-react';

export default function PersonaLibraryPage() {
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const filters = ['analytical', 'emotional', 'social', 'practical'];

  const seedDemoPersonas = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.results) {
        // Refresh the list
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (activeFilter) params.set('decision_style', activeFilter);
        const r = await fetch(`/api/personas?${params.toString()}`);
        const refreshed = await r.json();
        setPersonas(refreshed.personas || []);
      }
    } catch (e) {
      console.error('Seed failed:', e);
    }
    setSeeding(false);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeFilter) params.set('decision_style', activeFilter);
    fetch(`/api/personas?${params.toString()}`).then(r => r.json()).then(data => { setPersonas(data.personas || []); setLoading(false); }).catch(() => setLoading(false));
  }, [search, activeFilter]);

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
        <div className="max-w-5xl">
          <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Persona Library</h1><p className="text-gray-500 text-sm mt-1">Browse and query real human personas</p></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search personas by values, interests, or context..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {filters.map(f => (
                <button key={f} onClick={() => setActiveFilter(activeFilter === f ? null : f)} className={`text-xs px-3 py-1.5 rounded-full border transition ${activeFilter === f ? 'bg-accent text-white border-accent' : 'bg-white text-gray-500 border-gray-200 hover:border-accent/30'}`}>{f}</button>
              ))}
              {activeFilter && <button onClick={() => setActiveFilter(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => (<div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-gray-100" /><div><div className="h-3 bg-gray-100 rounded w-24 mb-1" /><div className="h-2 bg-gray-50 rounded w-16" /></div></div><div className="h-3 bg-gray-50 rounded w-full mb-2" /><div className="h-3 bg-gray-50 rounded w-3/4" /></div>))}</div>
          ) : personas.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {personas.map((p: any) => {
                const attrs = p.attributes || {};
                const values = attrs.values || [];
                const confidence = p.confidence?.overall;
                return (
                  <Link key={p.id} href={`/personas/${p.id}`} className="group">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-accent/30 hover:shadow-md transition-all h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center"><Users className="w-4 h-4 text-accent" /></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{attrs.display_name || attrs.demographics?.life_stage || 'Persona'}</div>
                          <div className="text-xs text-gray-400">{attrs.demographics?.age_range || ''} · {attrs.decision_style || ''}</div>
                        </div>
                        {confidence && <div className={`ml-auto text-xs px-2 py-0.5 rounded-full ${confidence > 0.7 ? 'confidence-high' : confidence > 0.4 ? 'confidence-medium' : 'confidence-low'}`}>{Math.round(confidence * 100)}%</div>}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-3 mb-3 flex-1">{p.narrative?.slice(0, 150)}...</p>
                      <div className="flex flex-wrap gap-1">{values.slice(0, 3).map((v: string, i: number) => (<span key={i} className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded-full">{v}</span>))}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="font-medium text-gray-700 mb-1">No personas yet</h3>
              <p className="text-sm text-gray-400 mb-4">Complete onboarding to create your own, or seed the library with demo personas</p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/onboarding" className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 transition">Create Persona</Link>
                <button onClick={seedDemoPersonas} disabled={seeding} className="px-4 py-2 bg-white text-accent text-sm rounded-lg border border-accent/30 hover:bg-accent-light transition disabled:opacity-50">
                  {seeding ? 'Seeding...' : 'Seed 4 Demo Personas'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
