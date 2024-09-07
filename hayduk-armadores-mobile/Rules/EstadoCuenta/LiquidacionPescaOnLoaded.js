
var clientAPI;

/**
 * Describe this function...
 */
export default function LiquidacionPescaOnLoaded(clientAPI) {
    var year = new Date().getFullYear();
    clientAPI.evaluateTargetPath("#Page:LiquidacionPesca/#Control:lspEjercicio").setValue(year);
}
