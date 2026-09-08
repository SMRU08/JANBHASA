# Janbhasha — Bug Report Template
# Phase 9: Integration Testing & Edge-Device Validation
# =======================================================
# Copy this template for every bug found during Phase 9 testing.
# Save each bug as: tests/bugs/BUG-<ID>.md

## Bug ID: BUG-XXXX

**Severity:** [ ] P0  [ ] P1  [ ] P2  [ ] P3  [ ] P4

> P0 = App unusable / data loss / security issue  
> P1 = Core feature broken (ASR/NMT/TTS/offline fails)  
> P2 = Major usability / performance issue  
> P3 = Minor issue  
> P4 = Cosmetic

---

### Summary
<!-- One sentence description of the bug -->

### Device Under Test
| Field | Value |
|-------|-------|
| Device model | |
| Android version | |
| RAM | |
| CPU | |
| Build version | |
| Date found | |
| Found by | |

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behaviour
<!-- What should happen -->

### Actual Behaviour
<!-- What actually happens — be specific, include error messages -->

### Logs
```
<!-- adb logcat output or stack trace -->
```

### Memory at time of bug
| Metric | Value |
|--------|-------|
| Free RAM | MB |
| App PSS | MB |
| Alert level | normal / warning / critical / oom |

### Latency at time of bug
| Stage | Latency |
|-------|---------|
| ASR | ms |
| NMT | ms |
| TTS | ms |
| Total | ms |

### Reproducibility
[ ] Always (100%)  [ ] Often (>50%)  [ ] Sometimes (<50%)  [ ] Rare (<10%)

### Network audit during bug
[ ] Network was DISABLED (offline confirmed)  
[ ] Network was ENABLED (offline not confirmed — retest with network off)

### Root Cause (if known)
<!-- C++ layer / JSI / TypeScript / Kotlin / Audio / Model / OOM / other -->

### Proposed Fix

### Fix Status
[ ] Open  [ ] In Progress  [ ] Fixed  [ ] Won't Fix  [ ] Cannot Reproduce

### Fix Commit / PR
<!-- Link to fix -->

---

## Severity Reference

| Severity | Definition | Example |
|----------|------------|---------|
| P0 | App crashes unrecoverably / data lost / audio uploaded to cloud | OOM crash with no recovery; network request made at runtime |
| P1 | Core pipeline broken | ASR always returns empty; TTS always silent; NMT always errors |
| P2 | Degraded quality / high latency / partial failure | Pipeline > 10s; memory not released after unload; Bluetooth crash |
| P3 | Minor usability issue | UI label wrong; incorrect language shown; fallback message poor |
| P4 | Cosmetic | Font size; colour; alignment |
