import type { AppSettings, ResultRecord } from '../types';
import { aggregate } from '../utils/calculations';

export function ReportsPage({ records, settings }: { records: ResultRecord[]; settings: AppSettings }) {
  const groups = new Map<string, ResultRecord[]>();
  records.forEach(r => { const key = `${r.grade}||${r.section}||${r.subject}||${r.teacher}`; groups.set(key, [...(groups.get(key)||[]), r]); });
  const rows = [...groups.entries()].map(([key, rs]) => {
    const [grade, section, subject, teacher] = key.split('||'); const s = aggregate(rs, settings).stats;
    return { grade, section, subject, teacher, ...s };
  });
  return <div className="page-wrap"><header className="page-header"><div><span className="eyebrow">مركز التقارير</span><h1>ملخص النتائج</h1><p>نسخة أولى عملية من تقرير ملخص النتائج، محسوبة من البيانات الفعلية.</p></div><button className="primary" onClick={()=>window.print()}>طباعة التقرير</button></header>
  <div className="panel report-sheet"><div className="report-head"><h2>{settings.schoolName}</h2><h3>ملخص النتائج</h3><p>{settings.academicYear} — {settings.semester}</p></div>
  <div className="table-wrap"><table><thead><tr><th>الصف</th><th>الشعبة</th><th>المادة</th><th>المعلم</th><th>طلاب</th><th>حاضر</th><th>غائب</th><th>ناجح</th><th>راسب</th><th>نسبة النجاح</th><th>التحصيل</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r.grade}</td><td>{r.section}</td><td>{r.subject}</td><td>{r.teacher}</td><td>{r.totalStudents}</td><td>{r.present}</td><td>{r.absent}</td><td>{r.passed}</td><td>{r.failed}</td><td>{r.passRate.toFixed(1)}%</td><td>{r.attainment.toFixed(1)}%</td></tr>)}</tbody></table></div></div></div>;
}
