
var clientAPI;

/**
 * Describe this function...
 */
export default function HabilitacionOnLoadPage(clientAPI) {

    var dDate = new Date();
    var sYear = dDate.getFullYear();
    var sMonth = dDate.getMonth() + 1;

    if (sMonth.toString().length == 1) sMonth = "0" + "" + sMonth;
    var sTemporada = sYear + "" + sMonth;

    clientAPI.evaluateTargetPath("#Page:Habilitaciones/#Control:LpTemporada").setValue(sTemporada);

}
