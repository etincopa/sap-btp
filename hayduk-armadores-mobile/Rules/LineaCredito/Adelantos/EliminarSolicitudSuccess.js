
var clientAPI;

/**
 * Describe this function...
 */
export default function EliminarSolicitudSuccess(clientAPI) {

    let actionResult = clientAPI.getActionResult("resultOdata");

        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/MessageAndClose.action",
            "Properties": {
                "Message": `Se ha eliminado correctamente,`,
                "OnSuccess": "/Armadores/Actions/LineaCredito/Adelantos/NavToAdelantosSolicitudes.action"
            }
        });
}
