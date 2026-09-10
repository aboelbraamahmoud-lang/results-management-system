import { useState } from 'react';
import type { AppSettings, PerformanceLevel } from '../types';
import { defaultLevels, validateLevels } from '../utils/calculations';

export function SettingsPage({ settings, onSave }: { settings: AppSettings; onSave: (s: AppSettings) => Promise<void> }) {
  const [draft, setDraft] = useState<AppSettings>(structuredClone(settings));
  const [message, setMessage] = useState('');
  const updateLevel = (id: string, patch: Partial<PerformanceLevel>) => setDraft(d => ({...d, levels: d.levels.map(l => l.id===id ? {...l,...patch}:l)}));
  const save = async () => {
    const errors = validateLevels(draft.levels);
    if (errors.length) return setMessage(errors.join(' '));
    if (draft.passMark < 0 || draft.passMark > 100) return setMessage('حد النجاح يجب أن يكون بين 0 و100.');
    await onSave(draft); setMessage('تم حفظ الإعدادات وإعادة حساب المؤشرات.');
  };
  return <div className="page-wrap"><header className="page-header"><div><span className="eyebrow">إعدادات النظام</span><h1>المدرسة والحسابات</h1><p>أي تعديل هنا ينعكس على جميع التحليلات والتقارير.</p></div></header>
    <div className="grid-two"><div className="panel"><h2>بيانات المدرسة</h2><div className="form-grid"><label>اسم المدرسة<input value={draft.schoolName} onChange={e=>setDraft({...draft,schoolName:e.target.value})}/></label><label>العام الأكاديمي<input value={draft.academicYear} onChange={e=>setDraft({...draft,academicYear:e.target.value})}/></label><label>الفصل الدراسي<input value={draft.semester} onChange={e=>setDraft({...draft,semester:e.target.value})}/></label><label>حد النجاح (%)<input type="number" value={draft.passMark} onChange={e=>setDraft({...draft,passMark:Number(e.target.value)})}/></label></div></div>
    <div className="panel"><h2>قاعدة الحساب</h2><p className="muted">النسبة = درجة الطالب ÷ الدرجة الكلية × 100. لا تدخل حالات الغياب ضمن متوسط التحصيل.</p><div className="formula">التحليل مبني على النِّسب وليس الدرجات الخام.</div></div></div>
    <div className="panel"><div className="panel-title"><h2>مستويات الأداء</h2><button className="ghost" onClick={()=>setDraft({...draft,levels:structuredClone(defaultLevels)})}>استعادة الافتراضي</button></div><div className="levels-editor">{[...draft.levels].sort((a,b)=>a.order-b.order).map(level=><div className="level-edit" key={level.id}><input value={level.name} onChange={e=>updateLevel(level.id,{name:e.target.value})}/><label>من<input type="number" step="0.001" value={level.min} onChange={e=>updateLevel(level.id,{min:Number(e.target.value)})}/></label><label>إلى<input type="number" step="0.001" value={level.max} onChange={e=>updateLevel(level.id,{max:Number(e.target.value)})}/></label><input type="color" value={level.color} onChange={e=>updateLevel(level.id,{color:e.target.value})}/></div>)}</div><div className="actions"><button className="primary" onClick={save}>حفظ الإعدادات</button>{message && <span className="status-msg">{message}</span>}</div></div>
  </div>;
}
