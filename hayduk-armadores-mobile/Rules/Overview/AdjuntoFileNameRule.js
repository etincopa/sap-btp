/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function Correo(context) {
    let appSettings = require("@nativescript/core/application-settings");
    let fileName = appSettings.getString("fileName");
    return fileName;
}