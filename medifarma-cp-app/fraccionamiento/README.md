# Getting Started
## VARIABLES DE ENTORNO
## VERSIONES
    electron v18.2.4
    node v14.1.5
    npm 6.14.14
## CONFIGURACION POR AMBIENTES
Archivos de configuracion para cada ambiente y configuracion de conexion con balanza (SerialPort)
app/manifest.json
app/service/localFunction.js
app/service/serial.js
## PASOS EJECUTAR APP
1.- Si falta el folder resources descargarlo del internet https://openui5.org/releases/
2.- Instalar todos los complementos npm del proyecto
    npm install
3.- Al instalar complementos de npm adicionales.



    (*) npm install -g electron
    (*) npm install --save-dev electron-builder
    npm i electron-packager
    npm i cli-truncate
    npm install -g create-electron-app
    npm install --save-dev @electron-forge/cli
    npx electron-forge import    
## CONSTRUIR APP
- Ejecutar app local
        (*) npm run start
- Construir instalador
        (* All) npm run dist
        (* windows) npx electron-builder --win --x64
- Construir
        npm run build

    ```sh
MacOs:
$ npm run dist
    |-- mac
    |   |-- appname-version-mac.zip
    |   |-- appname-version.dmg
    |   |-- appname.app
Windows:
# Cuando se utiliza el objetivo — Squirrel
    "win": {
      "target": "squirrel",
      "icon": "buildApp/icon.ico"
    }
$ npm run dist
    |-- win
    |   |-- REALESES
    |   |-- appnameSetupversion.exe
    |   |-- appname-version-full.nupkg
    |-- win-unpacked
# Cuando se utiliza el objetivo — NSIS
    "win": {
      "icon": "buildApp/icon.ico",
      "target": [
        "nsis"
      ]
    },
$ npm run dist
    |-- win
    |   |-- appnameSetupversion.exe
    |-- win-unpacked
En Linux:
$ npm run dist
    |-- appname-version.AppImage
    |-- appname-version.deb
    |-- linux-unpacked
```