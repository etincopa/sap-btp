# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

| File or Folder | Purpose                              |
| -------------- | ------------------------------------ |
| `app/`         | content for UI frontends goes here   |
| `db/`          | your domain models and data go here  |
| `srv/`         | your service models and code go here |
| `package.json` | project metadata and configuration   |
| `readme.md`    | this getting started guide           |

## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).

## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.

## DEPENDENCIAS
```sh
    npm i -g yo
    npm i -g generator-easy-ui5
    npm i -g @ui5/cli
    npm i -g @sap/cds
    npm i -g @sap/cds-dk
    npm i -g mbt
```
```sh
    cf install-plugin multiapps
    cf install-plugin -r CF-Community "html5-plugin"
```

VS CODE: Extension

- SAP Fiori tools - Extension Pack
- UI5 Language Assistant

# CAP
## AGREGAR ODATA EXTERNO
- Crear archivos **./edmx/Z_PP_CENTRALPESADAS_SRV.edmx**
- Obtener el EDMX del servicio oData v2: **http://s4hdev:8080/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV/$metadata**
- Ejecutar el comando:
```sh
    cds import edmx/Z_PP_CENTRALPESADAS_SRV.edmx
```
- Se agregara una propiedad en package.json: **"Z_PP_CENTRALPESADAS_SRV":{...}** y creara los archivos: **./srv/external/Z_PP_CENTRALPESADAS_SRV.csn** y **./srv/external/Z_PP_CENTRALPESADAS_SRV.edmx**

```json
/*EJECUCION EN LOCAL: Configurar ERP y VPN*/
{
    ...
    "Z_PP_CENTRALPESADAS_SRV": {
        "kind": "odata-v2",
        "model": "srv/external/Z_PP_CENTRALPESADAS_SRV",
        "credentials": {
            "url": "http://10.100.4.13:8000/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV",
            "headers": {
                "Authorization": "Basic XXXXXXX",
            }
        },
        "pool": {
            "min": 1,
            "max": 10
        }
    }
}
```


```json
/*EJECUCION EN BTP*/
{
    ...
    "Z_PP_CENTRALPESADAS_SRV": {
        "kind": "odata-v2",
        "model": "srv/external/Z_PP_CENTRALPESADAS_SRV",
        "credentials": {
          "destination": "CP_S4H_HTTP_BASIC",
          "path": "/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV",
            "requestTimeout": 30000
        },
        "pool": {
            "min": 1,
            "max": 10
        }
      }
}
```
- Configuracion del Destination
```json
{
    "Name": "CP_S4H_HTTP_BASIC",
    "Type": "HTTP",
    "URL": "http://s4hdev:8080",
    "Authentication": "BasicAuthentication",
    "ProxyType": "OnPremise",
    "User": "HLEONN",
    "sap-client": "150",
    "Password": "*******"
}
```

## DEBUG CAP

#### VISUAL STUDIO CODE
```
    (*) Esta configuracion ejecuta cds watch en modo debug
    Crear archivos:
    - .vscode/launch.json
    - .vscode/cds.js
```

    .vscode/launch.json
```json
    {
        "version": "0.2.0",
        "configurations": [
            {
            "name": "cds run",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/.vscode/cds",
            "args": [
                "run",
                "--with-mocks",
                "--in-memory?"
            ],
            "skipFiles": [ "<node_internals>/**" ],
            "console": "integratedTerminal",
            "autoAttachChildProcesses": true
            }
        ]
    }
```
    .vscode/cds.js
```js
    //Usar en launch.json para referirse a un CD instalado a través de una ruta absoluta
    const cds = require('@sap/cds');
    cds.exec();
```

## DEPLOY CAP

`user: <root-project> $`
```sh
cf login -a https://api.cf.us10.hana.ondemand.com/ -u <user> -p <password>
cds build
mbt build
cf deploy mta_archives/cp-mta_1.0.2.mtar
```

## DEPLOY MODULOS

Desplegar solo un modulo en especifico configurado en > mta.yaml

```sh
modules: ...
- name: cp-srv
  type: nodejs ...

cf deploy mta_archives/cp-mta_1.0.2.mtar -m <module-name>
```

## DEPLOY HTML5 APP

`user: <root-project>/<app-folder-name> $`
```sh
npm run build:cf
```

`user: <root-project> $`
```sh
cf login -a https://api.cf.us10.hana.ondemand.com/ -u <user> -p <password>
cf target -o <org> -s <space>
cf html5-list

cf html5-push app/<app-folder-name>/dist <app-host-id>
```

```
cf html5-push app/balanza/dist app/impresora/dist app/sala-pesaje/dist app/sala-pesaje-lectura-etiqueta/dist app/sala-pesaje-peso-manual/dist app/sala-pesaje-tara-manual/dist app/gestion-materiales/dist app/manejo-pedidos/dist 617d72cc-13bb-45c5-a80e-ce6645a1e0e3
```

