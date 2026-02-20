'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Users, Activity, BarChart3, LogOut, UserCircle, Edit3, Globe, GlobeLock, Trash2, X, Save, Plus, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/admin';

interface Persona {
  id: string;
  narrative: string;
  attributes: Record<string, any>;
  confidence: Record<string, any>;
  published: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export default function MyPersonasPage() {
  const { user, signOut } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNarrative, setEditNarrative] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPersonas = () => {
    fetch('/api/personas/mine')
      .then((r) => r.json())
      .then((data) => {
        setPersonas(data.personas || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleTogglePublish = async (persona: Persona) => {
    setActionLoading(persona.id);
    try {
      const res = await fetch(`/api/personas/${persona.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !persona.published }),
      });
      if (res.ok) {
        setPersonas((prev) =>
          prev.map((p) => (p.id === persona.id ? { ...p, published: !p.published } : p))
        );
      }
    } catch (e) {
      console.error('Toggle publish failed:', e);
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/personas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPersonas((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
    setActionLoading(null);
  };

  const handleStartEdit = (persona: Persona) => {
    setEditingId(persona.id);
    setEditNarrative(persona.narrative || '');
    setEditDisplayName(persona.attributes?.display_name || persona.attributes?.demographics?.life_stage || '');
  };

  const handleSaveEdit = async (persona: Persona) => {
    setActionLoading(persona.id);
    try {
      const updatedAttributes = {
        ...persona.attributes,
        display_name: editDisplayName,
      };
      const res = await fetch(`/api/personas/${persona.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrative: editNarrative,
          attributes_json: updatedAttributes,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPersonas((prev) =>
          prev.map((p) => (p.id === persona.id ? { ...p, narrative: updated.narrative, attributes: updated.attributes } : p))
        );
        setEditingId(null);
      }
    } catch (e) {
      console.error('Save failed:', e);
    }
    setActionLoading(null);
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Activity },
    { label: 'My Personas', href: '/my-personas', icon: UserCircle, active: true },
    { label: 'Persona Library', href: '/personas', icon: Users },
    { label: 'Panel', href: '/panel', icon: BarChart3 },
    ...(isAdmin(user?.email) ? [{ label: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Personas</h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your personas — edit, publish to the library, or remove them
              </p>
            </div>
            <Link
              href="/onboarding"
              className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 transition"
            >
              <Plus className="w-4 h-4" />
              Create New
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                    <div>
                      <div className="h-3 bg-gray-100 rounded w-32 mb-1" />
                      <div className="h-2 bg-gray-50 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-50 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-50 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : personas.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {personas.map((persona) => {
                const attrs = persona.attributes || {};
                const displayName = attrs.display_name || attrs.demographics?.life_stage || 'Persona';
                const values = attrs.values || [];
                const isEditing = editingId === persona.id;
                const isDeleting = deleteConfirmId === persona.id;
                const isActionLoading = actionLoading === persona.id;

                return (
                  <div
                    key={persona.id}
                    className="bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editDisplayName}
                              onChange={(e) => setEditDisplayName(e.target.value)}
                              className="text-sm font-medium text-gray-900 border border-gray-200 rounded px-2 py-1 focus:border-accent focus:outline-none"
                              placeholder="Display name"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{displayName}</div>
                          )}
                          <div className="text-xs text-gray-400">
                            {attrs.demographics?.age_range || ''} · {attrs.decision_style || ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status badge */}
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            persona.published
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {persona.published ? 'Published' : 'Draft'}
                        </span>

                        {/* Action buttons */}
                        {!isEditing && !isDeleting && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleStartEdit(persona)}
                              className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent-light rounded-lg transition"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTogglePublish(persona)}
                              disabled={isActionLoading}
                              className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent-light rounded-lg transition disabled:opacity-50"
                              title={persona.published ? 'Unpublish from library' : 'Publish to library'}
                            >
                              {persona.published ? (
                                <GlobeLock className="w-4 h-4" />
                              ) : (
                                <Globe className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(persona.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete confirmation */}
                    {isDeleting && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-red-600">
                          Delete this persona? This cannot be undone.
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-xs px-3 py-1.5 text-gray-500 hover:bg-white rounded transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(persona.id)}
                            disabled={isActionLoading}
                            className="text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                          >
                            {isActionLoading ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Narrative */}
                    {isEditing ? (
                      <div className="mb-4">
                        <label className="text-xs text-gray-400 mb-1 block">Narrative</label>
                        <textarea
                          value={editNarrative}
                          onChange={(e) => setEditNarrative(e.target.value)}
                          rows={4}
                          className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 focus:border-accent focus:outline-none resize-none"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleSaveEdit(persona)}
                            disabled={isActionLoading}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:opacity-50"
                          >
                            <Save className="w-3 h-3" />
                            {isActionLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                        {persona.narrative?.slice(0, 250)}
                        {(persona.narrative?.length || 0) > 250 ? '...' : ''}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {values.slice(0, 5).map((v: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded-full"
                        >
                          {v}
                        </span>
                      ))}
                      {attrs.decision_style && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {attrs.decision_style}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <UserCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="font-medium text-gray-700 mb-1">No personas yet</h3>
              <p className="text-sm text-gray-400 mb-4">
                Complete the onboarding process to create your first persona
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 transition"
              >
                <Plus className="w-4 h-4" />
                Create Persona
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
