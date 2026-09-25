import bcrypt from 'bcryptjs';
import { unlink } from 'fs/promises';
import type { FacultyRecord, StudentRecord } from '@/data/mock-data';
import { prisma } from '@/lib/prisma';

export function parseSubjects(raw: string): StudentRecord['subjects'] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item) => {
    if (typeof item === 'object' && item !== null && 'name' in item && 'present' in item && 'total' in item) {
      const subject = item as { name: string; present: number; total: number; percentage?: number };
      return [{ name: subject.name, present: subject.present, total: subject.total, percentage: subject.percentage ?? (subject.total ? (subject.present / subject.total) * 100 : 0) }];
    }

    if (typeof item === 'string') {
      const legacy = item.match(/name=([^;]+); present=(\d+); total=(\d+)/);
      if (legacy) {
        const present = Number(legacy[2]);
        const total = Number(legacy[3]);
        return [{ name: legacy[1], present, total, percentage: total ? (present / total) * 100 : 0 }];
      }
    }

    return [];
  });
}

function toStudentRecord(student: { name: string; rollNo: string; course: string; email: string; parentEmail: string; percentage: number; subjects: string }): StudentRecord {
  return {
    name: student.name,
    rollNo: student.rollNo,
    course: student.course,
    email: student.email,
    parentEmail: student.parentEmail,
    percentage: student.percentage,
    subjects: parseSubjects(student.subjects),
  };
}

function toFacultyRecord(faculty: { name: string; subject: string; facultyEmail: string; percentage: number; students: number }): FacultyRecord {
  return {
    name: faculty.name,
    subject: faculty.subject,
    facultyEmail: faculty.facultyEmail,
    percentage: faculty.percentage,
    students: faculty.students,
  };
}

export async function getStudents(): Promise<StudentRecord[]> {
  const students = await prisma.student.findMany({ orderBy: { createdAt: 'desc' } });
  return students.map(toStudentRecord);
}

export async function getFaculty(): Promise<FacultyRecord[]> {
  const faculty = await prisma.faculty.findMany({ orderBy: { createdAt: 'desc' } });
  const students = await prisma.student.findMany();

  return faculty.map((member) => {
    let present = 0;
    let total = 0;

    for (const student of students) {
      const subject = parseSubjects(student.subjects).find((item) => item.name.toLowerCase() === member.subject.toLowerCase());
      if (subject) {
        present += subject.present;
        total += subject.total;
      }
    }

    return toFacultyRecord({
      ...member,
      percentage: total ? (present / total) * 100 : 0,
      students: students.length,
    });
  });
}

export async function createStudent(student: { name: string; rollNo: string; course: string; parentEmail: string; email: string; password: string }) {
  const record = await prisma.student.create({
    data: {
      name: student.name,
      rollNo: student.rollNo,
      course: student.course,
      email: student.email.trim().toLowerCase(),
      parentEmail: student.parentEmail.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(student.password, 12),
      subjects: JSON.stringify([]),
    },
  });
  return toStudentRecord(record);
}

export async function createFaculty(student: { name: string; subject: string; facultyEmail: string; password: string }) {
  const record = await prisma.faculty.create({
    data: {
      name: student.name,
      subject: student.subject,
      facultyEmail: student.facultyEmail.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(student.password, 12),
    },
  });
  return toFacultyRecord(record);
}

export async function updateStudent(rollNo: string, student: { name: string; course: string; email: string; parentEmail: string; password?: string }) {
  const updated = await prisma.student.update({
    where: { rollNo },
    data: {
      name: student.name,
      course: student.course,
      email: student.email.trim().toLowerCase(),
      parentEmail: student.parentEmail.trim().toLowerCase(),
      ...(student.password ? { passwordHash: await bcrypt.hash(student.password, 12) } : {}),
    },
  });
  return toStudentRecord(updated);
}

export async function deleteStudent(rollNo: string) {
  await prisma.student.delete({ where: { rollNo } });
}

export async function updateFaculty(facultyEmail: string, faculty: { name: string; subject: string; facultyEmail: string; password?: string }) {
  const updated = await prisma.faculty.update({
    where: { facultyEmail },
    data: {
      name: faculty.name,
      subject: faculty.subject,
      facultyEmail: faculty.facultyEmail.trim().toLowerCase(),
      ...(faculty.password ? { passwordHash: await bcrypt.hash(faculty.password, 12) } : {}),
    },
  });
  return toFacultyRecord(updated);
}

