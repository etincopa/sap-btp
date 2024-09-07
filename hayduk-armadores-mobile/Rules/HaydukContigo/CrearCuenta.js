
var clientAPI;

/**
 * Describe this function...
 */
export default async function CrearCuenta(clientAPI) {
    let nombreCtrl = clientAPI.evaluateTargetPath("#Page:CrearCuenta/#Control:txtNombre");
    let nombre = nombreCtrl.getValue();
    let telCtrl = clientAPI.evaluateTargetPath("#Page:CrearCuenta/#Control:txtTelefono");
    let telefono = telCtrl.getValue();
    let dniCtrl = clientAPI.evaluateTargetPath("#Page:CrearCuenta/#Control:txtDNI");
    let dni = dniCtrl.getValue();
    let appSettings = require("@nativescript/core/application-settings");
    var urlToken = appSettings.getString("sUrlTokenHC");
    let sCorreo = appSettings.getString("correo");
    let sRuc = appSettings.getString("ruc");
    var razonSocial = appSettings.getString("razonSocial");

    let TextModule = require("@nativescript/core/text");

    const platform = clientAPI.nativescript.platformModule;
    var request = {
        "username": sCorreo,
        "password": sRuc,
        "telefono": telefono,
        "nombresApellidos": nombre,
        "tipoDocumentoId": "DNI",
        "numeroDocumento": dni,
        "rucEmpresa": sRuc,
        "razonSocialEmpresa": razonSocial
    }
    var newUrl = urlToken.substr(0, urlToken.lastIndexOf("/")) + "/registrarArmador";
    var result = await createAccount(newUrl, request);
    const Dialogs = clientAPI.nativescript.uiDialogsModule;
    if (result.isOk) {
        Dialogs.alert({
            title: 'Hayduk Contigo!',
            okButtonText: 'Aceptar',
            message: `Se ha enviado la solicitud exitosamente`
        });

    }
    else {
        Dialogs.alert({
            title: 'Hayduk Contigo!',
            okButtonText: 'Aceptar',
            message: result.message
        });
    }
}

async function createAccount(url, requestJson) {
    let httpModule = require('@nativescript/core/http');
    return new Promise(function (resolve, reject) {
        httpModule.request({
            url: url,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify(requestJson)
        }).then((response) => {
            const result = response.content.toJSON();
            var res = {
                isOk: false,
                message: ""
            }
            if (result.code == 200) {
                res.isOk = true;
                res.message = result.data.username;
            } else if (result.code == "E007") {
                res.isOk = false;
                res.message = result.mensaje;
            }
            resolve(res);
            // << (hide)
        }, (e) => {
            var result = {
                isOk: false,
                message: e.content.toJSON().mensaje
            }
            reject(result);
        });
    });
}