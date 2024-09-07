/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function SubHeadline(context) {
    let appSettings = require("@nativescript/core/application-settings");
    let sSubHeadline = appSettings.getString("correo");
    //if(sSubHeadline.length > 22) sSubHeadline = sSubHeadline.substr(0, 20) + "...";
    return sSubHeadline;
}