
var clientAPI;

/**
 * Describe this function...
 */
export default function EmbarcacionSaldoDisponibleRule(clientAPI) {
    var total = parseFloat(clientAPI.binding.MontoMaximo);
    var consumido = parseFloat(clientAPI.binding.MontoConsumido);
    consumido = 0;
    var disponible = total - consumido;
    if (disponible < 0)
        disponible = 0;
    return "$(C," + disponible + " ,USD)";
}
