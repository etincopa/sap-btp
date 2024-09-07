
var clientAPI;

/**
 * Describe this function...
 */
export default function FilterFechaFinOnValueChangeRule(clientAPI) {
    let sReturnValue = clientAPI.evaluateTargetPath("#Page:AdelantoEspecieTemporadaFilter/#Control:lpFechaFin").getValue()[0].ReturnValue;
    var fi = clientAPI.evaluateTargetPath("#Page:AdelantoEspecieTemporadaFilter/#Control:lpFechaInicio").getValue()[0].ReturnValue;

    appSettings.setString("FechaInicioAdelanto", fi);
    appSettings.setString("FechaFinAdelanto", sReturnValue);
}
