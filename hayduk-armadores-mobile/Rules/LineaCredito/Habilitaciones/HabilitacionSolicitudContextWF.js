
var clientAPI;

/**
 * Describe this function...
 */
export default function HabilitacionSolicitudContextWF(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sRuc = appSettings.getString("ruc");
    let iID = appSettings.getString("iID");


    let spMontoSolicitud = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spMontoSolicitud/#Value");
    let spTasaDescuento = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spTasaDescuento/#Value");
    let ntDetDescuento = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:ntDetDescuento/#Value");
    let lpMoneda = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpMoneda/#SelectedValue");
    let lpViaPago = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpViaPago/#SelectedValue");
    let lpPlanta = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpPlanta/#SelectedValue");
    let lpEmbarcacion = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpEmbarcacion/#SelectedValue");
    let spRSocial = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spRSocial/#Value");
    let lpPagarNroTemp = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpPagarNroTemp/#SelectedValue");

    let sViaPagoDV = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpViaPago").getValue()[0].DisplayValue;
    let sViaPagoDen = sViaPagoDV.toString().substr(sViaPagoDV.indexOf(' ') + 1);

    let sPlantaDV = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpPlanta").getValue()[0].DisplayValue;
    let sPlantaDen = sPlantaDV.toString().substr(sPlantaDV.indexOf(' ') + 1);
    let lpEmbarcacionDes = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpEmbarcacion").getValue()[0].DisplayValue;
    let embarcacionDes = lpEmbarcacionDes.toString().substr(lpEmbarcacionDes.indexOf(' ') + 1);
    appSettings.setString("sEmbarcacionDes",embarcacionDes);
    appSettings.setString("sPlantaDes",sPlantaDen);
    return {
        "Flujo": "Habilitaciones",
        "Action": "Add",
        "Group": "Z_SCP_ARM_APROBACION_HABILITACION",
        "IDRuc": sRuc,
        "Monto": spMontoSolicitud,
        "Moneda": lpMoneda,
        "ViaPago": lpViaPago,
        "Planta": lpPlanta,
        "Embarcacion": lpEmbarcacion,
        "EmbarcacionDes": embarcacionDes,
        "RSocial": spRSocial,
        "Temporada": lpPagarNroTemp,
        "TasaDescuento": spTasaDescuento,
        "Detalle": ntDetDescuento,

        "ViaPagoDen": sViaPagoDen,
        "PlantaDen": sPlantaDen,
        "ID":iID

    };

}
