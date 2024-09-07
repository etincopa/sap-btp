# Getting Started

```sh
npm uninstall -g cordova
npm install -g cordova@9.0.0
```

## KAPSEL SDK

    Kapsel SDK 3.2: SAP MOBILE PLATFORM SDK 3.2 KAPSELSDK04P_1-70005271 (Kapsel SDK 3.2 SP04 PL1)

## VARIABLES DE ENTORNO

    ANDROID_HOME C:\Users\egarciti\AppData\Local\Android\Sdk
    ANDROID_SDK_ROOT C:\Users\egarciti\AppData\Local\Android\Sdk
    JAVA_HOME C:\Program Files\Java\jdk1.8.0_281
    JRE_HOME C:\Program Files\Java\jre1.8.0_291
    GRADLE_HOME C:\Users\egarciti\Desktop\gradle\gradle-6.9.1
    KAPSEL_HOME C:\Users\egarciti\Desktop\MobileSDK3\KapselSDK 3.1

    PATH %JAVA_HOME%\bin
    PATH %ANDROID_HOME%\tools
    PATH %ANDROID_HOME%\tools\bin
    PATH %ANDROID_HOME%\platform-tools
    PATH %ANDROID_HOME%\emulator
    PATH %ANDROID_SDK_ROOT%\tools
    PATH %ANDROID_SDK_ROOT%\tools\bin
    PATH %ANDROID_SDK_ROOT%\platform-tools
    PATH %ANDROID_SDK_ROOT%\cmdline-tools/latest/bin/
    PATH %ANDROID_SDK_ROOT%\emulator
    PATH %JRE_HOME%\bin
    PATH %GRADLE_HOME%\bin
    PATH %KAPSEL_HOME%\

