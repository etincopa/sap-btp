
var clientAPI;

/**
 * Describe this function...
 */
export default function AdelantoSolicitudContextWF(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let sRuc = appSettings.getString("ruc");
    let iID = appSettings.getString("iID");


    let spMontoSolicitud = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:spMontoSolicitud/#Value");
    let spTasaDescuento = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:spTasaDescuento/#Value");
    let ntDetDescuento = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:ntDetDescuento/#Value");
    let lpMoneda = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpMoneda/#SelectedValue");
    let lpViaPago = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpViaPago/#SelectedValue");
    let lpPlanta = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpPlanta/#SelectedValue");
    let lpEmbarcacion = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpEmbarcacion/#SelectedValue");
    let spRSocial = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:spRSocial/#Value");
    let lpTemporada = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpTemporada/#Value");

    let sViaPagoDV = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpViaPago").getValue()[0].DisplayValue;
    let sViaPagoDen = sViaPagoDV.toString().substr(sViaPagoDV.indexOf(' ') + 1);

    let sPlantaDV = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpPlanta").getValue()[0].DisplayValue;
    let sPlantaDen = sPlantaDV.toString().substr(sPlantaDV.indexOf(' ') + 1);
    let lpEmbarcacionDes = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpEmbarcacion").getValue()[0].DisplayValue;
    let embarcacionDes = lpEmbarcacionDes.toString().substr(lpEmbarcacionDes.indexOf(' ') + 1);
    appSettings.setString("sEmbarcacionDes", embarcacionDes);
    appSettings.setString("sPlantaDes", sPlantaDen);

    return {
        "Flujo": "Adelantos",
        "Action": "Add",
        "Group": "Z_SCP_ARM_APROBACION_ADELANTO",
        "IDRuc": sRuc,
        "Monto": spMontoSolicitud,
        "Moneda": lpMoneda,
        "ViaPago": lpViaPago,
        "Planta": lpPlanta,
        "Embarcacion": lpEmbarcacion,
        "EmbarcacionDes": embarcacionDes,
        "RSocial": spRSocial,
        "Temporada": lpTemporada,
        "TasaDescuento": spTasaDescuento,
        "Detalle": ntDetDescuento,

        "ViaPagoDen": sViaPagoDen,
        "PlantaDen": sPlantaDen,
        "ID":iID

    };

}
