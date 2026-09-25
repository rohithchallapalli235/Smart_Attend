import { StatusPill } from '@/components/status-pill';
import { institutionStats, studentAttendance, facultySummary } from '@/data/mock-data';

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                North Valley Institute of Technology
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Smart Attend
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                Monthly Summary
              </button>
              <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                Export Report
              </button>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {institutionStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <div className="mt-4 flex items-end justify-between">
                <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-emerald-300">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Student dashboard</p>
                <h2 className="text-2xl font-bold text-white">Attendance overview</h2>
              </div>
              <button className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200">
                Class: B.Tech CSE - A
              </button>
            </div>

            <div className="space-y-4">
              {studentAttendance.map((student) => (
                <div key={student.name} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 font-semibold text-slate-950">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{student.name}</p>
                          <p className="text-sm text-slate-400">{student.course} • {student.rollNo}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <StatusPill value={student.percentage} />
                      <div className="min-w-[120px] rounded-xl bg-slate-800 px-3 py-2 text-right">
                        <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Attendance</p>
                        <p className="text-xl font-bold text-white">{formatPercent(student.percentage)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {student.subjects.map((subject) => (
                      <div key={subject.name} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <span>{subject.name}</span>
                          <span>{subject.present}/{subject.total}</span>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-right text-sm font-medium text-white">
                          {formatPercent(subject.percentage)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
              <p className="text-sm text-slate-400">Faculty dashboard</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Attendance alerts</h2>

              <div className="mt-5 space-y-3">
                {facultySummary.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.subject}</p>
                      </div>
                      <StatusPill value={item.percentage} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                      <span>{item.students} students</span>
                      <span className="font-semibold">{formatPercent(item.percentage)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 p-5 shadow-soft">
              <p className="text-sm text-slate-300">Email alert rule</p>
              <h3 className="mt-2 text-xl font-bold text-white">College SMTP integration</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                If attendance is below 75%, the system sends alert emails to the faculty and the student&apos;s parent using the configured college email credentials.
              </p>
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
                <p>Safe: &gt;= 75% • Green</p>
                <p>Alert: 60% to 74.9% • Blue</p>
                <p>Warning: below 60% • Red</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
