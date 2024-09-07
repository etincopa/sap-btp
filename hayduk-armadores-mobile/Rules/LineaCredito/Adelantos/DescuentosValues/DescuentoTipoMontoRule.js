
var clientAPI;

/**
 * Describe this function...
 */
export default function DescuentoTipoMontoRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var descTipo = appSettings.getString("DescuentoTipoMonto");
    return descTipo;
}
