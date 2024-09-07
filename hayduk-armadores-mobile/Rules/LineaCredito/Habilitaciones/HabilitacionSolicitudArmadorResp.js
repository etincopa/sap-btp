
var clientAPI;

/**
 * Describe this function...
 */
export default function HabilitacionSolicitudArmadorResp(clientAPI) {

    return clientAPI.getPageProxy().executeAction({
        "Name": "/Armadores/Actions/LineaCredito/MessageToHabilitacionAction.action",
        "Properties": {
            "Message": `Registros enviados correctamente`,
                "OnSuccess": "/Armadores/Actions/LineaCredito/Habilitaciones/NavToHabilitacionSolicitudes.action"
        }
    });

}
