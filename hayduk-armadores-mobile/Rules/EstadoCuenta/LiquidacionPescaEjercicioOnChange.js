
var clientAPI;

/**
 * Describe this function...
 */
export default function LiquidacionPescaEjercicioOnChange(clientAPI) {
    clientAPI.evaluateTargetPath("#Page:LiquidacionPesca")._childControls[0]._sections[1].searchUpdated();
}
