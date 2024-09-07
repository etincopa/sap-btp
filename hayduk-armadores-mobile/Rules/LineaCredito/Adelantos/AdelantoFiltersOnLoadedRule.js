
var clientAPI;

/**
 * Describe this function...
 */
export default function AdelantoFiltersOnLoadedRule(clientAPI) {

    let appSettings = require("@nativescript/core/application-settings");
    var temp = appSettings.getString("TemporadaAdelanto");
    var embarcacionId = appSettings.getString("EmbarcacionIdAdelanto");

    //clientAPI.evaluateTargetPath("#Page:AdelantoEspecieTemporadaFilter/#Control:lpTemporada").setValue(temp);
    //clientAPI.evaluateTargetPath("#Page:AdelantoEspecieTemporadaFilter/#Control:lpEmbarcacion").setValue(embarcacionId);
    var fi = appSettings.getString("FechaInicioAdelanto");
    var ff = appSettings.getString("FechaFinAdelanto");
    //clientAPI.evaluateTargetPath("#Page:AdelantoEspecieTemporadaFilter/#Control:lpFechaInicio").setValue(fi);
    //clientAPI.evaluateTargetPath("#Page:AdelantoEspecieTemporadaFilter/#Control:lpFechaFin").setValue(ff);
}
