/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function Correo(context) {
    let appSettings = require("@nativescript/core/application-settings");
    let sCorreo = appSettings.getString("correo");
    return sCorreo;
}