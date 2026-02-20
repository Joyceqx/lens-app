'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Users, MessageSquare, Clock, Activity, ArrowRight, ChevronRight, BarChart3, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Stats { total_personas: number; total_sessions: number; total_messages: number; avg_latency_ms: number; }

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch('/api/personas').then(r => r.json()),
    ]).then(([s, p]) => { setStats(s); setPersonas(p.personas?.slice(0, 6) || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 p-4 flex flex-col z-40">
        <Link href="/" className="flex items-center gap-2 mb-8"><div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></div><span className="text-lg font-semibold">Lens</span></Link>
        <nav className="flex-1 space-y-1">
          {[{ label: 'Dashboard', href: '/dashboard', icon: Activity, active: true }, { label: 'Personas', href: '/personas', icon: Users }, { label: 'My Personas', href: '/my-personas', icon: UserCircle }, { label: 'Panel', href: '/panel', icon: BarChart3 }].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${item.active ? 'bg-accent-light text-accent font-medium' : 'text-gray-500 hover:bg-gray-50'}`}><item.icon className="w-4 h-4" />{item.label}</Link>
          ))}
        </nav>
        {user && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="text-xs text-gray-400 truncate mb-2 px-3">{user.email}</div>
            <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition w-full">
              <LogOut className="w-4 h-4" />Sign Out
            </button>
          </div>
        )}
      </aside>

      <main className="ml-60 p-8">
        <div className="max-w-5xl">
          <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500 text-sm mt-1">Overview of your persona library and activity</p></div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {[{ label: 'Total Personas', value: stats?.total_personas ?? '\u2014', icon: Users, color: 'text-accent' }, { label: 'Chat Sessions', value: stats?.total_sessions ?? '\u2014', icon: MessageSquare, color: 'text-emerald-600' }, { label: 'Total Messages', value: stats?.total_messages ?? '\u2014', icon: Activity, color: 'text-amber-600' }, { label: 'Avg Latency', value: stats ? `${stats.avg_latency_ms}ms` : '\u2014', icon: Clock, color: 'text-blue-600' }].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3"><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Personas</h2>
            <Link href="/personas" className="text-sm text-accent hover:text-accent-hover flex items-center gap-1 transition">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map(i => (<div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"><div className="h-4 bg-gray-100 rounded w-3/4 mb-3" /><div className="h-3 bg-gray-50 rounded w-full mb-2" /><div className="h-3 bg-gray-50 rounded w-2/3" /></div>))}</div>
          ) : personas.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {personas.map((p: any) => {
                const attrs = p.attributes || {};
                return (
                  <Link key={p.id} href={`/personas/${p.id}`} className="group">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-accent/30 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center"><Users className="w-4 h-4 text-accent" /></div>
                        <div><div className="text-sm font-medium text-gray-900">{attrs.display_name || attrs.demographics?.life_stage || 'Persona'}</div><div className="text-xs text-gray-400">{attrs.demographics?.age_range || ''}</div></div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.narrative?.slice(0, 120)}...</p>
                      <div className="flex flex-wrap gap-1">{(attrs.values || []).slice(0, 3).map((v: string, i: number) => (<span key={i} className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded-full">{v}</span>))}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" /><h3 className="font-medium text-gray-700 mb-1">No personas yet</h3><p className="text-sm text-gray-400 mb-4">Run the seed script or invite contributors</p>
              <Link href="/onboarding" className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover">Start Onboarding <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
