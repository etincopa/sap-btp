/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function TabCuentaEdit(context) {
    var required = false;
    let targetCtrlTipoCuenta = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:Tipo");
    let targetCtrlBanco = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:Banco");
    let targetCtrlNumeroCuenta = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:NumeroCuenta");
    let sValueNumeroCuenta = targetCtrlNumeroCuenta.getValue();
    let targetCtrlNumeroCuentaCCI = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:NumeroCuentaCCI");
    let sValueNumeroCuentaCCI = targetCtrlNumeroCuentaCCI.getValue();
    let appSettings = require("@nativescript/core/application-settings");
    let fileName = appSettings.getString("fileName");

    if (targetCtrlTipoCuenta.getValue().length == 0)
        required = true;
    if (targetCtrlBanco.getValue().length == 0)
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
        return context.executeAction('/Armadores/Actions/Overview/Message/DatoCuentaEsRequeridoMessage.action');

    let sValueTipoCuenta = targetCtrlTipoCuenta.getValue()[0].ReturnValue;
    let sValueBanco = targetCtrlBanco.getValue()[0].DisplayValue;

    let idKey = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:IdKey");
    let idKeyValue = idKey.getValue();
    let claveBanco = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:ClaveBanco");
    let claveBancoValue = targetCtrlBanco.getValue()[0].ReturnValue;
    let adjunto = context.evaluateTargetPath("#Page:TabCuentaEdit/#Control:AdjuntoId");
    let sRuc = appSettings.getString("ruc");
    var action = "";
    if (idKeyValue == "")
        action = "Add";
    return {
        "IDRuc": sRuc,
        "Flujo": "",
        "IDKey": idKeyValue,
        "TipoNuevo": sValueTipoCuenta,
        "ClaveBancoNuevo": claveBancoValue,
        "BancoNuevo": sValueBanco,
        "NroCuentaNuevo": sValueNumeroCuenta,
        "CCINuevo": sValueNumeroCuentaCCI,
        "Group": "Z_SCP_ARM_APROBACION_CUENTA",
        "Action": action
    };
}