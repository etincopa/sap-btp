
var clientAPI;

/**
 * Describe this function...
 */
export default function LineaCreditoDescargaProyectada(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("AdelantoLineaCredito");

    var obj = JSON.parse(sValueLC);
    var sDescargaProyectada = obj.DescargaProyectada;

    return sDescargaProyectada;
}
