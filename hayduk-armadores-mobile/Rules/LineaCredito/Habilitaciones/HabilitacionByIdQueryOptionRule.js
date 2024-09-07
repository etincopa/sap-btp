
var clientAPI;

/**
 * Describe this function...
 */
export default function HabilitacionByIdQueryOptionRule(clientAPI) {
    var idHab = clientAPI.binding.IDHabilitacion;
    var idEje = clientAPI.binding.Ejercicio;
    let appSettings = require("@nativescript/core/application-settings");
    var ruc = appSettings.getString("ruc");
    var fini = appSettings.setString("fechaInicio");
    var ffin = appSettings.setString("fechaFin");
    var query = "$filter=IDHabilitacion eq '" + idHab + "' and IDRuc eq '" + ruc + "' and (FechaInicio eq '" + fini + "') and (FechaFin eq '" + ffin + "')";
    return query;
}
