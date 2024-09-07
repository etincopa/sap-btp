
var clientAPI;

/**
 * Describe this function...
 */
export default async function AdelantoEmbarcacionValidationRule(clientAPI) {

    var monto = 0;
    var embarcacionId = "";
    try {
        monto = parseFloat(clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:spMontoSolicitud/#Value"));
        embarcacionId = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpEmbarcacion/#SelectedValue");
    } catch (error) {
        monto = parseFloat(clientAPI.evaluateTargetPath("#Page:SolicitudPendAdelantoDetail/#Control:spMontoSolicitud/#Value"));
        embarcacionId = clientAPI.evaluateTargetPath("#Page:SolicitudPendAdelantoDetail/#Control:lpEmbarcacion/#SelectedValue");
    }

    let ruc = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    let appSettings = require("@nativescript/core/application-settings");
    let sValueLC = appSettings.getString("AdelantoLineaCredito");

    var obj = JSON.parse(sValueLC);
    var montoConsumido = parseFloat(obj.MontoConsumido);
    var result = await validarMonto(clientAPI, ruc, embarcacionId, monto);
    var montodis = result.disponible.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    const Dialogs = clientAPI.nativescript.uiDialogsModule;
    if (result.exito)
        return true;
    Dialogs.alert({
        title: '',
        okButtonText: 'Aceptar',
        message: `La embarcación no tiene saldo suficiente. Su monto disponible es de $ ${montodis}.`
    });
    return false;
}

async function validarMonto(clientAPI, ruc, embarcacionId, monto) {
    let httpModule = require('@nativescript/core/http');
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "AdelantoLinCredSet", //Entity
            [], //
            `$filter=IDRuc eq '${ruc}' and Embarcacion eq '${embarcacionId}'`
        ).then(function (oData) {
            var result = {
                exito: false,
                disponible: 0
            }
            if (oData.length > 0) {
                var oLineaCredito = oData.getItem(0)
                var total = parseFloat(oLineaCredito.MontoMaximo);
                var consumido = parseFloat(oLineaCredito.MontoConsumido);
                consumido = 0;
                var disponible = total - consumido;
                if (disponible < 0)
                    disponible = 0;
                result.disponible = disponible;
                if (monto < disponible) {
                    result.exito = true;
                    resolve(result);
                }
                resolve(result);
            } else {
                resolve(result);
            }

        }, function () {
            reject(false);
        });
    });
}