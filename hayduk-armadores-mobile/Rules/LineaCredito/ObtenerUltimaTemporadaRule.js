
var clientAPI;

/**
 * Describe this function...
 */
export default async function ObtenerUltimaTemporadaRule(clientAPI) {
    var temporada = clientAPI.getValue();
    if (temporada == undefined || temporada == "")
        return await getTemporada(clientAPI);
    return temporada;
}
async function getTemporada(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var temp = appSettings.getString("TemporadaAdelanto");
    if (temp != "" && temp != undefined)
        return temp;
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "TemporadaSet", //Entity
            [], //
            `$filter=IDEspecie eq '01'`
        ).then(function (oData) {

            if (oData.length > 0) {
                appSettings.setString("TemporadaAdelanto", oData._array[0].IDTemporada);
                appSettings.setString("FechaInicioAdelanto", oData._array[0].FechaInicio);
                appSettings.setString("FechaFinAdelanto", oData._array[0].FechaFin);
                resolve(oData._array[0].IDTemporada);
            } else {
                resolve("");
            }

        }, function () {
            reject("");
        });
    });
}