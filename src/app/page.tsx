'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, MessageSquare, BarChart3, Shield, Sparkles, Eye } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Lens</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Contribute
            </Link>
            <Link
              href="/dashboard"
              className="text-sm bg-accent text-white px-4 py-2 rounded-full hover:bg-accent-hover transition"
            >
              Open App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent-light text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Real Human Personas at Scale
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            Stop guessing what your
            <br />
            <span className="text-accent">customers think</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Query authentic human personas built from real interviews.
            Get explainable, grounded perspectives — not synthetic guesses.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full text-base font-medium hover:bg-accent-hover transition shadow-lg shadow-accent/25"
            >
              Explore Personas <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-base font-medium hover:border-gray-300 hover:bg-gray-50 transition"
            >
              Share Your Perspective
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Lens?</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Move beyond synthetic personas. Access real human perspectives grounded in authentic interviews.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Real Personas',
                desc: 'Built from structured conversational interviews with real people — not statistical models.',
              },
              {
                icon: MessageSquare,
                title: 'Explainable Responses',
                desc: 'Every answer includes confidence levels and explanations grounded in the persona\'s values.',
              },
              {
                icon: BarChart3,
                title: 'Multi-Persona Panel',
                desc: 'Query 3-5 personas simultaneously. See consensus, divergence, and actionable insights.',
              },
              {
                icon: Shield,
                title: 'Privacy First',
                desc: 'No PII exposed. Full consent management. Delete-on-request. Privacy by architecture.',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered Extraction',
                desc: 'Claude AI extracts values, behavioral patterns, life context, and taste signals from narratives.',
              },
              {
                icon: Eye,
                title: 'Authentic Depth',
                desc: 'Capture nuanced, contradictory, deeply personal reasoning that drives real decisions.',
              },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-accent/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to hear real perspectives?</h2>
          <p className="text-gray-500 mb-8">
            Start exploring authentic human personas today. No synthetic guesses — just real people.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-accent-hover transition shadow-lg shadow-accent/25"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <Eye className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">Lens</span>
          </div>
          <p className="text-xs text-gray-400">&copy; 2026 Lens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
