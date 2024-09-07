
var clientAPI;

/**
 * Describe this function...
 */
export default function LineaCreditoMoneda(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("HabilitacionLineaCredito");

    var obj = JSON.parse(sValueLC);
    var sMoneda = obj.Moneda;

    return sMoneda;
}
