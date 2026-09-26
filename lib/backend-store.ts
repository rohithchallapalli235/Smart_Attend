import bcrypt from 'bcryptjs';
import { unlink } from 'fs/promises';
import type { FacultyRecord, StudentRecord } from '@/data/mock-data';
import { prisma } from '@/lib/prisma';

export function parseSubjects(raw: string): StudentRecord['subjects'] {
  let parsed: unknown = [];
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const rawList: Array<{ name: string; present: number; total: number; percentage: number }> = [];

  for (const item of parsed) {
    if (typeof item === 'object' && item !== null && 'name' in item && 'present' in item && 'total' in item) {
      const subject = item as { name: string; present: number; total: number; percentage?: number };
      const present = Number(subject.present) || 0;
      const total = Number(subject.total) || 0;
      rawList.push({
        name: String(subject.name).trim(),
        present,
        total,
        percentage: total ? (present / total) * 100 : 0,
      });
    } else if (typeof item === 'string') {
      const legacy = item.match(/name=([^;]+); present=(\d+); total=(\d+)/);
      if (legacy) {
        const present = Number(legacy[2]);
        const total = Number(legacy[3]);
        rawList.push({ name: legacy[1].trim(), present, total, percentage: total ? (present / total) * 100 : 0 });
      }
    }
  }

  const map = new Map<string, { name: string; present: number; total: number; percentage: number }>();
  for (const sub of rawList) {
    const key = sub.name.toLowerCase();
    const existing = map.get(key);
    if (!existing || sub.total >= existing.total) {
      map.set(key, sub);
    }
  }

  return Array.from(map.values());
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

async function seedInitialDataIfNeeded() {
  const studentCount = await prisma.student.count();
  const facultyCount = await prisma.faculty.count();

  if (studentCount === 0 && facultyCount === 0) {
    const defaultPasswordHash = await bcrypt.hash('123456', 10);

    await prisma.faculty.createMany({
      data: [
        {
          name: 'Dr. Meera Iyer',
          subject: 'DWDM',
          facultyEmail: 'meera.iyer@college.edu',
          passwordHash: defaultPasswordHash,
          percentage: 85.0,
          students: 3,
        },
        {
          name: 'Prof. Rahul Sen',
          subject: 'Operating Systems',
          facultyEmail: 'rahul.sen@college.edu',
          passwordHash: defaultPasswordHash,
          percentage: 78.0,
          students: 3,
        },
      ],
    });

    await prisma.student.createMany({
      data: [
        {
          name: 'Aarav Nair',
          rollNo: 'CS-201',
          course: 'B.Tech CSE',
          email: 'aarav@college.edu',
          parentEmail: 'parent.aarav@gmail.com',
          passwordHash: defaultPasswordHash,
          percentage: 82.4,
          subjects: JSON.stringify([
            { name: 'DWDM', present: 10, total: 12, percentage: 83.3 },
            { name: 'Operating Systems', present: 9, total: 11, percentage: 81.8 },
          ]),
        },
        {
          name: 'Priya Sharma',
          rollNo: 'CS-208',
          course: 'B.Tech CSE',
          email: 'priya@college.edu',
          parentEmail: 'parent.priya@gmail.com',
          passwordHash: defaultPasswordHash,
          percentage: 65.0,
          subjects: JSON.stringify([
            { name: 'DWDM', present: 7, total: 12, percentage: 58.3 },
            { name: 'Operating Systems', present: 8, total: 11, percentage: 72.7 },
          ]),
        },
      ],
    });
  }
}

export async function getStudents(): Promise<StudentRecord[]> {
  await seedInitialDataIfNeeded();
  const students = await prisma.student.findMany({ orderBy: { createdAt: 'desc' } });
  return students.map(toStudentRecord);
}

export async function getFaculty(): Promise<FacultyRecord[]> {
  await seedInitialDataIfNeeded();
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

  const existingRecord = await prisma.attendance.findUnique({
    where: { studentId_subject_date: { studentId: student.id, subject: normalizedSubject, date } },
  });

  await prisma.attendance.upsert({
    where: { studentId_subject_date: { studentId: student.id, subject: normalizedSubject, date } },
    update: { present },
    create: { studentId: student.id, subject: normalizedSubject, date, present },
  });

  const existingSubjects = parseSubjects(student.subjects);
  const subjectMap = new Map<string, { name: string; present: number; total: number; percentage: number }>();

  for (const s of existingSubjects) {
    subjectMap.set(s.name.toLowerCase(), { name: s.name, present: s.present, total: s.total, percentage: s.percentage });
  }

  const current = subjectMap.get(normalizedSubject.toLowerCase()) ?? { name: normalizedSubject, present: 0, total: 0, percentage: 0 };

  if (existingRecord) {
    if (existingRecord.present !== present) {
      if (present) {
        current.present += 1;
      } else {
        current.present = Math.max(0, current.present - 1);
      }
    }
  } else {
    current.total += 1;
    if (present) {
      current.present += 1;
    }
  }

  current.percentage = current.total > 0 ? (current.present / current.total) * 100 : 0;
  subjectMap.set(normalizedSubject.toLowerCase(), current);

  const finalSubjects = Array.from(subjectMap.values());
  const totalPresent = finalSubjects.reduce((sum, item) => sum + item.present, 0);
  const totalClasses = finalSubjects.reduce((sum, item) => sum + item.total, 0);
  const overallPercentage = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;

  const updated = await prisma.student.update({
    where: { rollNo },
    data: {
      subjects: JSON.stringify(finalSubjects),
      percentage: overallPercentage,
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
