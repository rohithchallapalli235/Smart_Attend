import Link from 'next/link';

export function DashboardShell({
  title,
  subtitle,
  role,
  children,
}: {
  title: string;
  subtitle: string;
  role: string;
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/dashboard/institution', label: 'Institution' },
    { href: '/dashboard/faculty', label: 'Faculty' },
    { href: '/dashboard/student', label: 'Student' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Smart Attend</p>
              <h1 className="mt-2 text-3xl font-bold">{title}</h1>
              <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                {role}
              </span>
              <Link href="/" className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200">
                Home
              </Link>
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
