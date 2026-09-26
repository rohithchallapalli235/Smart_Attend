import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export type AssignmentQuestion = {
  prompt: string;
  options: string[];
  answer: number;
};

import fs from 'fs';

const baseDataDir = fs.existsSync('/var/data') ? '/var/data' : path.join(process.cwd(), 'data');
const resourceDirectory = path.join(baseDataDir, 'uploads', 'resources');

function parseQuestions(raw: string): AssignmentQuestion[] {
  return JSON.parse(raw) as AssignmentQuestion[];
}

export async function getResources() {
  const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });
  return resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    subject: resource.subject,
    facultyEmail: resource.facultyEmail,
    fileName: resource.fileName,
    createdAt: resource.createdAt,
    downloadUrl: `/api/resources/${resource.id}`,
  }));
}

export async function createResource({ title, subject, facultyEmail, fileName, file }: { title: string; subject: string; facultyEmail: string; fileName: string; file: Buffer }) {
  await mkdir(resourceDirectory, { recursive: true });
  const storedName = `${randomUUID()}.pdf`;
  const filePath = path.join(resourceDirectory, storedName);
  await writeFile(filePath, file);
  const resource = await prisma.resource.create({ data: { title, subject, facultyEmail, fileName, filePath } });
  return { ...resource, downloadUrl: `/api/resources/${resource.id}` };
}

export async function getResourceFile(id: number) {
  return prisma.resource.findUnique({ where: { id } });
}

export async function getAssignments() {
  const assignments = await prisma.assignment.findMany({ orderBy: { createdAt: 'desc' } });
  return assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    subject: assignment.subject,
    facultyEmail: assignment.facultyEmail,
    questions: parseQuestions(assignment.questions),
    createdAt: assignment.createdAt,
  }));
}

export async function createAssignment({ title, subject, facultyEmail, questions }: { title: string; subject: string; facultyEmail: string; questions: AssignmentQuestion[] }) {
  const assignment = await prisma.assignment.create({ data: { title, subject, facultyEmail, questions: JSON.stringify(questions) } });
  return { id: assignment.id, title: assignment.title, subject: assignment.subject, facultyEmail: assignment.facultyEmail, questions, createdAt: assignment.createdAt };
}

export async function getStudentSubmissions(studentEmail: string) {
  return prisma.assignmentSubmission.findMany({ where: { studentEmail: studentEmail.trim().toLowerCase() } });
}

export async function submitAssignment({ assignmentId, studentEmail, answers }: { assignmentId: number; studentEmail: string; answers: number[] }) {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw new Error('Assignment not found.');

  const questions = parseQuestions(assignment.questions);
  const score = questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentEmail: { assignmentId, studentEmail: studentEmail.trim().toLowerCase() } },
    update: { answers: JSON.stringify(answers), score, total: questions.length, submittedAt: new Date() },
    create: { assignmentId, studentEmail: studentEmail.trim().toLowerCase(), answers: JSON.stringify(answers), score, total: questions.length },
  });

  return { id: submission.id, assignmentId, score, total: questions.length, submittedAt: submission.submittedAt };
}
