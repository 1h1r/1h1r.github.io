@echo off
chcp 65001 >nul
title 亦然亦航博客后台管理系统
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║     亦然亦航博客后台管理系统启动中...     ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  正在启动后台服务...
echo.

cd /d "C:\Users\J\WorkBuddy\2026-07-05-15-20-48\yiran-yihang-blog\admin"
"C:\Users\J\.workbuddy\binaries\node\versions\22.12.0\node.exe" app.js

pause
