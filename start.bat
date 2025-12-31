@echo off
echo 正在启动太阳系模拟系统...
echo.
echo 请选择启动方式：
echo 1. Python HTTP服务器 (端口8080)
echo 2. Node.js HTTP服务器 (端口8080)
echo 3. 直接打开HTML文件
echo.
set /p choice=请输入选项 (1/2/3): 

if "%choice%"=="1" (
    echo 正在使用Python启动服务器...
    python -m http.server 8080
    if errorlevel 1 (
        echo Python未安装或命令失败，尝试使用py命令...
        py -m http.server 8080
    )
) else if "%choice%"=="2" (
    echo 正在使用Node.js启动服务器...
    npx http-server -p 8080
) else if "%choice%"=="3" (
    echo 正在打开HTML文件...
    start index.html
) else (
    echo 无效选项，使用默认方式启动...
    start index.html
)

pause

