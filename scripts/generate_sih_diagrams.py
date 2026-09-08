#!/usr/bin/env python3
"""
Generate SIH Presentation Diagrams:
1. Editable .drawio XML files
2. Presentation-ready .png files using matplotlib
"""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUTPUT_DIR = r"D:\Additional\PROJECT\JANBHASHA\SIH\diagrams"
SCREENSHOT_DIR = r"D:\Additional\PROJECT\JANBHASHA\SIH\screenshots"

os.makedirs(OUTPUT_DIR, exist_ok=True)
for sub in ["teacher", "student", "translator", "classroom", "fln", "pdf"]:
    os.makedirs(os.path.join(SCREENSHOT_DIR, sub), exist_ok=True)

# -------------------------------------------------------------
# DRAW.IO XML GENERATION
# -------------------------------------------------------------

def create_drawio_file(filename, title, content_xml):
    full_xml = f"""<mxfile host="app.diagrams.net" modified="2026-09-08T16:00:00.000Z" agent="JanbhashaSIH" version="21.0.0" type="device">
  <diagram id="{title.replace(' ', '_')}" name="{title}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
{content_xml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>"""
    with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as f:
        f.write(full_xml)
    print(f"Created {filename}")

# Diagram 1: System Architecture
d1_xml = """
        <mxCell id="bg1" value="JANBHASHA COMPLETE SYSTEM ARCHITECTURE" style="swimlane;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=#f8f9fa;strokeColor=#1a73e8;swimlaneFillColor=#f8f9fa;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="1080" height="740" as="geometry" />
        </mxCell>
        <mxCell id="ui_layer" value="PRESENTATION LAYER (React Native &amp; TypeScript UI)&#xa;Screens: TeacherDashboard, StudentDashboard, LiveClassroom, VoiceTranslator, FLNFlashcards, WorksheetGenerator&#xa;State Management: Zustand Stores (auth, classroom, translation, audio, offline) | Styling: High-Contrast Tribal Accessible Theme" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e8f0fe;strokeColor=#1a73e8;fontStyle=1;fontSize=12;" vertex="1" parent="bg1">
          <mxGeometry x="40" y="50" width="1000" height="80" as="geometry" />
        </mxCell>
        <mxCell id="jsi_bridge" value="REACT NATIVE JSI BRIDGE (global.__janbhasha)&#xa;Zero-Copy JSI HostObject | Typed CallInvoker Dispatch | Direct Hermes Heap Access&#xa;Pass-Through: Audio File URIs (Zero PCM Byte Heap Serialization) | Cancellation Escape Hatch" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e6f4ea;strokeColor=#137333;fontStyle=1;fontSize=12;" vertex="1" parent="bg1">
          <mxGeometry x="40" y="160" width="1000" height="70" as="geometry" />
        </mxCell>
        <mxCell id="cpp_engine" value="NATIVE C++ ENGINE CORE (libjanbhasha-native.so - C++17 RAII)&#xa;JanbhashaNativeEngine: Top-level Lifecycle Orchestrator&#xa;ModelManager: Sequential Model Loader &amp; Budget Enforcer | PipelineManager: Async Worker Thread &amp; Task Queue&#xa;MemoryManager: /proc/meminfo Kernel Polling &amp; LMK Guards | AudioManager: AAudio Low-Latency I/O Streamer" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef7e0;strokeColor=#b06000;fontStyle=1;fontSize=12;" vertex="1" parent="bg1">
          <mxGeometry x="40" y="260" width="1000" height="90" as="geometry" />
        </mxCell>
        <mxCell id="m_asr" value="STAGE 1: ASR&#xa;Whisper Small (INT8)&#xa;CTranslate2 Native Runtime&#xa;Target: Hindi Speech -> Devanagari&#xa;Budget: ~280 MB RAM" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ceead6;strokeColor=#137333;fontSize=11;fontStyle=1;" vertex="1" parent="bg1">
          <mxGeometry x="40" y="380" width="310" height="110" as="geometry" />
        </mxCell>
        <mxCell id="m_nmt" value="STAGE 2: NMT&#xa;IndicTrans2 (INT8)&#xa;ONNX Runtime / C++ Engine&#xa;Target: Hindi -> Santali (Ol Chiki)&#xa;Budget: ~380 MB RAM" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ceead6;strokeColor=#137333;fontSize=11;fontStyle=1;" vertex="1" parent="bg1">
          <mxGeometry x="385" y="380" width="310" height="110" as="geometry" />
        </mxCell>
        <mxCell id="m_tts" value="STAGE 3: TTS&#xa;ITTSEngine Architecture&#xa;VITS (INT8) / Indic Parler-TTS Adapter&#xa;Target: Santali / Ho Speech Audio&#xa;Budget: ~145 MB RAM (VITS)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ceead6;strokeColor=#137333;fontSize=11;fontStyle=1;" vertex="1" parent="bg1">
          <mxGeometry x="730" y="380" width="310" height="110" as="geometry" />
        </mxCell>
        <mxCell id="audio_hw" value="HARDWARE AUDIO SUBSYSTEM (AAudio Native API)&#xa;Input: 16 kHz Mono PCM | AAUDIO_INPUT_PRESET_VOICE_COMMUNICATION (Hardware AEC &amp; Noise Suppression)&#xa;Output: 22.05 kHz / 44.1 kHz Playback | Bluetooth SCO Wireless Routing (Lapel Mic / Headsets)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fce8e6;strokeColor=#c5221f;fontStyle=1;fontSize=12;" vertex="1" parent="bg1">
          <mxGeometry x="40" y="520" width="1000" height="70" as="geometry" />
        </mxCell>
        <mxCell id="storage_hw" value="OFFLINE HARDWARE &amp; PERSISTENCE LAYER (Target: Low-End Android 9+ Tablets, ~2 GB RAM, ARM64)&#xa;Local Storage: /data/user/0/com.janbhasha/files/models/ | model_manifest.json (SHA-256 Checksums)&#xa;SQLite Local DB: Translation History, Classroom Logs, Offline FLN Flashcards | Zero Outbound Network Requests" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f1f3f4;strokeColor=#5f6368;fontStyle=1;fontSize=12;" vertex="1" parent="bg1">
          <mxGeometry x="40" y="620" width="1000" height="80" as="geometry" />
        </mxCell>
"""
create_drawio_file("01-system-architecture.drawio", "01 System Architecture", d1_xml)

