
var clientAPI;

/**
 * Describe this function...
 */
export default function AdelantoByIdQueryOptionRule(clientAPI) {
    var idAdel = clientAPI.binding.IDAdelanto;
    var idEje = clientAPI.binding.Ejercicio;
    let appSettings = require("@nativescript/core/application-settings");
    var fini = appSettings.setString("fechaInicio");
    var ffin = appSettings.setString("fechaFin");
    var ruc = appSettings.getString("ruc");
    var query = "$filter=IDAdelanto eq '" + idAdel + "' and IDRuc eq '" + ruc + "' and (FechaInicio eq '" + fini + "') and (FechaFin eq '" + ffin + "')";
    return query;
}
