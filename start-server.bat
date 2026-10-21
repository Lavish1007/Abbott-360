@echo off
setlocal
title Abbott 360 - Local Server
pushd "%~dp0"
if errorlevel 1 (
    echo Could not open the app folder.
    pause
    exit /b 1
)

py -3 -c "import http.server" >nul 2>&1
if not errorlevel 1 (
    set "ABBOTT_PYTHON=py -3"
    goto :run
)

python -c "import sys, http.server; assert sys.version_info.major == 3" >nul 2>&1
if not errorlevel 1 (
    set "ABBOTT_PYTHON=python"
    goto :run
)

echo Python 3 is required to run Abbott 360.
echo Install it from https://www.python.org/downloads/
echo Select "Add Python to PATH" during installation, then run this file again.
popd
pause
exit /b 1

:run
echo Starting Abbott 360 at http://localhost:8000
echo Keep this window open while using the app.
echo Close this window or press Ctrl+C to stop the server.
echo.
%ABBOTT_PYTHON% -c "import http.server, threading, webbrowser; server = http.server.ThreadingHTTPServer(('127.0.0.1', 8000), http.server.SimpleHTTPRequestHandler); threading.Timer(1, lambda: webbrowser.open('http://localhost:8000')).start(); server.serve_forever()"
if errorlevel 1 (
    echo.
    echo The server stopped or could not start.
    echo If port 8000 is already in use, stop the previous server and try again.
    pause
)
popd
endlocal
