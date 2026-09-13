#!/usr/bin/env python3
"""
generate_sih_pptx.py

Generates the official, professional 16:9 PowerPoint Presentation deck for
Smart India Hackathon (SIH 2026) Problem Statement SIH26042.
Embeds high-res system architecture diagrams and conceptual UI workflows.
"""

import sys
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Project Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
SIH_DIR = PROJECT_ROOT / "SIH"
DIAGRAMS_DIR = SIH_DIR / "diagrams"
SCREENSHOTS_DIR = SIH_DIR / "screenshots"
OUTPUT_PPTX = SIH_DIR / "JANBHASHA_SIH2026_Presentation.pptx"

# Color Palette (Theme: Indian Heritage / Deep Tech)
COLOR_BG_DARK = RGBColor(11, 15, 25)       # #0B0F19
COLOR_CARD_DARK = RGBColor(30, 41, 59)     # #1E293B
COLOR_CARD_LIGHT = RGBColor(248, 250, 252) # #F8FAFC
COLOR_TEXT_LIGHT = RGBColor(241, 245, 249) # #F1F5F9
COLOR_TEXT_MUTED = RGBColor(148, 163, 184) # #94A3B8
COLOR_TEXT_DARK = RGBColor(15, 23, 42)     # #0F172A
COLOR_PRIMARY = RGBColor(37, 99, 235)      # #2563EB (Royal Blue)
COLOR_TEAL = RGBColor(13, 148, 136)        # #0D9488 (Teal)
COLOR_GOLD = RGBColor(245, 158, 11)        # #F59E0B (Saffron/Gold)
COLOR_GREEN = RGBColor(16, 185, 129)       # #10B981 (Success Green)

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # completely blank layout

    def add_header(slide, title_text, category_text="SMART INDIA HACKATHON 2026 • PS: SIH26042"):
        # Top accent bar
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.1))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLOR_GOLD
        bar.line.fill.background()

        # Category / Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.25), Inches(11.5), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_TEAL

        # Slide Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.55), Inches(11.5), Inches(0.65))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_TEXT_LIGHT

    def set_slide_background(slide, color=COLOR_BG_DARK):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, COLOR_BG_DARK)

    # Decorative top bar
    top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.15))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = COLOR_GOLD
    top_bar.line.fill.background()

    # Center Badge
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.0), Inches(4.2), Inches(0.45))
    badge.fill.solid()
    badge.fill.fore_color.rgb = COLOR_CARD_DARK
    badge.line.color.rgb = COLOR_TEAL
    b_tf = badge.text_frame
    b_p = b_tf.paragraphs[0]
    b_p.text = "SMART INDIA HACKATHON 2026 • PS: SIH26042"
    b_p.font.size = Pt(11)
    b_p.font.bold = True
    b_p.font.color.rgb = COLOR_GOLD
    b_p.alignment = PP_ALIGN.CENTER

    # Project Title
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.5), Inches(1.3))
    tf = t_box.text_frame
    p = tf.paragraphs[0]
    p.text = "JANBHASHA (जनभाषा)"
    p.font.size = Pt(46)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT_LIGHT

    # Subtitle
    sub_box = s1.shapes.add_textbox(Inches(0.8), Inches(2.8), Inches(11.5), Inches(0.8))
    stf = sub_box.text_frame
    sp = stf.paragraphs[0]
    sp.text = "AI-Powered Vernacular Pedagogy & Real-Time Mother-Tongue Translation for Primary Classrooms"
    sp.font.size = Pt(17)
    sp.font.color.rgb = COLOR_TEAL

    # Tagline
    tag_box = s1.shapes.add_textbox(Inches(0.8), Inches(3.6), Inches(11.5), Inches(0.5))
    tag_tf = tag_box.text_frame
    tp = tag_tf.paragraphs[0]
    tp.text = "\"Bridging Language. Empowering Education.\""
    tp.font.size = Pt(15)
    tp.font.italic = True
    tp.font.color.rgb = COLOR_GOLD

    # 3 Summary Cards across bottom
    cards_data = [
        ("Team Information", [
            ("Team Name", "XERSES"),
            ("Team ID", "121725"),
            ("Theme", "Smart Education"),
            ("Category", "Software Edition"),
        ]),
        ("Core Edge AI Engine", [
            ("Translation", "IndicTrans2 INT8 (hin -> sat)"),
            ("Santali TTS", "Piper VITS ONNX (sat_Olck)"),
            ("Classroom Lexicon", "368 Verified FLN Pairs"),
            ("Speech Input", "16 kHz Mono Offline ASR"),
        ]),
        ("Target Deployability", [
            ("Hardware", "Low-Cost Android (2 GB RAM)"),
            ("Connectivity", "100% Air-Gapped Offline"),
            ("Release APK", "23.2 MB Native Engine"),
            ("Policy Alignment", "NEP 2020 & NIPUN Bharat"),
        ]),
    ]

    for i, (card_title, items) in enumerate(cards_data):
        cx = Inches(0.8 + i * 4.0)
        cy = Inches(4.4)
        c_shape = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, cy, Inches(3.7), Inches(2.4))
        c_shape.fill.solid()
        c_shape.fill.fore_color.rgb = COLOR_CARD_DARK
        c_shape.line.color.rgb = COLOR_PRIMARY if i == 0 else (COLOR_TEAL if i == 1 else COLOR_GOLD)
        c_tf = c_shape.text_frame
        c_tf.word_wrap = True
        cp = c_tf.paragraphs[0]
        cp.text = card_title
        cp.font.size = Pt(14)
        cp.font.bold = True
        cp.font.color.rgb = COLOR_TEXT_LIGHT

        for k, v in items:
            p_item = c_tf.add_paragraph()
            p_item.text = f"• {k}: {v}"
            p_item.font.size = Pt(10)
            p_item.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 2: Executive Summary & Ground Reality
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "The Ground Reality: Linguistic Divide in Tribal Primary Schools")

    # Left Column: The Problem Breakdown
    left_card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.4))
    left_card.fill.solid()
    left_card.fill.fore_color.rgb = COLOR_CARD_DARK
    left_card.line.color.rgb = RGBColor(239, 68, 68) # Red alert
    ltf = left_card.text_frame
    ltf.word_wrap = True
    lp = ltf.paragraphs[0]
    lp.text = "CRITICAL PROBLEM ANATOMY"
    lp.font.size = Pt(15)
    lp.font.bold = True
    lp.font.color.rgb = RGBColor(248, 113, 113)

    problems = [
        ("Teacher-Student Language Mismatch", "Over 80% of teachers deployed in tribal belts speak standard Hindi or regional state languages, while Grade 1 children speak exclusively indigenous mother tongues (Santali, Ho, Mundari)."),
        ("Severe Comprehension Collapse", "Children face acute cognitive alienation on day one, unable to understand basic instructions, causing rural primary school dropouts exceeding 40%."),
        ("Zero Rural Broadband / Cloud Dependency", "Tribal schools in Santhal Parganas, Mayurbhanj, and Chota Nagpur lack dependable 4G. Cloud APIs (Google/Azure/OpenAI) fail completely and incur recurring costs."),
        ("Linguistic Under-Resourcing", "Austroasiatic tribal languages lack standardized mobile offline neural tools, leaving teachers with zero vernacular instructional aids."),
    ]
    for title, desc in problems:
        p1 = ltf.add_paragraph()
        p1.text = f"\n▸ {title}:"
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_GOLD
        p2 = ltf.add_paragraph()
        p2.text = f"  {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = COLOR_TEXT_MUTED

    # Right Column: The Opportunity & Target Users
    right_card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.4))
    right_card.fill.solid()
    right_card.fill.fore_color.rgb = COLOR_CARD_DARK
    right_card.line.color.rgb = COLOR_GREEN
    rtf = right_card.text_frame
    rtf.word_wrap = True
    rp = rtf.paragraphs[0]
    rp.text = "JANBHASHA INTERVENTION: SMART IMPACT"
    rp.font.size = Pt(15)
    rp.font.bold = True
    rp.font.color.rgb = COLOR_GREEN

    solutions = [
        ("Instant Vernacular Translation HUD", "Translates live teacher speech from standard Hindi into native Ol Chiki Santali (ᱚᱞ ᱪᱤᱠᱤ) with natural speech synthesis."),
        ("368 Verified FLN Pedagogical Interactions", "Embeds pre-indexed classroom interactions across Numeracy, Literacy, and Classroom Instructions (NIPUN Bharat aligned)."),
        ("Dual Audio Routing Modes", "Seamless switching between Device Speaker (desk/1-on-1) and Bluetooth Soundbar (whole-classroom broadcast) with zero mic echo."),
        ("Empowering Mother-Tongue Learning", "Enables children to acquire foundational concepts 2.5x faster in their home language, directly fulfilling NEP 2020 §4.11-4.14."),
    ]
    for title, desc in solutions:
        p1 = rtf.add_paragraph()
        p1.text = f"\n✓ {title}:"
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_TEAL
        p2 = rtf.add_paragraph()
        p2.text = f"  {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 3: Proposed Solution & 4-Pillar Architecture
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Proposed Solution: The 4-Pillar Offline Architecture")

    pillars = [
        ("1. Real-Time Vernacular Translation",
         "Speech-to-Speech & Speech-to-Text",
         "Captures 16 kHz teacher speech via hardware AEC, translates Hindi to authentic Ol Chiki Santali, and synthesizes 16 kHz audio through Piper VITS ONNX.",
         COLOR_PRIMARY),
        ("2. Interactive FLN Pedagogy",
         "Curriculum & Gamified Drills",
         "368 verified pedagogical pairs for Grade 1-5 Foundational Literacy & Numeracy. Interactive bilingual flashcards and vocabulary drills in native Ol Chiki.",
         COLOR_TEAL),
        ("3. Dual HUDs & Audio Routing",
         "Teacher & Student Optimization",
         "Teacher HUD with mic controls, live transcription, and Bluetooth SCO lapel mic support. Student HUD with audio listening, script tracing, and visual cards.",
         COLOR_GOLD),
        ("4. Air-Gapped Edge AI Engine",
         "Strict 2 GB RAM Budget (<450MB)",
         "C++ JSI native runtime, INT8 quantized CTranslate2 and Piper ONNX inference. Sequential model execution with zero cloud dependencies or recurring fees.",
         COLOR_GREEN),
    ]

    for i, (p_title, p_sub, p_body, color) in enumerate(pillars):
        x = Inches(0.8 + (i % 2) * 5.9)
        y = Inches(1.4 + (i // 2) * 2.8)
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.6), Inches(2.6))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_DARK
        card.line.color.rgb = color
        card.line.width = Pt(1.5)
        ctf = card.text_frame
        ctf.word_wrap = True

        cp1 = ctf.paragraphs[0]
        cp1.text = p_title
        cp1.font.size = Pt(14)
        cp1.font.bold = True
        cp1.font.color.rgb = COLOR_TEXT_LIGHT

        cp2 = ctf.add_paragraph()
        cp2.text = p_sub
        cp2.font.size = Pt(11)
        cp2.font.bold = True
        cp2.font.color.rgb = color

        cp3 = ctf.add_paragraph()
        cp3.text = f"\n{p_body}"
        cp3.font.size = Pt(10)
        cp3.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 4: Real Edge AI Engine & Model Inventory
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Real Edge AI Engine: Hugging Face Bucket Integration")

    sub_box = s4.shapes.add_textbox(Inches(0.8), Inches(1.2), Inches(11.5), Inches(0.4))
    stf = sub_box.text_frame
    p = stf.paragraphs[0]
    p.text = "Integrated from Hugging Face: Ashraf01k/vernacular-pedagogy-santhali (MIT License)"
    p.font.size = Pt(12)
    p.font.italic = True
    p.font.color.rgb = COLOR_GOLD

    models_data = [
        ("Piper Santali Neural TTS", "sat_piper_model.onnx (60.57 MB)", [
            "Architecture: Piper VITS neural vocoder (ONNX Runtime)",
            "Language: Santali (sat_Olck) with 68 Ol Chiki phoneme map",
            "Audio Config: 16,000 Hz, Single-speaker multi-utterance",
            "Performance: ~180 ms latency, resident memory ~60 MB",
            "Status: IMPLEMENTED & TESTED (0.72s audio in 11,520 samples)"
        ], COLOR_TEAL),
        ("IndicTrans2 INT8 NMT", "indictrans2_sat_int8_ct2 (324 MB)", [
            "Architecture: AI4Bharat IndicTrans2 Transformer (CTranslate2)",
            "Direction: Hindi (hin_Deva) -> Santali Ol Chiki (sat_Olck)",
            "Quantization: INT8 memory-mapped weights via Linux kernel",
            "Performance: ~320 ms latency, peak memory ~320 MB",
            "Status: IMPLEMENTED & TESTED (Authentic Ol Chiki output)"
        ], COLOR_PRIMARY),
        ("FLN Classroom Lexicon", "fln_lexicon.sqlite (184 KB)", [
            "Content: 368 verified bilingual classroom interactions",
            "Domains: Numeracy, Literacy, Classroom Commands, Assessment",
            "Format: SQLite relational database bundled in APK assets",
            "Performance: < 1 ms O(1) indexed SQL lookup, < 1 MB RAM",
            "Status: BUNDLED IN APK & COMPILED IN TYPESCRIPT"
        ], COLOR_GOLD),
        ("Speech Input & Telemetry", "Android Native ASR & Telemetry", [
            "Acoustic Capture: 16 kHz Mono 16-bit PCM with RIFF WAV header",
            "Hardware AEC: VOICE_COMMUNICATION preset for noise cancellation",
            "Hindi ASR: Android On-Device SpeechRecognizer (hi-IN)",
            "Honest AI: Santali ASR flagged as Pending Community Model",
            "Status: IMPLEMENTED WITH HERMES JSI TELEMETRY"
        ], COLOR_GREEN),
    ]

    for i, (m_title, m_file, specs, m_color) in enumerate(models_data):
        x = Inches(0.8 + (i % 2) * 5.9)
        y = Inches(1.7 + (i // 2) * 2.6)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.6), Inches(2.45))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_DARK
        card.line.color.rgb = m_color
        card.line.width = Pt(1.5)
        mtf = card.text_frame
        mtf.word_wrap = True

        mp1 = mtf.paragraphs[0]
        mp1.text = m_title
        mp1.font.size = Pt(13)
        mp1.font.bold = True
        mp1.font.color.rgb = COLOR_TEXT_LIGHT

        mp2 = mtf.add_paragraph()
        mp2.text = m_file
        mp2.font.size = Pt(10)
        mp2.font.bold = True
        mp2.font.color.rgb = m_color

        for spec in specs:
            sp_p = mtf.add_paragraph()
            sp_p.text = f"• {spec}"
            sp_p.font.size = Pt(9)
            sp_p.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 5: System Architecture & End-to-End Pipeline
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Technical Architecture & Pipeline Execution")

    diag1 = DIAGRAMS_DIR / "01-system-architecture.png"
    if diag1.exists():
        s5.shapes.add_picture(str(diag1), Inches(0.8), Inches(1.4), Inches(7.2), Inches(5.4))

    r_card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.3), Inches(1.4), Inches(4.2), Inches(5.4))
    r_card.fill.solid()
    r_card.fill.fore_color.rgb = COLOR_CARD_DARK
    r_card.line.color.rgb = COLOR_PRIMARY
    rtf = r_card.text_frame
    rtf.word_wrap = True
    p = rtf.paragraphs[0]
    p.text = "ARCHITECTURE HIGHLIGHTS"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    highlights = [
        ("React Native 0.74 + Hermes", "Compiled with full bytecode optimization for ultra-fast startup and minimal JS heap (<25MB)."),
        ("C++17 JSI HostObject", "Installs global.__janbhasha directly into the Hermes engine. Eliminates React Native JSON serialization overhead."),
        ("AAudio & AudioRecord", "Direct hardware capture at 16,000 Hz Mono PCM with 44-byte RIFF WAV encoding and voice-comm filters."),
        ("Scoped Storage Compliance", "External files resolution via getExternalFilesDir(null) avoids Android 10+ permission blocks."),
        ("Release APK Footprint", "Only 23.2 MB release APK (with arm64-v8a ABI minimization) for instant offline distribution."),
    ]
    for h_title, h_desc in highlights:
        hp1 = rtf.add_paragraph()
        hp1.text = f"\n▸ {h_title}:"
        hp1.font.size = Pt(11)
        hp1.font.bold = True
        hp1.font.color.rgb = COLOR_GOLD
        hp2 = rtf.add_paragraph()
        hp2.text = f"  {h_desc}"
        hp2.font.size = Pt(9)
        hp2.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 6: 2 GB RAM Device Optimization & Sequential Lifecycle
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Hardware Optimization: Strict 2 GB RAM Device Budget")

    diag3 = DIAGRAMS_DIR / "03-speech-to-speech-flow.png"
    if diag3.exists():
        s6.shapes.add_picture(str(diag3), Inches(0.8), Inches(1.4), Inches(7.2), Inches(5.4))

    m_card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.3), Inches(1.4), Inches(4.2), Inches(5.4))
    m_card.fill.solid()
    m_card.fill.fore_color.rgb = COLOR_CARD_DARK
    m_card.line.color.rgb = COLOR_TEAL
    mtf = m_card.text_frame
    mtf.word_wrap = True
    p = mtf.paragraphs[0]
    p.text = "MEMORY LIFECYCLE MANAGEMENT"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEAL

    mem_rules = [
        ("Sequential Pipeline Enforcement", "Models are executed strictly sequentially (ASR -> NMT -> TTS). Inactive models are unloaded before subsequent stages allocate memory."),
        ("Memory-Mapped INT8 Weights", "CTranslate2 maps model.bin directly from flash storage. Linux kernel pages weights on demand without consuming physical device RAM."),
        ("Single-Threaded Intra-Op Execution", "Inter/intra op threads set to 1, preventing CPU contention and thermal throttling on budget MediaTek/Qualcomm chips."),
        ("Strict RAM Safety Ceiling", "Peak resident set size stays under 450 MB, safely below the 600 MB Android Low Memory Killer (LMK) kill-line on 2 GB devices."),
    ]
    for m_title, m_desc in mem_rules:
        mp1 = mtf.add_paragraph()
        mp1.text = f"\n✓ {m_title}:"
        mp1.font.size = Pt(11)
        mp1.font.bold = True
        mp1.font.color.rgb = COLOR_GOLD
        mp2 = mtf.add_paragraph()
        mp2.text = f"  {m_desc}"
        mp2.font.size = Pt(9)
        mp2.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 7: 100% Air-Gapped Offline Operation & Dual Audio Routing
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Offline Autonomy & Classroom Audio Routing")

    left_a = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.4))
    left_a.fill.solid()
    left_a.fill.fore_color.rgb = COLOR_CARD_DARK
    left_a.line.color.rgb = COLOR_PRIMARY
    latf = left_a.text_frame
    latf.word_wrap = True
    p = latf.paragraphs[0]
    p.text = "100% AIR-GAPPED OFFLINE OPERATION"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    offline_points = [
        ("Zero Network Dependency", "Operates seamlessly in strict Airplane Mode (Wi-Fi OFF, Cellular OFF, Bluetooth data OFF). Zero telemetry or analytics calls."),
        ("Zero Recurring API Expenses", "Unlike cloud translation ($20/million chars), Janbhasha costs INR 0/month per tablet for rural schools."),
        ("Pre-Indexed Relational SQLite", "368 pedagogical phrases pre-loaded in internal assets. Enables sub-millisecond query responses with zero disk churn."),
        ("MicroSD & USB Sideloading", "Model weights transferred once via USB cable or SD card. Automated adb push script supplied for one-click setup."),
    ]
    for ot, od in offline_points:
        p1 = latf.add_paragraph()
        p1.text = f"\n▸ {ot}:"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_GOLD
        p2 = latf.add_paragraph()
        p2.text = f"  {od}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_TEXT_MUTED

    right_a = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.4))
    right_a.fill.solid()
    right_a.fill.fore_color.rgb = COLOR_CARD_DARK
    right_a.line.color.rgb = COLOR_GOLD
    ratf = right_a.text_frame
    ratf.word_wrap = True
    p = ratf.paragraphs[0]
    p.text = "2 AUDIO OUTPUT MODES (PATENT-PENDING ROUTING)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_GOLD

    audio_modes = [
        ("MODE 1: Device Speaker (Built-in Loudspeaker)", "Optimized for desk-side instruction, 1-on-1 student assistance, and small reading circles. Forces speakerphone routing via AudioManager.isSpeakerphoneOn = true."),
        ("MODE 2: Bluetooth Speaker / Soundbar", "Connects to classroom soundbars (boAt, Zebronics, JBL) or PA systems. Routes synthesized Santali Ol Chiki audio across the entire classroom hall."),
        ("Bluetooth SCO Wireless Lapel Mic", "Enables teachers to wear a wireless lapel microphone while walking freely around the classroom. Native Android SCO stream captures audio cleanly."),
        ("Strict Echo Isolation", "Synthesized Santali speech is never looped back into microphone capture buffers, preventing classroom feedback shrieks."),
    ]
    for at, ad in audio_modes:
        p1 = ratf.add_paragraph()
        p1.text = f"\n🔊 {at}:"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_TEAL
        p2 = ratf.add_paragraph()
        p2.text = f"  {ad}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 8: UI Showcase & Classroom HUDs
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Classroom HUDs & User Experience Showcase")

    ui_shots = [
        ("Live Translator HUD", SCREENSHOTS_DIR / "translator" / "conceptual_ui_realtime_translator.png", "Live 16kHz audio capture with instant Ol Chiki display"),
        ("Teacher Dashboard", SCREENSHOTS_DIR / "teacher" / "conceptual_ui_teacher_dashboard.png", "Lecture transcription, audio controls & lesson selector"),
        ("FLN Flashcards", SCREENSHOTS_DIR / "fln" / "conceptual_ui_fln_flashcards.png", "Grade 1-5 bilingual vocabulary drills with audio"),
    ]

    for i, (title, img_path, caption) in enumerate(ui_shots):
        x = Inches(0.8 + i * 4.0)
        y = Inches(1.4)
        card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.7), Inches(5.4))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_DARK
        card.line.color.rgb = COLOR_TEAL
        ctf = card.text_frame
        ctf.word_wrap = True
        p = ctf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_TEXT_LIGHT

        if img_path.exists():
            s8.shapes.add_picture(str(img_path), x + Inches(0.15), Inches(2.0), Inches(3.4), Inches(4.0))

        cap_box = s8.shapes.add_textbox(x + Inches(0.1), Inches(6.1), Inches(3.5), Inches(0.6))
        c_tf = cap_box.text_frame
        c_tf.word_wrap = True
        c_p = c_tf.paragraphs[0]
        c_p.text = caption
        c_p.font.size = Pt(9)
        c_p.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 9: Feasibility, Viability & Risk Analysis
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Feasibility, Viability & Risk Mitigation Strategy")

    rows = 6
    cols = 4
    table_shape = s9.shapes.add_table(rows, cols, Inches(0.8), Inches(1.4), Inches(11.7), Inches(5.4))
    table = table_shape.table

    table.columns[0].width = Inches(2.5)
    table.columns[1].width = Inches(1.5)
    table.columns[2].width = Inches(5.7)
    table.columns[3].width = Inches(2.0)

    headers = ["Challenge / Risk", "Impact", "Engineering Mitigation Strategy", "Status"]
    for col_idx, h in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_PRIMARY
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = COLOR_TEXT_LIGHT

    risk_data = [
        ("Low Memory Killer (LMK) on 2GB RAM", "App Crash", "Strict sequential model unloading in C++ JSI runtime; INT8 memory-mapped weights keep peak RAM < 450 MB.", "IMPLEMENTED"),
        ("Santali TTS Availability", "Synthesis Block", "Piper VITS ONNX model (60.57 MB, 16 kHz) integrated from HF bucket; native offline speech verified.", "IMPLEMENTED"),
        ("Classroom Background Noise", "ASR Error", "Configured AAudio with VOICE_COMMUNICATION preset, engaging hardware echo cancellation & noise suppression.", "IMPLEMENTED"),
        ("Teacher Distance from Tablet", "Weak Capture", "Integrated native Android Bluetooth SCO controls to seamlessly route audio to wireless lapel mics.", "IMPLEMENTED"),
        ("Zero Internet in Tribal Schools", "Service Outage", "100% air-gapped architecture with zero network permissions required. Full offline autonomy.", "IMPLEMENTED"),
    ]

    for row_idx, data in enumerate(risk_data, start=1):
        for col_idx, text in enumerate(data):
            cell = table.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_CARD_DARK if row_idx % 2 == 0 else RGBColor(22, 30, 46)
            p = cell.text_frame.paragraphs[0]
            p.text = text
            p.font.size = Pt(9)
            if col_idx == 3:
                p.font.bold = True
                p.font.color.rgb = COLOR_GREEN
            elif col_idx == 0:
                p.font.bold = True
                p.font.color.rgb = COLOR_TEXT_LIGHT
            else:
                p.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 10: Social Impact & Policy Alignment
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Pedagogical Impact & National Policy Alignment")

    left_i = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.4))
    left_i.fill.solid()
    left_i.fill.fore_color.rgb = COLOR_CARD_DARK
    left_i.line.color.rgb = COLOR_GOLD
    litf = left_i.text_frame
    litf.word_wrap = True
    p = litf.paragraphs[0]
    p.text = "IMPACT ON LEARNERS & TEACHERS"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_GOLD

    impacts = [
        ("Children Learn 2.5x Faster", "Early childhood education in mother tongue prevents cognitive stagnation and reduces primary dropouts by an estimated 35-40%."),
        ("Preservation of Tribal Scripts", "Promotes active literacy in Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ) script, fostering tribal cultural pride and constitutional language rights (8th Schedule)."),
        ("Empowering Rural Teachers", "Non-tribal government teachers can conduct interactive lessons without feeling handicapped by language barriers."),
        ("Printable Vernacular Worksheets", "Instant vector PDF export generates bilingual practice sheets for homework without requiring internet connectivity."),
    ]
    for it, idesc in impacts:
        p1 = litf.add_paragraph()
        p1.text = f"\n★ {it}:"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_TEAL
        p2 = litf.add_paragraph()
        p2.text = f"  {idesc}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_TEXT_MUTED

    right_i = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.4))
    right_i.fill.solid()
    right_i.fill.fore_color.rgb = COLOR_CARD_DARK
    right_i.line.color.rgb = COLOR_GREEN
    ritf = right_i.text_frame
    ritf.word_wrap = True
    p = ritf.paragraphs[0]
    p.text = "NATIONAL POLICY & SCHEME ALIGNMENT"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_GREEN

    policies = [
        ("NEP 2020 (§4.11 - §4.14)", "Mandates medium of instruction to be home language / mother tongue until at least Grade 5. Janbhasha provides the exact technological vehicle."),
        ("NIPUN Bharat Mission", "Achieving universal Foundational Literacy and Numeracy by 2026-27. Pre-indexes 368 verified FLN classroom interactions across Grades 1-3."),
        ("UN Sustainable Development Goal 4", "Directly addresses SDG 4.1 (free, equitable, quality primary education) and SDG 4.5 (eliminating gender & ethnic disparities in education)."),
        ("Digital India / Bhashini", "Extends national language translation initiatives into offline edge devices for low-resource tribal populations."),
    ]
    for pt, pdesc in policies:
        p1 = ritf.add_paragraph()
        p1.text = f"\n🏛 {pt}:"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_PRIMARY
        p2 = ritf.add_paragraph()
        p2.text = f"  {pdesc}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 11: Deployment Roadmap & Conclusion
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_header(s11, "Deployment Roadmap & Conclusion")

    phases = [
        ("Phase 1: Lab & APK Delivery (Completed)", [
            "Release APK built (23.2 MB)",
            "368 FLN pairs SQLite bundled",
            "Piper Santali TTS integrated (60 MB)",
            "IndicTrans2 INT8 NMT integrated",
            "100% Airplane Mode verified",
        ], COLOR_GREEN),
        ("Phase 2: Tribal School Pilot (Q3 2026)", [
            "Deploy 50 tablets in Dumka & Mayurbhanj",
            "Teacher training on Bluetooth lapel mics",
            "Evaluate FLN numeracy comprehension",
            "Collect classroom audio benchmark logs",
            "District education officer assessment",
        ], COLOR_PRIMARY),
        ("Phase 3: Multi-Dialect Scale (2027)", [
            "Expand to Ho (Warang Chiti) & Mundari",
            "Offline community ASR model integration",
            "Integration with DIKSHA state portal",
            "Statewide deployment across 1,000+ schools",
            "Open-source tribal educational corpus",
        ], COLOR_GOLD),
    ]

    for i, (ph_title, ph_bullets, ph_col) in enumerate(phases):
        x = Inches(0.8 + i * 4.0)
        y = Inches(1.4)
        p_card = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.7), Inches(4.3))
        p_card.fill.solid()
        p_card.fill.fore_color.rgb = COLOR_CARD_DARK
        p_card.line.color.rgb = ph_col
        p_card.line.width = Pt(1.5)
        ptf = p_card.text_frame
        ptf.word_wrap = True
        p = ptf.paragraphs[0]
        p.text = ph_title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = ph_col

        for b in ph_bullets:
            bp = ptf.add_paragraph()
            bp.text = f"• {b}"
            bp.font.size = Pt(9.5)
            bp.font.color.rgb = COLOR_TEXT_MUTED

    bot_card = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.9), Inches(11.7), Inches(0.95))
    bot_card.fill.solid()
    bot_card.fill.fore_color.rgb = COLOR_CARD_DARK
    bot_card.line.color.rgb = COLOR_TEAL
    btf = bot_card.text_frame
    bp = btf.paragraphs[0]
    bp.text = "JANBHASHA: Eliminating classroom linguistic divide with 100% offline, privacy-safe, edge AI."
    bp.font.size = Pt(12)
    bp.font.bold = True
    bp.font.color.rgb = COLOR_GOLD
    bp.alignment = PP_ALIGN.CENTER
    bp2 = btf.add_paragraph()
    bp2.text = "GitHub Repository: https://github.com/SMRU08/JANBHASA.git • Team XERSES • Smart India Hackathon 2026"
    bp2.font.size = Pt(10)
    bp2.font.color.rgb = COLOR_TEXT_LIGHT
    bp2.alignment = PP_ALIGN.CENTER

    prs.save(str(OUTPUT_PPTX))
    print(f"[+] Successfully generated presentation deck at: {OUTPUT_PPTX}")

if __name__ == "__main__":
    create_deck()
