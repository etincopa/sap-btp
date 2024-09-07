/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function AdjuntoPDF(context) {
    let appSettings = require("@nativescript/core/application-settings");
    let actionResult = context.getActionResult("get");
    let sBase64 = actionResult.data._array[0].Documento;

    /* let  inputUser = context.evaluateTargetPath("#Page:User/#Control:UsuarioPrueba");*/
    if (sBase64.length > 0) {
        //return context.executeAction('/Armadores/Actions/EstadoCuenta/AdjuntoPDF.action');

        var binary_string = window.atob(sBase64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        var arrBuffer = bytes.buffer;

        var newBlob = new Blob([arrBuffer], {
            type: "application/vnd.openxmlformats"
        });

        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
            return;
        }

        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        var data = window.URL.createObjectURL(newBlob);

        var link = document.createElement('a');
        document.body.appendChild(link); //required in FF, optional for Chrome
        link.href = data;
        link.download = 'Prueba.pdf'; //sNombre;
        link.click();
        window.URL.revokeObjectURL(data);
        link.remove();

    } else {
        //return context.executeAction('/Armadores/Actions/Overview/ServiceRest/CreateTabCuentasEditWF.action');
    }



}