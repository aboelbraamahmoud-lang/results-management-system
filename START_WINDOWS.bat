@echo off
chcp 65001 >nul
title نظام إدارة النتائج - التشغيل المحلي
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js غير مثبت على هذا الجهاز.
  echo ثبّت Node.js ثم شغّل هذا الملف مرة أخرى.
  pause
  exit /b 1
)
if not exist node_modules (
  echo جاري تثبيت مكتبات المشروع لأول مرة...
  call npm install
  if errorlevel 1 (
    echo حدث خطأ أثناء تثبيت المكتبات.
    pause
    exit /b 1
  )
)
echo تشغيل نظام إدارة النتائج...
call npm run dev
pause
