import * as XLSX from 'xlsx';
import type { ResultRecord, StudentStatus } from '../types';

export type RawRow = Record<string, unknown>;
export type MappingKey = 'studentId' | 'studentName' | 'department' | 'subject' | 'grade' | 'section' | 'teacher' | 'score' | 'maxScore' | 'status' | 'examName' | 'academicYear' | 'semester';
export type ColumnMapping = Partial<Record<MappingKey, string>>;

export async function readWorkbook(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  return {
    workbook,
    sheetNames: workbook.SheetNames,
  };
}

export function sheetToRows(workbook: XLSX.WorkBook, sheetName: string): RawRow[] {
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' });
}

const statusValues: StudentStatus[] = ['حاضر', 'غائب', 'لم يؤد الاختبار', 'محروم', 'بعذر'];

export function normalizeStatus(value: unknown): StudentStatus {
  const text = String(value ?? '').trim();
  if (statusValues.includes(text as StudentStatus)) return text as StudentStatus;
  if (!text) return 'حاضر';
  if (/غائب|absent/i.test(text)) return 'غائب';
  if (/محروم/i.test(text)) return 'محروم';
  if (/عذر/i.test(text)) return 'بعذر';
  return 'حاضر';
}

export interface ImportDefaults {
  department: string;
  subject: string;
  grade: string;
  section: string;
  teacher: string;
  examName: string;
  academicYear: string;
  semester: string;
  maxScore: number;
}

export function convertRows(rows: RawRow[], mapping: ColumnMapping, defaults: ImportDefaults, batchId: string) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const output: ResultRecord[] = [];
  rows.forEach((row, index) => {
    const get = (key: MappingKey) => mapping[key] ? row[mapping[key] as string] : undefined;
    const studentName = String(get('studentName') ?? '').trim();
    if (!studentName) {
      errors.push(`الصف ${index + 2}: اسم الطالب فارغ.`);
      return;
    }
    const rawScore = get('score');
    const status = normalizeStatus(get('status'));
    const maxScoreValue = Number(get('maxScore') || defaults.maxScore);
    if (!Number.isFinite(maxScoreValue) || maxScoreValue <= 0) {
      errors.push(`الصف ${index + 2}: الدرجة الكلية غير صحيحة.`);
      return;
    }
    let score: number | null = rawScore === '' || rawScore === undefined ? null : Number(rawScore);
    if (status === 'حاضر' && (score === null || !Number.isFinite(score))) {
      errors.push(`الصف ${index + 2}: درجة الطالب غير رقمية أو مفقودة.`);
      return;
    }
    if (score !== null && (score < 0 || score > maxScoreValue)) {
      errors.push(`الصف ${index + 2}: الدرجة ${score} خارج النطاق 0–${maxScoreValue}.`);
      return;
    }
    if (status !== 'حاضر' && score !== null) warnings.push(`الصف ${index + 2}: الطالب حالته «${status}» وله درجة مسجلة.`);
    output.push({
      id: crypto.randomUUID(),
      studentId: String(get('studentId') || `${Date.now()}-${index}`),
      studentName,
      department: String(get('department') || defaults.department),
      subject: String(get('subject') || defaults.subject),
      grade: String(get('grade') || defaults.grade),
      section: String(get('section') || defaults.section),
      teacher: String(get('teacher') || defaults.teacher),
      examName: String(get('examName') || defaults.examName),
      academicYear: String(get('academicYear') || defaults.academicYear),
      semester: String(get('semester') || defaults.semester),
      score: status === 'حاضر' ? score : null,
      maxScore: maxScoreValue,
      status,
      importBatchId: batchId,
      createdAt: new Date().toISOString(),
    });
  });
  return { records: output, errors, warnings };
}
