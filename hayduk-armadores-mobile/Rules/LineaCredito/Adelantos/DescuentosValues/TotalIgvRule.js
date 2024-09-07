
var clientAPI;

/**
 * Describe this function...
 */
export default function TotalIgvRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var embDesc = appSettings.getString("EmbarcacionDescuento");
    var obj = JSON.parse(embDesc);
    if (obj.TIgv == undefined)
        return "T. IGV : ";
    return "T. IGV : $(C," + obj.TIgv + " ,'USD')";
}
