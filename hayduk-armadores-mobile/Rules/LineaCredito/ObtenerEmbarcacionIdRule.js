
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerEmbarcacionIdRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var emb = appSettings.getString("EmbarcacionIdAdelanto");
    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    var query = "$filter=IDRuc eq '" + sUserId + "' and Embarcacion eq '" + emb + "'";
    return query;
}
