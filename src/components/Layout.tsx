import { BarChart3, Database, FileSpreadsheet, GraduationCap, LayoutDashboard, Settings, Upload } from 'lucide-react';
import type { ReactNode } from 'react';

export type PageKey = 'dashboard' | 'import' | 'results' | 'reports' | 'settings';

export function Layout({ page, setPage, children, schoolName }: { page: PageKey; setPage: (p: PageKey) => void; children: ReactNode; schoolName: string }) {
  const items: { key: PageKey; label: string; icon: ReactNode }[] = [
    { key: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard size={19} /> },
    { key: 'import', label: 'استيراد النتائج', icon: <Upload size={19} /> },
    { key: 'results', label: 'النتائج والطلاب', icon: <Database size={19} /> },
    { key: 'reports', label: 'ملخص النتائج', icon: <FileSpreadsheet size={19} /> },
    { key: 'settings', label: 'الإعدادات', icon: <Settings size={19} /> },
  ];
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><GraduationCap /></div><div><strong>إدارة النتائج</strong><span>{schoolName}</span></div></div>
      <nav>{items.map((item) => <button key={item.key} className={page === item.key ? 'active' : ''} onClick={() => setPage(item.key)}>{item.icon}<span>{item.label}</span></button>)}</nav>
      <div className="sidebar-foot"><BarChart3 size={18} /> نسخة محلية تجريبية</div>
    </aside>
    <main className="main-area">{children}</main>
  </div>;
}
