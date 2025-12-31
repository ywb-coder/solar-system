# 太阳系模拟系统启动脚本
Write-Host "正在启动太阳系模拟系统..." -ForegroundColor Green
Write-Host ""

# 检查Python是否可用
$pythonAvailable = $false
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pythonAvailable = $true
        Write-Host "检测到Python: $pythonVersion" -ForegroundColor Cyan
    }
} catch {
    try {
        $pythonVersion = py --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $pythonAvailable = $true
            Write-Host "检测到Python: $pythonVersion" -ForegroundColor Cyan
        }
    } catch {}
}

# 检查Node.js是否可用
$nodeAvailable = $false
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $nodeAvailable = $true
        Write-Host "检测到Node.js: $nodeVersion" -ForegroundColor Cyan
    }
} catch {}

Write-Host ""
Write-Host "请选择启动方式：" -ForegroundColor Yellow
Write-Host "1. Python HTTP服务器 (端口8080)"
Write-Host "2. Node.js HTTP服务器 (端口8080)"
Write-Host "3. 直接打开HTML文件"
Write-Host ""

$choice = Read-Host "请输入选项 (1/2/3)"

if ($choice -eq "1") {
    if ($pythonAvailable) {
        Write-Host "正在使用Python启动服务器..." -ForegroundColor Green
        Write-Host "服务器地址: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
        python -m http.server 8080
    } else {
        Write-Host "Python未安装，尝试使用py命令..." -ForegroundColor Yellow
        py -m http.server 8080
    }
} elseif ($choice -eq "2") {
    if ($nodeAvailable) {
        Write-Host "正在使用Node.js启动服务器..." -ForegroundColor Green
        Write-Host "服务器地址: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
        npx http-server -p 8080
    } else {
        Write-Host "Node.js未安装，请先安装Node.js" -ForegroundColor Red
        Read-Host "按Enter键退出"
    }
} elseif ($choice -eq "3") {
    Write-Host "正在打开HTML文件..." -ForegroundColor Green
    Start-Process "index.html"
} else {
    Write-Host "无效选项，直接打开HTML文件..." -ForegroundColor Yellow
    Start-Process "index.html"
}

