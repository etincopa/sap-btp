# Rendición de Gastos - Frontend

## Ejecución en local (VS Code o BAS)

Tener en cuenta que:

- De preferencia usar una sesión en incógnito en el navegador web.
- Para las operaciones de workflow (route `bpmworkflowruntime`) se debe iniciar sesión en el IAS (p. ej. desde el siguiente enlace: http://localhost:8080/bpmworkflowruntime/v1/xsrf-token
- En la carpeta de la app que se desea probar debe existir un `default-env.json` con las variables de la app `temporal-approuter`. Se pueden obtener con el comando `cf default-env temporal-approuter` (para instalar el plugin default-env ver este [enlace](https://github.com/everis-scp/scp-documentation/blob/master/README.md#instalaci%C3%B3n-de-herramientas)).

Comandos:

```bash
# Ir a la app que se desea probar (p. ej. <app> = caja-chica)
cd <app>
# Iniciar Fiori Launchpad Sandbox
npm run start
```

## Despliegue

```bash
# Iniciar sesión en CF
cf login --sso -o everis-peru-demo -s apps

# Build y deploy de una app en específico
# (tener en consideración que podrían haber conflictos con cambios de otros desarrolladores)
cd caja-chica && npm run build:cf && cd .. && cf html5-push caja-chica/dist entregas-rendir/dist entregas-rendir-taskui/dist monitor-aprobacion/dist reporte-documentos/dist 66e4c059-97c5-4561-b373-14b20da77b5b
#
cd entregas-rendir && npm run build:cf && cd .. && cf html5-push caja-chica/dist entregas-rendir/dist entregas-rendir-taskui/dist monitor-aprobacion/dist reporte-documentos/dist 66e4c059-97c5-4561-b373-14b20da77b5b
#
cd monitor-aprobacion && npm run build:cf && cd .. && html5-push caja-chica/dist entregas-rendir/dist entregas-rendir-taskui/dist monitor-aprobacion/dist reporte-documentos/dist 66e4c059-97c5-4561-b373-14b20da77b5b
#
cd reporte-documentos && npm run build:cf && cd .. && html5-push caja-chica/dist entregas-rendir/dist entregas-rendir-taskui/dist monitor-aprobacion/dist reporte-documentos/dist 66e4c059-97c5-4561-b373-14b20da77b5b
```

## Sharepoint

Se ha migrado la gestión de archivos de esta solución de Document Service a Sharepoint:
https://everisgroup.sharepoint.com/sites/Everis_Demo_BTP_Rendicion_Gastos/Shared%20Documents/Forms/AllItems.aspx

## Roles

Para Fondo Fijo:

- Roles de Workflow ([link](https://api.sap.com/api/SAP_CP_Workflow_CF/resource))

  - Global roles: WorkflowInitiator / Scopes:
    WORKFLOW_DEFINITION_GET
    WORKFLOW_INSTANCE_START
    WORKFLOW_INSTANCE_RETRY_RESUME

    ```
    > cf update-service workflow_mta -c '{"authorities": ["WORKFLOW_DEFINITION_GET","WORKFLOW_INSTANCE_START","WORKFLOW_INSTANCE_RETRY_RESUME"]}'
    ```

- TODO:

## Setup / Instalación en Cliente

---Work in progress---

1. Config. Workflow para registrar apps My Inbox, etc... en Portal Service ([link](https://blogs.sap.com/2021/03/21/add-my-inbox-app-to-the-btp-cf-launchpad-site/))

2. Role Collections ([API Documentation](https://api.sap.com/api/SAP_CP_Workflow_CF/resource))

3. Configuración Portal Service
   - My Inbox: Se crea una copia local de la app y se activa la opción de `showAdditionalAttributes = true` para que muestre las variables (atributos) que los workflows setean en el User Task. [Documentación relacionada](https://help.sap.com/viewer/e157c391253b4ecd93647bf232d18a83/Cloud/en-US/634a7bad2dd04592bdaa133dd126bbb7.html).



# Deploy UI5
```sh
root > mbt build                        (Generar build a todo el proyecto)
root > cd carpeta_proyecto > ui5 build  (Generar build a un proyecto en especifico)

cf login -a https://api.cf.us10.hana.ondemand.com/ -u MiCorreo@nttdata.com -p MiContraseña
```

## DEV
Suppliers
```sh
cf html5-push accountstatus/dist approvalmonitor/dist bpcreationrequest/dist bpupdaterequest/dist invoiceregister/dist invoiceregisternotoc/dist potracking/dist quotationupdate/dist tileaccountstatus/dist tilepotracking/dist ui5suppliersinvitation/dist ui5UsersMassiveLoad/dist edc2689f-ce91-4f65-8373-434a60cd8019
```

ER y FF
```sh
cf html5-push caja-chica/dist entregas-rendir/dist entregas-rendir-taskui/dist monitor-aprobacion/dist reporte-documentos/dist f1b5653e-0065-407e-8f69-2ffe022aab2e
```

## QAS
Suppliers
```sh
cf html5-push accountstatus/dist approvalmonitor/dist bpcreationrequest/dist bpupdaterequest/dist invoiceregister/dist invoiceregisternotoc/dist potracking/dist quotationupdate/dist tileaccountstatus/dist tilepotracking/dist ui5suppliersinvitation/dist ui5UsersMassiveLoad/dist 2b6120a6-6836-4453-8fd3-08fc0a9d7307
```

ER y FF
```sh
cf html5-push caja-chica/dist entregas-rendir/dist entregas-rendir-taskui/dist monitor-aprobacion/dist reporte-documentos/dist fa16343b-3cd7-4914-a623-1145aee51fa9
```

## PRD
Suppliers
```sh
cf html5-push accountstatus/dist approvalmonitor/dist bpcreationrequest/dist bpupdaterequest/dist invoiceregister/dist invoiceregisternotoc/dist potracking/dist quotationupdate/dist tileaccountstatus/dist tilepotracking/dist ui5suppliersinvitation/dist ui5UsersMassiveLoad/dist 9d7b84ed-8943-4b16-b74b-494808103279
```

ER y FF
```sh
cf html5-push caja-chica/dist entregas-rendir/dist entregas-rendir-taskui/dist monitor-aprobacion/dist reporte-documentos/dist 6ce53f51-25e4-4339-9fa9-f57b885ddaf7
```