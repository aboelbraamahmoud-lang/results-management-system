import { useMemo, useState } from 'react';
import type { AppSettings, ResultRecord } from '../types';
import { calculateRecord } from '../utils/calculations';

export function ResultsPage({ records, settings }: { records: ResultRecord[]; settings: AppSettings }) {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => records.map(r => calculateRecord(r, settings)).filter(r => [r.studentName, r.teacher, r.subject, r.grade, r.section].join(' ').includes(query)), [records, settings, query]);
  return <div className="page-wrap"><header className="page-header"><div><span className="eyebrow">قاعدة البيانات المحلية</span><h1>النتائج والطلاب</h1><p>عرض مباشر للنتائج بعد تطبيق محرك الحساب المركزي.</p></div></header>
    <div className="panel"><div className="toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث باسم الطالب أو المعلم أو المادة أو الصف..."/><span>{rows.length} سجل</span></div>
      <div className="table-wrap"><table><thead><tr><th>الطالب</th><th>الصف/الشعبة</th><th>المادة</th><th>المعلم</th><th>الدرجة</th><th>النسبة</th><th>المستوى</th><th>الحالة</th></tr></thead><tbody>{rows.slice(0,300).map(r=><tr key={r.id}><td><strong>{r.studentName}</strong></td><td>{r.grade} — {r.section}</td><td>{r.subject}</td><td>{r.teacher}</td><td>{r.score ?? '—'} / {r.maxScore}</td><td>{r.percentage === null ? '—' : `${r.percentage.toFixed(1)}%`}</td><td>{r.level ? <span className="level-pill" style={{borderColor:r.level.color}}>{r.level.name}</span> : '—'}</td><td>{r.status}</td></tr>)}</tbody></table></div>
      {rows.length > 300 && <div className="table-note">يتم عرض أول 300 سجل في هذه النسخة، مع بقاء جميع السجلات محفوظة.</div>}
    </div>
  </div>;
}
