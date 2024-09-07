
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerEmbarcacionRule(clientAPI) {
    var emb = "";//clientAPI.getValue();
    if (emb == "" || emb == undefined) {
        let appSettings = require("@nativescript/core/application-settings");
        return appSettings.getString("EmbarcacionAdelanto");
    }
    return emb;
}