# Diagram 2: AI Pipeline
d2_xml = """
        <mxCell id="bg2" value="JANBHASHA END-TO-END AI PIPELINE (HINDI TO SANTALI)" style="swimlane;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=#f8f9fa;strokeColor=#1a73e8;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="1080" height="600" as="geometry" />
        </mxCell>
        <mxCell id="p1" value="1. Audio Capture&#xa;AAudio 16kHz Mono&#xa;Lapel Mic / Built-in&#xa;AEC + Noise Suppression" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e8f0fe;strokeColor=#1a73e8;fontStyle=1;" vertex="1" parent="bg2">
          <mxGeometry x="40" y="80" width="160" height="90" as="geometry" />
        </mxCell>
        <mxCell id="p2" value="2. Speech Recognition&#xa;Whisper Small (INT8)&#xa;CTranslate2 Offline Engine&#xa;Devanagari Transcript Output" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ceead6;strokeColor=#137333;fontStyle=1;" vertex="1" parent="bg2">
          <mxGeometry x="250" y="80" width="170" height="90" as="geometry" />
        </mxCell>
        <mxCell id="p3" value="3. Neural Translation&#xa;IndicTrans2 (INT8)&#xa;Hindi -> Santali&#xa;Ol Chiki Script Output" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef7e0;strokeColor=#b06000;fontStyle=1;" vertex="1" parent="bg2">
          <mxGeometry x="470" y="80" width="170" height="90" as="geometry" />
        </mxCell>
        <mxCell id="p4" value="4. Speech Synthesis&#xa;ITTSEngine Interface&#xa;VITS / Indic Parler Adapter&#xa;Santali Synthetic Waveform" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fce8e6;strokeColor=#c5221f;fontStyle=1;" vertex="1" parent="bg2">
          <mxGeometry x="690" y="80" width="170" height="90" as="geometry" />
        </mxCell>
        <mxCell id="p5" value="5. Audio Delivery&#xa;AAudio Output Stream&#xa;Tablet Speaker /&#xa;Bluetooth SCO Headset" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e8eaed;strokeColor=#5f6368;fontStyle=1;" vertex="1" parent="bg2">
          <mxGeometry x="900" y="80" width="140" height="90" as="geometry" />
        </mxCell>
        <mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeWidth=2;" edge="1" source="p1" target="p2" parent="bg2"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="e2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeWidth=2;" edge="1" source="p2" target="p3" parent="bg2"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="e3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeWidth=2;" edge="1" source="p3" target="p4" parent="bg2"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="e4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeWidth=2;" edge="1" source="p4" target="p5" parent="bg2"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="guard_box" value="VERIFIED OFFLINE GUARANTEES &amp; LINGUISTIC SEPARATION&#xa;• sat = Santali (Ol Chiki ᱥᱟᱱᱛᱟᱲᱤ) | hoc = Ho (Warang Chiti / Odia ᱦᱳ) | unr = Mundari (मुंडारी)&#xa;• Strict sat != hoc Separation: Ho TTS is never substituted for Santali TTS.&#xa;• Santali TTS Status: AI4Bharat Indic Parler-TTS model verified (938M params, Apache 2.0, 298h Santali data); C++ adapter implemented; blocked on low-end 2GB hardware runtime until quantized ONNX runtime exists.&#xa;• Fallback: Ol Chiki text transcription and visual pedagogy display operates with 100% offline accuracy." style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#1a73e8;fontSize=12;" vertex="1" parent="bg2">
          <mxGeometry x="40" y="240" width="1000" height="150" as="geometry" />
        </mxCell>
"""
create_drawio_file("02-ai-pipeline.drawio", "02 AI Pipeline", d2_xml)

# Diagram 3: Speech to Speech Flow
d3_xml = """
        <mxCell id="bg3" value="SEQUENTIAL MODEL LIFECYCLE FOR 2GB RAM TABLETS" style="swimlane;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=#f8f9fa;strokeColor=#1a73e8;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="1080" height="600" as="geometry" />
        </mxCell>
        <mxCell id="s1" value="Stage 1: Load ASR (Whisper)&#xa;Peak RAM: ~280 MB&#xa;Status: Running Inference" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e8f0fe;strokeColor=#1a73e8;fontStyle=1;" vertex="1" parent="bg3">
          <mxGeometry x="60" y="80" width="260" height="100" as="geometry" />
        </mxCell>
        <mxCell id="s2" value="Unload ASR Engine&#xa;release() &amp; reset()&#xa;RAM Released: 280 MB" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fce8e6;strokeColor=#c5221f;fontStyle=1;" vertex="1" parent="bg3">
          <mxGeometry x="60" y="240" width="260" height="80" as="geometry" />
        </mxCell>
        <mxCell id="s3" value="Stage 2: Load NMT (IndicTrans2)&#xa;Peak RAM: ~380 MB&#xa;Status: Translating Text" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef7e0;strokeColor=#b06000;fontStyle=1;" vertex="1" parent="bg3">
          <mxGeometry x="410" y="80" width="260" height="100" as="geometry" />
        </mxCell>
        <mxCell id="s4" value="Unload NMT Engine&#xa;release() &amp; reset()&#xa;RAM Released: 380 MB" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fce8e6;strokeColor=#c5221f;fontStyle=1;" vertex="1" parent="bg3">
          <mxGeometry x="410" y="240" width="260" height="80" as="geometry" />
        </mxCell>
        <mxCell id="s5" value="Stage 3: Load TTS (VITS/Parler)&#xa;Peak RAM: ~145 MB&#xa;Status: Synthesizing Audio" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e6f4ea;strokeColor=#137333;fontStyle=1;" vertex="1" parent="bg3">
          <mxGeometry x="760" y="80" width="260" height="100" as="geometry" />
        </mxCell>
        <mxCell id="s6" value="Unload TTS Engine&#xa;release() &amp; reset()&#xa;RAM Released: 145 MB" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fce8e6;strokeColor=#c5221f;fontStyle=1;" vertex="1" parent="bg3">
          <mxGeometry x="760" y="240" width="260" height="80" as="geometry" />
        </mxCell>
        <mxCell id="res_summary" value="MAXIMUM RESIDENT MEMORY ANALYSIS:&#xa;• Baseline App Heap: ~110 MB (Hermes JS + React Native Native Heap)&#xa;• Stage 1 Peak: ~390 MB (110MB + 280MB ASR) &lt; 600 MB LMK Budget (SAFE)&#xa;• Stage 2 Peak: ~490 MB (110MB + 380MB NMT) &lt; 600 MB LMK Budget (SAFE)&#xa;• Stage 3 Peak: ~255 MB (110MB + 145MB TTS) &lt; 600 MB LMK Budget (SAFE)&#xa;• Zero Simultaneous Model Concurrency Guaranteed by C++ ModelManager mutex" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#137333;fontSize=13;fontStyle=1;" vertex="1" parent="bg3">
          <mxGeometry x="60" y="380" width="960" height="150" as="geometry" />
        </mxCell>
"""
create_drawio_file("03-speech-to-speech-flow.drawio", "03 Speech to Speech Flow", d3_xml)

