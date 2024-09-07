
var clientAPI;

/**
 * Describe this function...
 */
export default function MontoDisponible(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("AdelantoDisponible");
    return sValueLC;
}
