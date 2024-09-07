
var clientAPI;

/**
 * Describe this function...
 */
export default function LineaCreditoMontoDisponible(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("HabilitacionLineaCredito");

    var obj = JSON.parse(sValueLC);
    var iMontoDisponible = parseFloat(obj.MontoDisponible);

    return iMontoDisponible;
}