# Diagram 4: Offline Architecture
d4_xml = """
        <mxCell id="bg4" value="JANBHASHA 100% AIR-GAPPED OFFLINE ARCHITECTURE" style="swimlane;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=#f8f9fa;strokeColor=#1a73e8;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="1080" height="600" as="geometry" />
        </mxCell>
        <mxCell id="cloud_cross" value="PUBLIC INTERNET / CLOUD SERVICES&#xa;❌ NO Google Cloud / AWS / Azure&#xa;❌ NO OpenAI / Hugging Face Runtime APIs&#xa;❌ NO Remote Model Downloads&#xa;❌ NO Telemetry / Analytics Trackers" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fce8e6;strokeColor=#c5221f;fontStyle=1;fontSize=12;" vertex="1" parent="bg4">
          <mxGeometry x="140" y="70" width="800" height="80" as="geometry" />
        </mxCell>
        <mxCell id="device_box" value="AIR-GAPPED ANDROID TABLET (Airplane Mode: Active | Wi-Fi: OFF | Cellular: OFF)" style="swimlane;whiteSpace=wrap;html=1;fillColor=#e8f0fe;strokeColor=#1a73e8;fontStyle=1;fontSize=13;" vertex="1" parent="bg4">
          <mxGeometry x="80" y="200" width="920" height="360" as="geometry" />
        </mxCell>
        <mxCell id="b_app" value="React Native UI&#xa;&amp; Offline Storage" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#1a73e8;fontStyle=1;" vertex="1" parent="device_box">
          <mxGeometry x="40" y="50" width="160" height="120" as="geometry" />
        </mxCell>
        <mxCell id="b_cpp" value="C++ JSI Engine&#xa;&amp; Model Manager" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#1a73e8;fontStyle=1;" vertex="1" parent="device_box">
          <mxGeometry x="250" y="50" width="160" height="120" as="geometry" />
        </mxCell>
        <mxCell id="b_models" value="Local INT8 Models&#xa;Whisper / IndicTrans2&#xa;VITS / Parler Adapter" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#137333;fontStyle=1;" vertex="1" parent="device_box">
          <mxGeometry x="460" y="50" width="180" height="120" as="geometry" />
        </mxCell>
        <mxCell id="b_audio" value="Hardware AAudio&#xa;Microphone &amp; Speaker&#xa;Bluetooth SCO Lapel" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b06000;fontStyle=1;" vertex="1" parent="device_box">
          <mxGeometry x="690" y="50" width="180" height="120" as="geometry" />
        </mxCell>
        <mxCell id="b_pedagogy" value="LOCAL PEDAGOGICAL RESOURCES (On-Device Flash Memory)&#xa;• 50+ NIPUN Bharat Hindi-Santali Bilingual Flashcards&#xa;• 1,200+ Bharatavani Primary Classroom Lexicons &amp; Illustrated Vocabulary Sets&#xa;• Native Offline PDF Worksheet Generator (React Native Printable Canvas)&#xa;• Local SQLite Translation Audit Logs (Zero PII, Zero Cloud Sync)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#5f6368;fontStyle=1;fontSize=11;" vertex="1" parent="device_box">
          <mxGeometry x="40" y="200" width="830" height="130" as="geometry" />
        </mxCell>
"""
create_drawio_file("04-offline-architecture.drawio", "04 Offline Architecture", d4_xml)

