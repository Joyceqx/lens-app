'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, Users, Activity, ArrowLeft, MessageCircle, BarChart3, UserCircle, Brain, Heart, Compass, User, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/admin';

export default function PersonaProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const [persona, setPersona] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/personas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPersona(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading persona...</div>
      </div>
    );

  if (!persona || persona.error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Persona not found</h2>
          <Link href="/personas" className="text-sm text-accent hover:text-accent-hover">
            Back to library
          </Link>
        </div>
      </div>
    );

  const attrs = persona.attributes || {};
  const confidence = persona.confidence || {};
  const demographics = attrs.demographics || {};

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Activity },
    { label: 'My Personas', href: '/my-personas', icon: UserCircle },
    { label: 'Persona Library', href: '/personas', icon: Users, active: true },
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
                item.active
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-60 p-8">
        <div className="max-w-3xl">
          <Link
            href="/personas"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
          </Link>

          {/* Hero card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {attrs.display_name || demographics.life_stage || 'Persona Profile'}
                  </h1>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {[demographics.age_range, demographics.location_type, demographics.household]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
              <Link
                href={`/chat/${id}`}
                className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition shrink-0"
              >
                <MessageCircle className="w-4 h-4" /> Chat with Persona
              </Link>
            </div>

            {/* Overall confidence */}
            {confidence.overall && (
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
                <span className="text-xs text-gray-400">Confidence</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${confidence.overall * 100}%`,
                      background:
                        confidence.overall > 0.7
                          ? '#059669'
                          : confidence.overall > 0.4
                          ? '#D97706'
                          : '#DC2626',
                    }}
                  />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    confidence.overall > 0.7
                      ? 'bg-emerald-50 text-emerald-600'
                      : confidence.overall > 0.4
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-red-50 text-red-500'
                  }`}
                >
                  {Math.round(confidence.overall * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Key characteristics grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Demographics */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900">Demographics</h2>
              </div>
              <div className="space-y-2 text-sm">
                {demographics.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gender</span>
                    <span className="text-gray-700">{demographics.gender}</span>
                  </div>
                )}
                {demographics.age_range && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Age</span>
                    <span className="text-gray-700">{demographics.age_range}</span>
                  </div>
                )}
                {demographics.ethnicity && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ethnicity</span>
                    <span className="text-gray-700">{demographics.ethnicity}</span>
                  </div>
                )}
                {demographics.region && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Region</span>
                    <span className="text-gray-700">{demographics.region}</span>
                  </div>
                )}
                {demographics.education && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Education</span>
                    <span className="text-gray-700">{demographics.education}</span>
                  </div>
                )}
                {demographics.income && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Income</span>
                    <span className="text-gray-700">{demographics.income}</span>
                  </div>
                )}
                {demographics.household && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Household</span>
                    <span className="text-gray-700">{demographics.household}</span>
                  </div>
                )}
                {demographics.life_stage && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Life Stage</span>
                    <span className="text-gray-700">{demographics.life_stage}</span>
                  </div>
                )}
                {demographics.location_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span className="text-gray-700">{demographics.location_type}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Decision Profile */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-purple-500" />
                <h2 className="text-sm font-semibold text-gray-900">Decision Profile</h2>
              </div>
              <div className="space-y-2 text-sm">
                {attrs.decision_style && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Style</span>
                    <span className="text-gray-700 capitalize">{attrs.decision_style}</span>
                  </div>
                )}
                {attrs.communication_style && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Communication</span>
                    <span className="text-gray-700 capitalize">{attrs.communication_style}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Values */}
          {attrs.values?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-gray-900">Core Values</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {attrs.values.map((v: string, i: number) => (
                  <span
                    key={i}
                    className="text-sm bg-accent-light text-accent px-3 py-1.5 rounded-full"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Behavioral Patterns */}
          {attrs.behavioral_patterns?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-900">Behavioral Patterns</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {attrs.behavioral_patterns.map((b: string, i: number) => (
                  <span
                    key={i}
                    className="text-sm bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Life Context */}
          {attrs.life_context?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900">Life Context</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {attrs.life_context.map((c: string, i: number) => (
                  <span
                    key={i}
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
