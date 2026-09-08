cmake_minimum_required(VERSION 3.22.1)
project(janbhasha-native CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# ============================================================
# Compiler flags
# ============================================================
add_compile_options(
    -Wall
    -Wextra
    -Werror=return-type
    -fvisibility=hidden
    -fno-exceptions       # React Native NDK convention — we use our own JanbhashaError
    -fno-rtti
    -O2
)
# NOTE: We DO use exceptions internally (JanbhashaError derives std::runtime_error).
# Override -fno-exceptions for our sources only:
add_compile_options($<$<COMPILE_LANGUAGE:CXX>:-fexceptions>)

# ============================================================
# React Native / Hermes / JSI headers
# ============================================================
# React Native 0.74+ ships ReactAndroid as a Gradle dependency.
# find_package(ReactAndroid) provides imported targets:
#   ReactAndroid::jsi         — JSI headers + library
#   ReactAndroid::reactnative — React Native core
find_package(ReactAndroid REQUIRED CONFIG)

# ============================================================
# Prebuilt Libraries Detection (android/app/libs/${ANDROID_ABI})
# ============================================================
set(PREBUILT_LIBS_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../libs/${ANDROID_ABI}")
set(PREBUILT_INCLUDE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../libs/include")

# ONNX Runtime (libonnxruntime.so)
if(EXISTS "${PREBUILT_LIBS_DIR}/libonnxruntime.so")
    message(STATUS "[Janbhasha] Found ONNX Runtime prebuilt in ${PREBUILT_LIBS_DIR}")
    add_library(onnxruntime SHARED IMPORTED)
    set_target_properties(onnxruntime PROPERTIES
        IMPORTED_LOCATION "${PREBUILT_LIBS_DIR}/libonnxruntime.so")
    set(HAVE_ONNXRUNTIME TRUE)
else()
    message(STATUS "[Janbhasha] ONNX Runtime prebuilt NOT found in ${PREBUILT_LIBS_DIR} (Dev stub mode)")
    set(HAVE_ONNXRUNTIME FALSE)
endif()

# CTranslate2 (libctranslate2.so)
if(EXISTS "${PREBUILT_LIBS_DIR}/libctranslate2.so")
    message(STATUS "[Janbhasha] Found CTranslate2 prebuilt in ${PREBUILT_LIBS_DIR}")
    add_library(ctranslate2 SHARED IMPORTED)
    set_target_properties(ctranslate2 PROPERTIES
        IMPORTED_LOCATION "${PREBUILT_LIBS_DIR}/libctranslate2.so")
    set(HAVE_CTRANSLATE2 TRUE)
else()
    message(STATUS "[Janbhasha] CTranslate2 prebuilt NOT found in ${PREBUILT_LIBS_DIR} (Dev stub mode)")
    set(HAVE_CTRANSLATE2 FALSE)
endif()

# ============================================================
# Source files
# ============================================================
set(JANBHASHA_SOURCES
    # Errors
    errors/JanbhashaErrors.h          # header-only

    # Config
    config/LanguageConfig.h           # header-only
    config/ModelManifest.h
    config/ModelManifest.cpp

    # Engine subsystems
    engine/MemoryManager.h
    engine/MemoryManager.cpp
    engine/ModelManager.h
    engine/ModelManager.cpp
    engine/JanbhashaNativeEngine.h
    engine/JanbhashaNativeEngine.cpp

    # Audio
    audio/AudioManager.h
    audio/AudioManager.cpp

    # ASR
    asr/IASREngine.h                  # header-only
    asr/WhisperASREngine.h
    asr/WhisperASREngine.cpp

    # Translation
    translation/ITranslationEngine.h  # header-only
    translation/IndicTransEngine.h
    translation/IndicTransEngine.cpp

    # TTS
    tts/ITTSEngine.h                  # header-only
    tts/VITSTTSEngine.h
    tts/VITSTTSEngine.cpp
    tts/IndicParlerTTSEngine.h
    tts/IndicParlerTTSEngine.cpp

    # Pipeline
    pipeline/PipelineManager.h
    pipeline/PipelineManager.cpp

    # JSI
    jsi/JanbhashaJSIHostObject.h
    jsi/JanbhashaJSIHostObject.cpp
    jsi/JanbhashaJSIInstaller.h
    jsi/JanbhashaJSIInstaller.cpp

    # JNI entry point
    jni/JanbhashaJNI.cpp
)

# ============================================================
# Shared library
# ============================================================
add_library(
    janbhasha-native
    SHARED
    ${JANBHASHA_SOURCES}
)

# ============================================================
# Include paths
# ============================================================
target_include_directories(janbhasha-native PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/engine
    ${CMAKE_CURRENT_SOURCE_DIR}/pipeline
    ${CMAKE_CURRENT_SOURCE_DIR}/audio
    ${CMAKE_CURRENT_SOURCE_DIR}/config
    ${CMAKE_CURRENT_SOURCE_DIR}/errors
    ${CMAKE_CURRENT_SOURCE_DIR}/asr
    ${CMAKE_CURRENT_SOURCE_DIR}/translation
    ${CMAKE_CURRENT_SOURCE_DIR}/tts
    ${CMAKE_CURRENT_SOURCE_DIR}/jsi
    ${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules/react-native/ReactCommon/callinvoker
)
if(EXISTS "${PREBUILT_INCLUDE_DIR}")
    target_include_directories(janbhasha-native PRIVATE ${PREBUILT_INCLUDE_DIR})
endif()

# ============================================================
# Link libraries
# ============================================================
target_link_libraries(
    janbhasha-native
    # JSI
    ReactAndroid::jsi

    # Android system
    android
    log
    aaudio         # AAudio recording/playback (API 26+, always present on API 28+)

    # C++ standard
    c++_shared
)

if(HAVE_ONNXRUNTIME)
    target_link_libraries(janbhasha-native onnxruntime)
    target_compile_definitions(janbhasha-native PRIVATE HAVE_ONNXRUNTIME=1)
endif()

if(HAVE_CTRANSLATE2)
    target_link_libraries(janbhasha-native ctranslate2)
    target_compile_definitions(janbhasha-native PRIVATE HAVE_CTRANSLATE2=1)
endif()

# ============================================================
# ABI filters — arm64-v8a is the priority for 2GB devices.
# armeabi-v7a provides fallback for older hardware.
# x86_64 for emulator testing.
# ============================================================
# Set in android/app/build.gradle:
#   abiFilters "arm64-v8a", "armeabi-v7a", "x86_64"

# ============================================================
# Model asset packaging strategy
# ============================================================
# Models are NOT bundled in the APK. They are:
#   1. Shipped separately (via device provisioning or side-load).
#   2. Extracted to internal storage on first launch:
#      /data/user/0/com.janbhasha/files/models/
#   3. model_manifest.json references absolute paths on device.
#
# This avoids APK size limit (100MB Play Store / 150MB direct)
# and prevents model file decompression during install.
#
# At runtime, EngineConfig.modelsBasePath points to:
#   context.getFilesDir() + "/models"
