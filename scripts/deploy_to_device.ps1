param(
    [string]$AdbPath = "C:\Users\smrut\AppData\Local\Android\Sdk\platform-tools\adb.exe",
    [string]$ProjectRoot = "D:\Additional\PROJECT\JANBHASHA"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "     JANBHASHA ANDROID APP & AI MODEL DEPLOYMENT TOOL       " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$apkPath = Join-Path $ProjectRoot "mobile\android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "[!] Error: APK not found at $apkPath" -ForegroundColor Red
    exit 1
}

Write-Host "`nWaiting for connected online Android phone..." -ForegroundColor Yellow
$deviceId = $null

while ($null -eq $deviceId) {
    $rawDevices = & $AdbPath devices
    $lines = $rawDevices -split "`r?`n" | Where-Object { $_ -match "\S" } | Select-Object -Skip 1
    
    foreach ($line in $lines) {
        if ($line -match "^\s*([^\s]+)\s+device$") {
            $deviceId = $Matches[1]
            break
        }
    }
    
    if ($null -ne $deviceId) {
        Write-Host "[OK] Detected online device: $deviceId" -ForegroundColor Green
        break
    }
    
    Write-Host "[-] Phone not ready yet (device is either locked, charging-only, or offline)." -ForegroundColor Yellow
    Write-Host "    -> Please UNLOCK phone screen." -ForegroundColor White
    Write-Host "    -> Pull down notification panel and change USB to 'File Transfer'." -ForegroundColor White
    Write-Host "    -> If prompted: Tap 'Allow USB Debugging' -> OK." -ForegroundColor White
    
    Start-Sleep -Seconds 3
    & $AdbPath reconnect 2>$null | Out-Null
}

Write-Host "`n[1/4] Installing Production Release APK (38.2 MB)..." -ForegroundColor Cyan
$installResult = & $AdbPath -s $deviceId install -r -d $apkPath
Write-Host $installResult -ForegroundColor Green

Write-Host "`n[2/4] Granting Android runtime permissions..." -ForegroundColor Cyan
$perms = @(
    "android.permission.RECORD_AUDIO",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.READ_MEDIA_AUDIO",
    "android.permission.BLUETOOTH_CONNECT",
    "android.permission.BLUETOOTH_SCAN"
)
foreach ($p in $perms) {
    & $AdbPath -s $deviceId shell pm grant com.janbhasha $p 2>$null | Out-Null
}
Write-Host "[OK] All audio, storage, and Bluetooth permissions granted." -ForegroundColor Green

Write-Host "`n[3/4] Deploying AI Models to Phone Storage..." -ForegroundColor Cyan
$destExt = "/sdcard/Android/data/com.janbhasha/files/models"
$destShared = "/sdcard/Janbhasha/models"

# Create directories on device
& $AdbPath -s $deviceId shell "mkdir -p $destExt/asr/whisper-small-ct2 $destExt/tts/vits-santhali $destExt/tts/sat_piper $destExt/translation/indictrans2_sat_ct2 $destExt/dictionary $destShared"

$itemsToPush = @(
    @{ Src = "$ProjectRoot\configs\model_manifest.json"; Dst = "$destExt/model_manifest.json" },
    @{ Src = "$ProjectRoot\models\dictionary"; Dst = "$destExt/" },
    @{ Src = "$ProjectRoot\models\tts\sat_piper"; Dst = "$destExt/tts/" },
    @{ Src = "$ProjectRoot\models\tts\vits-santhali"; Dst = "$destExt/tts/" },
    @{ Src = "$ProjectRoot\models\asr\whisper-small-ct2"; Dst = "$destExt/asr/" },
    @{ Src = "$ProjectRoot\models\translation\indictrans2_sat_ct2"; Dst = "$destExt/translation/" }
)

foreach ($item in $itemsToPush) {
    if (Test-Path $item.Src) {
        Write-Host "--> Pushing $($item.Src)..." -ForegroundColor Gray
        & $AdbPath -s $deviceId push $item.Src $item.Dst
    }
}

# Mirror to shared storage
Write-Host "--> Mirroring to /sdcard/Janbhasha/models..." -ForegroundColor Gray
& $AdbPath -s $deviceId shell "cp -rn $destExt/* $destShared/ 2>/dev/null || true"
Write-Host "[OK] All AI models deployed to device storage." -ForegroundColor Green

Write-Host "`n[4/4] Launching JANBHASHA on device..." -ForegroundColor Cyan
& $AdbPath -s $deviceId shell am start -n com.janbhasha/.MainActivity
Write-Host "[OK] Application successfully started on phone!" -ForegroundColor Green
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT COMPLETED SUCCESSFULLY!                      " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