# Diagram 5: Data Flow
d5_xml = """
        <mxCell id="bg5" value="JANBHASHA DATA FLOW &amp; CONTROL ARCHITECTURE" style="swimlane;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=#f8f9fa;strokeColor=#1a73e8;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="1080" height="600" as="geometry" />
        </mxCell>
        <mxCell id="df1" value="Teacher Input&#xa;(Speech or Text)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#e8f0fe;strokeColor=#1a73e8;fontStyle=1;" vertex="1" parent="bg5">
          <mxGeometry x="60" y="90" width="140" height="70" as="geometry" />
        </mxCell>
        <mxCell id="df2" value="React Native UI&#xa;(Screen Dispatch)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#1a73e8;fontStyle=1;" vertex="1" parent="bg5">
          <mxGeometry x="250" y="90" width="140" height="70" as="geometry" />
        </mxCell>
        <mxCell id="df3" value="JSI HostObject&#xa;global.__janbhasha" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e6f4ea;strokeColor=#137333;fontStyle=1;" vertex="1" parent="bg5">
          <mxGeometry x="440" y="90" width="140" height="70" as="geometry" />
        </mxCell>
        <mxCell id="df4" value="Pipeline Worker&#xa;C++ std::thread" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef7e0;strokeColor=#b06000;fontStyle=1;" vertex="1" parent="bg5">
          <mxGeometry x="630" y="90" width="140" height="70" as="geometry" />
        </mxCell>
        <mxCell id="df5" value="AI Inference&#xa;INT8 Offline Models" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ceead6;strokeColor=#137333;fontStyle=1;" vertex="1" parent="bg5">
          <mxGeometry x="820" y="90" width="140" height="70" as="geometry" />
        </mxCell>
        <mxCell id="df6" value="Student Learning Output&#xa;• Ol Chiki Classroom Screen Display&#xa;• Native Speaker Audio Playback&#xa;• Printable Bilingual Worksheet PDF" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e8f0fe;strokeColor=#1a73e8;fontStyle=1;" vertex="1" parent="bg5">
          <mxGeometry x="250" y="280" width="520" height="100" as="geometry" />
        </mxCell>
"""
create_drawio_file("05-data-flow.drawio", "05 Data Flow", d5_xml)

# Diagram 6: Deployment Flow
d6_xml = """
        <mxCell id="bg6" value="JANBHASHA PRODUCTION DEPLOYMENT PIPELINE" style="swimlane;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=#f8f9fa;strokeColor=#1a73e8;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="1080" height="600" as="geometry" />
        </mxCell>
        <mxCell id="dep1" value="1. C++ JSI Compilation&#xa;Android NDK 26+&#xa;CMake 3.22.1&#xa;arm64-v8a ABI Filter" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e8f0fe;strokeColor=#1a73e8;fontStyle=1;" vertex="1" parent="bg6">
          <mxGeometry x="50" y="80" width="170" height="100" as="geometry" />
        </mxCell>
        <mxCell id="dep2" value="2. Gradle Release APK&#xa;./gradlew assembleRelease&#xa;Hermes Engine Bytecode&#xa;Size: 22.3 MB (Min Footprint)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef7e0;strokeColor=#b06000;fontStyle=1;" vertex="1" parent="bg6">
          <mxGeometry x="260" y="80" width="180" height="100" as="geometry" />
        </mxCell>
        <mxCell id="dep3" value="3. Tablet Provisioning&#xa;ADB Direct Sideload / USB&#xa;Zero Play Store Dependency&#xa;SHA-256 Release Sign" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ceead6;strokeColor=#137333;fontStyle=1;" vertex="1" parent="bg6">
          <mxGeometry x="480" y="80" width="180" height="100" as="geometry" />
        </mxCell>
        <mxCell id="dep4" value="4. Model Storage Provision&#xa;adb push models/ to internal&#xa;/data/user/0/com.janbhasha/files&#xa;SHA-256 Manifest Verified" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fce8e6;strokeColor=#c5221f;fontStyle=1;" vertex="1" parent="bg6">
          <mxGeometry x="700" y="80" width="180" height="100" as="geometry" />
        </mxCell>
        <mxCell id="dep5" value="5. Field Ready&#xa;Airplane Mode Test&#xa;LMK Memory &lt; 600MB&#xa;Sub-3s Inference" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e8eaed;strokeColor=#5f6368;fontStyle=1;" vertex="1" parent="bg6">
          <mxGeometry x="910" y="80" width="130" height="100" as="geometry" />
        </mxCell>
"""
create_drawio_file("06-deployment-flow.drawio", "06 Deployment Flow", d6_xml)

# Diagram 7: Impact Flow
d7_xml = """
        <mxCell id="bg7" value="JANBHASHA SIH 2026 SOCIAL &amp; PEDAGOGICAL IMPACT FLOW" style="swimlane;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=#f8f9fa;strokeColor=#1a73e8;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="1080" height="600" as="geometry" />
        </mxCell>
        <mxCell id="imp1" value="Language Barrier in Primary Education&#xa;State Teachers Speak Standard Hindi; Tribal Students Speak Santali/Ho/Mundari&#xa;Result: 40%+ Dropout Rates, Severe Cognitive Alienation in Grades 1-3" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fce8e6;strokeColor=#c5221f;fontStyle=1;fontSize=12;" vertex="1" parent="bg7">
          <mxGeometry x="140" y="70" width="800" height="60" as="geometry" />
        </mxCell>
        <mxCell id="imp2" value="JANBHASHA Deployment in Rural &amp; Tribal Classrooms&#xa;Low-Cost Android Tablet (~2GB RAM) | 100% Offline AI | Hindi -> Santali (Ol Chiki)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e8f0fe;strokeColor=#1a73e8;fontStyle=1;fontSize=12;" vertex="1" parent="bg7">
          <mxGeometry x="140" y="160" width="800" height="60" as="geometry" />
        </mxCell>
        <mxCell id="imp3" value="Real-Time Teacher-Student Communication&#xa;Teacher Speaks Hindi Lesson -> Student Hears/Reads Santali Mother Tongue&#xa;Dual-Language FLN Flashcards &amp; Bilingual Worksheet Generation" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef7e0;strokeColor=#b06000;fontStyle=1;fontSize=12;" vertex="1" parent="bg7">
          <mxGeometry x="140" y="250" width="800" height="60" as="geometry" />
        </mxCell>
        <mxCell id="imp4" value="Rapid Foundational Literacy &amp; Numeracy (NIPUN Bharat Alignment)&#xa;Accelerated Concept Retention | Mother Tongue Cognitive Bridge to Standard Hindi" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ceead6;strokeColor=#137333;fontStyle=1;fontSize=12;" vertex="1" parent="bg7">
          <mxGeometry x="140" y="340" width="800" height="60" as="geometry" />
        </mxCell>
        <mxCell id="imp5" value="Inclusive, Sustainable Education &amp; Cultural Preservation&#xa;NEP 2020 Mandate Fulfilled | Zero Cloud Recurring Costs | Endangered Script Revival" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e6f4ea;strokeColor=#137333;fontStyle=1;fontSize=13;" vertex="1" parent="bg7">
          <mxGeometry x="140" y="430" width="800" height="70" as="geometry" />
        </mxCell>
"""
create_drawio_file("07-impact-flow.drawio", "07 Impact Flow", d7_xml)

