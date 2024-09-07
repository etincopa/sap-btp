
var clientAPI;

/**
 * Describe this function...
 */
export default function LiquidacionPescaFiltroOnChange(clientAPI) {
    if (clientAPI.getValue().filterItems.length > 0)
        clientAPI.evaluateTargetPath("#Page:LiquidacionPesca/#Control:lspEjercicio").setValue(clientAPI.getValue().filterItems[0]);
}
