import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/60 p-8 shadow-soft">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                Institutional Attendance Solution
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Smart Attend for seamless campus monitoring
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-300">
                Monitor student attendance, trigger alerts, and keep parents and faculty informed with a single institution-wide solution.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/login" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400">
                  Login to dashboard
                </Link>
                <Link href="/dashboard/institution" className="rounded-full border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
                  View institution overview
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-700 bg-slate-950/70 p-6 shadow-soft">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-200">Safe</p>
                  <h3 className="mt-2 text-3xl font-bold text-white">75%+</h3>
                  <p className="mt-1 text-xs text-emerald-200">Green</p>
                </div>
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="text-sm text-blue-200">Alert</p>
                  <h3 className="mt-2 text-3xl font-bold text-white">60-74%</h3>
                  <p className="mt-1 text-xs text-blue-200">Blue</p>
                </div>
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 sm:col-span-2">
                  <p className="text-sm text-red-200">Warning</p>
                  <h3 className="mt-2 text-3xl font-bold text-white">Below 60%</h3>
                  <p className="mt-1 text-xs text-red-200">Red</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