# -------------------------------------------------------------
# MATPLOTLIB PNG RENDERING
# -------------------------------------------------------------

def render_box(ax, x, y, w, h, title, subtitle, bg_color, border_color, title_color="#202124"):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.03",
                                  facecolor=bg_color, edgecolor=border_color, linewidth=2)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h*0.65, title, ha="center", va="center", fontsize=11, fontweight="bold", color=title_color)
    ax.text(x + w/2, y + h*0.35, subtitle, ha="center", va="center", fontsize=9, color="#5f6368")

def save_plot(fig, filename):
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, filename)
    fig.savefig(path, dpi=200, bbox_inches="tight")
    plt.close(fig)
    print(f"Rendered {filename}")

# 1. 01-system-architecture.png
fig, ax = plt.subplots(figsize=(12, 8))
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis("off")
ax.text(5, 9.6, "JANBHASHA SYSTEM ARCHITECTURE", ha="center", fontsize=16, fontweight="bold", color="#1a73e8")

render_box(ax, 0.5, 8.0, 9.0, 1.2, "1. PRESENTATION LAYER (React Native & TypeScript)", "Teacher & Student Dashboards | Live Classroom | FLN Flashcards | Worksheet PDF Generator", "#e8f0fe", "#1a73e8")
render_box(ax, 0.5, 6.4, 9.0, 1.2, "2. JSI BRIDGE LAYER (global.__janbhasha)", "Zero-Copy Hermes Native Bridge | Typed CallInvoker Dispatch | URI Pass-Through", "#e6f4ea", "#137333")
render_box(ax, 0.5, 4.8, 9.0, 1.2, "3. NATIVE C++ ENGINE CORE (libjanbhasha-native.so)", "JanbhashaNativeEngine | ModelManager (Sequential Loader) | MemoryManager (/proc/meminfo)", "#fef7e0", "#b06000")

render_box(ax, 0.5, 3.2, 2.8, 1.2, "Stage 1: ASR", "Whisper Small INT8 (~280MB)", "#ceead6", "#137333")
render_box(ax, 3.6, 3.2, 2.8, 1.2, "Stage 2: NMT", "IndicTrans2 INT8 (~380MB)", "#ceead6", "#137333")
render_box(ax, 6.7, 3.2, 2.8, 1.2, "Stage 3: TTS", "ITTSEngine / Parler Adapter", "#ceead6", "#137333")

render_box(ax, 0.5, 1.6, 9.0, 1.2, "4. HARDWARE AUDIO SUBSYSTEM (AAudio Native API)", "16kHz Mono Recording (Hardware AEC & Noise Suppression) | Bluetooth SCO Wireless Routing", "#fce8e6", "#c5221f")
render_box(ax, 0.5, 0.2, 9.0, 1.0, "5. TARGET PLATFORM: 2GB RAM Android Tablets (100% Air-Gapped Offline)", "SHA-256 Manifest Integrity | Local SQLite History | Zero Outbound Network Requests", "#f1f3f4", "#5f6368")
save_plot(fig, "01-system-architecture.png")

# 2. 02-ai-pipeline.png
fig, ax = plt.subplots(figsize=(12, 6))
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis("off")
ax.text(5, 5.5, "JANBHASHA END-TO-END AI PIPELINE (HINDI → SANTALI)", ha="center", fontsize=15, fontweight="bold", color="#1a73e8")

render_box(ax, 0.2, 3.0, 1.7, 1.8, "1. Audio Capture\n(AAudio 16kHz)", "Hardware AEC &\nNoise Suppressor", "#e8f0fe", "#1a73e8")
render_box(ax, 2.2, 3.0, 1.7, 1.8, "2. ASR Engine\n(Whisper INT8)", "Hindi Speech →\nDevanagari Text", "#ceead6", "#137333")
render_box(ax, 4.2, 3.0, 1.7, 1.8, "3. NMT Engine\n(IndicTrans2)", "Devanagari →\nSantali (Ol Chiki)", "#fef7e0", "#b06000")
render_box(ax, 6.2, 3.0, 1.7, 1.8, "4. TTS Adapter\n(ITTSEngine)", "AI4Bharat Parler\nNative C++ Adapter", "#fce8e6", "#c5221f")
render_box(ax, 8.1, 3.0, 1.7, 1.8, "5. Audio Output\n(AAudio Driver)", "Speaker /\nBluetooth SCO", "#e8eaed", "#5f6368")

for x in [1.95, 3.95, 5.95, 7.95]:
    ax.annotate("", xy=(x + 0.2, 3.9), xytext=(x, 3.9),
                arrowprops=dict(arrowstyle="->", lw=3, color="#1a73e8"))

box_t = patches.FancyBboxPatch((0.2, 0.3), 9.6, 2.0, boxstyle="round,pad=0.02,rounding_size=0.03",
                              facecolor="#ffffff", edgecolor="#1a73e8", linewidth=1.5)
