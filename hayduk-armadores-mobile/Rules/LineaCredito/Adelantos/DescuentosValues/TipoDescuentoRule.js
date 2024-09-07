
var clientAPI;

/**
 * Describe this function...
 */
export default function TipoDescuentoRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var descTipo = appSettings.getString("DescuentoTipoDescripcion");
    return descTipo;
}
