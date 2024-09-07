# Getting Started

## VERSIONES

node --version
	v16.15.1

npm --version
	8.16.0

java -version
	java version "1.8.0_333"
	Java(TM) SE Runtime Environment (build 1.8.0_333-b02)
	Java HotSpot(TM) 64-Bit Server VM (build 25.333-b02, mixed mode)

gradle -version
	------------------------------------------------------------
	Gradle 7.4.2
	------------------------------------------------------------

	Build time:   2022-03-31 15:25:29 UTC
	Revision:     540473b8118064efcc264694cbcaa4b677f61041

	Kotlin:       1.5.31
	Groovy:       3.0.9
	Ant:          Apache Ant(TM) version 1.10.11 compiled on July 10 2021
	JVM:          1.8.0_333 (Oracle Corporation 25.333-b02)
	OS:           Mac OS X 12.4 x86_64

adb --version
	Android Debug Bridge version 1.0.41
	Version 33.0.2-8557947
	Installed as //Users/egarciti/Library/Android/sdk/platform-tools/adb

cordova --version
	11.0.0 


## VARIABLES DE ENTORNO

    JAVA_HOME C:\Program Files\Java\jdk1.8.0_x
    JRE_HOME C:\Program Files\Java\jre1.8.0_x
    ANDROID_HOME C:\Users\egarciti\AppData\Local\Android\Sdk
    ANDROID_SDK_ROOT C:\Users\egarciti\AppData\Local\Android\Sdk
    GRADLE_HOME C:\Users\egarciti\Desktop\gradle\gradle-7.4.x

    PATH %JAVA_HOME%\bin
    PATH %JRE_HOME%\bin
    PATH %ANDROID_HOME%\tools
    PATH %ANDROID_HOME%\tools\bin
    PATH %ANDROID_HOME%\platform-tools
    PATH %ANDROID_HOME%\emulator
    PATH %ANDROID_SDK_ROOT%\tools
    PATH %ANDROID_SDK_ROOT%\tools\bin
    PATH %ANDROID_SDK_ROOT%\platform-tools
    PATH %ANDROID_SDK_ROOT%\cmdline-tools/latest/bin/
    PATH %ANDROID_SDK_ROOT%\emulator
    PATH %GRADLE_HOME%\bin

## PLUGINS:
npm install -g cordova@11.0.0


## CONFIGURACION ANDROID STUDIO
Android Studio Chipmunk | 2021.2.1

	Preferences ->
		Appearance & Behavior -> 
			System Settings ->
				Android SDK ->
					SDK Platforms :
						Name: Android API 32 (Sv2)
						API Level: 32
					SDK Tools :
						- Android SDK Build-Tools 33
							Version: 30.0.3
						- Android SDK Command-line Tools (latest)
							Version 7.0
						- Android Emulator
							Version: 31.2.10
						- Android SDK Platform-Tools
							Version: 33.0.2


## EMULADOR ANDROID:  
Virtual Device Manager (AVD):
	Nexus 6 API 29 Android 10
	Target: Android 10.0 (Google APIs)
	ABI: arm64-v8a
	Release Name: Q
	API Level: 29

Listar y ejecutar emulador
#Listar emuladores configurados en AVD
emulator -list-avds

#Ejecutar emulador AVD
emulator -avd <avds_device_name>

#Listar dispositivos disponibles
adb devices
adb devices -l


CONSTRUIR / EJECUTAR APK

Nota:
	No ejecutar el comando: cordova prepare

1.- 
#Construir APK
cordova build android

2.- 
#Cargar APK en Dispositivo / Emulador
adb -s <devices_attached> install -r "<path_apk>"

