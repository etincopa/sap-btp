# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.9] - 2022-03-31

-   despliegue 2.0.9-PRD

## [2.0.8] - 2022-03-31

-   Cambios en las versionesv8

## [2.0.7] - 2022-03-31

-   Cambios en las versiones prd

## [2.0.6] - 2022-03-30

-   Cambios en las versiones action-electron-builder@v1.6.0

## [2.0.5] - 2022-03-30

-   Cambios en las versiones prd
-   Cambios en las versiones de librerias

## [2.0.4] - 2022-03-28

-   LFSHYD-1138 App informe de flota se cuelga al cargar informe (minor:without devtools)

## [2.0.3] - 2022-03-28

-   LFSHYD-1138 App informe de flota se cuelga al cargar informe (minor:delete datepicker and timepicker salidapesca, llegaazonapesca, descarga y descarga2)

## [2.0.2] - 2022-03-28

-   LFSHYD-1138 App informe de flota se cuelga al cargar informe (minor: delete datepicker and timepicker zonapesca also reset calas columns).

## [2.0.1] - 2022-03-25
-   LFSHYD-1138 App informe de flota se cuelga al cargar informe (minor change calas)

## [2.0.0] - 2022-03-23

-   add devTools

## [1.9.9] - 2022-03-23

-   LFSHYD-1138 App informe de flota se cuelga al cargar informe (minor change)

## [1.9.8] - 2022-03-23

-   Add lib folder

## [1.9.7] - 2022-03-23

-   version en PRD

## [1.9.6] - 2022-03-23

-   LFSHYD-1138 App informe de flota se cuelga al cargar informe

## [1.9.5] - 2022-01-07

-   LFSHYD-1084 Modificar orden columnas app SCP relacionado al ticket 1062

## [1.9.4] - 2021-12-10

-   Version en PRD

## [1.9.3] - 2021-12-10

-   Version temporal con Dev Tools activo

## [1.9.2] - 2021-12-10

-   LFSHYD-1062 Cambio de Nomenclatura: Fondo y Prof

## [1.9.1] - 2021-11-18

-   Version temporal con Dev Tools activo

## [1.9.0] - 2021-11-18

-   LFSHYD-1009 Adicionar Zona FAO

## [1.2.7]

-   Fix bug para primera embarcación H321 en funcionalidad Tripulación Propuesta

## [1.2.5]

-   Version en PRD con ajustes menores

## [1.2.2] - 2020-05-28

-   Corrección bug tallas (petición fallida), se borran tallas. Filtro no se enviaba bien.

## [1.2.1] - 2020-05-28

-   Corrección bug tallas (petición fallida), se borran tallas.

## [1.2.0] - 2020-05-26

-   Logs adicionales y debugger activado en electron (debe ser temporal).

## [1.1.1] - 2020-05-24

-   Se automatizó upload a Sharepoint con GitHub Actions.

## [1.1.0] - 2020-05-22

-   Fix input arribo en estado Error en caso que estaba bien.
-   Se agregó evento change para un mejor comportamiento de fechas/horas.
-   Typo Historial.
-   Mejoras a nivel ABAP:
    -   Más logs y validación de campos para que no se sobreescriban al venir un nuevo valor vacío.
    -   Corrección longitud Material (40 -> 18)

## [1.0.9] - 2020-05-18

-   Se agregó una corrección de calas en el backend ABAP (por un tema de versiones con Informe Flota ZPPI0005).
-   Se agregaron mejoras menores según ESLint.
-   Se revirtió la lógica de Tripulante. Ahora toma como filtro de búsqueda: Última temporada + palabra clave de búsqueda. La entidad OData es TripulanteSet, en lugar de TripulanteRegionSet.

## [1.0.8] - 2020-05-15

-   Se agregó completado de minutos en campos de 'fecha hora'.

## [1.0.7] - 2020-05-13

-   Se añadió log mejorado para error al cargar entidades.

## [1.0.6] - 2020-05-12

### Added

-   Se agregó evento "change" para campos Fecha y Hora de Calas. Esto corrige error de validación de fechas en calas.
-   Se resolvio el tema de Fondo en calas, solo permite 3 enteros y 2 dec.
-   Validación de fecha 31 corregida.
-   Se corrigió error (en SAP ERP) que no permitía agregar más de 21 calas.
-   Se agregó al proyecto URLs Dinámicos para los servicios (local/qas)
-   Se agregó Github Actions para dist automático.
