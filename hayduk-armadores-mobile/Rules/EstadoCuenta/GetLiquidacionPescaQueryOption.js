
var clientAPI;

/**
 * Describe this function...
 */
export default function GetLiquidacionPescaQueryOption(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sRuc = appSettings.getString("ruc");
    var ejercicioCtrl = clientAPI.evaluateTargetPath("#Page:LiquidacionPesca/#Control:lspEjercicio").getValue();
    var year = new Date().getFullYear();
    if (ejercicioCtrl.length > 0)
        year = ejercicioCtrl[0].ReturnValue;
    var qo = "$filter=IDRuc eq '" + sRuc + "' and IDEjercicio eq '" + year + "'";
    return qo;
}
