
var clientAPI;

/**
 * Describe this function...
 */
export default function PlantaDesDisplayReturn(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var emb = appSettings.getString("sPlantaDes");
    return emb;
}
