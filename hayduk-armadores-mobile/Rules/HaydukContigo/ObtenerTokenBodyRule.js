
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerTokenBodyRule(clientAPI) {
    
    let appSettings = require("@nativescript/core/application-settings");
    let sCorreo = appSettings.getString("correo");
    let sRuc = appSettings.getString("ruc");
    var usu = appSettings.getString("sUsuarioHC");
    var pass = appSettings.getString("sPasswordHC");
    var request = {
        "username": usu,
        "password": pass,
        "usernameUsuario": sCorreo,
        "rucUsuario": sRuc
    };
    console.info('[DEBUG] ObtenerTokenBodyRule.ts - start', JSON.stringify(request));
    return request;
}
