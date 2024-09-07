/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function CreateRegisterTabCuentas(context) {
    let actionResult = context.getActionResult('create');
    let data = actionResult.data;
    let idWF = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:IdWF");
    idWF.setValue(data.id);
    let targetCtrlTipoCuenta = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:Tipo");
    let sValueTipoCuenta = targetCtrlTipoCuenta.getValue();
    let targetCtrlNumeroCuenta = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:NumeroCuenta");
    let sValueNumeroCuenta = targetCtrlNumeroCuenta.getValue();
    let targetCtrlBanco = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:Banco");
    let sValueBanco = targetCtrlBanco.getValue();
    let targetCtrlNumeroCuentaCCI = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:NumeroCuentaCCI");
    let sValueNumeroCuentaCCI = targetCtrlNumeroCuentaCCI.getValue();
    let adjunto = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:AdjuntoId");
    let appSettings = require("@nativescript/core/application-settings");
    let fileName = appSettings.getString("fileName");
    var required = false;
    if (sValueTipoCuenta.length == 0)
        required = true;
    if (sValueBanco.length == 0)
        required = true;
    else {
        let bancoId = targetCtrlBanco.getValue()[0].ReturnValue;
        var bancoIdSinMoneda = bancoId.substr(0, bancoId.length-1);
        var sBancoPermitidosIds = appSettings.getString("sBancoPermitidoIds");
        if (!sBancoPermitidosIds.includes(bancoIdSinMoneda)) {
            if (sValueNumeroCuentaCCI == "" || fileName == "")
                required = true;
        }
    }
    if (sValueNumeroCuenta == "")
        required = true;
    if (required)
        return null;
    else
        return context.executeAction('/Armadores/Actions/Overview/ServiceOData/CreateTabCuentas.action');
}