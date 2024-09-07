
var clientAPI;
export default function ShowAttachment(clientAPI) {
    let srcValue = clientAPI.getValue()[0].ReturnValue;
    let targetCtrl = clientAPI.evaluateTargetPath("#Page:TabCuentaEdit/#Control:AdjuntoId");
    let appSettings = require("@nativescript/core/application-settings");
    var bancoIdSinMoneda = bancoId.substr(0, bancoId.length-1);
    var sBancoPermitidosIds = appSettings.getString("sBancoPermitidoIds");
    if (sBancoPermitidosIds.includes(bancoIdSinMoneda)) {
        var ok = "";
        targetCtrl.setVisible(false);
    } else {
        var no = "";
        targetCtrl.setVisible(true);
    }
}
