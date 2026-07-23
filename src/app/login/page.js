"use client";

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        setSuccess('Account created successfully! You can now log in.');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#181614] px-4 font-sans select-none relative overflow-hidden">
      {/* Decorative Warm Background Highlights */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#e05a47]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#d99c26]/5 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#24211d]/90 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 shadow-2xl flex flex-col gap-6 animate-fade-in-up">
        {/* Header Title */}
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-3xl font-black font-serif-display text-white tracking-wide uppercase leading-none">
            Azzurro Hotel
          </h1>
          <p className="text-xs font-semibold tracking-wider text-[#a8a090] uppercase mt-2">
            Operations Dashboard Log In
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3.5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-red-400 text-[18px] shrink-0 mt-0.5">error</span>
            <span className="text-[12px] font-semibold text-red-300 leading-snug">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-3.5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-emerald-400 text-[18px] shrink-0 mt-0.5">check_circle</span>
            <span className="text-[12px] font-semibold text-emerald-300 leading-snug">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#a8a090] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 bg-[#1e1b19] border border-white/[0.04] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#d99c26]/60 transition-colors"
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#a8a090] uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full pl-10 pr-4 py-3 bg-[#1e1b19] border border-white/[0.04] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#d99c26]/60 transition-colors"
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-2 py-3 bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-1.5 justify-center">
                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="flex items-center gap-3">
            <span className="flex-1 border-t border-white/[0.06]" />
            <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">or</span>
            <span className="flex-1 border-t border-white/[0.06]" />
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-[12px] rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <div className="text-center flex flex-col gap-1.5">
          <p className="text-[11px] text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#d99c26] hover:text-[#f8b436] font-bold hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            Authorized Personnel Only · Azzurro Hospitality Group
          </p>
        </div>
      </div>
    </div>
  );
}
