
var clientAPI;

/**
 * Describe this function...
 */
export default function CrearCuentaBodyRule(clientAPI) {
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
    return request;
}
