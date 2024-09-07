
var clientAPI;

/**
 * Describe this function...
 */
export default function LineaCreditoCantidad(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("AdelantoLineaCredito");

    var obj = JSON.parse(sValueLC);
    var sCantidad = obj.Cantidad;

    return sCantidad;
}
