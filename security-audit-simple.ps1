# =================================================================
# SCRIPT DE VERIFICATION SECURITE PORTFOLIO JULIEN PINOT
# Expert Cybersecurite - Audit automatise Windows PowerShell
# =================================================================

Write-Host "DEMARRAGE DE L'AUDIT DE SECURITE" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Variables
$PortfolioDir = "C:\xampp\htdocs\SIO1_2024_PINOT"
$SecurityScore = 0
$TotalChecks = 15

function Write-Success {
    param($Message)
    Write-Host "OK $Message" -ForegroundColor Green
    $script:SecurityScore++
}

function Write-Error {
    param($Message)
    Write-Host "KO $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "WARN $Message" -ForegroundColor Yellow
}

# =================================================================
# VERIFICATIONS DE SECURITE
# =================================================================

Write-Host "1. Verification de la structure de securite..." -ForegroundColor Blue

# Verifier la presence du .htaccess
if (Test-Path "$PortfolioDir\.htaccess") {
    Write-Success ".htaccess present et configure"
} else {
    Write-Error ".htaccess manquant"
}

# Verifier le fichier de securite JS
if (Test-Path "$PortfolioDir\PortFolio\Js\security.js") {
    Write-Success "Script de securite JavaScript present"
} else {
    Write-Error "Script de securite manquant"
}

# Verifier les pages d'erreur
if ((Test-Path "$PortfolioDir\error\403.html") -and 
    (Test-Path "$PortfolioDir\error\404.html") -and 
    (Test-Path "$PortfolioDir\error\500.html")) {
    Write-Success "Pages d'erreur securisees presentes"
} else {
    Write-Error "Pages d'erreur manquantes"
}

Write-Host "2. Verification des headers de securite..." -ForegroundColor Blue

# Verifier CSP dans les fichiers HTML
try {
    $cspFound = Get-ChildItem -Path "$PortfolioDir\PortFolio\Html\*.html" | 
        Select-String -Pattern "Content-Security-Policy" -Quiet
    if ($cspFound) {
        Write-Success "Content Security Policy configure"
    } else {
        Write-Error "CSP manquant"
    }
} catch {
    Write-Warning "Erreur verification CSP"
}

# Verifier X-Frame-Options
try {
    $xfoFound = Get-ChildItem -Path "$PortfolioDir\PortFolio\Html\*.html" | 
        Select-String -Pattern "X-Frame-Options" -Quiet
    if ($xfoFound) {
        Write-Success "X-Frame-Options configure"
    } else {
        Write-Error "X-Frame-Options manquant"
    }
} catch {
    Write-Warning "Erreur verification X-Frame-Options"
}

# Verifier X-XSS-Protection
try {
    $xssFound = Get-ChildItem -Path "$PortfolioDir\PortFolio\Html\*.html" | 
        Select-String -Pattern "X-XSS-Protection" -Quiet
    if ($xssFound) {
        Write-Success "X-XSS-Protection configure"
    } else {
        Write-Error "X-XSS-Protection manquant"
    }
} catch {
    Write-Warning "Erreur verification X-XSS-Protection"
}

Write-Host "3. Verification de la protection des fichiers..." -ForegroundColor Blue

# Verifier absence de fichiers sensibles exposes
$SensitiveFiles = @(".env", ".git", "config.php", "wp-config.php", "database.sql")
foreach ($file in $SensitiveFiles) {
    if (Test-Path "$PortfolioDir\$file") {
        Write-Error "Fichier sensible expose: $file"
    } else {
        Write-Success "Aucun fichier sensible $file trouve"
    }
}

Write-Host "4. Verification de la configuration de securite..." -ForegroundColor Blue

# Verifier le fichier de configuration
if (Test-Path "$PortfolioDir\security-config.conf") {
    Write-Success "Configuration de securite presente"
} else {
    Write-Warning "Configuration de securite manquante"
}

# Verifier la documentation de securite
if (Test-Path "$PortfolioDir\SECURITY-README.md") {
    Write-Success "Documentation de securite presente"
} else {
    Write-Warning "Documentation de securite manquante"
}

Write-Host "5. Verification de la structure generale..." -ForegroundColor Blue

# Verifier la structure generale
$RequiredDirs = @("PortFolio\Html", "PortFolio\Css", "PortFolio\Js", "PortFolio\Images", "error")
foreach ($dir in $RequiredDirs) {
    if (Test-Path "$PortfolioDir\$dir") {
        Write-Success "Repertoire $dir present"
    } else {
        Write-Error "Repertoire $dir manquant"
    }
}

# =================================================================
# RAPPORT FINAL
# =================================================================

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "RAPPORT DE SECURITE FINAL" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$Percentage = [math]::Round(($SecurityScore * 100) / $TotalChecks)

if ($Percentage -ge 90) {
    Write-Host "EXCELLENT - Score: $SecurityScore/$TotalChecks ($Percentage%)" -ForegroundColor Green
    Write-Host "Portfolio hautement securise!" -ForegroundColor Green
} elseif ($Percentage -ge 75) {
    Write-Host "BON - Score: $SecurityScore/$TotalChecks ($Percentage%)" -ForegroundColor Yellow
    Write-Host "Securite satisfaisante" -ForegroundColor Yellow
} elseif ($Percentage -ge 50) {
    Write-Host "MOYEN - Score: $SecurityScore/$TotalChecks ($Percentage%)" -ForegroundColor Yellow
    Write-Host "Securite basique" -ForegroundColor Yellow
} else {
    Write-Host "INSUFFISANT - Score: $SecurityScore/$TotalChecks ($Percentage%)" -ForegroundColor Red
    Write-Host "Securite insuffisante" -ForegroundColor Red
}

Write-Host ""
Write-Host "RECOMMANDATIONS:" -ForegroundColor White
Write-Host "- Activer HTTPS en production" -ForegroundColor Gray
Write-Host "- Configurer un WAF" -ForegroundColor Gray
Write-Host "- Monitoring 24/7" -ForegroundColor Gray
Write-Host "- Tests de penetration reguliers" -ForegroundColor Gray

Write-Host ""
Write-Host "Support: julien.pinot@student.com" -ForegroundColor Blue
Write-Host "Documentation: SECURITY-README.md" -ForegroundColor Blue
Write-Host ""
Write-Host "Audit termine - $(Get-Date)" -ForegroundColor Green

# Generation d'un rapport JSON
$ReportData = @{
    audit_date = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    security_score = $SecurityScore
    total_checks = $TotalChecks
    percentage = $Percentage
    status = if ($Percentage -ge 90) { "EXCELLENT" } 
             elseif ($Percentage -ge 75) { "BON" } 
             elseif ($Percentage -ge 50) { "MOYEN" } 
             else { "INSUFFISANT" }
}

$ReportData | ConvertTo-Json -Depth 3 | Out-File "$PortfolioDir\security-report.json" -Encoding UTF8

Write-Host "Rapport JSON genere: security-report.json" -ForegroundColor Green
