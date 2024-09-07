# Informe de Flota 
![build/release/upload](https://github.com/everis-scp/hayduk-informe-flota-front/workflows/Upload%20to%20Sharepoint%20workflow/badge.svg)

**Funcionalidades:**

**Restricciones:**
- No permite guardar múltiples borradores. Sólo almacena el último.

## Dependencias
Depende de la aplicación `informeflotalogin`. Debe estar desplegada en SCP.

## Despliegue
El despliegue de esta aplicación consiste en:
- Desplegar en SCP la versión web (sin cambiar los URLs que apuntan a `informeflotalogin`). Actualmente esto sólo es necesario para QAS, ya que en PRD sólo se usa la versión Desktop.
- Generar el instalador para Windows con electron-builder (previamente cambiando los URLs que apuntan a `informeflotalogin`). **Esto se encuentra automatizado con GitHub Actions. También se sube el instalador a la [carpeta correspondiente en SharePoint](https://everisgroup.sharepoint.com/sites/CompartidoExterno/Documentos%20compartidos/Forms/AllItems.aspx?viewid=59f9654b%2D813e%2D411a%2Daf84%2D84038d28036b&id=%2Fsites%2FCompartidoExterno%2FDocumentos%20compartidos%2FGeneral%2F3%2E%20Hayduk%2FInforme%20de%20Flota)**: 

### Despligue en SCP desde Web IDE (versión web)
1. Clonar repo.
2. Cambiar en el `package.json` para que el `script.build` sea "ui5 build --all".

### Despliegue en SCP desde local (manualmente)
1. Generar build: `npm run ui5build`

2. Borrar archivo `di.code-validation.core_issues.json` de `dist/`. *Por alguna razón este archivo pesa varios MBs.*
3. Comprimir archivos.
4. Subir en HTML5 apps > Versioning > Versions
5. Activar nueva versión


## Generación de Instalador
### Target platforms
Sólo se ha probado con Windows (nsis). Probablemente necesite ajustes (relacionados a rutas, por ejemplo de los icons) para desplegar en macOS, sin embargo esto no es requerido por Hayduk.

### Usando GitHub Actions
Para realizar un despliegue (generación de Instalador para Windows) utilizando GitHub Actions:
- Cambiar versión en `package.json` siguiendo la nomenclatura `{package.version}-rc.{X}-{ENV}`. Ojo que no tiene "v" al inicio.
- Hacer un commit con algún nombre, por ejemplo "despliegue qas" o "despliegue prd".
- Crear un tag con la siguiente nomenclatura (importante poner la "v" al inicio): `v{package.version}-rc.{X}-{ENV}`
  - package.version: es lo colocado en el `package.json`
  - X: es el nro. de intento de despliegue, comienza en 1 y va aumentando. Se debe reiniciar para un nuevo package.version
  - ENV: entorno de despliegue. Si es "QAS" se generará el instalador con los URLs de QAS. Si es "PRD" se generará el instalador con los URLs de PRD (Ver `build-tools\replace-service-urls.js`).
- Pushear ese tag

Ejemplo:

```console
> git add .
> git commit -m "despliegue qas"
> git tag v1.0.5-rc.2-QAS
> git push --tags
```

El workflow definido de generación de instalador depende de la configuración en `.github\workflows\build.yaml` e invoca `npm run dist` el cual a su vez utiliza `build-tools\replace-service-urls.js` para reemplazar los URLs de los servicios.

**Importante:** Tener cuidado con estos archivos!

### Local
Para generar el instalador en local:
```console
> npm install
> npm run dist
```

## Base 

Tener en consideración que a nivel funcional esta aplicación esta basada en los siguientes programas ABAP (Informe de Flota SAP):

 - Creación de Temporada: ZPPVA_TEMP_PESCA.
 - Carga de embarcaciones oficiales: ZPPI0001.
 - Creación de cuota por embarcación: ZPPI0002.
 - Creación de cuota por tripulante: ZPPI0004.
 - Ubicación de Zona de Pesca: ZPPVA0004.
