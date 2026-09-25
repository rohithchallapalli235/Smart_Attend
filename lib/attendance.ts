export type AttendanceStatus = {
  label: string;
  tone: 'green' | 'blue' | 'red';
};

export function getAttendanceStatus(percentage: number): AttendanceStatus {
  if (percentage >= 75) {
    return { label: 'Safe', tone: 'green' };
  }

  if (percentage >= 60) {
    return { label: 'Alert', tone: 'blue' };
  }

  return { label: 'Warning', tone: 'red' };
}
