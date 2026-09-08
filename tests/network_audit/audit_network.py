"""
Phase 9 - Network Audit Script (Windows-compatible)
"""
import sys
import json
import os
import re
import argparse
from datetime import datetime
from typing import List, Dict

# Windows cp1252 fix
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

FINDINGS: List[Dict] = []

RISK_ICON = {"NONE": "[OK]", "LOW": "[LO]", "MEDIUM": "[MD]",
             "HIGH": "[HI]", "CRITICAL": "[!!]"}


def finding(component: str, risk: str, detail: str, mitigation: str = ""):
    FINDINGS.append({"component": component, "risk": risk,
                     "detail": detail, "mitigation": mitigation})
    print(f"  {RISK_ICON.get(risk,'[?]')} [{risk}] {component}: {detail}")


def audit_android_permissions(project_root: str):
    print("\n[1] Android Permissions Audit")
    found = False
    for root, dirs, files in os.walk(os.path.join(project_root, "mobile", "android")):
        dirs[:] = [d for d in dirs if d not in ["build", ".gradle"]]
        for f in files:
            if f == "AndroidManifest.xml":
                found = True
                path = os.path.join(root, f)
                content = open(path, encoding="utf-8", errors="ignore").read()
                has_internet = "android.permission.INTERNET" in content
                has_record   = "android.permission.RECORD_AUDIO" in content
                finding("INTERNET permission",
                        "HIGH" if has_internet else "NONE",
                        "DECLARED" if has_internet else "NOT declared",
                        "Verify never exercised at runtime via tcpdump")
                finding("RECORD_AUDIO", "NONE" if has_record else "MEDIUM",
                        "DECLARED (required)" if has_record else "NOT declared")
    if not found:
        finding("AndroidManifest.xml", "MEDIUM", "Not found",
                "Run: npx react-native run-android to generate")


def audit_python_requirements(project_root: str):
    print("\n[2] Python Dependency Audit")
    req_path = os.path.join(project_root, "requirements.txt")
    if not os.path.exists(req_path):
        finding("requirements.txt", "MEDIUM", "Not found", "")
        return
    lines = [l.strip().split("==")[0].split(">=")[0].split("<=")[0].lower()
             for l in open(req_path) if l.strip() and not l.startswith("#")]
    NET_CAPABLE = {
        "huggingface-hub": ("MEDIUM", "Downloads from HF Hub",
                            "Set HF_HUB_OFFLINE=1 + local_files_only=True"),
        "transformers":    ("MEDIUM", "Downloads models by default",
                            "Set TRANSFORMERS_OFFLINE=1"),
        "datasets":        ("MEDIUM", "Downloads datasets", "HF_DATASETS_OFFLINE=1"),
        "requests":        ("LOW",    "HTTP client present", "Audit runtime usage"),
        "firebase":        ("CRITICAL","Telemetry", "REMOVE"),
        "sentry":          ("HIGH",   "Error reporting to remote", "REMOVE or disable"),
    }
    for pkg in lines:
        for known, (risk, detail, mit) in NET_CAPABLE.items():
            if known in pkg:
                finding(pkg, risk, detail, mit)
                break


def audit_rn_packages(project_root: str):
    print("\n[3] React Native Package Audit")
    pkg_path = os.path.join(project_root, "mobile", "package.json")
    if not os.path.exists(pkg_path):
        finding("package.json", "MEDIUM", "Not found", "")
        return
    pkg = json.load(open(pkg_path))
    all_deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    SUSPICIOUS = {
        "react-native-firebase": ("CRITICAL", "Firebase telemetry"),
        "firebase":              ("CRITICAL", "Firebase SDK"),
        "@sentry":               ("HIGH",     "Sentry error reporting"),
        "analytics":             ("HIGH",     "Analytics/telemetry"),
        "crashlytics":           ("HIGH",     "Crash reporting"),
    }
    for dep in all_deps:
        dep_l = dep.lower()
        for s, (risk, detail) in SUSPICIOUS.items():
            if s in dep_l:
                finding(dep, risk, detail, "Remove for offline build")
                break
        else:
            finding(dep, "NONE", "No known network risk", "")


def audit_cpp_sources(project_root: str):
    print("\n[4] C++ Source Network Audit")
    cpp_root = os.path.join(project_root, "mobile", "android",
                            "app", "src", "main", "cpp")
    if not os.path.exists(cpp_root):
        finding("C++ sources", "MEDIUM", "Directory not found", "Build native layer first")
        return
    NET_PATTERNS = [r"socket\s*\(", r"curl_", r"#include.*curl",
                    r"#include.*http", r"getaddrinfo"]
    issues = []
    for root, _, files in os.walk(cpp_root):
        for f in files:
            if not f.endswith((".cpp", ".h", ".c", ".cc")):
                continue
            content = open(os.path.join(root, f),
                           encoding="utf-8", errors="ignore").read()
            for pat in NET_PATTERNS:
                if re.search(pat, content, re.IGNORECASE):
                    rel = os.path.relpath(os.path.join(root, f), cpp_root)
                    issues.append(f"{rel} matches `{pat}`")
    if issues:
        for i in issues:
            finding("C++ network pattern", "HIGH", i, "Review and remove")
    else:
        finding("C++ sources", "NONE", "No network patterns found", "")


def run_audit(project_root: str, output_path: str):
    print("\n" + "="*60)
    print("Janbhasha - Phase 9 Network Audit")
    print("="*60)
    audit_android_permissions(project_root)
    audit_python_requirements(project_root)
    audit_rn_packages(project_root)
    audit_cpp_sources(project_root)

    critical = sum(1 for f in FINDINGS if f["risk"] == "CRITICAL")
    high     = sum(1 for f in FINDINGS if f["risk"] == "HIGH")
    medium   = sum(1 for f in FINDINGS if f["risk"] == "MEDIUM")
    accepted = critical == 0 and high == 0

    summary = {
        "total": len(FINDINGS), "critical": critical,
        "high": high, "medium": medium,
        "network_audit_passed": accepted,
        "tested_at": datetime.utcnow().isoformat() + "Z",
    }
    output = {"summary": summary, "findings": FINDINGS}
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"AUDIT SUMMARY")
    print(f"  CRITICAL: {critical}")
    print(f"  HIGH:     {high}")
    print(f"  MEDIUM:   {medium}")
    print(f"  PASSED:   {'YES' if accepted else 'NO - resolve CRITICAL/HIGH first'}")
    print(f"  Results:  {output_path}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--project_root", default=".")
    parser.add_argument("--output", default="tests/network_audit/results.json")
    args = parser.parse_args()
    run_audit(args.project_root, args.output)
