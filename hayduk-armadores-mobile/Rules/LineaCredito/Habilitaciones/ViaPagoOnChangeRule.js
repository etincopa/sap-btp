
var clientAPI;

/**
 * Describe this function...
 */
export default function ViaPagoOnChangeRule(clientAPI) {
    let viaPagoId = clientAPI.getValue()[0].ReturnValue;
    var plantaCtrl = {};
    try {
        plantaCtrl = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpPlanta");

    } catch (ex) {
        plantaCtrl = clientAPI.evaluateTargetPath("#Page:SolicitudPendHabilitacionDetail/#Control:lpPlanta");
    }
    let appSettings = require("@nativescript/core/application-settings");
    var transferenciaId = appSettings.getString("sViaPagoTransferencia");
    var chequeId = appSettings.getString("sViaPagoCheque");
    var plantaLimaId = appSettings.getString("sPlantaLimaId");

    if (transferenciaId == viaPagoId) {
        plantaCtrl.setEditable(false);
        plantaCtrl.setValue(plantaLimaId);
    } else if (viaPagoId == chequeId) {
        plantaCtrl.setEditable(true);
        plantaCtrl.setValue("");
    } else {
        plantaCtrl.setEditable(true);
        plantaCtrl.setValue("");
    }
}
