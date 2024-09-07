
var clientAPI;

/**
 * Describe this function...
 */
export default function CrearCuentaSuccessRule(clientAPI) {
    let actionResult = clientAPI.getActionResult("result");
    var result = actionResult.data;
    if (actionResult.data == undefined)
        result = JSON.parse(actionResult.error.responseBody);
    if (result.code == 200) {
        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/HaydukContigo/MessageCrearCuentaSuccess.action",
            "Properties": {
                "Message": "Se ha enviado la solicitud exitosamente, vuelva a ingresar."
            }
        });
    } else if (result.code == "E007") {

        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/HaydukContigo/MessageCrearCuentaSuccess.action",
            "Properties": {
                "Message": result.mensaje
            }
        });
    }
}
