# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Janbhasha Native JNI / JSI Bridge
-keep class com.janbhasha.** { *; }
-keepclasseswithmembernames class * {
    native <methods>;
}

# React Native Core & JSI internals
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.turbomodule.core.** { *; }
-keep class com.facebook.react.turbomodule.core.CallInvokerHolderImpl { *; }

# Third-party Native Libraries
-keep class com.tencent.mmkv.** { *; }
-keep class com.horcrux.svg.** { *; }
-keep class com.rnfs.** { *; }
-keep class com.christopherdro.htmltopdf.** { *; }
-keep class com.christopherdro.RNPrint.** { *; }

# Audio and Android OS callbacks
-keep class android.media.** { *; }

# Suppress harmless warnings from framework reflective lookups
-dontwarn com.facebook.react.**
-dontwarn com.tencent.mmkv.**
