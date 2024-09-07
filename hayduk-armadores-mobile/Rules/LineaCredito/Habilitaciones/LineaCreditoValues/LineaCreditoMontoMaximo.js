
var clientAPI;

/**
 * Describe this function...
 */
export default function LineaCreditoMontoMaximo(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("HabilitacionLineaCredito");

    var obj = JSON.parse(sValueLC);
    var iMontoMaximo = parseFloat(obj.MontoMaximo);

    return iMontoMaximo*100; //Linea de credito
}
