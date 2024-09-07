
var clientAPI;

/**
 * Describe this function...
 */
export default function AdelantoOnLoadPage(clientAPI) {

    var dDate = new Date();
    var sYear = dDate.getFullYear();
    var sMonth = dDate.getMonth() + 1;

    if (sMonth.toString().length == 1) sMonth = "0" + "" + sMonth;
    var sTemporada = sYear + "" + sMonth;

    clientAPI.evaluateTargetPath("#Page:Adelantos/#Control:lpTemporada").setValue(sTemporada);

}
