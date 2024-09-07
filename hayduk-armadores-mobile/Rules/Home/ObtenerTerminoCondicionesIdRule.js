
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerTerminoCondicionesIdRule(clientAPI) {
     let appSettings = require("@nativescript/core/application-settings");
    let tcId = appSettings.getString("terminoCondicionesId");
    return tcId;
}
