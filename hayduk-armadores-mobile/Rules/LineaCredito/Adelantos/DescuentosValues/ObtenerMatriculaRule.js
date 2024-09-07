
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerMatriculaRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var embDesc=appSettings.getString("EmbarcacionDescuento");
    var obj = JSON.parse(embDesc);
    return obj.Matricula;
}