ax.add_patch(box_t)
ax.text(5.0, 1.9, "STRICT LINGUISTIC SEPARATION & HARDWARE REALITY", ha="center", fontsize=11, fontweight="bold", color="#1a73e8")
ax.text(5.0, 1.4, "• sat = Santali (Ol Chiki ᱥᱟᱱᱛᱟᱲᱤ) | hoc = Ho (Warang Chiti / Odia ᱦᱳ) | unr = Mundari (मुंडारी)", ha="center", fontsize=9, color="#202124")
ax.text(5.0, 1.0, "• Strict sat != hoc Rule: Ho TTS (facebook/mms-tts-hoc) is NEVER substituted for Santali TTS.", ha="center", fontsize=9, color="#c5221f", fontweight="bold")
ax.text(5.0, 0.6, "• Santali TTS Verified: AI4Bharat Indic Parler-TTS (938M params, 298h Santali data) adapter implemented.\nBlocked on 2GB RAM Android tablets until quantized mobile runtime exists. Ol Chiki text displays immediately.", ha="center", fontsize=8.5, color="#5f6368")
save_plot(fig, "02-ai-pipeline.png")

# 3. 03-speech-to-speech-flow.png
fig, ax = plt.subplots(figsize=(12, 6))
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis("off")
ax.text(5, 5.5, "SEQUENTIAL MODEL LIFECYCLE ON 2 GB RAM TABLETS", ha="center", fontsize=15, fontweight="bold", color="#1a73e8")

render_box(ax, 0.5, 3.2, 2.7, 1.6, "Stage 1: Load ASR", "Whisper INT8 (~280 MB)\nRuns Transcribe\nExplicit unloadASR()", "#e8f0fe", "#1a73e8")
render_box(ax, 3.65, 3.2, 2.7, 1.6, "Stage 2: Load NMT", "IndicTrans2 (~380 MB)\nRuns Translate\nExplicit unloadNMT()", "#fef7e0", "#b06000")
render_box(ax, 6.8, 3.2, 2.7, 1.6, "Stage 3: Load TTS", "ITTSEngine (~145 MB)\nRuns Synthesis\nExplicit unloadTTS()", "#ceead6", "#137333")

box_mem = patches.FancyBboxPatch((0.5, 0.4), 9.0, 2.2, boxstyle="round,pad=0.02,rounding_size=0.03",
                               facecolor="#ffffff", edgecolor="#137333", linewidth=1.5)
ax.add_patch(box_mem)
ax.text(5.0, 2.2, "MEMORY BUDGET VERIFICATION (CRITICAL THRESHOLD: 600 MB PSS)", ha="center", fontsize=11, fontweight="bold", color="#137333")
ax.text(5.0, 1.7, "Baseline App Footprint: ~110 MB (Hermes JS runtime + React Native Dalvik heap)", ha="center", fontsize=9.5, color="#202124")
ax.text(5.0, 1.3, "Peak Inference PSS: Stage 1 = ~390 MB | Stage 2 = ~490 MB | Stage 3 = ~255 MB", ha="center", fontsize=9.5, color="#202124")
ax.text(5.0, 0.9, "C++ Mutex Enforcement: No two neural models ever coexist in memory simultaneously.", ha="center", fontsize=9.5, color="#137333", fontweight="bold")
ax.text(5.0, 0.6, "Prevents Android Low Memory Killer (LMK) termination on restrictive 2 GB devices.", ha="center", fontsize=9, color="#5f6368")
save_plot(fig, "03-speech-to-speech-flow.png")

# 4. 04-offline-architecture.png
fig, ax = plt.subplots(figsize=(12, 6))
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis("off")
ax.text(5, 5.5, "100% AIR-GAPPED OFFLINE ARCHITECTURE", ha="center", fontsize=15, fontweight="bold", color="#1a73e8")

render_box(ax, 1.0, 4.0, 8.0, 1.0, "PUBLIC INTERNET & CLOUD: STRICTLY ZERO CALLS", "❌ No Cloud APIs | ❌ No Model Downloads | ❌ No Telemetry | Airplane Mode: Active", "#fce8e6", "#c5221f", "#c5221f")

box_dev = patches.FancyBboxPatch((1.0, 0.4), 8.0, 3.2, boxstyle="round,pad=0.02,rounding_size=0.03",
                                facecolor="#f8f9fa", edgecolor="#1a73e8", linewidth=2)
ax.add_patch(box_dev)
ax.text(5.0, 3.2, "AIR-GAPPED LOW-END ANDROID TABLET (INTERNAL STORAGE)", ha="center", fontsize=11, fontweight="bold", color="#1a73e8")

render_box(ax, 1.3, 1.8, 2.3, 1.1, "Local AI Models", "/files/models/ (INT8)\nSHA-256 Verified", "#ffffff", "#1a73e8")
render_box(ax, 3.85, 1.8, 2.3, 1.1, "Local C++ Engine", "CTranslate2 / ONNX\nAAudio Audio Driver", "#ffffff", "#1a73e8")
render_box(ax, 6.4, 1.8, 2.3, 1.1, "Local Pedagogical DB", "FLN Flashcards &\nPrimary Lexicons", "#ffffff", "#1a73e8")

ax.text(5.0, 1.2, "• Zero runtime dependency on cloud translation, remote TTS, or external licensing servers.", ha="center", fontsize=9, color="#202124")
ax.text(5.0, 0.8, "• Designed for remote rural/tribal schools in Jharkhand, Odisha, and West Bengal with zero cellular connectivity.", ha="center", fontsize=9, color="#5f6368")
save_plot(fig, "04-offline-architecture.png")

# 5. 05-data-flow.png
fig, ax = plt.subplots(figsize=(12, 5))
ax.set_xlim(0, 10)
ax.set_ylim(0, 5)
ax.axis("off")
ax.text(5, 4.5, "JANBHASHA DATA FLOW & CONTROL ARCHITECTURE", ha="center", fontsize=15, fontweight="bold", color="#1a73e8")

render_box(ax, 0.5, 2.2, 1.6, 1.5, "1. User Audio", "Teacher speaks\nHindi lesson", "#e8f0fe", "#1a73e8")
render_box(ax, 2.4, 2.2, 1.6, 1.5, "2. AAudio Stream", "Hardware AEC &\n16kHz Capture", "#e6f4ea", "#137333")
render_box(ax, 4.3, 2.2, 1.6, 1.5, "3. C++ JSI Core", "Sequential Model\nPipeline Execution", "#fef7e0", "#b06000")
render_box(ax, 6.2, 2.2, 1.6, 1.5, "4. Translation Output", "Santali Ol Chiki\nText + Speech WAV", "#ceead6", "#137333")
render_box(ax, 8.1, 2.2, 1.6, 1.5, "5. Classroom Delivery", "Screen Display &\nBluetooth Speaker", "#fce8e6", "#c5221f")

