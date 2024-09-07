
var clientAPI;

/**
 * Describe this function...
 */
export default function HabilitacionTemporadaOnValueChange(clientAPI) {

    let isOk = true;
    let lpEspecie = "";
    let lpTemporada = "";

    try {

        lpTemporada = clientAPI.getValue()[0].ReturnValue;
        //lpEspecie = clientAPI.evaluateTargetPath("#Page:HabilitacionEspecieTemporadaFilter/#Control:lpEspecie").getValue()[0].ReturnValue;

        clientAPI.evaluateTargetPath("#Page:Habilitaciones/#Control:spTemporada").setValue(lpTemporada);

    } catch (ex) {
        isOk = false;
        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/ToastMessageGeneric.action",
            "Properties": {
                "Message": `${ex}`,
            }
        });
    }

    if (isOk) {

        let qo = `$filter=IDEspecie eq '01' and IDTipo eq 'HABTEMP' and IDTemporada eq '${lpTemporada}'`;

        let containerProxy = clientAPI.getPageProxy().getControl('FormCellContainer0');

        let lpFechaInicio = containerProxy.getControl('lpFechaInicio');
        lpFechaInicio.setEditable(false);

        let specifierFechaInicio = lpFechaInicio.getTargetSpecifier();
        //let qo1 = specifierFechaInicio.getQueryOptions();
        specifierFechaInicio.setQueryOptions(qo);
        lpFechaInicio.setTargetSpecifier(specifierFechaInicio);



        let lpFechaFin = containerProxy.getControl('lpFechaFin');
        lpFechaFin.setEditable(false);

        let specifierFin = lpFechaFin.getTargetSpecifier();
        //let qo1 = specifierFin.getQueryOptions();
        specifierFin.setQueryOptions(qo);
        lpFechaFin.setTargetSpecifier(specifierFin);

        //return clientAPI.getPageProxy().executeAction({"Name": "/Armadores/Actions/ClosePage.action"});

    }




}
