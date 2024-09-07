
var clientAPI;

/**
 * Describe this function...
 */
export default function DescuentoDetailOnPress(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var name = clientAPI._context.clientAPIProps.actionBinding.key;
    var value = clientAPI._context.clientAPIProps.actionBinding.value;
    var tipo = "";
    var desc = "";
    if (name.indexOf("FEP") > 0) {
        tipo = "DsctoFep";
        desc = "DESCUENTOS FEP";
    } else if (name.indexOf("Adelanto") > 0) {
        tipo = "DsctoAdel";
        desc = "DESCUENTOS DE ADELANTO";
    } else if (name.indexOf("Detracc") > 0) {
        tipo = "DsctoDetrac";
        desc = "DESCUENTOS DE DETRACCIÓN";
    } else if (name.indexOf("Comb") > 0) {
        tipo = "DsctoComb";
        desc = "DESCUENTOS DE COMBUSTIBLE";
    } else if (name.indexOf("Material") > 0) {
        tipo = "DsctoMatServ";
        desc = "DESCUENTOS DE MATERIAL/SERVICIO";
    } else if (name.indexOf("Hab") > 0) {
        tipo = "DsctoHab";
        desc = "DESCUENTOS DE HABILITACIONES";
    } else if (name.indexOf("Deco") > 0) {
        tipo = "DsctoDeco";
        desc = "DESCUENTOS DECO";
    } else if (name.indexOf("Pedro") > 0) {
        tipo = "DsctoSanPedro";
        desc = "DESCUENTOS SAN PEDRO";
    } else if (name.indexOf("Otros") > 0) {
        tipo = "DsctoOtros";
        desc = "OTROS DESCUENTOS";
    }
    appSettings.setString("DescuentoTipo", tipo);
    appSettings.setString("DescuentoTipoDescripcion", desc);
    appSettings.setString("DescuentoTipoMonto", value);
    if (value != "" && value != "0")
        return clientAPI.executeAction("/Armadores/Actions/LineaCredito/NavToDescuentoDetailDetail.action");

}
