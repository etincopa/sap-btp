/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function Headline(context) {
    let appSettings = require("@nativescript/core/application-settings");
    let sHeadline = appSettings.getString("razonSocial");
    return sHeadline;
}