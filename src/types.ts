export type StudentStatus = 'حاضر' | 'غائب' | 'لم يؤد الاختبار' | 'محروم' | 'بعذر';

export interface PerformanceLevel {
  id: string;
  name: string;
  min: number;
  max: number;
  color: string;
  order: number;
}

export interface AppSettings {
  schoolName: string;
  academicYear: string;
  semester: string;
  passMark: number;
  levels: PerformanceLevel[];
}

export interface ResultRecord {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  subject: string;
  grade: string;
  section: string;
  teacher: string;
  examName: string;
  academicYear: string;
  semester: string;
  score: number | null;
  maxScore: number;
  status: StudentStatus;
  importBatchId: string;
  createdAt: string;
}

export interface ImportBatch {
  id: string;
  fileName: string;
  createdAt: string;
  rowCount: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
}

export interface CalculatedResult extends ResultRecord {
  percentage: number | null;
  passed: boolean | null;
  level: PerformanceLevel | null;
}

export interface DashboardStats {
  totalStudents: number;
  present: number;
  absent: number;
  passed: number;
  failed: number;
  passRate: number;
  attainment: number;
  levelCounts: Record<string, number>;
}
