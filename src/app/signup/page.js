"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to sign up.');
      } else {
        // Success! Redirect to login page
        router.push('/login?registered=true');
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

      {/* Signup Card */}
      <div className="w-full max-w-md bg-[#24211d]/90 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 shadow-2xl flex flex-col gap-6 animate-fade-in-up">
        {/* Header Title */}
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-3xl font-black font-serif-display text-white tracking-wide uppercase leading-none">
            Azzurro Hotel
          </h1>
          <p className="text-xs font-semibold tracking-wider text-[#a8a090] uppercase mt-2">
            Create Operational Account
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3.5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-red-400 text-[18px] shrink-0 mt-0.5">error</span>
            <span className="text-[12px] font-semibold text-red-300 leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#a8a090] uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">person</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nipun Goel"
                className="w-full pl-10 pr-4 py-3 bg-[#1e1b19] border border-white/[0.04] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#d99c26]/60 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#a8a090] uppercase tracking-wider">
              Email Address
            </label>
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
            <label className="text-[10px] font-bold text-[#a8a090] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-4 py-3 bg-[#1e1b19] border border-white/[0.04] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#d99c26]/60 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#a8a090] uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">lock</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
                Registering...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="text-center flex flex-col gap-1.5">
          <p className="text-[11px] text-slate-400 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-[#d99c26] hover:text-[#f8b436] font-bold hover:underline transition-colors">
              Log In
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
