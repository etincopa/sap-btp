
var clientAPI;

/**
 * Describe this function...
 */
export default async function AdelantoLineaCreditoService(clientAPI) {

    let appSettings = require("@nativescript/core/application-settings");
    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');

    var embarcacion = "";
    if (clientAPI._context.clientAPIProps.actionBinding == undefined)
        embarcacion = await obtenerEmbarcacion(clientAPI, sUserId);
    else {
        var item = clientAPI._context.clientAPIProps.actionBinding;
        var sLineaCredito = '{ "Moneda":"PEN", "MontoMaximo": 0, "MontoConsumido": 0, "Cantidad" : 0, "DescargaProyectada": "0 Ton" }';
        /*var oLineaCredito = {
            Moneda: item.Moneda,
            MontoMaximo: item.MontoMaximo,
            MontoConsumido: item.MontoConsumido,
            Cantidad: item.Cantidad,
            DescargaProyectada: item.DescargaProyectada
        };*/
        var oLineaCredito = await obtenerLineaCredito(clientAPI, sUserId, item.Embarcacion);
        sLineaCredito = JSON.stringify(oLineaCredito);
        var total = parseFloat(oLineaCredito.MontoMaximo);
        var consumido = parseFloat(oLineaCredito.MontoConsumido);
        consumido = 0;
        var disponible = total - consumido;
        if (disponible < 0)
            disponible = 0;
        appSettings.setString("AdelantoDisponible", "$(C," + disponible + " ,USD)");
        appSettings.setString("AdelantoLineaCredito", sLineaCredito);
        appSettings.setString("EmbarcacionIdAdelanto", item.Embarcacion);
        appSettings.setString("EmbarcacionAdelanto", item.Descripcion);
    }
    return true;
}
async function obtenerEmbarcacion(clientAPI, ruc) {
    let appSettings = require("@nativescript/core/application-settings");
    let httpModule = require('@nativescript/core/http');
    let sFilter = `$filter=IDRuc eq '${ruc}'`;
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "TipoEmbarcacionSet", //Entity
            [], //
            sFilter
        ).then(function (oData) {

            if (oData.length > 0) {
                var item = oData.getItem(0);
                var embarcacion = item.IDEmbarcacion + " " + item.Descripcion;
                appSettings.setString("EmbarcacionIdAdelanto", item.IDEmbarcacion);
                appSettings.setString("EmbarcacionAdelanto", embarcacion);
                resolve(item.IDEmbarcacion);
            } else {

                resolve("");
            }

        }, function () {
            reject("");
        });
    });
}
async function obtenerLineaCredito(clientAPI, ruc, embarcacion) {
    let appSettings = require("@nativescript/core/application-settings");
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "AdelantoLinCredSet", //Entity
            [], //
            `$filter=IDRuc eq '${ruc}' and Embarcacion eq '${embarcacion}'` //Filter
        ).then(function (oData) {

            if (oData.length > 0) {

                var item = oData.getItem(0);

                var oLineaCredito = {
                    Moneda: item.Moneda,
                    MontoMaximo: parseFloat(item.MontoMaximo),
                    MontoConsumido: parseFloat(item.MontoConsumido),
                    Cantidad: item.Cantidad,
                    DescargaProyectada: item.DescargaProyectada
                };
                resolve(oLineaCredito);

            }

        }, function () {
            var oLineaCredito = {
                Moneda: 0,
                MontoMaximo: 0,
                MontoConsumido: 0,
                Cantidad: 0,
                DescargaProyectada: 0
            };
            reject(oLineaCredito);
        });
    });
}