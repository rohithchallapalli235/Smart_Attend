export type StudentRecord = {
  id: number;
  name: string;
  rollNo: string;
  course: string;
  parentEmail: string;
  facultyEmail: string;
  percentage: number;
  subjects: Array<{
    name: string;
    present: number;
    total: number;
    percentage: number;
  }>;
};

export type FacultyRecord = {
  id: number;
  name: string;
  subject: string;
  email: string;
  percentage: number;
  students: number;
};

export type InstitutionStat = {
  label: string;
  value: string;
  change: string;
};

export const institutionStats: InstitutionStat[] = [
  { label: 'Total students', value: '8,420', change: '+5.2%' },
  { label: 'Present today', value: '7,166', change: '+4.7%' },
  { label: 'Faculty online', value: '128', change: '+2.1%' },
  { label: 'Low attendance', value: '84', change: '-1.3%' },
];

export const studentAttendance: StudentRecord[] = [
  {
    id: 1,
    name: 'Aarav Nair',
    rollNo: 'CS-201',
    course: 'B.Tech CSE',
    parentEmail: 'parent1@example.com',
    facultyEmail: 'faculty.math@example.com',
    percentage: 82.4,
    subjects: [
      { name: 'Maths', present: 30, total: 34, percentage: 88.2 },
      { name: 'DBMS', present: 28, total: 32, percentage: 87.5 },
      { name: 'OS', present: 25, total: 30, percentage: 83.3 },
    ],
  },
  {
    id: 2,
    name: 'Priya Sharma',
    rollNo: 'CS-208',
    course: 'B.Tech CSE',
    parentEmail: 'parent2@example.com',
    facultyEmail: 'faculty.os@example.com',
    percentage: 58.6,
    subjects: [
      { name: 'Maths', present: 17, total: 32, percentage: 53.1 },
      { name: 'DBMS', present: 20, total: 30, percentage: 66.7 },
      { name: 'OS', present: 15, total: 28, percentage: 53.6 },
    ],
  },
  {
    id: 3,
    name: 'Rohan Verma',
    rollNo: 'CS-214',
    course: 'B.Tech CSE',
    parentEmail: 'parent3@example.com',
    facultyEmail: 'faculty.dbms@example.com',
    percentage: 71.2,
    subjects: [
      { name: 'Maths', present: 22, total: 30, percentage: 73.3 },
      { name: 'DBMS', present: 22, total: 32, percentage: 68.8 },
      { name: 'OS', present: 24, total: 30, percentage: 80 },
    ],
  },
];

export const facultySummary: FacultyRecord[] = [
  { id: 1, name: 'Dr. Meera Iyer', subject: 'Mathematics', email: 'faculty.math@example.com', percentage: 74.8, students: 64 },
  { id: 2, name: 'Prof. Rahul Sen', subject: 'Operating Systems', email: 'faculty.os@example.com', percentage: 60.3, students: 52 },
  { id: 3, name: 'Dr. Sneha Nair', subject: 'Database Systems', email: 'faculty.dbms@example.com', percentage: 56.1, students: 48 },
];

export const institutionDepartments = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Business Administration',
];
