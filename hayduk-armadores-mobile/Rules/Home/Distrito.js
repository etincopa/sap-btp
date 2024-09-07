/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function Distrito(context) {
     let appSettings = require("@nativescript/core/application-settings");
    let sDistrito = appSettings.getString("distrito");
    return sDistrito;
}