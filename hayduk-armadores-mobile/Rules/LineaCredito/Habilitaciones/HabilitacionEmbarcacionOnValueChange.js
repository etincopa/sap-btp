
var clientAPI;

/**
 * Describe this function...
 */
export default function HabilitacionEmbarcacionOnValueChange(clientAPI) {

    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    let sFilter = `$filter=IDRuc eq '${sUserId}'`;

    var spRSocialTarget = {};
    var spTasaDescuentoTarget = {};
    try {
        spRSocialTarget = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spRSocial");
        spTasaDescuentoTarget = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spTasaDescuento");

    } catch (ex) {
        spRSocialTarget = clientAPI.evaluateTargetPath("#Page:SolicitudPendHabilitacionDetail/#Control:spRSocial");
        spTasaDescuentoTarget = clientAPI.evaluateTargetPath("#Page:SolicitudPendHabilitacionDetail/#Control:spTasaDescuento");
    }
    let tasaValue = 0;
    //({ NombreDscto } -> { Tasa })
    spTasaDescuentoTarget.setValue(tasaValue.toString());
    return;

    try {

        //spRSocialTarget.setValue("");
        spTasaDescuentoTarget.setValue(tasaValue.toString());
        let lpEmbarcacion = clientAPI.getValue()[0].DisplayValue;
        let spReturnValue = lpEmbarcacion.toString().substr(0, lpEmbarcacion.indexOf(' '));
        let spDisplayValue = lpEmbarcacion.toString().substr(lpEmbarcacion.indexOf(' ') + 1);

        //spRSocialTarget.setValue(spDisplayValue.toString());

        sFilter = sFilter + " and IDEmbarcacion eq '" + spReturnValue + "'";


        return clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "TipoTasaSet", //Entity
            [], //
            sFilter //  and IDTemporada eq '${lpTemporada}' Filter //$filter=IDRuc eq '{{#Application/#ClientData/#Property:UserId}}'
        ).then(function (oData) {

            try {
                if (oData.length > 0) {
                    for (var i = 0; i < oData.length; i++) {
                        var item = oData.getItem(i);
                        tasaValue = Number.parseFloat(item.Tasa);
                        if (isNaN(tasaValue)) tasaValue = 0;
                        if (tasaValue == 'NaN') tasaValue = 0;
                    }
                }
            } catch (ex) {
                return clientAPI.getPageProxy().executeAction({
                    "Name": "/Armadores/Actions/ToastMessageGeneric.action",
                    "Properties": {
                        "Message": `${ex}`,
                    }
                });
            }

            spTasaDescuentoTarget.setValue(tasaValue.toString());
            return;

        }, function () {
            return;
        });


    } catch (ex) {
        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/ToastMessageGeneric.action",
            "Properties": {
                "Message": `${ex}`,
            }
        });
    }

}
