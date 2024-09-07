
var clientAPI;

/**
 * Describe this function...
 */
export default function FacturaVentaPetroleoSuccess(clientAPI) {
    let actionResult = clientAPI.getActionResult("get");
    var result = JSON.parse(actionResult.data);

    let url = result.sUrl;

    //let url = "https://asp402r.paperless.com.pe/Facturacion/PDFServlet?id=3JQEzOli(MaS)caknVTeC6tnRw(IgU)&o=E";
    //let url = "https://hayduk-qas-armadores-armador-srv.cfapps.us10.hana.ondemand.com/user";
    //let url = clientAPI.evaluateTargetPath("#Page:VentaPetroleo/#Control:spOpenDocument").getValue();

    return clientAPI.getPageProxy().executeAction({
        "Name": "/Armadores/Actions/EstadoCuenta/OpenDocumentAction.action",
        "Properties": {
            "Path": `${url}​​​​`,
        }
    });
    /*
    .then((result) => {
        
    }, (error) => {
        return clientAPI.getPageProxy().executeAction({
                "Name": "/Armadores/Actions/ToastMessageGeneric.action",
                "Properties": {
                    "Message": `${error}​​`,
                }
            });
    });*/



    /*
    let fs = require('@nativescript/core/file-system');

    let http = require('@nativescript/core/http');
    var fileName = result.sFolio + ".pdf";
    var filePath = "/storage/emulated/0/Download";

    var externalFolder = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath();
    var externalFolderExists = fs.Folder.exists(externalFolder);
    var path = "";
    if (externalFolderExists)
        path = fs.path.join(externalFolder, fileName);
    else
        path = fs.path.join(filePath, fileName); //Create temporal file

    http.getFile(url, path)

        .then(resultFile => {

            return clientAPI.getPageProxy().executeAction({

                "Name": "/Armadores/Actions/ToastMessageGeneric.action",

                "Properties": {

                    "Message": `Archivo descargado en: ${filePath}​​ /${fileName}​​`,

                }

            });
        }, error => {
            return clientAPI.getPageProxy().executeAction({

                "Name": "/Armadores/Actions/ToastMessageGeneric.action",

                "Properties": {

                    "Message": `${error}​​`,

                }

            });

        });
        */
}