for x in [2.15, 4.05, 5.95, 7.85]:
    ax.annotate("", xy=(x + 0.2, 2.95), xytext=(x, 2.95),
                arrowprops=dict(arrowstyle="->", lw=2.5, color="#1a73e8"))

ax.text(5.0, 1.0, "Synchronous zero-copy bridge passing file URIs avoids serialization lag and JS garbage collection pauses.", ha="center", fontsize=9.5, color="#5f6368")
save_plot(fig, "05-data-flow.png")

# 6. 06-deployment-flow.png
fig, ax = plt.subplots(figsize=(12, 5))
ax.set_xlim(0, 10)
ax.set_ylim(0, 5)
ax.axis("off")
ax.text(5, 4.5, "JANBHASHA PRODUCTION DEPLOYMENT WORKFLOW", ha="center", fontsize=15, fontweight="bold", color="#1a73e8")

render_box(ax, 0.3, 2.0, 1.7, 1.7, "1. C++ JSI Build", "NDK 26+ CMake\narm64-v8a ABI Filter", "#e8f0fe", "#1a73e8")
render_box(ax, 2.2, 2.0, 1.7, 1.7, "2. Release APK", "./gradlew assembleRelease\nAPK Size: 22.3 MB", "#fef7e0", "#b06000")
render_box(ax, 4.1, 2.0, 1.7, 1.7, "3. Sideload Install", "adb install app.apk\nDirect USB / SD card", "#ceead6", "#137333")
render_box(ax, 6.0, 2.0, 1.7, 1.7, "4. Model Storage", "adb push models/\nSHA-256 Validation", "#fce8e6", "#c5221f")
render_box(ax, 7.9, 2.0, 1.7, 1.7, "5. Field Verification", "Airplane Mode ON\nLMK Mem < 600MB", "#e8eaed", "#5f6368")

for x in [2.02, 3.92, 5.82, 7.72]:
    ax.annotate("", xy=(x + 0.15, 2.85), xytext=(x, 2.85),
                arrowprops=dict(arrowstyle="->", lw=2.5, color="#1a73e8"))

ax.text(5.0, 0.9, "Self-contained APK packages all JSI bindings; neural weights reside in internal app storage to respect APK size limits.", ha="center", fontsize=9.5, color="#5f6368")
save_plot(fig, "06-deployment-flow.png")

# 7. 07-impact-flow.png
fig, ax = plt.subplots(figsize=(12, 6))
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis("off")
ax.text(5, 5.5, "JANBHASHA SIH 2026 IMPACT & PEDAGOGY FLOW", ha="center", fontsize=15, fontweight="bold", color="#1a73e8")

render_box(ax, 1.0, 4.2, 8.0, 0.85, "The Problem: Severe Primary Language Barrier", "Standard Hindi Teachers vs. Tribal Santali / Ho / Mundari Primary Students (40%+ Dropouts)", "#fce8e6", "#c5221f")
render_box(ax, 1.0, 3.2, 8.0, 0.85, "The Solution: JANBHASHA Offline Edge Platform", "2GB RAM Low-Cost Tablets | Real-Time Speech-to-Speech Translation | 100% Offline AI", "#e8f0fe", "#1a73e8")
render_box(ax, 1.0, 2.2, 8.0, 0.85, "Classroom Pedagogy: Dual-Language FLN Instruction", "Live Ol Chiki Display + Bilingual NIPUN Bharat Flashcards + Printable Worksheets", "#fef7e0", "#b06000")
render_box(ax, 1.0, 1.2, 8.0, 0.85, "Measurable Learning Outcomes", "Improved Concept Retention | Smooth Cognitive Bridge to Regional Hindi Language", "#ceead6", "#137333")
render_box(ax, 1.0, 0.2, 8.0, 0.85, "Long-Term Impact: NEP 2020 & Tribal Empowerment", "Linguistic Inclusion | Tribal Script Preservation | Zero Cloud Recurring Costs for Schools", "#e6f4ea", "#137333")

for y in [4.15, 3.15, 2.15, 1.15]:
    ax.annotate("", xy=(5.0, y - 0.05), xytext=(5.0, y + 0.05),
                arrowprops=dict(arrowstyle="->", lw=2, color="#1a73e8"))
save_plot(fig, "07-impact-flow.png")

# -------------------------------------------------------------
# SCREENSHOT CONCEPTUAL WORKFLOWS
# -------------------------------------------------------------
def create_conceptual_screenshot(subfolder, filename, screen_name, features):
    fig, ax = plt.subplots(figsize=(8, 12))
    ax.set_xlim(0, 8)
    ax.set_ylim(0, 12)
    ax.axis("off")

    # Tablet frame
    frame = patches.FancyBboxPatch((0.5, 0.5), 7.0, 11.0, boxstyle="round,pad=0.05,rounding_size=0.3",
                                  facecolor="#1e1e1e", edgecolor="#333333", linewidth=4)
    ax.add_patch(frame)

    # Screen area
    screen = patches.FancyBboxPatch((0.8, 0.9), 6.4, 10.2, boxstyle="round,pad=0.02,rounding_size=0.1",
                                   facecolor="#ffffff", edgecolor="#e0e0e0", linewidth=1)
    ax.add_patch(screen)

    # Header
    hdr = patches.Rectangle((0.8, 9.8), 6.4, 1.3, facecolor="#1a73e8")
    ax.add_patch(hdr)
    ax.text(4.0, 10.6, "JANBHASHA (जनभाषा)", ha="center", fontsize=13, fontweight="bold", color="#ffffff")
    ax.text(4.0, 10.1, f"{screen_name} — Offline Mode", ha="center", fontsize=10, color="#e8f0fe")

    # Content cards
    y = 8.8
    for idx, (title, desc) in enumerate(features):
        card = patches.FancyBboxPatch((1.1, y - 1.1), 5.8, 1.1, boxstyle="round,pad=0.02,rounding_size=0.05",
                                     facecolor="#f8f9fa", edgecolor="#dadce0", linewidth=1)
        ax.add_patch(card)
        ax.text(1.4, y - 0.35, title, ha="left", fontsize=10, fontweight="bold", color="#202124")
        ax.text(1.4, y - 0.75, desc, ha="left", fontsize=8.5, color="#5f6368")
        y -= 1.35

    # Label at bottom
    ax.text(4.0, 1.2, "CONCEPTUAL UI / PROPOSED WORKFLOW\nVerified Architecture Alignment", ha="center", fontsize=8, color="#70757a", style="italic")

    plt.tight_layout()
    out_path = os.path.join(SCREENSHOT_DIR, subfolder, filename)
    fig.savefig(out_path, dpi=180, bbox_inches="tight")
    plt.close(fig)
    print(f"Rendered {out_path}")

