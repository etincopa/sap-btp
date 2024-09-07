# hayduk-armadores-mobile

Repositorio de aplicativo movil de armadores (Metadata Project). Este proyecto se migró de MDK 5 a MDK 6, lo cual implicó que se aplique una [migración semi-automática según esta documentación](https://help.sap.com/doc/f53c64b93e5140918d676b927a3cd65b/Cloud/en-US/docs-en/about/releases/mdk/metadata-migration.html).

## Requisitos

- Depende del Client Project (https://github.com/everis-scp/hayduk-armadores-mobile-mdkclient)

## Cómo ejecutar desde VS Code

- Seguir los siguientes pasos: https://blogs.sap.com/2020/12/21/debug-your-mdk-app-with-visual-studio-code-android-studio./
- Agregar en el BAS o VS Code - MDK Extension Settings la siguiente librería externa:
  ```
  {
    "mdk.bundlerExternals": [
      "nativescript-advanced-webview"
    ]
  }
  ```

## Tips

- Desde VS Code:
  - Se puede lanzar la app para que ejecute en el emulador desde el `launch.json` > "MDK Launch on Android".
  - Se puede attachar un debugger desde `launch.json` > "MDK Attach on Android". Usar las opciones Breakpoints "All Exceptions" y "Uncaught Exceptions" para capturar excepciones en tiempo de ejecución (esto no se puede hacer desde BAS).

## Errores Migración

- Se corrigió un error relacionado a un código que fallaba en el método `initialize` de `Extensions/MyWebViewModule/controls/MyWebViewExtension.ts`.
- Se corrigió un error "android.view.InflateException" relacionado a que el background no coincidía con el de la app. Se tomó el color del background del Client Project y se seteó en los controles en `Extensions/MyWebViewModule/controls/MyWebViewExtension.ts`
  ```
  this._layout.backgroundColor = "#354A5F";
  ...
  const opts: AdvancedWebViewOptions = {
                  url: Url,
                  showTitle: false,
                  toolbarColor: "#354A5F",
                  toolbarControlsColor: "#354A5F",
                  ...
  ```

## TODO:

- Documentar cambios que se tienen que hacer para apuntar a DEV/QAS/PRD.
- Documentar pasos de despliegue de la App
- Documentar pasos de despliegue del Client