export async function deleteFaculty(facultyEmail: string) {
  const faculty = await prisma.faculty.findUnique({ where: { facultyEmail } });
  if (!faculty) throw new Error('Faculty not found.');
  const resources = await prisma.resource.findMany({ where: { facultyEmail }, select: { filePath: true } });

  await prisma.$transaction(async (transaction) => {
    await transaction.attendance.deleteMany({ where: { subject: faculty.subject } });
    await transaction.assignment.deleteMany({ where: { facultyEmail } });
    await transaction.resource.deleteMany({ where: { facultyEmail } });
    await transaction.faculty.delete({ where: { facultyEmail } });

    const students = await transaction.student.findMany();
    for (const student of students) {
      const subjects = parseSubjects(student.subjects).filter((subject) => subject.name.toLowerCase() !== faculty.subject.toLowerCase());
      const totalPresent = subjects.reduce((sum, subject) => sum + subject.present, 0);
      const totalClasses = subjects.reduce((sum, subject) => sum + subject.total, 0);
      await transaction.student.update({
        where: { id: student.id },
        data: { subjects: JSON.stringify(subjects), percentage: totalClasses ? (totalPresent / totalClasses) * 100 : 0 },
      });
    }
  });

  await Promise.all(resources.map((resource) => unlink(resource.filePath).catch(() => undefined)));
}

export async function verifyLogin({ role, email, password }: { role: string; email: string; password: string }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (role === 'institution') {
    return normalizedEmail === (process.env.INSTITUTION_EMAIL ?? 'admin@smartattend.edu').toLowerCase()
      && password === (process.env.INSTITUTION_PASSWORD ?? 'admin123');
  }

  if (role === 'faculty') {
    const faculty = await prisma.faculty.findUnique({ where: { facultyEmail: normalizedEmail } });
    return faculty ? bcrypt.compare(password, faculty.passwordHash) : false;
  }

  if (role === 'student') {
    const student = await prisma.student.findUnique({ where: { email: normalizedEmail } });
    return student ? bcrypt.compare(password, student.passwordHash) : false;
  }

  return false;
}

export async function markAttendance({ rollNo, subject, present, date }: { rollNo: string; subject: string; present: boolean; date: string }) {
  const student = await prisma.student.findUnique({ where: { rollNo } });

  if (!student) {
    throw new Error('Student not found.');
  }

  const normalizedSubject = subject.trim();
  await prisma.attendance.upsert({
    where: { studentId_subject_date: { studentId: student.id, subject: normalizedSubject, date } },
    update: { present },
    create: { studentId: student.id, subject: normalizedSubject, date, present },
  });

  const dailyRecords = await prisma.attendance.findMany({ where: { studentId: student.id } });
  const subjects = parseSubjects(student.subjects);
  const legacySubjects = new Map(subjects.map((item) => [item.name.toLowerCase(), item]));
  const dailySubjects = new Map<string, { name: string; present: number; total: number; percentage: number }>();

  for (const record of dailyRecords) {
    const current = dailySubjects.get(record.subject.toLowerCase()) ?? { name: record.subject, present: legacySubjects.get(record.subject.toLowerCase())?.present ?? 0, total: legacySubjects.get(record.subject.toLowerCase())?.total ?? 0, percentage: 0 };
    current.total += 1;
    if (record.present) current.present += 1;
    current.percentage = (current.present / current.total) * 100;
    dailySubjects.set(record.subject.toLowerCase(), current);
  }

  subjects.push(...dailySubjects.values());

  const totalPresent = subjects.reduce((sum, item) => sum + item.present, 0);
  const totalClasses = subjects.reduce((sum, item) => sum + item.total, 0);
  const updated = await prisma.student.update({
    where: { rollNo },
    data: {
      subjects: JSON.stringify(subjects),
      percentage: totalClasses ? (totalPresent / totalClasses) * 100 : 0,
    },
  });

  return toStudentRecord(updated);
}

export async function markAttendanceBatch(records: Array<{ rollNo: string; present: boolean }>, subject: string, date: string) {
  const updatedStudents: StudentRecord[] = [];

  for (const record of records) {
    updatedStudents.push(await markAttendance({ ...record, subject, date }));
  }

  return updatedStudents;
}

export async function getAttendanceForDate(date: string, subject: string) {
  const records = await prisma.attendance.findMany({
    where: { date, subject },
    include: { student: { select: { rollNo: true } } },
  });

  return records.map((record) => ({ rollNo: record.student.rollNo, present: record.present }));
}
