'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusPill } from '@/components/status-pill';
import type { FacultyRecord, StudentRecord } from '@/data/mock-data';

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

type StudentForm = {
  name: string;
  rollNo: string;
  course: string;
  email: string;
  parentEmail: string;
  password: string;
};

type FacultyForm = {
  name: string;
  subject: string;
  facultyEmail: string;
  password: string;
};

type Resource = {
  id: number;
  title: string;
  subject: string;
  facultyEmail: string;
  fileName: string;
  downloadUrl: string;
  createdAt: string;
};

type AssignmentQuestion = {
  prompt: string;
  options: string[];
  answer: number;
};

type Assignment = {
  id: number;
  title: string;
  subject: string;
  facultyEmail: string;
  questions: AssignmentQuestion[];
  createdAt: string;
};

type Submission = {
  assignmentId: number;
  score: number;
  total: number;
};

type FacultySubmissionRecord = {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  subject: string;
  studentName: string;
  rollNo: string;
  studentEmail: string;
  score: number;
  total: number;
  percentage: number;
  submittedAt: string;
};

function emptyQuestion(): AssignmentQuestion {
  return { prompt: '', options: ['', '', '', ''], answer: 0 };
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') ?? 'institution';
  const identity = searchParams.get('email')?.trim().toLowerCase();

  useEffect(() => {
    if (!searchParams.get('role')) {
      router.replace('/login');
    }
  }, [router, searchParams]);

  const [studentList, setStudentList] = useState<StudentRecord[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>([]);
  const [resourceList, setResourceList] = useState<Resource[]>([]);
  const [assignmentList, setAssignmentList] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [facultySubmissions, setFacultySubmissions] = useState<FacultySubmissionRecord[]>([]);

  const [studentForm, setStudentForm] = useState<StudentForm>({
    name: '',
    rollNo: '',
    course: '',
    email: '',
    parentEmail: '',
    password: '',
  });

  const [facultyForm, setFacultyForm] = useState<FacultyForm>({
    name: '',
    subject: '',
    facultyEmail: '',
    password: '',
  });
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, boolean>>({});
  const [markedAttendance, setMarkedAttendance] = useState<Record<string, boolean>>({});
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editingStudentRollNo, setEditingStudentRollNo] = useState<string | null>(null);
  const [editingFacultyEmail, setEditingFacultyEmail] = useState<string | null>(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentQuestions, setAssignmentQuestions] = useState<AssignmentQuestion[]>([emptyQuestion()]);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, Record<number, number>>>({});
  const [learningMessage, setLearningMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [studentRes, facultyRes, resourceRes, assignmentRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/faculty'),
        fetch('/api/resources'),
        fetch('/api/assignments?viewer=student'),
      ]);

      if (studentRes.ok) {
        const studentData = await studentRes.json();
        if (Array.isArray(studentData)) {
          setStudentList(studentData);
        }
      }

      if (facultyRes.ok) {
        const facultyData = await facultyRes.json();
        if (Array.isArray(facultyData)) {
          setFacultyList(facultyData);
        }
      }

      if (resourceRes.ok) setResourceList(await resourceRes.json());
      if (assignmentRes.ok) setAssignmentList(await assignmentRes.json());
    };

    loadData();
  }, []);

  useEffect(() => {
    if (role !== 'student' || !identity) return;
    fetch(`/api/assignments/submissions?studentEmail=${encodeURIComponent(identity)}`)
      .then((response) => response.ok ? response.json() : [])
      .then((data: Submission[]) => setSubmissions(data));
  }, [identity, role]);

  useEffect(() => {
    if (role !== 'faculty' || !identity) return;
    fetch(`/api/assignments/submissions?facultyEmail=${encodeURIComponent(identity)}`)
      .then((response) => response.ok ? response.json() : [])
      .then((data: FacultySubmissionRecord[]) => setFacultySubmissions(data));
  }, [identity, role]);

  const currentStudent = useMemo(() => studentList.find((student) => student.email?.toLowerCase() === identity) ?? studentList[0], [identity, studentList]);
  const currentFaculty = useMemo(() => facultyList.find((faculty) => faculty.facultyEmail?.toLowerCase() === identity) ?? facultyList[0], [identity, facultyList]);

  useEffect(() => {
    if (role !== 'faculty' || !currentFaculty?.subject) return;

    const loadMarkedAttendance = async () => {
      const response = await fetch(`/api/attendance?date=${encodeURIComponent(attendanceDate)}&subject=${encodeURIComponent(currentFaculty.subject)}`);
      if (!response.ok) return;
      const data = await response.json() as { records: Array<{ rollNo: string; present: boolean }> };
      const statuses = Object.fromEntries(data.records.map((record) => [record.rollNo, record.present]));
      setMarkedAttendance(statuses);
      setAttendanceDraft(statuses);
    };

    loadMarkedAttendance();
  }, [attendanceDate, currentFaculty?.subject, role]);

  const handleBatchAttendance = async () => {
    const records = Object.entries(attendanceDraft)
      .filter(([rollNo]) => !Object.prototype.hasOwnProperty.call(markedAttendance, rollNo))
      .map(([rollNo, present]) => ({ rollNo, present }));
    if (!records.length || !currentFaculty?.facultyEmail) {
      setAttendanceMessage('All selected students are already marked for this date, or no student has been selected.');
      return;
    }

    setAttendanceMessage('Saving attendance for selected students...');
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records,
        subject: currentFaculty.subject,
        facultyEmail: currentFaculty?.facultyEmail,
        date: attendanceDate,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null) as { message?: string } | null;
      setAttendanceMessage(error?.message ?? 'Attendance could not be saved.');
      return;
    }

    const result = await response.json() as { students: StudentRecord[]; emailSent: number };
    setStudentList((prev) => prev.map((student) => result.students.find((updated) => updated.rollNo === student.rollNo) ?? student));
    setMarkedAttendance((prev) => ({ ...prev, ...attendanceDraft }));
    setAttendanceMessage(result.emailSent ? `Attendance saved. ${result.emailSent} alert email(s) sent.` : 'Attendance saved. No alert email was needed.');
  };

  const handleStudentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!studentForm.name || !studentForm.rollNo || !studentForm.course || !studentForm.email || !studentForm.parentEmail || (!editingStudentRollNo && !studentForm.password)) {
      return;
    }

    const isEditing = Boolean(editingStudentRollNo);
    const response = await fetch('/api/students', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...studentForm,
        ...(isEditing ? { rollNo: editingStudentRollNo } : {}),
      }),
    });

    if (!response.ok) {
      return;
    }

    const newStudent = await response.json() as StudentRecord;
    setStudentList((prev) => isEditing
      ? prev.map((student) => student.rollNo === editingStudentRollNo ? newStudent : student)
      : [newStudent, ...prev]);
    setStudentForm({ name: '', rollNo: '', course: '', email: '', parentEmail: '', password: '' });
    setEditingStudentRollNo(null);
  };

  const handleFacultySubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!facultyForm.name || !facultyForm.subject || !facultyForm.facultyEmail || (!editingFacultyEmail && !facultyForm.password)) {
      return;
    }

    const isEditing = Boolean(editingFacultyEmail);
    const response = await fetch('/api/faculty', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...facultyForm,
        ...(isEditing ? { originalEmail: editingFacultyEmail } : {}),
      }),
    });

    if (!response.ok) {
      return;
    }

    const newFaculty = await response.json() as FacultyRecord;
    setFacultyList((prev) => isEditing
      ? prev.map((faculty) => faculty.facultyEmail === editingFacultyEmail ? newFaculty : faculty)
      : [newFaculty, ...prev]);
    setFacultyForm({ name: '', subject: '', facultyEmail: '', password: '' });
    setEditingFacultyEmail(null);
  };

  const handleDeleteStudent = async (rollNo: string) => {
    if (!window.confirm('Delete this student account?')) return;
    const response = await fetch('/api/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rollNo }) });
    if (response.ok) setStudentList((prev) => prev.filter((student) => student.rollNo !== rollNo));
  };

  const handleDeleteFaculty = async (facultyEmail: string) => {
    if (!window.confirm('Delete this faculty account?')) return;
    const response = await fetch('/api/faculty', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ facultyEmail }) });
    if (response.ok) {
      setFacultyList((prev) => prev.filter((faculty) => faculty.facultyEmail !== facultyEmail));
      setResourceList((prev) => prev.filter((resource) => resource.facultyEmail !== facultyEmail));
      setAssignmentList((prev) => prev.filter((assignment) => assignment.facultyEmail !== facultyEmail));
    }
  };

  const handleExportReport = () => {
    const link = document.createElement('a');
    link.href = '/api/reports/attendance';
    link.download = 'bvc-engineering-college-attendance.csv';
    link.click();
  };

  const beginStudentEdit = (student: StudentRecord) => {
    setEditingStudentRollNo(student.rollNo);
    setStudentForm({ name: student.name, rollNo: student.rollNo, course: student.course, email: student.email ?? '', parentEmail: student.parentEmail ?? '', password: '' });
  };

  const beginFacultyEdit = (faculty: FacultyRecord) => {
    setEditingFacultyEmail(faculty.facultyEmail ?? null);
    setFacultyForm({ name: faculty.name, subject: faculty.subject, facultyEmail: faculty.facultyEmail ?? '', password: '' });
  };

  const handleResourceUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resourceTitle || !resourceFile || !currentFaculty?.facultyEmail) return;
    const formData = new FormData();
    formData.append('title', resourceTitle);
    formData.append('subject', currentFaculty.subject);
    formData.append('facultyEmail', currentFaculty.facultyEmail);
    formData.append('file', resourceFile);
    const response = await fetch('/api/resources', { method: 'POST', body: formData });
    if (!response.ok) {
      setLearningMessage('PDF upload failed. Please select a PDF file.');
      return;
    }
    const resource = await response.json() as Resource;
    setResourceList((prev) => [resource, ...prev]);
    setResourceTitle('');
    setResourceFile(null);
    setLearningMessage('PDF notes uploaded successfully.');
  };

  const handleAssignmentCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assignmentTitle || !currentFaculty?.facultyEmail) return;
    const response = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: assignmentTitle, subject: currentFaculty.subject, facultyEmail: currentFaculty.facultyEmail, questions: assignmentQuestions }),
    });
    if (!response.ok) {
      setLearningMessage('Assignment could not be created. Complete every question and option.');
      return;
    }
    const assignment = await response.json() as Assignment;
    setAssignmentList((prev) => [assignment, ...prev]);
    setAssignmentTitle('');
    setAssignmentQuestions([emptyQuestion()]);
    setLearningMessage('MCQ assignment published.');
  };

  const handleAssignmentSubmit = async (assignment: Assignment) => {
    if (!identity) return;
    const answerMap = studentAnswers[assignment.id] ?? {};
    const answers = assignment.questions.map((_, index) => answerMap[index] as number | undefined);
    if (answers.length !== assignment.questions.length || answers.some((answer) => answer === undefined)) return;
    const response = await fetch(`/api/assignments/${assignment.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentEmail: identity, answers: answers as number[] }),
    });
    if (!response.ok) return;
    const submission = await response.json() as Submission;
    setSubmissions((prev) => [...prev.filter((item) => item.assignmentId !== assignment.id), submission]);
  };

  if (role === 'student') {
    if (!currentStudent) {
      return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Student portal</p>
            <h1 className="mt-3 text-3xl font-bold text-white">No student account registered</h1>
            <p className="mt-3 text-slate-400">Ask your institution to register your student account before signing in.</p>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Student portal</p>
                <h1 className="mt-2 text-3xl font-bold text-white">{currentStudent.name}</h1>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                {currentStudent.course} • {currentStudent.rollNo}
              </div>
            </div>
          </header>

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-400">Your attendance</p>
                <h2 className="text-2xl font-bold text-white">Overall progress</h2>
              </div>
              <StatusPill value={currentStudent.percentage} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Current percentage</p>
                <p className="mt-2 text-3xl font-bold text-white">{formatPercent(currentStudent.percentage)}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Classes attended</p>
                <p className="mt-2 text-3xl font-bold text-white">{currentStudent.subjects.reduce((sum, s) => sum + s.present, 0)}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Total classes</p>
                <p className="mt-2 text-3xl font-bold text-white">{currentStudent.subjects.reduce((sum, s) => sum + s.total, 0)}</p>
              </div>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            {currentStudent.subjects.map((subject) => (
              <div key={subject.name} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-white">{subject.name}</p>
                  <span className="text-sm text-slate-300">{subject.present}/{subject.total}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(subject.percentage, 100)}%` }} />
                </div>
                <p className="mt-2 text-right text-sm font-medium text-white">{formatPercent(subject.percentage)}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Registered faculty</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Subjects available to you</h2>
            <div className="mt-5 space-y-3">
              {facultyList.length ? facultyList.map((faculty) => (
                <div key={faculty.facultyEmail ?? faculty.name} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div>
                    <p className="font-semibold text-white">{faculty.subject}</p>
                    <p className="text-sm text-slate-400">{faculty.name}</p>
                  </div>
                  <span className="text-sm text-emerald-300">Available</span>
                </div>
              )) : <p className="text-sm text-slate-400">No faculty subjects have been registered yet.</p>}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Learning resources</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Notes and assignments</h2>
            <div className="mt-5 space-y-4">
              {resourceList.length ? resourceList.map((resource) => (
                <a key={resource.id} href={resource.downloadUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-emerald-400/50">
                  <div>
                    <p className="font-semibold text-white">{resource.title}</p>
                    <p className="text-sm text-slate-400">{resource.subject} • {resource.fileName}</p>
                  </div>
                  <span className="text-sm text-emerald-300">Open PDF</span>
                </a>
              )) : <p className="text-sm text-slate-400">No notes have been uploaded yet.</p>}
            </div>
            <div className="mt-6 space-y-5">
              {assignmentList.length ? assignmentList.map((assignment) => {
                const submission = submissions.find((item) => item.assignmentId === assignment.id);
                return (
                  <div key={assignment.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{assignment.title}</p>
                        <p className="text-sm text-slate-400">{assignment.subject} • {assignment.questions.length} questions</p>
                      </div>
                      {submission ? <span className="text-sm font-semibold text-emerald-300">Score: {submission.score}/{submission.total}</span> : null}
                    </div>
                    {!submission ? <div className="mt-4 space-y-4">
                      {assignment.questions.map((question, questionIndex) => (
                        <fieldset key={questionIndex} className="rounded-xl border border-slate-800 p-3">
                          <legend className="px-1 text-sm font-medium text-white">{questionIndex + 1}. {question.prompt}</legend>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center gap-2 rounded-lg bg-slate-900 p-2 text-sm text-slate-300">
                                <input type="radio" name={`assignment-${assignment.id}-question-${questionIndex}`} checked={studentAnswers[assignment.id]?.[questionIndex] === optionIndex} onChange={() => setStudentAnswers((prev) => ({ ...prev, [assignment.id]: { ...prev[assignment.id], [questionIndex]: optionIndex } }))} />
                                {option}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      ))}
                      <button type="button" onClick={() => handleAssignmentSubmit(assignment)} className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950">Submit assignment</button>
                    </div> : <p className="mt-4 text-sm text-slate-400">This assignment has already been submitted.</p>}
                  </div>
                );
              }) : <p className="text-sm text-slate-400">No assignments have been published yet.</p>}
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (role === 'faculty') {
    if (!currentFaculty) {
      return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
          <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Faculty portal</p>
            <h1 className="mt-3 text-3xl font-bold text-white">No faculty account registered</h1>
            <p className="mt-3 text-slate-400">Ask your institution to register your faculty account before signing in.</p>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">Faculty portal</p>
                <h1 className="mt-2 text-3xl font-bold text-white">{currentFaculty.name}</h1>
              </div>
              <div className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                {currentFaculty.subject}
              </div>
            </div>
          </header>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Class attendance</p>
              <p className="mt-3 text-3xl font-bold text-white">{formatPercent(currentFaculty.percentage)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Students tracked</p>
              <p className="mt-3 text-3xl font-bold text-white">{currentFaculty.students}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Alert status</p>
              <div className="mt-3"><StatusPill value={currentFaculty.percentage} /></div>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Registered students</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Mark {currentFaculty.subject} attendance</h2>
            {attendanceMessage ? <p className="mt-3 text-sm text-emerald-300">{attendanceMessage}</p> : null}
            <label className="mt-5 block text-sm text-slate-300">
              Attendance date
              <input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className="mt-2 block rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-white" />
            </label>
            <div className="mt-5 space-y-3">
              {studentList.length ? studentList.map((student) => {
                const subject = student.subjects.find((item) => item.name.toLowerCase() === currentFaculty.subject.toLowerCase());
                const selectedStatus = attendanceDraft[student.rollNo];
                return (
                  <div key={student.rollNo} className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-white">{student.name}</p>
                      <p className="text-sm text-slate-400">{student.course} • {student.rollNo}</p>
                      <p className="mt-1 text-xs text-slate-500">{subject ? `${subject.present}/${subject.total} classes` : 'No classes marked yet'}</p>
                      {Object.prototype.hasOwnProperty.call(markedAttendance, student.rollNo) ? <p className="mt-1 text-xs font-semibold text-emerald-300">Already marked for {attendanceDate}</p> : null}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" disabled={Object.prototype.hasOwnProperty.call(markedAttendance, student.rollNo)} onClick={() => setAttendanceDraft((prev) => ({ ...prev, [student.rollNo]: true }))} className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${selectedStatus === true ? 'bg-emerald-400 text-slate-950' : 'border border-emerald-500/40 text-emerald-300'}`}>Present</button>
                      <button type="button" disabled={Object.prototype.hasOwnProperty.call(markedAttendance, student.rollNo)} onClick={() => setAttendanceDraft((prev) => ({ ...prev, [student.rollNo]: false }))} className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${selectedStatus === false ? 'bg-red-500 text-white' : 'border border-red-500/40 text-red-300'}`}>Absent</button>
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-slate-400">No students have been registered yet.</p>}
            </div>
            <button type="button" onClick={handleBatchAttendance} className="mt-5 w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white">Save attendance</button>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleResourceUpload} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Faculty resources</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Upload PDF notes</h2>
              <div className="mt-5 space-y-3">
                <input value={resourceTitle} onChange={(event) => setResourceTitle(event.target.value)} placeholder="Notes title" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
                <input type="file" accept="application/pdf" onChange={(event) => setResourceFile(event.target.files?.[0] ?? null)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300" />
                <button type="submit" className="w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white">Upload notes</button>
              </div>
            </form>

            <form onSubmit={handleAssignmentCreate} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Faculty assessment</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Create MCQ assignment</h2>
              <input value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} placeholder="Assignment title" className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
              <div className="mt-4 space-y-4">
                {assignmentQuestions.map((question, questionIndex) => (
                  <div key={questionIndex} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                    <input value={question.prompt} onChange={(event) => setAssignmentQuestions((prev) => prev.map((item, index) => index === questionIndex ? { ...item, prompt: event.target.value } : item))} placeholder={`Question ${questionIndex + 1}`} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder:text-slate-500" />
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <input key={optionIndex} value={option} onChange={(event) => setAssignmentQuestions((prev) => prev.map((item, index) => index === questionIndex ? { ...item, options: item.options.map((value, option) => option === optionIndex ? event.target.value : value) } : item))} placeholder={`Option ${optionIndex + 1}`} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
                      ))}
                    </div>
                    <label className="mt-2 block text-sm text-slate-300">Correct option
                      <select value={question.answer} onChange={(event) => setAssignmentQuestions((prev) => prev.map((item, index) => index === questionIndex ? { ...item, answer: Number(event.target.value) } : item))} className="ml-2 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-white">
                        {question.options.map((_, optionIndex) => <option key={optionIndex} value={optionIndex}>Option {optionIndex + 1}</option>)}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setAssignmentQuestions((prev) => [...prev, emptyQuestion()])} className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-slate-200">Add question</button>
                <button type="submit" className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950">Publish assignment</button>
              </div>
            </form>
          </section>

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Student submissions</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Quiz results & assignment attempts</h2>
            <div className="mt-5 space-y-3">
              {facultySubmissions.length ? (
                facultySubmissions.map((sub) => (
                  <div key={sub.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{sub.studentName}</span>
                        <span className="text-xs text-slate-400">({sub.rollNo})</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{sub.assignmentTitle} • {sub.subject}</p>
                      <p className="mt-0.5 text-xs text-slate-500">Submitted: {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">Attempted</span>
                      <div className="rounded-xl bg-slate-900 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-400">Score</p>
                        <p className="text-lg font-bold text-emerald-400">{sub.score} / {sub.total}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No student submissions have been recorded yet for your assignments.</p>
              )}
            </div>
          </section>

          {learningMessage ? <p className="mt-4 text-sm text-emerald-300">{learningMessage}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                BVC Engineering College
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Smart Attend
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                Monthly Summary
              </button>
              <button type="button" onClick={handleExportReport} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                Export Report
              </button>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Registered students', value: studentList.length },
            { label: 'Registered faculty', value: facultyList.length },
            { label: 'Subjects available', value: new Set(facultyList.map((faculty) => faculty.subject)).size },
            { label: 'Students needing attention', value: studentList.filter((student) => student.percentage < 75).length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <div className="mt-4 flex items-end justify-between">
                <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
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
              {studentList.map((student) => (
                <div key={`${student.name}-${student.rollNo}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
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
                        <div className="flex gap-2">
                          <button type="button" onClick={() => beginStudentEdit(student)} className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-200">Edit</button>
                          <button type="button" onClick={() => handleDeleteStudent(student.rollNo)} className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300">Delete</button>
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
                      <div key={`${student.rollNo}-${subject.name}`} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
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
                {facultyList.map((item) => (
                  <div key={`${item.name}-${item.subject}`} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.subject}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => beginFacultyEdit(item)} className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-200">Edit</button>
                        <button type="button" onClick={() => item.facultyEmail && handleDeleteFaculty(item.facultyEmail)} className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300">Delete</button>
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

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleStudentSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
            <div className="mb-5">
              <p className="text-sm text-slate-400">Institutional actions</p>
              <h2 className="text-2xl font-bold text-white">{editingStudentRollNo ? 'Edit student' : 'Register student'}</h2>
            </div>

            <div className="space-y-4">
              <input
                value={studentForm.name}
                onChange={(event) => setStudentForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Student name"
              />
              <input
                value={studentForm.rollNo}
                onChange={(event) => setStudentForm((prev) => ({ ...prev, rollNo: event.target.value }))}
                disabled={Boolean(editingStudentRollNo)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Roll number"
              />
              <input
                value={studentForm.course}
                onChange={(event) => setStudentForm((prev) => ({ ...prev, course: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Course"
              />
              <input
                type="email"
                value={studentForm.email}
                onChange={(event) => setStudentForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Student email"
              />
              <input
                type="email"
                value={studentForm.parentEmail}
                onChange={(event) => setStudentForm((prev) => ({ ...prev, parentEmail: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Parent email"
              />
              <input
                type="password"
                value={studentForm.password}
                onChange={(event) => setStudentForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Student password"
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950">
                  {editingStudentRollNo ? 'Save student' : 'Add student'}
                </button>
                {editingStudentRollNo ? <button type="button" onClick={() => { setEditingStudentRollNo(null); setStudentForm({ name: '', rollNo: '', course: '', email: '', parentEmail: '', password: '' }); }} className="rounded-xl border border-slate-700 px-4 py-3 text-slate-200">Cancel</button> : null}
              </div>
            </div>
          </form>

          <form onSubmit={handleFacultySubmit} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
            <div className="mb-5">
              <p className="text-sm text-slate-400">Institutional actions</p>
              <h2 className="text-2xl font-bold text-white">{editingFacultyEmail ? 'Edit faculty' : 'Register faculty'}</h2>
            </div>

            <div className="space-y-4">
              <input
                value={facultyForm.name}
                onChange={(event) => setFacultyForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Faculty name"
              />
              <input
                value={facultyForm.subject}
                onChange={(event) => setFacultyForm((prev) => ({ ...prev, subject: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Subject"
              />
              <input
                type="email"
                value={facultyForm.facultyEmail}
                onChange={(event) => setFacultyForm((prev) => ({ ...prev, facultyEmail: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Faculty email"
              />
              <input
                type="password"
                value={facultyForm.password}
                onChange={(event) => setFacultyForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Faculty password"
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white">
                  {editingFacultyEmail ? 'Save faculty' : 'Add faculty'}
                </button>
                {editingFacultyEmail ? <button type="button" onClick={() => { setEditingFacultyEmail(null); setFacultyForm({ name: '', subject: '', facultyEmail: '', password: '' }); }} className="rounded-xl border border-slate-700 px-4 py-3 text-slate-200">Cancel</button> : null}
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 flex items-center justify-center">
          <div className="text-slate-400">Loading Smart Attend...</div>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
