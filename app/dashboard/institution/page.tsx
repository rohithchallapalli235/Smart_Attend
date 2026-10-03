import { DashboardShell } from '@/components/dashboard-shell';
import { getFaculty, getStudents } from '@/lib/backend-store';
import { institutionDepartments } from '@/data/mock-data';

export const dynamic = 'force-dynamic';

export default async function InstitutionDashboardPage() {
  const [students, faculty] = await Promise.all([getStudents(), getFaculty()]);
  const averageAttendance = students.length
    ? students.reduce((total, student) => total + student.percentage, 0) / students.length
    : 0;
  const institutionStats = [
    { label: 'Registered students', value: students.length.toLocaleString() },
    { label: 'Registered faculty', value: faculty.length.toLocaleString() },
    { label: 'Average attendance', value: `${averageAttendance.toFixed(1)}%` },
    { label: 'Students below 75%', value: students.filter((student) => student.percentage < 75).length.toLocaleString() },
  ];

  return (
    <DashboardShell title="Institution Dashboard" subtitle="A full campus overview for administration and leadership." role="Institution">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {institutionStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Academic structure</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Departments</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {institutionDepartments.map((dept) => (
              <div key={dept} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white">
                {dept}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Institution action plan</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Key alerts</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li className="rounded-2xl border border-slate-800 bg-slate-950 p-3">Monitor underperforming classes during semester review.</li>
            <li className="rounded-2xl border border-slate-800 bg-slate-950 p-3">Send attendance alerts to parents of eligible students.</li>
            <li className="rounded-2xl border border-slate-800 bg-slate-950 p-3">Track faculty compliance for every course section.</li>
          </ul>
        </div>
      </section>
    </DashboardShell>
  );
}