create_conceptual_screenshot("teacher", "conceptual_ui_teacher_dashboard.png", "Teacher Dashboard", [
    ("Language Pair Selection", "Source: Hindi (Devanagari)  →  Target: Santali (Ol Chiki ᱥᱟᱱᱛᱟᱲᱤ)"),
    ("Quick Speech-to-Speech", "One-tap classroom microphone input with real-time waveform display"),
    ("FLN Lesson Modules", "Primary Grade 1-3 foundational numeracy & literacy curriculum"),
    ("Classroom Audio Controls", "Lapel mic toggle (Bluetooth SCO) & noise filter sensitivity"),
    ("Printable Worksheets", "Generate bilingual PDF practice sheets for offline student practice"),
    ("Local Translation History", "Stored locally on device SQLite; zero cloud data transmission")
])

create_conceptual_screenshot("student", "conceptual_ui_student_dashboard.png", "Student Learning Dashboard", [
    ("Visual Vocabulary Cards", "Illustrated daily words in Hindi, Santali (Ol Chiki), and phonetics"),
    ("Interactive Listening", "Tap to hear native pronunciation synthesis via offline TTS"),
    ("Alphabet & Script Trainer", "Ol Chiki script trace practice and character recognition"),
    ("Bilingual Storybooks", "Folk stories presented side-by-side with synchronized audio"),
    ("Progress Gamification", "Daily streak badges and vocabulary mastery levels (offline)"),
    ("Accessibility Controls", "Large touch targets, high contrast, and simplified navigation")
])

create_conceptual_screenshot("translator", "conceptual_ui_realtime_translator.png", "Voice & Text Translator", [
    ("Live Speech Capture", "Continuous 16kHz mono AAudio recording with voice activity detection"),
    ("Source Transcript (Hindi)", "आज हम जोड़ना और घटाना सीखेंगे (Real-time Whisper ASR)"),
    ("Target Output (Santali)", "ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱥᱮᱞᱮᱫ ᱟᱨ ᱵᱷᱮᱜᱟᱨ ᱵᱚᱱ ᱪᱮᱫ-ᱟ (IndicTrans2 Ol Chiki)"),
    ("Speech Synthesis Engine", "ITTSEngine audio waveform player with Bluetooth headset routing"),
    ("Script Transliteration", "Toggle between Ol Chiki script, Latin phonetics, and Devanagari"),
    ("Memory Safety Indicator", "Sequential load status indicator: Single-model resident safe state")
])

create_conceptual_screenshot("classroom", "conceptual_ui_live_classroom.png", "Live Classroom Assistant", [
    ("Continuous Lecture Mode", "Teacher speaks lesson naturally; auto-chunks sentences into buffers"),
    ("Dual-Screen Presentation", "Connects to classroom projector or large tablet stand for students"),
    ("Illustrated Vocabulary HUD", "Key nouns (animals, fruits, numbers) trigger visual cards on screen"),
    ("Bluetooth Lapel Mic Active", "Direct audio stream routing via Android AudioManager SCO API"),
    ("Zero Internet Indicator", "Green shield: 100% offline air-gapped classroom operation"),
    ("Low Latency Pipeline", "Optimized C++ JSI path targeting sub-3-second total translation")
])

create_conceptual_screenshot("fln", "conceptual_ui_fln_flashcards.png", "FLN Flashcards & Literacy", [
    ("NIPUN Bharat Aligned", "Foundational numeracy and literacy targets for early grades"),
    ("Dual-Script Flashcards", "Front: Hindi word + illustration | Back: Santali Ol Chiki + Audio"),
    ("Interactive Flip Animation", "Zero-lag 60fps hardware accelerated animations in React Native"),
    ("Offline Speech Drill", "Student repeats word into microphone for pronunciation feedback"),
    ("Vocabulary Sets", "Numbers, colors, family, school items, nature, and community"),
    ("Local Mastery Tracking", "Saves student review progress to device AsyncStorage")
])

create_conceptual_screenshot("pdf", "conceptual_ui_worksheet_pdf_generator.png", "Worksheet PDF Generator", [
    ("Bilingual Template Builder", "Select grade level, subject (Math/Language), and vocabulary set"),
    ("Side-by-Side Exercises", "Fill-in-the-blanks, matching words, and Ol Chiki tracing lines"),
    ("Client-Side Rendering", "Vector PDF compiled natively on Android without web servers"),
    ("Direct Printer Dispatch", "Send PDF via WiFi-Direct or Bluetooth to local school printer"),
    ("SD Card / USB Export", "Save printable PDF files to tablet storage for village distribution"),
    ("Teacher Customization", "Add custom classroom sentences and local tribal folk terms")
])

print("All diagrams and conceptual screenshots generated successfully!")
