
var clientAPI;

/**
 * Describe this function...
 */
export default function DescuentoDetailDetailQueryOption(clientAPI) {

    let ruc = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    let appSettings = require("@nativescript/core/application-settings");
    var embarcacionId = appSettings.getString("EmbarcacionIdAdelanto");
    var descuentoTipo = appSettings.getString("DescuentoTipo");
    var query = "$filter=IDRuc eq '" + ruc + "' and Embarcacion eq '" + embarcacionId + "' and TipoDescuento eq '" + descuentoTipo + "'";
    return query;
}
