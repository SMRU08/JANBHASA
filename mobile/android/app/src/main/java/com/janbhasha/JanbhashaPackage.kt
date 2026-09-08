package com.janbhasha

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * JanbhashaPackage
 *
 * Registers JanbhashaModule with the React Native module registry.
 * Add this to your MainApplication.kt:
 *
 *   override fun getPackages(): List<ReactPackage> = listOf(
 *       MainReactPackage(),
 *       JanbhashaPackage()
 *   )
 */
class JanbhashaPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> = listOf(JanbhashaModule(reactContext))

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