## VERSIONES

    cordova 9.0.0(Recomendado), 11.0.0
    node v16.15.1
    npm 8.11.0
    java version "1.8.0_333"
    Gradle 7.4.2 (https://gradle.org/releases/)
    Android Debug Bridge (ADB)  version 1.0.41 Version 31.0.3-7562133


## PASOS CREAR APP

1.- Cree una carpeta para guardar sus proyectos de SDK híbrido (Kapsel) Cordova y
navegue hasta la carpeta del proyecto que creó.

2.- Abra un símbolo del sistema o terminal de Windows, ingrese:

```xml
cordova create <Project_Folder> <Application_ID> <Application_Name>

- <Project_Folder> : el directorio que se generará para el proyecto.
- <Application_ID> : debe coincidir con el ID de la aplicación tal como está
configurado en SAP Mobile Platform Server para la aplicación, que tiene un estilo de dominio inverso, por ejemplo, com.mycompany.logon.
- <Application_Name> : nombre de la aplicación.
```

    cordova create .\Kapsel_Projects\LogonDemo com.mycompany.logon LogonDemo

A partir de Cordova 5.x. Este complemento se agrega de forma predeterminada al crear un nuevo proyecto.

Los proyectos existentes que usan Cordova Android 10 o superior deben eliminar este complemento con el siguiente comando debido a que ahora esta integrada en el núcleo de Cordova Android (10.x y superior), este complemento ya no es necesario:

    cordova plugin rm cordova-plugin-whitelist

3.- Debe agregar las plataformas antes de agregar complementos de Hybrid SDK (Kapsel).
Para agregar la plataforma, ingrese:

    cordova platform add ios
    cordova platform add android
    cordova platform add windows

Si se requiere remover plataformas, ingresar:

    cordova platform remove android

4.- Al instalar complementos de Hybrid SDK (Kapsel), debe especificar una ruta utilizando el --searchpath a una ubicación donde se puede encontrar el complemento local de kapsel.
Por ejemplo:

    cordova plugin add kapsel-plugin-logon --searchpath $KAPSEL_HOME/plugins

5.- Edite el contenido de la aplicación web en la carpeta www del proyecto
y use el comando "cordova prepare" para copiar ese contenido en las
carpetas de proyecto de Android, iOS y Windows:

    cordova prepare android
    cordova prepare ios
    cordova prepare windows

Si va a importar su proyecto a Android Studio, debe ejecutar:

    cordova build android

Cuando se ejecuta en un dispositivo, la versión de compilación de lanzamiento de la aplicación deshabilitar la depuracion con Web Inspector.
android:debuggable="false"

6.- Comandos para contruir la APK

    - cordova prepare
    - cordova build android  o - Cordova build android --prod --release

7.- Desplegar APK en dispositivo fisico con ADB

    - adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk

8.- Desplegar APK en un emulador

    - cordova run android --emulator

9.- Debugger

    - chrome://inspect/#devices
    - cordova serve 8000 (http://localhost:8000/android/www/index.html)

## PASE DE FICHEROS DE PROYECTO HTML5 a CORDOVA
Webapp ->
controller/
controls/
css/
i18n/
lib/
model/
service/
view/
Component.js
manifest.json



## RESTRUCTURAR Y GENERAR NUEVO ID

```sh
Original: com.sap.webide.xd2331fe23c8745fc8ce8378255e2f1fa
Nuevo DEV: com.medifarma.cp.pesajeimpresionbultosaldo.dev
Nuevo QAS: com.medifarma.cp.pesajeimpresionbultosaldo.qas
Nuevo PRD: com.medifarma.cp.pesajeimpresionbultosaldo

# Copiar el archivo config.xml (Original)
cordova platform remove android
# Pegar el archivo config.xml (Original) y cambiar el ID de pla aplicacion
cordova platform add android@9.0.0 ó cordova platform add android
cordova build android
```


## BUILD / DEPLOY APP

1.- Si va a construir su proyecto a Android, debe ejecutar:

    cordova build android

2.- Desplegar APK en dispositivo fisico / Emulador con ADB

    # adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk
    adb -s emulator-5554 install -r "/Users/egarciti/Documents/GitHub/medifarma-cp-app/mobile-pesaje-produccion/platforms/android/app/build/outputs/apk/debug/app-debug.apk"

3.- Desplegar APK en un emulador

    cordova run android --emulator

4.- Debugger

    - chrome://inspect/#devices


## CONFIGURACION DE ARCHIVOS

> platforms/android/app/build.gradle

buscar el siguiente código

```js
dependencies {
    implementation fileTree(dir: 'libs', include: '*.jar')
    // SUB-PROJECT DEPENDENCIES START
    implementation(project(path: ":CordovaLib"))
    implementation "cz.msebera.android:httpclient:4.4.1.1"
    implementation "com.google.code.gson:gson:2.8.0"
    implementation "com.android.support:support-v4:22.0.0"
    // SUB-PROJECT DEPENDENCIES END
}
```

Reemplazarlo por:

```js
configurations {
    all*.exclude group: 'com.google.code.gson'
}

dependencies {
    implementation fileTree(dir: 'libs', include: '*.jar')
    // SUB-PROJECT DEPENDENCIES START
    implementation(project(path: ":CordovaLib"))
    implementation "com.google.code.gson:gson:2.8.0"
    // SUB-PROJECT DEPENDENCIES END
}
```

(*) Solo para ejecutar en emulador MacOS añadir:

```js
android {
    defaultConfig {...}
    splits {
        abi {
                enable true
                reset()
                include 'x86', 'x86_64', 'armeabi', 'armeabi-v7a', 'mips', 'mips64', 'arm64-v8a'
                universalApk true
            }       	 	        	   	 
    }
    ...
}

```

- Emulador: Nexus 6 API 29 Android 10.0 arm64-v8a
Comando para ejecutar el APK en el Emulador

    adb -s emulator-5554 install -r "/Users/egarciti/Documents/GitHub/medifarma-cp-app/gestion-materiales/platforms/android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk"

## Posibles Errores y Soluciones:

ERROR:
"requireCordovaModule" to load non-cordova module "fs" is not supported.
Instead, add this module to your dependencies and use regular "require" to load it.

Buscar el siguiente codigo en todo el proyecto:

```js
context.requirecordovamodule("fs");
context.requireCordovaModule("path");
context.requireCordovaModule("elementtree");
context.requireCordovaModule("shelljs");
```

Remplazar por:

```js
require("fs");
require("path");
require("elementtree");
require("shelljs");
```

ERROR:
AAPT: error: resource color/contents_text (aka com.medifarma.cp.pesajeimpresionbultosaldo:color/contents_text) not found.

Agregar los colores que generan error en:

> ..\platforms\android\app\src\main\res\values\colors.xml

```xml
<resources>
<color name="result_view">@color/colorPrimary</color>
<color name="result_minor_text">@color/colorPrimaryDark</color>
<color name="result_text">@color/colorPrimaryDark</color>
<color name="status_text">@color/colorPrimaryDark</color>
<color name="encode_view">@color/colorPrimaryDark</color>
<color name="contents_text">@color/colorPrimaryDark</color>
<color name="colorPrimary">#FF0000</color>
<color name="colorPrimaryDark">#0000FF</color>
<color name="transparent">#00000000</color>
</resources>
```

ERROR:
AAPT: error: resource dimen/standard_padding (aka com.medifarma.cp.pesajeimpresionbultosaldo:dimen/standard_padding) not found.

Agregar las dimenciones que generan error en:

> ..\platforms\android\app\src\main\res\values\dimens.xml

```xml
<resources>
<dimen name="half_padding">16dp</dimen>
<dimen name="standard_padding">16dp</dimen>
</resources>
```

