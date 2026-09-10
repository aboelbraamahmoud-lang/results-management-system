import type { ResultRecord } from '../types';

const names = ['أحمد سالم', 'محمد راشد', 'يوسف علي', 'عبدالله حسن', 'خالد ناصر', 'عمر محمود', 'سالم فهد', 'راشد حمد', 'ناصر جاسم', 'تميم أحمد'];
const subjects = [
  { department: 'قسم الرياضيات', subject: 'الرياضيات', teacher: 'أحمد عرفات' },
  { department: 'قسم العلوم', subject: 'العلوم', teacher: 'زكريا حسن' },
  { department: 'قسم التربية الإسلامية', subject: 'التربية الإسلامية', teacher: 'محمود الشبراوي' },
];

export function makeSampleData(): ResultRecord[] {
  const rows: ResultRecord[] = [];
  let idx = 1;
  for (let g = 7; g <= 9; g++) {
    for (let s = 1; s <= 3; s++) {
      for (const subject of subjects) {
        names.forEach((name, i) => {
          const absent = (i + s + g + idx) % 17 === 0;
          const maxScore = g === 7 ? 20 : g === 8 ? 30 : 15;
          const pct = Math.max(35, Math.min(100, 58 + ((i * 7 + s * 4 + g * 5 + idx) % 43)));
          rows.push({
            id: crypto.randomUUID(),
            studentId: `${g}${s}${String(i + 1).padStart(2, '0')}`,
            studentName: `${name} ${g}/${s}`,
            department: subject.department,
            subject: subject.subject,
            grade: `الصف ${g}`,
            section: `${g}/${s}`,
            teacher: subject.teacher,
            examName: 'اختبار تجريبي أول',
            academicYear: '2026-2027',
            semester: 'الفصل الدراسي الأول',
            score: absent ? null : Math.round((pct / 100) * maxScore * 2) / 2,
            maxScore,
            status: absent ? 'غائب' : 'حاضر',
            importBatchId: 'sample',
            createdAt: new Date().toISOString(),
          });
          idx++;
        });
      }
    }
  }
  return rows;
}
