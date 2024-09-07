
var clientAPI;

/**
 * Describe this function...
 */
export default async function HabilitacionLineaCreditoService(clientAPI) {

    let appSettings = require("@nativescript/core/application-settings");
    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');


    var sLineaCredito = '{ "Moneda":"PEN", "MontoMaximo": 0, "MontoConsumido": 0 , "MontoDisponible": 0}';
    var item = clientAPI._context.clientAPIProps.actionBinding;

    /*var oLineaCredito = {
        Moneda: item.Moneda,
        MontoMaximo: item.MontoMaximo,
        MontoConsumido: item.MontoConsumido
    };*/
    var oLineaCredito = await obtenerLineaCredito(clientAPI, item.Embarcacion);
    sLineaCredito = JSON.stringify(oLineaCredito);
    appSettings.setString("HabilitacionLineaCredito", sLineaCredito);
    appSettings.setString("EmbarcacionIdAdelanto", item.Embarcacion);
    appSettings.setString("EmbarcacionAdelanto", item.Descripcion);
    return true;
}

async function obtenerLineaCredito(clientAPI, embarcacion) {
    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    let httpModule = require('@nativescript/core/http');
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "HabilitacionLinCredSet", //Entity
            [], //
            `$filter=IDRuc eq '${sUserId}' and Embarcacion eq '${embarcacion}'` //Filter
        ).then(function (oData) {

            if (oData.length > 0) {
                var item = oData.getItem(0);
                var oLineaCredito = {
                    Moneda: item.Moneda,
                    MontoMaximo: item.MontoMaximo,
                    MontoConsumido: item.MontoConsumido,
                    MontoDisponible: item.MontoDisponible
                };
                resolve(oLineaCredito);
            } else {
                var oLineaCredito = {
                    Moneda: 0,
                    MontoMaximo: 0,
                    MontoConsumido: 0,
                    MontoDisponible: 0
                };
                resolve(oLineaCredito);
            }

        }, function () {
            var oLineaCredito = {
                Moneda: 0,
                MontoMaximo: 0,
                MontoConsumido: 0,
                MontoDisponible: 0
            };
            reject(oLineaCredito);
        });
    });
}