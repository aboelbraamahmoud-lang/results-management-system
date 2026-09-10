import { CheckCircle2, CircleOff, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { aggregate } from '../utils/calculations';
import type { AppSettings, ResultRecord } from '../types';

export function Dashboard({ records, settings }: { records: ResultRecord[]; settings: AppSettings }) {
  const { calculated, stats } = aggregate(records, settings);
  const groupBy = (key: 'department' | 'subject' | 'grade' | 'teacher') => {
    const map = new Map<string, ResultRecord[]>();
    records.forEach((r) => map.set(r[key] || 'غير محدد', [...(map.get(r[key] || 'غير محدد') || []), r]));
    return [...map.entries()].map(([name, rows]) => ({ name, ...aggregate(rows, settings).stats })).sort((a, b) => b.attainment - a.attainment);
  };
  const departments = groupBy('department');
  const subjects = groupBy('subject');
  const topSubject = subjects[0];
  const lowSubject = subjects[subjects.length - 1];
  return <div className="page-wrap">
    <header className="page-header"><div><span className="eyebrow">لوحة المعلومات</span><h1>نظرة شاملة على النتائج</h1><p>المؤشرات مبنية مباشرة على البيانات المخزنة محليًا.</p></div></header>
    <section className="kpi-grid">
      <KpiCard title="إجمالي الطلاب" value={stats.totalStudents} icon={<Users size={20} />} />
      <KpiCard title="أدوا الاختبار" value={stats.present} icon={<GraduationCap size={20} />} />
      <KpiCard title="نسبة النجاح" value={`${stats.passRate.toFixed(1)}%`} icon={<CheckCircle2 size={20} />} />
      <KpiCard title="متوسط التحصيل" value={`${stats.attainment.toFixed(1)}%`} icon={<TrendingUp size={20} />} />
      <KpiCard title="الراسبون" value={stats.failed} icon={<CircleOff size={20} />} />
    </section>
    <section className="grid-two">
      <div className="panel"><div className="panel-title"><h2>توزيع مستويات الأداء</h2><span>{calculated.filter(r => r.percentage !== null).length} نتيجة</span></div><div className="level-bars">
        {settings.levels.sort((a,b)=>a.order-b.order).map(level => {
          const count = stats.levelCounts[level.name] || 0;
          const total = Math.max(1, stats.present);
          return <div className="level-row" key={level.id}><div><span>{level.name}</span><b>{count}</b></div><div className="bar-track"><div className="bar-fill" style={{ width: `${(count/total)*100}%`, background: level.color }} /></div></div>;
        })}
      </div></div>
      <div className="panel"><div className="panel-title"><h2>مؤشرات سريعة</h2></div><div className="insights">
        <div><span>أعلى مادة تحصيلًا</span><strong>{topSubject ? `${topSubject.name} — ${topSubject.attainment.toFixed(1)}%` : 'لا توجد بيانات'}</strong></div>
        <div><span>أقل مادة تحصيلًا</span><strong>{lowSubject ? `${lowSubject.name} — ${lowSubject.attainment.toFixed(1)}%` : 'لا توجد بيانات'}</strong></div>
        <div><span>الغياب/عدم الأداء</span><strong>{stats.absent}</strong></div>
      </div></div>
    </section>
    <section className="panel"><div className="panel-title"><h2>مقارنة الأقسام</h2><span>مرتبة حسب متوسط التحصيل</span></div>
      <div className="table-wrap"><table><thead><tr><th>القسم</th><th>عدد الطلاب</th><th>نسبة النجاح</th><th>متوسط التحصيل</th><th>راسب</th></tr></thead><tbody>{departments.map(d=><tr key={d.name}><td><strong>{d.name}</strong></td><td>{d.totalStudents}</td><td>{d.passRate.toFixed(1)}%</td><td>{d.attainment.toFixed(1)}%</td><td>{d.failed}</td></tr>)}</tbody></table></div>
    </section>
  </div>;
}
