
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerCantidadProyectadaRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("AdelantoLineaCredito");
    var obj = JSON.parse(sValueLC);
    var cantidad = obj.DescargaProyectada;
    return "Tm pendientes de facturar : "+cantidad+ " TM";
}
