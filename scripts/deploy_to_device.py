#!/usr/bin/env python3
import os
import sys
import time
import subprocess
from pathlib import Path

ADB_PATH = r"C:\Users\smrut\AppData\Local\Android\Sdk\platform-tools\adb.exe"
PROJECT_ROOT = Path(r"D:\Additional\PROJECT\JANBHASHA")
APK_PATH = PROJECT_ROOT / "mobile" / "android" / "app" / "build" / "outputs" / "apk" / "release" / "app-release.apk"
MODELS_DIR = PROJECT_ROOT / "models"
CONFIGS_DIR = PROJECT_ROOT / "configs"

PACKAGE_NAME = "com.janbhasha"
DEVICE_DEST_EXTERNAL = "/sdcard/Android/data/com.janbhasha/files/models"
DEVICE_DEST_SHARED = "/sdcard/Janbhasha/models"

def run_cmd(args, check=True, capture=True, timeout=None):
    if capture:
        res = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=timeout)
    else:
        res = subprocess.run(args, timeout=timeout)
    if check and res.returncode != 0:
        err = res.stderr.strip() if capture else f"exit code {res.returncode}"
        raise RuntimeError(f"Command failed: {' '.join(str(x) for x in args)}\nError: {err}")
    return res

def wait_for_online_device(max_attempts=10):
    print("Checking ADB devices...")
    for attempt in range(1, max_attempts + 1):
        try:
            res = run_cmd([ADB_PATH, "devices"], capture=True)
            lines = res.stdout.strip().split("\n")[1:]
            online_devices = []
            offline_devices = []
            for line in lines:
                parts = line.split()
                if len(parts) >= 2:
                    if parts[1] == "device":
                        online_devices.append(parts[0])
                    elif parts[1] == "offline":
                        offline_devices.append(parts[0])
            
            if online_devices:
                device_id = online_devices[0]
                print(f"[OK] Found online device: {device_id}")
                return device_id
            
            if offline_devices:
                print(f"[!] Device is currently OFFLINE.")
                print("    ACTION REQUIRED ON PHONE:")
                print("    1. Unlock phone screen.")
                print("    2. Change USB notification to 'File Transfer / Android Auto'.")
                print("    3. If prompt appears: 'Allow USB debugging from this computer?' -> Check 'Always allow' and tap 'OK'.")
                print("    4. If still offline, unplug and re-plug USB cable.")
                try:
                    run_cmd([ADB_PATH, "reconnect"], check=False)
                except Exception:
                    pass
            else:
                print(f"[-] No device detected. (Attempt {attempt}/{max_attempts})")
        except Exception as e:
            print(f"ADB check notice: {e}")
        
        time.sleep(2)
    return None

def install_apk(device_id):
    if not APK_PATH.exists():
        raise FileNotFoundError(f"APK not found at {APK_PATH}.")
    
    print(f"\n[1/4] Installing Production Release APK ({APK_PATH.stat().st_size / (1024*1024):.1f} MB)...")
    res = run_cmd([ADB_PATH, "-s", device_id, "install", "-r", "-d", str(APK_PATH)], capture=True, timeout=120)
    print(res.stdout.strip())
    print("[OK] APK installed successfully!")

def grant_permissions(device_id):
    print("\n[2/4] Granting Android permissions...")
    permissions = [
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_AUDIO",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
    ]
    for perm in permissions:
        try:
            run_cmd([ADB_PATH, "-s", device_id, "shell", "pm", "grant", PACKAGE_NAME, perm], check=False)
        except Exception:
            pass
    print("[OK] Runtime permissions granted.")

def push_models(device_id):
    print("\n[3/4] Deploying AI Models to device storage...")
    
    target_dirs = [
        f"{DEVICE_DEST_EXTERNAL}/asr/whisper-small-ct2",
        f"{DEVICE_DEST_EXTERNAL}/tts/vits-santhali",
        f"{DEVICE_DEST_EXTERNAL}/tts/sat_piper",
        f"{DEVICE_DEST_EXTERNAL}/translation/indictrans2_sat_ct2",
        f"{DEVICE_DEST_EXTERNAL}/dictionary",
        DEVICE_DEST_SHARED,
    ]
    for d in target_dirs:
        run_cmd([ADB_PATH, "-s", device_id, "shell", f"mkdir -p {d}"], check=False)
    
    model_payloads = [
        ("configs/model_manifest.json", f"{DEVICE_DEST_EXTERNAL}/model_manifest.json"),
        ("models/dictionary", f"{DEVICE_DEST_EXTERNAL}/"),
        ("models/tts/sat_piper", f"{DEVICE_DEST_EXTERNAL}/tts/"),
        ("models/tts/vits-santhali", f"{DEVICE_DEST_EXTERNAL}/tts/"),
        ("models/asr/whisper-small-ct2", f"{DEVICE_DEST_EXTERNAL}/asr/"),
        ("models/translation/indictrans2_sat_ct2", f"{DEVICE_DEST_EXTERNAL}/translation/"),
    ]
    
    for rel_src, device_dest in model_payloads:
        src_full = PROJECT_ROOT / rel_src
        if not src_full.exists():
            print(f"[-] Skipping {rel_src} (not found locally)")
            continue
        
        print(f"--> Pushing {rel_src} to {device_dest}...")
        try:
            res = run_cmd([ADB_PATH, "-s", device_id, "push", str(src_full), device_dest], capture=True, timeout=300)
            last_line = res.stdout.strip().split("\n")[-1] if res.stdout else "Done"
            print(f"    [OK] {last_line}")
        except Exception as pe:
            print(f"    [!] Error pushing {rel_src}: {pe}")
            
    print("--> Setting up /sdcard/Janbhasha/models mirror...")
    run_cmd([ADB_PATH, "-s", device_id, "shell", f"cp -rn {DEVICE_DEST_EXTERNAL}/* {DEVICE_DEST_SHARED}/ 2>/dev/null || true"], check=False)
    print("[OK] AI Models successfully deployed to device.")

def launch_app(device_id):
    print("\n[4/4] Launching JANBHASHA...")
    run_cmd([ADB_PATH, "-s", device_id, "shell", "am", "start", "-n", f"{PACKAGE_NAME}/.MainActivity"], capture=True)
    print("[OK] Application launched!")

def main():
    print("=" * 60)
    print("   JANBHASHA ON-DEVICE APPLICATION & MODEL DEPLOYMENT")
    print("=" * 60)
    
    device_id = wait_for_online_device(max_attempts=3)
    if not device_id:
        print("\n[!] Could not connect to an online Android device.")
        sys.exit(1)
    
    install_apk(device_id)
    grant_permissions(device_id)
    push_models(device_id)
    launch_app(device_id)
    
    print("\n" + "=" * 60)
    print("   ALL TASKS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
