
var clientAPI;

/**
 * Describe this function...
 */
export default function LiqDetalleQueryOptionRule(clientAPI) {
    var idLiq = clientAPI.binding.IDLiquidacion;
    var idEje = clientAPI.binding.IDEjercicio;
    let appSettings = require("@nativescript/core/application-settings");
    var ruc = appSettings.getString("ruc");
    var query = "$filter=IDLiquidacion eq '" + idLiq + "' and IDRuc eq '" + ruc + "' and IDEjercicio eq '" + idEje + "'";
    return query;
}
