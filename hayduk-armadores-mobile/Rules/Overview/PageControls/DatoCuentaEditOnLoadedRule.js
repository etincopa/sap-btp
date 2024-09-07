
var clientAPI;

/**
 * Describe this function...
 */
export default function DatoCuentaEditOnLoadedRule(clientAPI) {
    let idKey = clientAPI.evaluateTargetPath("#Page:TabCuentaEdit/#Control:IdKey");
    let idKeyValue = idKey.getValue();
    if (idKeyValue == "")
        clientAPI.evaluateTargetPath("#Page:TabCuentaEdit")._actionBar.title = "Nueva Cuenta";
    let targetCtrlBanco = clientAPI.evaluateTargetPath("#Page:TabCuentaEdit/#Control:Banco");
    if (targetCtrlBanco.getValue().length > 0) {
        let bancoId = targetCtrlBanco.getValue()[0].ReturnValue;
        let targetCtrl = clientAPI.evaluateTargetPath("#Page:TabCuentaEdit/#Control:AdjuntoId");
        let cciCtrl = clientAPI.evaluateTargetPath("#Page:TabCuentaEdit/#Control:NumeroCuentaCCI");
        let appSettings = require("@nativescript/core/application-settings");
        var bancoIdSinMoneda = bancoId.substr(0, bancoId.length - 1);
        var sBancoPermitidosIds = appSettings.getString("sBancoPermitidoIds");
        if (sBancoPermitidosIds.includes(bancoIdSinMoneda)) {
            targetCtrl.setVisible(false);
            cciCtrl.setVisible(false);
        } else {
            targetCtrl.setVisible(true);
            cciCtrl.setVisible(true);
        }
    }
}
