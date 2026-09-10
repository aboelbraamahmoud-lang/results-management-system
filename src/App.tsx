import { useEffect, useState } from 'react';
import { Layout, type PageKey } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ImportPage } from './pages/ImportPage';
import { ResultsPage } from './pages/ResultsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { clearResults, getResults, getSettings, putBatch, putResults, saveSettings } from './services/db';
import { makeSampleData } from './data/sample';
import type { AppSettings, ImportBatch, ResultRecord } from './types';
import { defaultSettings } from './utils/calculations';

export default function App() {
  const [page, setPage] = useState<PageKey>('dashboard');
  const [records, setRecords] = useState<ResultRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { (async()=>{ const [r,s]=await Promise.all([getResults(),getSettings()]); setRecords(r);setSettings(s);setLoaded(true); })(); },[]);
  const importRecords = async (newRecords: ResultRecord[], batch: ImportBatch) => { await putResults(newRecords); await putBatch(batch); setRecords(await getResults()); setPage('dashboard'); };
  const updateSettings=async(s:AppSettings)=>{await saveSettings(s);setSettings(s);};
  const loadSample=async()=>{const sample=makeSampleData();await clearResults();await putResults(sample);setRecords(sample);};
  const clearAll=async()=>{if(confirm('هل تريد مسح جميع النتائج المحلية؟')){await clearResults();setRecords([]);}};
  if(!loaded) return <div className="loading">جارٍ فتح قاعدة البيانات المحلية...</div>;
  return <Layout page={page} setPage={setPage} schoolName={settings.schoolName}><div className="top-actions"><button className="ghost" onClick={loadSample}>تحميل بيانات تجريبية</button><button className="danger-ghost" onClick={clearAll}>مسح النتائج</button></div>{page==='dashboard'&&<Dashboard records={records} settings={settings}/>} {page==='import'&&<ImportPage settings={settings} onImport={importRecords}/>} {page==='results'&&<ResultsPage records={records} settings={settings}/>} {page==='reports'&&<ReportsPage records={records} settings={settings}/>} {page==='settings'&&<SettingsPage settings={settings} onSave={updateSettings}/>}</Layout>;
}
