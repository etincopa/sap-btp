var clientAPI;

/**
 * Describe this function...
 */
export default function MontoSolesRule(clientAPI) {
    var tipoCambio = parseFloat(clientAPI.binding.TipoCambio);
    var monto = parseFloat(clientAPI.binding.Monto);
    var total = tipoCambio * monto;
    var result = "S/ "+parseFloat(total + "").toFixed(2);
    return result;
}