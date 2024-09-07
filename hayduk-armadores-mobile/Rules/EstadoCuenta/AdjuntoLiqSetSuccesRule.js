
/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function AdjuntoLiqSetSuccesRule(context) {

    let fs = require('@nativescript/core/file-system');
    let TextModule = require("@nativescript/core/text");
    let appSettings = require("@nativescript/core/application-settings");

    const platform = context.nativescript.platformModule;
    const Dialogs = context.nativescript.uiDialogsModule;

    let oActionResponce = context.getActionResult("oData");
    let oData = oActionResponce.data._array;

    if (oData.length > 0) {

        var sBase64 = oData[0].Documento;
        var fileName = oData[0].NombreArchivo;
        if (fileName.length < 4) fileName = "documento.pdf";

        //var sBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G";
        if (sBase64.length > 0) {


            let appSettings = require("@nativescript/core/application-settings");
            appSettings.setString("sBase64", sBase64);

            return context.getPageProxy().executeAction({
                "Name": "/Armadores/Actions/EstadoCuenta/OpenDocumentOdata.action"
            });


            /*

            let documents = fs.knownFolders.documents();
            let filePath = "/storage/emulated/0/Download"; //documents.path;

            const path = fs.path.join(filePath, fileName); //Crea ruta Archivo temporal
            const file = fs.File.fromPath(path); //Obtiene Archivo temporal Creado

            let contentFile;
            if (platform.isAndroid) {
                contentFile = android.util.Base64.decode(sBase64, android.util.Base64.NO_WRAP);
            }

            if (platform.isIOS) {
                contentFile = NSData.alloc().initWithBase64EncodedStringOptions(base64Data, 0);
            }

            //Sobrescribir el contenido en el archivo creado
            file.write(contentFile)
                .then((result) => {
                    // Succeess.
                    return context.getPageProxy().executeAction({
                        "Name": "/Armadores/Actions/ToastMessageGeneric.action",
                        "Properties": {
                            "Message": `Archivo descargado en: ${filePath} /${fileName}`,
                        }
                    });
                })
                .catch((err) => {
                    return context.getPageProxy().executeAction({
                        "Name": "/Armadores/Actions/ToastMessageGeneric.action",
                        "Properties": {
                            "Message": `Error: ${err.stack}`,
                        }
                    });
                });
                 */
        } else {

            return context.getPageProxy().executeAction({
                "Name": "/Armadores/Actions/ToastMessageGeneric.action",
                "Properties": {
                    "Message": "El documento esta vacio, no es posible generar"
                }
            });
        }

    } else {

        return context.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/ToastMessageGeneric.action",
            "Properties": {
                "Message": "No se encontro documentos asociados"
            }
        });

    }

}
