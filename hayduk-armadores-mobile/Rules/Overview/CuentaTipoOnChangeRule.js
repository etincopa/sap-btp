
var clientAPI;

/**
 * Describe this function...
 */
export default function CuentaTipoOnChangeRule(clientAPI) {
    let tipoId = clientAPI.getValue()[0].ReturnValue;
    let cboCuentaTipo = clientAPI.evaluateTargetPath("#Page:TabCuentaEdit/#Control:Tipo");
    cboCuentaTipo.setValue(tipoId);
}
