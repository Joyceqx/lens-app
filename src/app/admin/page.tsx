'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Users, Activity, BarChart3, LogOut, UserCircle, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Persona {
  id: string;
  user_id: string | null;
  narrative: string;
  attributes: Record<string, any>;
  confidence: Record<string, any>;
  published: boolean;
  version: number;
  created_at: string;
}

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/personas')
      .then((r) => {
        if (r.status === 403) throw new Error('Access denied');
        return r.json();
      })
      .then((data) => {
        setPersonas(data.personas || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch('/api/admin/personas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPersonas((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
    setDeleting(null);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        await fetch('/api/admin/personas', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        setPersonas((prev) => prev.filter((p) => p.id !== id));
      } catch (e) {
        console.error('Bulk delete failed for', id, e);
      }
    }
    setSelectedIds(new Set());
    setBulkDeleting(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === personas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(personas.map((p) => p.id)));
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Activity },
    { label: 'My Personas', href: '/my-personas', icon: UserCircle },
    { label: 'Persona Library', href: '/personas', icon: Users },
    { label: 'Panel', href: '/panel', icon: BarChart3 },
    { label: 'Admin', href: '/admin', icon: Shield, active: true },
  ];

  if (error === 'Access denied') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-gray-700 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400 mb-4">This page is restricted to administrators.</p>
          <Link href="/dashboard" className="text-sm text-accent hover:text-accent-hover">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 p-4 flex flex-col z-40">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold">Lens</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                item.active ? 'bg-accent-light text-accent font-medium' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        {user && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="text-xs text-gray-400 truncate mb-2 px-3">{user.email}</div>
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      <main className="ml-60 p-8">
        <div className="max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-accent" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin: Persona Management</h1>
              <p className="text-gray-500 text-sm mt-1">
                Review and manage all personas in the database ({personas.length} total)
              </p>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4 flex items-center justify-between">
              <span className="text-sm text-red-600">
                {selectedIds.size} persona{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size} Selected`}
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-2 bg-gray-50 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select all header */}
              <div className="flex items-center gap-3 px-4 py-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={selectedIds.size === personas.length && personas.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="w-48">Name</span>
                <span className="w-20">Status</span>
                <span className="w-16 text-center">Quality</span>
                <span className="flex-1">Narrative Preview</span>
                <span className="w-24 text-right">Actions</span>
              </div>

              {personas.map((persona) => {
                const attrs = persona.attributes || {};
                const displayName = attrs.display_name || attrs.demographics?.life_stage || 'Unnamed';
                const overallConfidence = persona.confidence?.overall;
                const isConfirming = deleteConfirmId === persona.id;

                return (
                  <div
                    key={persona.id}
                    className={`bg-white rounded-lg border p-4 transition-all ${
                      selectedIds.has(persona.id) ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(persona.id)}
                        onChange={() => toggleSelect(persona.id)}
                        className="rounded border-gray-300"
                      />
                      <div className="w-48 shrink-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{displayName}</div>
                        <div className="text-xs text-gray-400">
                          {attrs.demographics?.age_range || '—'} · {attrs.decision_style || '—'}
                        </div>
                      </div>
                      <div className="w-20 shrink-0">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            persona.published ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {persona.published ? 'Public' : 'Draft'}
                        </span>
                      </div>
                      <div className="w-16 shrink-0 text-center">
                        {overallConfidence ? (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              overallConfidence > 0.7
                                ? 'bg-emerald-50 text-emerald-600'
                                : overallConfidence > 0.4
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-red-50 text-red-500'
                            }`}
                          >
                            {Math.round(overallConfidence * 100)}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 truncate">
                          {persona.narrative?.slice(0, 120) || 'No narrative'}
                        </p>
                      </div>
                      <div className="w-24 shrink-0 flex justify-end">
                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-100 rounded transition"
                            >
                              No
                            </button>
                            <button
                              onClick={() => handleDelete(persona.id)}
                              disabled={deleting === persona.id}
                              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                            >
                              {deleting === persona.id ? '...' : 'Yes'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(persona.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete persona"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
