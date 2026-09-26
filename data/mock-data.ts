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

export type InstitutionStat = {
  label: string;
  value: string;
  change: string;
};

export const institutionDepartments = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
];

export const institutionStats: InstitutionStat[] = [
  { label: 'Total students', value: '8,420', change: '+5.2%' },
  { label: 'Present today', value: '7,166', change: '+4.7%' },
  { label: 'Faculty online', value: '128', change: '+2.1%' },
  { label: 'Low attendance', value: '84', change: '-1.3%' },
];

export const studentAttendance: StudentRecord[] = [
  {
    name: 'Aarav Nair',
    rollNo: 'CS-201',
    course: 'B.Tech CSE',
    percentage: 82.4,
    parentEmail: 'parent.arav@example.edu',
    subjects: [
      { name: 'Maths', present: 30, total: 34, percentage: 88.2 },
      { name: 'DBMS', present: 28, total: 32, percentage: 87.5 },
      { name: 'OS', present: 25, total: 30, percentage: 83.3 },
    ],
  },
  {
    name: 'Priya Sharma',
    rollNo: 'CS-208',
    course: 'B.Tech CSE',
    percentage: 58.6,
    parentEmail: 'parent.priya@example.edu',
    subjects: [
      { name: 'Maths', present: 17, total: 32, percentage: 53.1 },
      { name: 'DBMS', present: 20, total: 30, percentage: 66.7 },
      { name: 'OS', present: 15, total: 28, percentage: 53.6 },
    ],
  },
  {
    name: 'Rohan Verma',
    rollNo: 'CS-214',
    course: 'B.Tech CSE',
    percentage: 71.2,
    parentEmail: 'parent.rohan@example.edu',
    subjects: [
      { name: 'Maths', present: 22, total: 30, percentage: 73.3 },
      { name: 'DBMS', present: 22, total: 32, percentage: 68.8 },
      { name: 'OS', present: 24, total: 30, percentage: 80 },
    ],
  },
];

export const facultySummary: FacultyRecord[] = [
  { name: 'Dr. Meera Iyer', subject: 'Mathematics', percentage: 74.8, students: 64, facultyEmail: 'meera.iyer@college.edu' },
  { name: 'Prof. Rahul Sen', subject: 'Operating Systems', percentage: 60.3, students: 52, facultyEmail: 'rahul.sen@college.edu' },
  { name: 'Dr. Sneha Nair', subject: 'Database Systems', percentage: 56.1, students: 48, facultyEmail: 'sneha.nair@college.edu' },
];
