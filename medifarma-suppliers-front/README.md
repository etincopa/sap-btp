# everis-suppliers

Portal de Proveedores Front

## Cambios necesarios para apuntar una app a QAS

Se ha agregado una ruta más `saperpqas` (que apunta al destination `S4H_HTTP_BASIC_QAS`) al `xs-app.json` del app router.

Se debe agregar esta misma ruta al `xs-app.json` de la aplicación que se quiera apuntar a QAS.

Además, cambiar todas las referencias de `saperp` a `saperpqas` en la carpeta de esa aplicación (usar la funcionalidad de buscar por carpeta del IDE que esté utilizando).

_Nota:_ Lo mencionado arriba es una de las formas de lograr que la app apunte a QAS. Otras formas son bienvenidas, pero informarlas al equipo del proyecto.

## Despliegue de la solución

### Requisitos antes del despliegue

1. Tener los siguientes entitlements en la subaccount:

    - [x] Portal
    - [x] Application Runtime
    - [x] Connectivity
    - [x] Destination
    - [x] HTML5 Applications
    - [x] Workflow
    - [x] UI Theme Designer
    - [x] HANA Cloud (para la app de Invitaciones)

2. [x] Crear un System user en el administrador del IAS y colocarle una contraseña. Ver [documentación](https://help.sap.com/viewer/6d6d63354d1242d185ab4830fc04feb1/Cloud/en-US/e3f31bdf55c5454c86a479c6384498a5.html).
       _Para este proyecto es: AAA_

3. [x] Revisar los destinos, ya que probablemente varíen de un ambiente a otro. Por ejemplo, en este repo el destino que apunta al S/4HANA ES4 de everis es `Everis`.
       Actualmente se tienen mapeados los siguientes:

    - [ ] TODO: VALIDAR S4H_HTTP_BASIC (Ver `docs/destinations/S4H_HTTP_BASIC`)
    - [x] IAS_SCIM_API (Ver `docs/destinations/IAS_SCIM_API`)
    - [x] TODO: SUPPLIERS_WORKFLOW_MAIL (Ver `docs/destinations/SUPPLIERS_WORKFLOW_MAIL`)
    - [ ] soap_wsdl (TODO: VALIDAR)

4. [x] Solicitar la instalación de certificados en el SAP ERP (tx. STRUST) para poder usar los servicios de SAP BTP Workflow e IAS. A continuación como descargar los certificados.

    - 5.1 Se tiene que tener mapeado los dominios, tanto para workflow e IAS. Por ejemplo, el Workflow API puede estar en la región cf-us10:

        > Workflow [https://api.workflow-sap.cfapps.us10.hana.ondemand.com](https://api.workflow-sap.cfapps.us10.hana.ondemand.com)

        > IAS [https://awjv7cscn.accounts.ondemand.com](https://awjv7cscn.accounts.ondemand.com)

    - 5.2 Descargar los certificados desde el navegador.<br>
      _Nota: En caso se requiera un proxy para realizar las conexiones de SAP ERP hacia servicios externos les deben brindar el proxy host y proxy port._

5. [x] Se debe solicitar salida a nivel de red desde el SAP ERP hacia SAP BTP (a la región correspondiente).

6. [x] Solicitar salida del SAP Cloud Connector hacia SAP BTP (a la región correspondiente). _Importante: Validar con equipo basis._

7. [x] Migrar código ABAP de paquetes `/EPER/UTILS` y `/EPER/SUPPLIERS`.

8. [x] Activar/exponer servicios OData `/EPER/SUPPLIERS_SRV` en la tx. `/IWFND/MAINT_SERVICE`.

9. [x] Llenar tabla de constantes (`/EPER/TCONSTANTS`).

    1. El client id y secret de Workflow se obtienen del service key del workflow instance.
    2. El user/password de IAS son los mismos que los configurados en el destination IAS_SCIM_API (system user administrator).

10. [x] Registrar object y subobject de log en la tx. `SLG0`:

    - Objeto: /EPER/SUPPLIERS
        - Subobjetos:
            - BP_REQUEST: Solicitud de creación Business Partner
            - PR_NOT_PORDER: Pre register without purchase order
    - Objeto: /EPER/GENERAL (General Logs)
        - Subobjetos:
            - IAS_API: Identity Authentication SCIM API

11. [x] Registrar rangos de números:

    **Código del rango:**
    /EPER/PRN

    - **Descripción del rango:**
      Rango de número para la tabla /EPER/TPRNOTPORD
    - **Dominio longitud número:**
      /EPER/D_CORRELATIVE
    - **Advertencia %:**
      10.0
    - **Intervalo:**
      01: 0000000001 - 9999999999

    **Código del rango:**
    /EPER/PRW

    - **Descripción del rango:**
      Rango para la tabla /EPER/TPRNOTPOWF
    - **Dominio longitud número:**
      /EPER/D_CORRELATIVE
    - **Advertencia %:**
      10.0
    - **Intervalo:**
      01: 0000000001 - 9999999999

    **Pasos**: (seguir para los 2 rangos de números indicados)

    - Entrar en la tx. SNUM en PRD
    - En el campo "Nombre objeto" ingresar el código del rango (por ejemplo: /EPER/PRN)
    - Darle al botón Crear
    - En el campo Txt. Brv. ingresar el mismo "código del rango"
    - En el camop TxtExpl. ingresar la "descripción del rango
    - En el campo Dominio longitud número ingresar el valor "Dominio longitud número"
    - En el campo Advertencia % ingresar el valor "Advertencia %"
    - Dejar las demás opciones por defecto
    - Guardar (botón disquete)
    - Ingresar a la ventana de Intervalos
    - Agregar el intervalo definido en el valor "Intervalo". Considerar "01" como identificador del intervalo.

12. [x] Llenar tablas `/EPER/TSUPPROLE` y `/EPER/TSUPPUSRL` mediante sus vistas de actualización (tx. `SM30`). Se debe llenar en mayúsculas los campos que no sean descripciones.

    Tabla `/EPER/TSUPPROLE`:

    ```
    BP_APPROVER  | APROBADOR DE PRE REGISTRO SIN OC
    PRN_APPROVER | APROBADOR DE BUSINESS PARTNER
    ```

13. [ ] Para app Invitación de Proveedores: Crear mapping hacia la subaccount de aplicaciones en la subaccount donde reside la base de datos HANA Cloud.

14. [ ] TODO: Crear usuario en el ERP para el destination `S4H_HTTP_BASIC`.

15. [x] Se debe crear un destination hacia el servicio de IAS SCIM API:
    - Entrar en la tx. SM59
    - Crear nuevo destination de tipo 'G' (Conexión HTTP con servidor externo) con el nombre `IAS_HOST`
    - Llenar los datos relevantes
        - Host: <ias_tenant>.accounts.ondemand.com
        - Puerto: 443
        - Prefijo: /service/scim/
    - En la pestaña de Entr.sist./Seguridad activar el uso de certificado y seleccionar donde se haya cargado el certificado SSL: ANONYM Cliente SSL (anónimo)
    - Guardar

### Pasos para despliegue

1. [x] Hacer build y desplegar modulo de servicios (Sunat, etc...): https://github.com/everis-scp/everis-suppliers-services-db. Recordar modificar el `host` en el `mta.yaml` ya que este debe ser único.
2. [x] Hacer build y despliegue del Workflow para la app BP Creation Request (repo: https://github.com/everis-scp/everis-suppliers-bp-workflow) y también la de Workflow para Pre-registro sin OC (repo: https://github.com/everis-scp/everis-suppliers-invoicenotoc-workflow). TODO: Se debe hacer luego de suppliers-front, ya que depende de `workflow_service`.
3. [ ] Hacer build y desplegar backend de app Invitacion (https://github.com/everis-scp/everis-suppliers-invitation-capm)
4. [x] Crear una instancia de "app-host" con el nombre `suppliers_html5_repo_host` y actualizarlo con la config. `{"sizeLimit": 8}`. Para mas detalle, ver [esta documentación](https://github.com/everis-scp/scp-documentation/blob/master/scp/cf/cf.md#sizelimit-html5-repo-host). Esto sólo se hace para el primer despliegue.
5. [x] Hacer Build de todo el proyecto y desplegar. Recordar modificar el `host` en el `mta.yaml` ya que este debe ser único. También agregar el URL correspondiente en `xs-security.json`.
    ```
    > mbt build
    > cf deploy mta_archives/...mtar
    ```
6. [x] Crear un service key al service instance de Workflow con el nombre `workflowsuppliers`.

### Pasos pos-despliegue

1. [x] Asignar permisos a workflow instance service. Ver [documentación](https://github.com/everis-scp/scp-documentation/blob/master/workflow-cf/wf.md#permisos). Por ejemplo:

`cf update-service workflow_service -c "scopes.json"`

2.  [x] Configurar IAS:
    -   Descargar metadata IAS: Tenant Settings > SAML 2.0 Configuration > Download Metadata File
    -   En SCP, ir a Trust Configuration y añadir metadata IAS
    -   En IAS, añadir una nueva Application
    -   Añadir SAML 2.0 Configuration (descargar metadata de SCP > Trust Configuration > SAML Metadata) y setear Algorithm a `SHA-256`
    -   Cambiar Subject Identifier a Login Name
    -   Agregar Assertion Attribute: Groups > Groups (respetar mayúsculas)
    -   En IAS, configurar Trusted Domains en Tenant Settings
    -   Setear en el Application, el Home URL
    -   Actualizar los templates de correos de IAS. Ver carpeta `docs/templates/` y plantilla _Plantillas y Políticas IAS - Suppliers - Everis v1.0.xlsx_.
    -   Cargar CSS y apuntar a este
3.  [x] Crear Role Collections (no se manejan por el `xs-security.json`) y asignarle los roles que correspondan (guiarse de la subcuenta Everis - Demo):
    -   [x] Suppliers_BP_Aprobador
    -   [x] Suppliers_BP_Proveedor
    -   [x] Suppliers_Admin
    -   [x] Suppliers_Inicial
    -   [x] Suppliers_Invitacion
    -   [x] Suppliers_Monitor
    -   [x] Suppliers_User_Load
4.  [x] Crear Role Collection Mappings en Trust Configuration

5.  [ ] Publicar el theme correspondiente (ver `resources/everis-theme.zip`). Ver más info en repo [`scp-documentation/theming`](https://github.com/everis-scp/scp-documentation/blob/master/btp/theming/btp-theming.md).

**IMPORTANTE:** Aplica para Custom Domain: Después de desplegar en PRD, verificar si es accesible la app desde: (URL Custom Domain)<br>
En caso salga error, ejecutar el comando `cf map-route suppliers-approuter <domain> --hostname <subdomain>`.

### Otros

-   [Documentación de Roles necesarios para Workflow tiles.](https://help.sap.com/viewer/e157c391253b4ecd93647bf232d18a83/Cloud/en-US/103f2b307af142e5a91368c1539dea57.html)

-   Si sale el error "Invalid redirect ...", ver [este blog](https://blogs.sap.com/2020/07/08/how-to-update-xsuaa-service-instance-to-accept-multiple-redirect-uris/).

    Hay que configurar en el `xs-security.json` el enlace del portal y volver a hacer build/desplegar, por ejemplo:

    ```json
    "oauth2-configuration": {
          "redirect-uris": [
              "https://everis-peru-demo-apps-suppliers-approuter.cfapps.us10.hana.ondemand.com/login/callback",
              "http://localhost:5000/login/callback"
          ]
      }
    ```

-   **Despliegue Individual de apps HTML5**

    Esto construye todas las apps:

    ```
    > mbt build -m=verbose
    ```

    Esto construye el módulo designado por el "module_path":

    ```
    > cd "module_path"
    > ui5 build
    ```

    Finalmente, se suben las apps a SAP BTP:

    ```
    > cd 'raiz del proyecto'
    > cf html5-push bpcreationrequest/dist accountstatus/dist ui5suppliersinvitation/dist invoiceregister/dist potracking/dist tilepotracking/dist app/dist quotationupdate/dist invoiceregisternotoc/dist approvalmonitor/dist tileaccountstatus/dist ui5UsersMassiveLoad/dist <ID>
    ```

    El `<ID>` se obtiene del app-host service instance o ejecutando el comando `cf html5-list`.

    Ejemplo:

    ```
    cf html5-push bpcreationrequest/dist accountstatus/dist ui5suppliersinvitation/dist invoiceregister/dist potracking/dist tilepotracking/dist app/dist quotationupdate/dist invoiceregisternotoc/dist approvalmonitor/dist tileaccountstatus/dist ui5UsersMassiveLoad/dist 89e99823-5d5d-4ed4-91c2-edcf2a731aed
    ```

## TODO:

-   Quitar referencias a Kallpa
