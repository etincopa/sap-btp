
var clientAPI;

/**
 * Describe this function...
 */
export default function OpenDocumentUrl(clientAPI) {
     let appSettings = require("@nativescript/core/application-settings");
    let url = appSettings.getString("OpenDocumentUrl");

    return url;
}
