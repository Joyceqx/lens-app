'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ConfirmedPage() {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0b2e] via-[#1a1545] to-[#0f0b2e] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">You&apos;re all set!</h1>

        <p className="text-white/50 text-lg mb-2">
          Your account has been confirmed{user?.email ? ` as ${user.email}` : ''}.
        </p>

        <p className="text-white/30 text-sm mb-8">
          You&apos;re now signed in and ready to create your first persona.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full text-base font-medium hover:bg-accent-hover transition shadow-lg shadow-accent/25"
        >
          Go to Homepage <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-white/20 text-xs mt-6">
          Redirecting in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}
