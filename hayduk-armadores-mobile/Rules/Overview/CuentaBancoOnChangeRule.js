
var clientAPI;

/**
 * Describe this function...
 */
export default function CuentaBancoOnChangeRule(clientAPI) {
    let bancoId = clientAPI.getValue()[0].ReturnValue;
    let targetCtrl = clientAPI.evaluateTargetPath("#Page:TabCuentaEdit/#Control:AdjuntoId");
    let cciCtrl = clientAPI.evaluateTargetPath("#Page:TabCuentaEdit/#Control:NumeroCuentaCCI");
    let appSettings = require("@nativescript/core/application-settings");
    var bancoIdSinMoneda = bancoId.substr(0, bancoId.length-1);
    var sBancoPermitidosIds = appSettings.getString("sBancoPermitidoIds");
    if (sBancoPermitidosIds.includes(bancoIdSinMoneda)) {
        cciCtrl.setVisible(false);
        cciCtrl.setValue("");
        targetCtrl.setVisible(false);
    } else {
        cciCtrl.setVisible(true);
        targetCtrl.setVisible(true);
    }
}
