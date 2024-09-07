
var clientAPI;

/**
 * Describe this function...
 */
export default function AdelantoEmbarcacionOnValueChange(clientAPI) {

    var spRSocialTarget = {};
    try {
        spRSocialTarget = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:spRSocial");

    } catch (ex) {
        spRSocialTarget = clientAPI.evaluateTargetPath("#Page:SolicitudPendAdelantoDetail/#Control:spRSocial");
    }
    try {

        //spRSocialTarget.setValue("");
        let lpEmbarcacion = clientAPI.getValue()[0].DisplayValue;
        let spReturnValue = lpEmbarcacion.toString().substr(0, lpEmbarcacion.indexOf(' '));
        let spDisplayValue = lpEmbarcacion.toString().substr(lpEmbarcacion.indexOf(' ') + 1);

        //spRSocialTarget.setValue(spDisplayValue.toString());

    } catch (ex) {
        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/ToastMessageGeneric.action",
            "Properties": {
                "Message": `${ex}`,
            }
        });
    }

}
