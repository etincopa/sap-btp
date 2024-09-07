
var clientAPI;

/**
 * Describe this function...
 */
export default function HabilitacionEspecieOnValueChange(clientAPI) {

    let sReturnValue = clientAPI.getValue()[0].ReturnValue;
    let sDisplayValue = clientAPI.getValue()[0].DisplayValue;
    
    let containerProxy = clientAPI.getPageProxy().getControl('FormCellContainer0');
    if (!containerProxy.isContainer()) {
        return;
    }

    clientAPI.evaluateTargetPath("#Page:Habilitaciones/#Control:spEspecie").setValue(sDisplayValue);
    clientAPI.evaluateTargetPath("#Page:Habilitaciones/#Control:spTemporada").setValue("");

    let lpTemporada = containerProxy.getControl('lpTemporada');
    let specifier = lpTemporada.getTargetSpecifier();
    lpTemporada.setEditable(false);
    //let qo1 = specifier.getQueryOptions();
    let qo = "$filter=IDEspecie eq '" + sReturnValue + "'";
    specifier.setQueryOptions(qo);
    lpTemporada.setTargetSpecifier(specifier);

    return clientAPI.read(
        "/Armadores/Services/s4hService.service", //Service
        "TemporadaSet", //Entity
        [], //
        `$filter=IDEspecie eq '${sReturnValue}'` //Filter
    ).then(function (oData) {

        if (oData.length > 0) {
            lpTemporada.setEditable(true);
        } else {
            return clientAPI.getPageProxy().executeAction({
                "Name": "/Armadores/Actions/ToastMessageGeneric.action",
                "Properties": {
                    "Message": `No hay registros de temporadas para la Especie: ${sReturnValue}`
                }
            });
        }
    }, function () {
        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/ToastMessageGeneric.action",
            "Properties": {
                "Message": `No hay registros de temporadas para la Especie: ${sReturnValue}`
            }
        });
    });
    
}
