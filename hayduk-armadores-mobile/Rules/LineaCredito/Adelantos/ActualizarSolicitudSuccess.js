
var clientAPI;

/**
 * Describe this function...
 */
export default function ActualizarSolicitudSuccess(clientAPI) {
        let actionResult = clientAPI.getActionResult("resultOdata");

        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/MessageAndClose.action",
            "Properties": {
                "Message": `Se ha actualizado correctamente.`,
                "OnSuccess": "/Armadores/Actions/LineaCredito/Adelantos/NavToAdelantosSolicitudes.action"
            }
        });
}
