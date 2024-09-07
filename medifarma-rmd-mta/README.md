# medifarma-rmd-mta

### Instalar el CDS global
npm i -g @sap/cds-dk

### Comandos Conectarse primero a HANA
cds deploy --to hana

mbt build

** cf login

Deploy al SCP
cf deploy <file.mtar> cf deploy <file.mtar> -m

### Para poder visualizar la BD de Hana, solo el esquema que uno esta creando
hana-cli opendbx

### Para ejecutar el modulo
cds watch

### Link de como configurar local SAP CommonCryptoLib para hacer deploy en SAP Hana Cloud
https://help.sap.com/viewer/e54136ab6a4a43e6a370265bf0a2d744/4.2.14/en-US/c049e28431ee4e8280cd6f5d1a8937d8.html

### Link para descargar el SAPCAR para extraer el SAP CommonCryptoLib
https://launchpad.support.sap.com/#/softwarecenter/template/products/_APP=00200682500000001943&_EVENT=DISPHIER&HEADER=N&FUNCTIONBAR=Y&EVENT=TREE&TMPL=INTRO_SWDC_SP_TC&V=MAINT&REFERER=CATALOG-PATCHES&ROUTENAME=products/By%20Category%20-%20SAP%20Technology%20Components

Una vez ingresado el link anterior, buscan SAPCAR y lo descargan de acuerdo a su sistema operativo.
Centro de descargas Generales
https://launchpad.support.sap.com/#

### Link video si tienen problemas con el powershell.
https://www.youtube.com/watch?v=zUszm-f6Xq4

### Para visualizar las salidas del Powershell para scripts
Get-ExecutionPolicy -list

### Para setear valor al Powershell y te permita usar scripts
Set-ExecutionPolicy RemoteSigned -Force

### Instalar Hana-Cli VS (por si no se encuentra en el package)
npm i -g hana-cli

### Si no funciona el general probar con esta version
npm i -g hana-cli@1.202010.5


### Despliegue html5

cf html5-push app/solicitudmd/dist 6374f652-cf50-446e-9dea-ab4d527c073b


## Resources for job
https://selient.medium.com/send-email-with-excel-files-attachment-in-node-js-9c994b9bf19f
https://nodemailer.com/about/
https://docs.sheetjs.com/docs/getting-started/roadmap


## Resources for services external
https://developers.sap.com/tutorials/btp-app-ext-service-add-consumption.html
