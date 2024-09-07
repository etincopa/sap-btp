/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function downLoadFilesRule(context) {

    let fs = require('@nativescript/core/file-system');
    let http = require('@nativescript/core/http');
    let TextModule = require("@nativescript/core/text");

    const platform = context.nativescript.platformModule;
    const Dialogs = context.nativescript.uiDialogsModule;

    var sBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G";
    var fileName = "probando.pdf";

    var documents = fs.knownFolders.documents();
    //var filePath = "/sdcard/Download"; //documents.path;
    var filePath = "/storage/emulated/0/Download"; //documents.path;
    const path = fs.path.join(filePath, fileName); //Create temporal file
    const file = fs.File.fromPath(path); //Get Temporal File

    let nativeData;

    if (platform.isAndroid) {

        //const text = new java.lang.String("cualquierCosa");
        //const data = text.getBytes("UTF-8");
        //const base64 = android.util.Base64.encodeToString(sBase64, android.util.Base64.NO_WRAP);
        nativeData = android.util.Base64.decode(sBase64, android.util.Base64.NO_WRAP);

    }

    if (platform.isIOS) {

        //const data = text.dataUsingEncoding(NSUTF8StringEncoding);
        //const base64 = data.base64EncodedStringWithOptions(0);
        nativeData = NSData.alloc().initWithBase64EncodedStringOptions(base64Data, 0);
    }

    file.write(nativeData)
        .then((result) => {
            // Succeed.
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

    /*
    file.writeSync(nativeData,
        err => {
            Dialogs.alert({
                title: "Error",
                message: "Error: " + err,
                okButtonText: "Ok",
            });
        }, TextModule.encoding.ISO_8859_1);

  
    */


    /*
        var url  = "https://asp402r.paperless.com.pe/Facturacion/PDFServlet?id=3JQEzOli(MaS)caknVTeC6tnRw(IgU)(IgU)&o=E";
        http.getFile(url, path)
            .then(resultFile => {
                Dialogs.alert({
                    title: 'Saved!',
                    okButtonText: 'OK',
                    message: `File saved here:\n${resultFile.path}`
                });
            }, error => {
                Dialogs.alert({
                    title: 'Error',
                    okButtonText: 'OK',
                    message: `${error}`
                });
            });
    */


}
