
var clientAPI;

/**
 * Describe this function...
 */
export default async function HabilitacionSearchExistResp(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let actionResult = clientAPI.getActionResult("oData");
    let oData = actionResult.data._array;
    var id = oData[0].iID;
    appSettings.setString("iID", id + "");
    //Si es mayor a CERO, existe ya tiene solicitud pendiente de aprobacion


    //Validar si todos los campos estan correctos

    let isOk = true;
    let sMessage = '';

    let spMontoSolicitud = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spMontoSolicitud/#Value");
    let spTasaDescuento = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spTasaDescuento/#Value");
    let ntDetDescuento = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:ntDetDescuento/#Value");
    let spRSocial = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spRSocial/#Value");

    try {

        isOk = validateValues(spMontoSolicitud, 'number');
        //isOk = validateValues(spTasaDescuento, 'number');
        //isOk = validateValues(ntDetDescuento, 'string');
        //isOk = validateValues(spRSocial, 'string');

        let lpMoneda = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpMoneda/#SelectedValue");
        let lpViaPago = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpViaPago/#SelectedValue");
        let lpPlanta = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpPlanta/#SelectedValue");
        let lpEmbarcacion = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpEmbarcacion/#SelectedValue");
        let lpPagarNroTemp = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:lpPagarNroTemp/#SelectedValue");

    } catch (ex) {
        isOk = false;
        sMessage = ex;
    }


    if (isOk) {
        //Enviar registros al WF
        return clientAPI.executeAction('/Armadores/Actions/LineaCredito/Habilitaciones/HabilitacionSolicitudWF.action');

    } else {

        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/ToastMessageGeneric.action",
            "Properties": {
                "Message": `Error: ${sMessage}, Complete todos los campos e intentelo nuevamente.`,
            }
        });

    }

}

function validateValues(value, type) {
    if (value !== null && value !== undefined) {

        if (type == 'number') {

            if (isNaN(value)) throw "Campo no es numerico";

            return true;

        } else if (type == 'string') {

            if (value.toString().trim() == '') throw "Campo vacio";

            return true;

        }

    }

    throw "Campo vacio";

}
async function getHabilitacionId(clientAPI) {
    var oFunction = {
        "Name": "obtenerHabilitacionId",
        "Parameters": {
            "tipo": "1"
        }
    }
    return new Promise(function (resolve, reject) {
        clientAPI.callFunction(
            "/Armadores/Services/armadorService.service", //Service
            oFunction
        ).then(function (oData) {

            var ok = "";
            resolve("");

        }, function () {
            reject("");
        });
    });
}