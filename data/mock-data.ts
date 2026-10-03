export type StudentRecord = {
  name: string;
  rollNo: string;
  course: string;
  email?: string;
  percentage: number;
  parentEmail?: string;
  subjects: Array<{
    name: string;
    present: number;
    total: number;
    percentage: number;
  }>;
};

export type FacultyRecord = {
  name: string;
  subject: string;
  percentage: number;
  students: number;
  facultyEmail?: string;
};

export const institutionDepartments = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
];
