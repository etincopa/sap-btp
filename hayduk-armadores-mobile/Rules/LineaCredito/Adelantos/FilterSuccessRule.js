
var clientAPI;

/**
 * Describe this function...
 */
export default async function FilterSuccessRule(clientAPI) {
    //let appSettings = require("@nativescript/core/application-settings");
    //var embarcacionId = appSettings.getString("EmbarcacionIdAdelanto");
    //let ruc = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    //var getLinCred = await obtenerLineaCredito(clientAPI, ruc, embarcacionId);
    //appSettings.setString("AdelantoLineaCredito", JSON.stringify(getLinCred));
    //var obj = { "MinValue": 0, "MaxValue": getLinCred.MontoMaximo, "Currency": getLinCred.Moneda, "Value": getLinCred.MontoConsumido };
    //clientAPI.evaluateTargetPath("#Page:Adelantos/#Control:xcAdelanto").setValue(obj);
    //clientAPI.evaluateTargetPath("#Page:Adelantos/#Control:spCantidadDescagada").setValue(getLinCred.DescargaProyectada);
    //clientAPI.evaluateTargetPath("#Page:Adelantos/#Control:spDescargaProy").setValue(getLinCred.Cantidad);
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