## ERRORES CAP
```sh
Error staging application "cp-db": BuildpackCompileFailed - App staging failed in the buildpack compile phase 
Download the application logs via the dmol command and check them for more information.

Versiones buildpack: https://github.com/cloudfoundry/nodejs-buildpack/releases

remplazar buildpack: nodejs_buildpack por:
buildpack: https://github.com/cloudfoundry/nodejs-buildpack/releases/download/v1.7.70/nodejs-buildpack-cflinuxfs3-v1.7.70.zip
```

```sh
Error srv/csn.json:6748: Expected element to have
a type (in entity:"CatalogService.GRUPO_ORDEN_ATENCION"/element:"totalIniciada")
(STDERR, APP/PROC/WEB)#

Este error se debe a que las funciones de SQL como ( AVG, COUNT, DISTINCT, MAX, MIN, SUM)
se le debe de asignar un tipo a la propiedad
Ejmp: select ..., sum(A.campoA) as campoA: Decimal(18, 3) from ...
```

```sh
Error starting application "cp-srv": Some instances have crashed. Check the logs of your application for more information.

Agregar en package.json la propiedad `engines`
{
    ...
  "engines": {
    "node": "^14"
  },
  "dependencies": {
      ...
  }
  ...
}

```

# CORDOVA
Recomendaciones:
- Kapsel SDK 3.1 SP02 PL11: SAP MOBILE PLATFORM SDK 3.1 KAPSELSDK02P_11-70003613 Android @8.+
- Kapsel SDK 3.2 SP04 PL1 : SAP MOBILE PLATFORM SDK 3.2 KAPSELSDK04P_1-70005271 Android @9.+

Versiones
- cordova 9.0.0
- node v14.17.5
- npm 6.14.14
- java version 1.8.0_311
- gradle-6.9.1 (https://gradle.org/releases/)

```sh
cordova platform add android@9.0.0
cordova platform add ios@6.1.0
cordova platform add windows@7.0.1
```
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




## CONFIGURACION DEL PROYECTO CORDOVA

0. CREAR PROYECTO

- #cordova create < name_project > < namespace > < name_app >
- cordova create gestion-materiales com.medifarma.cp.pesajeimpresionbultosaldo PesajeImpBultoSaldo

1. AGREGAR/ELIMINAR PLATAFORMA [android, ios, wp8]

- cordova platform add android
- cordova platform remove android

2. AGREGAR PLUGINS

- cordova plugin add https://github.com/Microsoft/cordova-plugin-indexedDB //indexeddbshim - v1.0.6 - 2015-04-16
  o cordova plugin add https://github.com/p-w/cordova-plugin-indexedDB //indexeddbshim - v3.2.0 - 2017-12-09
- cordova plugin add kapsel-plugin-barcodescanner --searchpath %KAPSEL_HOME%/plugins
  o cordova plugin add %KAPSEL_HOME%/plugins/barcodescanner
  o cordova plugins add https://github.com/wildabeast/BarcodeScanner.git
- cordova plugin add com-ugrokit-cordova-ugrokit --searchpath %KAPSEL_HOME%/plugins
- cordova plugin add kapsel-plugin-logon --searchpath %KAPSEL_HOME%/plugins //complemento de inicio de sesión
- cordova plugin add cordova-plugin-dialogs // Notification
- cordova plugin add kapsel-plugin-odata --searchpath %KAPSEL_HOME%/plugins

  2.1. AGREGAR/ELIMINAR PLUGGINS

- cordova plugin remove <plugin_id>
- npm uninstall <plugin_id>

3. DEPLEGAR EN EMULADOR
   
ANDROID
- cordova run android --emulator

IOS
- cordova run ios –list
- cordova run ios –target < deviceID >

4. CONSTRUIR APK
- cordova prepare
- cordova build android
- Cordova build android --prod --release

5. DEBUGGER

- cordova serve 8000 (http://localhost:8000/android/www/index.html)

platforms/android/app/build.gradle

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

Posibles Errores al construir:

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

    Reemplazarlo por:

```js
require("fs");
require("path");
require("elementtree");
require("shelljs");
```

    ERROR:
    AAPT: error: resource color/contents_text (aka com.medifarma.cp.pesajeimpresionbultosaldo:color/contents_text) not found.

    Agregar los colores que generan error en:
    ..\platforms\android\app\src\main\res\values\colors.xml

```html
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
    ..\platforms\android\app\src\main\res\values\dimens.xml

```html
<resources>
  <dimen name="half_padding">16dp</dimen>
  <dimen name="standard_padding">16dp</dimen>
</resources>
```

