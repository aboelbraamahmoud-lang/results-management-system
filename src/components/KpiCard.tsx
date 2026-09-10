import type { ReactNode } from 'react';
export function KpiCard({ title, value, note, icon }: { title: string; value: string | number; note?: string; icon?: ReactNode }) {
  return <div className="kpi-card"><div className="kpi-head"><span>{title}</span>{icon}</div><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}
