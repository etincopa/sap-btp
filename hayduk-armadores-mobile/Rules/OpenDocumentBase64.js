
var clientAPI;

/**
 * Describe this function...
 */
export default function OpenDocumentBase64(clientAPI) {

    let appSettings = require("@nativescript/core/application-settings");
    let sBase64 = appSettings.getString("sBase64");

    return sBase64;
}
