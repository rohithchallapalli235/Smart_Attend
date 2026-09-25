'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'institution' | 'faculty' | 'student'>('institution');
  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    localStorage.setItem('smart_attend_role', role);
    localStorage.setItem('smart_attend_email', email);

    router.push(`/dashboard/${role}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-900/90 p-7 shadow-soft">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Smart Attend</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Login</h1>
          <p className="mt-2 text-sm text-slate-400">Institution-based access portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'institution' | 'faculty' | 'student')}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-0"
            >
              <option value="institution">Institution</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.edu"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-xs text-slate-300">
          <p>No built-in registration is required for students or faculty.</p>
          <p className="mt-1">The institution manages all accounts manually.</p>
        </div>
      </div>
    </main>
  );
}
