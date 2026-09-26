import { DashboardShell } from '@/components/dashboard-shell';
import { StatusPill } from '@/components/status-pill';
import { facultySummary } from '@/data/mock-data';

export default function FacultyDashboardPage() {
  return (
    <DashboardShell title="Faculty Dashboard" subtitle="Review class performance and issue attendance warnings." role="Faculty">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Latest class review</p>
              <h2 className="text-2xl font-bold text-white">Semester attendance snapshot</h2>
            </div>
            <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
              Mark attendance
            </button>
          </div>

          <div className="space-y-4">
            {facultySummary.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">{item.subject}</p>
                  </div>
                  <StatusPill value={item.percentage} />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                  <span>{item.students} students</span>
                  <span>{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Alert trigger</p>
          <h3 className="mt-2 text-2xl font-bold text-white">Attendance process</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <p className="font-medium text-white">Safe</p>
              <p className="mt-2">75% and above — emails are not triggered.</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <p className="font-medium text-blue-300">Alert</p>
              <p className="mt-2">60% to 75% — inform faculty and parent.</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <p className="font-medium text-red-300">Warning</p>
              <p className="mt-2">Below 60% — urgent alert to faculty and parent.</p>
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
