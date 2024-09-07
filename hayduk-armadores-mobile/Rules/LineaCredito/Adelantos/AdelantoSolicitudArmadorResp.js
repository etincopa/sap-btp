
var clientAPI;

/**
 * Describe this function...
 */
export default function AdelantoSolicitudArmadorResp(clientAPI) {

    return clientAPI.getPageProxy().executeAction({
        "Name": "/Armadores/Actions/LineaCredito/MessageToAdelantoAction.action",
        "Properties": {
            "Message": `Registros enviados correctamente`,
                "OnSuccess": "/Armadores/Actions/LineaCredito/Adelantos/NavToAdelantosSolicitudes.action"
        }
    });

}
