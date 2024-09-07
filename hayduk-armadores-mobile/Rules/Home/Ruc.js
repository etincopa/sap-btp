/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function Ruc(context) {
    let appSettings = require("@nativescript/core/application-settings");
    let sRuc = appSettings.getString("ruc");
    return sRuc;
}