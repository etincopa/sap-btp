
var clientAPI;

/**
 * Describe this function...
 */
export default function LineaCreditoMontoConsumido(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("AdelantoLineaCredito");

    var obj = JSON.parse(sValueLC);
    var iMontoConsumido = parseFloat(obj.MontoConsumido);

    return iMontoConsumido;
}
