
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerIDRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var id = appSettings.getString("iID");
    return id;
}
