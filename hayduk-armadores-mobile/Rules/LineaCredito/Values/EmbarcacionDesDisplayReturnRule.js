
var clientAPI;

/**
 * Describe this function...
 */
export default function EmbarcacionDesDisplayReturnRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var emb = appSettings.getString("sEmbarcacionDes");
    return emb;
}
