
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerCantidadDescargadaRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("AdelantoLineaCredito");
    var obj = JSON.parse(sValueLC);
    var cantidad = obj.Cantidad;
    return "LMCE : "+cantidad + " TM";

}
