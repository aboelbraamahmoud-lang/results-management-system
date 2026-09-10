@echo off
chcp 65001 >nul
title نظام إدارة النتائج - بناء نسخة الإنتاج
if not exist node_modules call npm install
call npm run build
pause
