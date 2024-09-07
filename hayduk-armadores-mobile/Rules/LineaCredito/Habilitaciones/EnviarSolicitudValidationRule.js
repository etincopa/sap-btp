
var clientAPI;

/**
 * Describe this function...
 */
export default async function EnviarSolicitudValidationRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("HabilitacionLineaCredito");
    const Dialogs = clientAPI.nativescript.uiDialogsModule;
    var montoSolicitudCtrl = {};
    try {
        montoSolicitudCtrl = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spMontoSolicitud");

    } catch (ex) {
        montoSolicitudCtrl = clientAPI.evaluateTargetPath("#Page:SolicitudPendHabilitacionDetail/#Control:spMontoSolicitud");
    }
    var montoSolicitud = 0;
    if (montoSolicitudCtrl.getValue() != "" && montoSolicitudCtrl.getValue() != undefined)
        montoSolicitud = parseFloat(montoSolicitudCtrl.getValue());

    if (sValueLC == undefined)
        sValueLC = await obtenerLineaCredito(clientAPI);
    var obj = JSON.parse(sValueLC);
    var iMontoConsumido = parseFloat(obj.MontoConsumido) + montoSolicitud;
    var iMontoMaximo = parseFloat(obj.MontoMaximo);
    var consumido = parseFloat(obj.MontoConsumido);
    var maximo = parseFloat(obj.MontoMaximo);
    var disponible = maximo - consumido;
    if (disponible < 0)
        disponible = 0;
    var returnValue = true;
    if (iMontoMaximo == 0) {
        returnValue = false;
        Dialogs.alert({
            title: '',
            okButtonText: 'Aceptar',
            message: `No tiene línea de crédito, contacte al personal de Hayduk.`
        });
    }
    var montodis = disponible.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    if (iMontoMaximo - iMontoConsumido < 0) {
        returnValue = false;
        Dialogs.alert({
            title: '',
            okButtonText: 'Aceptar',
            message: `No cuenta con línea de crédito disponible. Su monto disponible es de $ ${montodis}.`
        });

    }
    return returnValue;
}
async function obtenerLineaCredito(clientAPI, sFilter) {
    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    let httpModule = require('@nativescript/core/http');
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "HabilitacionLinCredSet", //Entity
            [], //
            `$filter=IDRuc eq '${sUserId}'` //Filter
        ).then(function (oData) {

            if (oData.length > 0) {
                var item = oData.getItem(0);
                var oLineaCredito = {
                    Moneda: item.Moneda,
                    MontoMaximo: item.MontoMaximo,
                    MontoConsumido: item.MontoConsumido
                };
                var sLineaCredito = JSON.stringify(oLineaCredito);
                resolve(sLineaCredito);
            } else {
                var oLineaCredito = {
                    Moneda: 0,
                    MontoMaximo: 0,
                    MontoConsumido: 0
                };
                var sLineaCredito = JSON.stringify(oLineaCredito);
                resolve(sLineaCredito);
            }

        }, function () {
            var oLineaCredito = {
                Moneda: 0,
                MontoMaximo: 0,
                MontoConsumido: 0
            };
            var sLineaCredito = JSON.stringify(oLineaCredito);
            reject(sLineaCredito);
        });
    });
}
async function getHabilitacionId(clientAPI) {
    var oFunction={
       "Name":"obtenerHabilitacionId",
        "Parameters":{
            "tipo":"1"
        }
    }
    return new Promise(function (resolve, reject) {
        clientAPI.callFunction(
            "/Armadores/Services/armadorService.service", //Service
            oFunction
        ).then(function (oData) {

            var ok="";
            resolve("");

        }, function (rs) {
            reject("");
        });
    });
}