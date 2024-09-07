/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function Correo(context) {
    let appSettings = require("@nativescript/core/application-settings");
    let adjunto = appSettings.getString("adjunto");

    let targetCtrlBanco = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:Banco");
    let bancoId = targetCtrlBanco.getValue()[0].ReturnValue;
    var bancoIdSinMoneda = bancoId.substr(0, bancoId.length-1);
    var sBancoPermitidosIds = appSettings.getString("sBancoPermitidoIds");
    if (sBancoPermitidosIds.includes(bancoIdSinMoneda)) {
        return "";
    } else
        return adjunto;
}