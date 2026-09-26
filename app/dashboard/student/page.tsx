import { DashboardShell } from '@/components/dashboard-shell';
import { StatusPill } from '@/components/status-pill';
import { facultySummary, studentAttendance } from '@/data/mock-data';

const student = studentAttendance[1];

export default function StudentDashboardPage() {
  return (
    <DashboardShell title="Student Dashboard" subtitle="Attendance, classroom details, and progress insights." role="Student">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Student profile</p>
              <h2 className="mt-1 text-2xl font-bold text-white">{student.name}</h2>
            </div>
            <StatusPill value={student.percentage} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Roll number</p>
              <p className="mt-2 text-xl font-semibold text-white">{student.rollNo}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Course</p>
              <p className="mt-2 text-xl font-semibold text-white">{student.course}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Attendance</p>
              <p className="mt-2 text-xl font-semibold text-white">{student.percentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {student.subjects.map((subject) => (
              <div key={subject.name} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{subject.name}</p>
                  <span className="text-sm text-slate-400">{subject.present}/{subject.total}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(subject.percentage, 100)}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Current performance</span>
                  <span className="font-semibold text-white">{subject.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Parent updates</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Attendance alerts</h3>
            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-300">Current status:</p>
              <div className="mt-3 flex items-center justify-between">
                <StatusPill value={student.percentage} />
                <span className="text-lg font-semibold text-white">{student.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 p-5">
            <p className="text-sm text-slate-300">Faculty contact</p>
            <h3 className="mt-2 text-xl font-bold text-white">{facultySummary[1].name}</h3>
            <p className="mt-2 text-sm text-slate-300">{facultySummary[1].subject}</p>
            <p className="mt-4 text-sm text-slate-200">Email: {facultySummary[1].facultyEmail}</p>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
