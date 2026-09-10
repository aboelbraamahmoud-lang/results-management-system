import type { AppSettings, CalculatedResult, PerformanceLevel, ResultRecord } from '../types';

export const defaultLevels: PerformanceLevel[] = [
  { id: 'excellent', name: 'ممتاز', min: 90, max: 100, color: '#15803d', order: 1 },
  { id: 'very-good', name: 'جيد جدًا', min: 80, max: 89.999, color: '#0f766e', order: 2 },
  { id: 'good', name: 'جيد', min: 70, max: 79.999, color: '#2563eb', order: 3 },
  { id: 'acceptable', name: 'مقبول', min: 60, max: 69.999, color: '#ca8a04', order: 4 },
  { id: 'weak', name: 'ضعيف', min: 50, max: 59.999, color: '#ea580c', order: 5 },
  { id: 'very-weak', name: 'ضعيف جدًا', min: 0, max: 49.999, color: '#dc2626', order: 6 },
];

export const defaultSettings: AppSettings = {
  schoolName: 'مدرستي',
  academicYear: '2026-2027',
  semester: 'الفصل الدراسي الأول',
  passMark: 50,
  levels: defaultLevels,
};

export function percentage(score: number | null, maxScore: number, status: ResultRecord['status']): number | null {
  if (status !== 'حاضر' || score === null || !Number.isFinite(score) || maxScore <= 0) return null;
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

export function resolveLevel(pct: number | null, levels: PerformanceLevel[]): PerformanceLevel | null {
  if (pct === null) return null;
  const ordered = [...levels].sort((a, b) => a.order - b.order);
  return ordered.find((level) => pct >= level.min && pct <= level.max) ?? null;
}

export function calculateRecord(record: ResultRecord, settings: AppSettings): CalculatedResult {
  const pct = percentage(record.score, record.maxScore, record.status);
  return {
    ...record,
    percentage: pct,
    passed: pct === null ? null : pct >= settings.passMark,
    level: resolveLevel(pct, settings.levels),
  };
}

export function aggregate(records: ResultRecord[], settings: AppSettings) {
  const calculated = records.map((r) => calculateRecord(r, settings));
  const uniqueStudents = new Set(records.map((r) => r.studentId || r.studentName));
  const presentRecords = calculated.filter((r) => r.percentage !== null);
  const absent = calculated.filter((r) => r.status !== 'حاضر').length;
  const passed = presentRecords.filter((r) => r.passed).length;
  const failed = presentRecords.filter((r) => r.passed === false).length;
  const attainment = presentRecords.length
    ? presentRecords.reduce((sum, r) => sum + (r.percentage ?? 0), 0) / presentRecords.length
    : 0;
  const levelCounts: Record<string, number> = {};
  settings.levels.forEach((l) => (levelCounts[l.name] = 0));
  presentRecords.forEach((r) => {
    if (r.level) levelCounts[r.level.name] = (levelCounts[r.level.name] ?? 0) + 1;
  });
  return {
    calculated,
    stats: {
      totalStudents: uniqueStudents.size,
      present: presentRecords.length,
      absent,
      passed,
      failed,
      passRate: presentRecords.length ? (passed / presentRecords.length) * 100 : 0,
      attainment,
      levelCounts,
    },
  };
}

export function validateLevels(levels: PerformanceLevel[]): string[] {
  const errors: string[] = [];
  const sorted = [...levels].sort((a, b) => a.min - b.min);
  if (!sorted.length) return ['يجب وجود مستوى واحد على الأقل.'];
  for (const level of sorted) {
    if (!level.name.trim()) errors.push('يوجد مستوى بدون اسم.');
    if (level.min < 0 || level.max > 100 || level.min > level.max) {
      errors.push(`حدود المستوى «${level.name}» غير صحيحة.`);
    }
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].max >= sorted[i + 1].min) {
      errors.push(`يوجد تداخل بين «${sorted[i].name}» و«${sorted[i + 1].name}».`);
    }
  }
  return errors;
}
