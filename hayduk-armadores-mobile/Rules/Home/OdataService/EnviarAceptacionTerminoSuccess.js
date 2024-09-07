
var clientAPI;

/**
 * Describe this function...
 */
export default function EnviarAceptacionTerminoSuccess(clientAPI) {
        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/MessageAndClose.action",
            "Properties": {
                "Message": `Se ha aceptado los términos y condiciones correctamente.`
            }
        });
}
