'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const roles = [
  {
    key: 'institution',
    label: 'Institution',
    title: 'Institution login',
    emailLabel: 'Institution email',
  },
  {
    key: 'faculty',
    label: 'Faculty',
    title: 'Faculty login',
    emailLabel: 'Faculty email',
  },
  {
    key: 'student',
    label: 'Student',
    title: 'Student login',
    emailLabel: 'Student email',
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<(typeof roles)[number]['key']>('institution');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRole = roles.find((role) => role.key === selectedRole) ?? roles[0];

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, [activeRole]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: activeRole.key,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      router.push(`/?role=${activeRole.key}&email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_25%),linear-gradient(135deg,#020617_0%,#0f172a_40%,#111827_100%)] px-4 py-12 text-slate-100">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/80 shadow-[0_30px_80px_rgba(15,23,42,0.7)] backdrop-blur-sm lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-slate-900 to-slate-950 p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.28),_transparent_40%)]" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">BVC Engineering College</p>
              <h1 className="mt-7 max-w-sm text-4xl font-bold leading-tight text-white">
                Transparent attendance for every role on campus.
              </h1>
            </div>

            <div className="space-y-4 rounded-3xl border border-emerald-400/20 bg-slate-900/45 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">Attendance status guide</p>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
                  Smart alerts
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-800/80 p-3">
                  <span className="text-sm text-slate-300">Safe attendance</span>
                  <span className="font-semibold text-emerald-300">75% and above</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-800/80 p-3">
                  <span className="text-sm text-slate-300">Alert range</span>
                  <span className="font-semibold text-blue-300">60% to 74.9%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-800/80 p-3">
                  <span className="text-sm text-slate-300">Warning range</span>
                  <span className="font-semibold text-red-300">Below 60%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Secure portal</p>
              <h2 className="mt-3 text-3xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-400">
                Select your role and sign in to access the appropriate dashboard.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-1.5">
              {roles.map((role) => {
                const isActive = role.key === selectedRole;
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => setSelectedRole(role.key)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-emerald-300">{activeRole.title}</p>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                  {activeRole.emailLabel}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  placeholder="you@college.edu"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-between text-sm text-slate-400">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500" />
                  Remember me
                </label>
                <a href="/" className="font-medium text-emerald-300 hover:text-emerald-200">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Signing in...' : `Sign in as ${activeRole.label}`}
              </button>
            </form>

          </div>
        </section>
      </div>
    </main>
  );
}
