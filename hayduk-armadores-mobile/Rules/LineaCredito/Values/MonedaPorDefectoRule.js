
var clientAPI;

/**
 * Describe this function...
 */
export default function MonedaPorDefectoRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var sMonedaPorDefecto = appSettings.getString("sMonedaPorDefecto");
    return sMonedaPorDefecto;
}
