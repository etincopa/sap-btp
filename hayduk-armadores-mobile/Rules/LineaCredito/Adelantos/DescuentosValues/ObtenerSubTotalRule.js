
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerSubTotalRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var embDesc = appSettings.getString("EmbarcacionDescuento");
    var obj = JSON.parse(embDesc);
    var desc = obj.SubtotalDctos;
    if (desc == undefined)
        return "";
    return "Total : $(C," + desc + " ,'USD')";
}
