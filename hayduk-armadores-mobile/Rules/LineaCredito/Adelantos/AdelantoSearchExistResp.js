
var clientAPI;

/**
 * Describe this function...
 */
export default async function AdelantoSearchExistResp(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let actionResult = clientAPI.getActionResult("oData");
    let oData = actionResult.data._array;
    var id = oData[0].iID;
    appSettings.setString("iID",id+"");
    let sValueLC = appSettings.getString("AdelantoLineaCredito");
    var obj = JSON.parse(sValueLC);
    var iMontoMaximo = parseFloat(obj.MontoMaximo);

    //Validar si todos los campos estan correctos

    let isOk = true;
    let sMessage = '';

    let spMontoSolicitud = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:spMontoSolicitud/#Value");
    let ntDetDescuento = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:ntDetDescuento/#Value");
    let spRSocial = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:spRSocial/#Value");

    try {

        isOk = validateValues(spMontoSolicitud, 'number');

        let lpMoneda = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpMoneda/#SelectedValue");
        let lpViaPago = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpViaPago/#SelectedValue");
        let lpPlanta = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpPlanta/#SelectedValue");
        let lpEmbarcacion = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpEmbarcacion/#SelectedValue");
        //let lpTemporada = clientAPI.evaluateTargetPath("#Page:SolicitarAdelanto/#Control:lpTemporada/#SelectedValue");

    } catch (ex) {
        isOk = false;
        sMessage = ex;
    }


    if (isOk) {
        //Enviar registros al WF
        return clientAPI.executeAction('/Armadores/Actions/LineaCredito/Adelantos/AdelantoSolicitudWF.action');

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

async function getAdelantoId(clientAPI) {
    var oFunction = {
        Name: "obtenerAdelantoId",
        Parameters: {

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