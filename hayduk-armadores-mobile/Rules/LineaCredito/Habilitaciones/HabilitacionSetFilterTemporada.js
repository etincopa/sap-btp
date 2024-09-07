
var clientAPI;

/**
 * Describe this function...
 */
export default function HabilitacionSetFilterTemporada(clientAPI) {

    let isOk = true;
    let lpEspecie = "";
    let lpTemporada = "";
    ///let spFilterTemporada = "";


    try {

        //spFilterTemporada = clientAPI.evaluateTargetPath("#Page:HabilitacionEspecieTemporadaFilter/#Control:spFilterTemporada");
        //spFilterTemporada.setValue("");
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

        let qo = `$filter=IDEspecie eq '01' and IDTemporada eq '${lpTemporada}'`;

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
        let appSettings = require("@nativescript/core/application-settings");
        appSettings.setString("fechaInicio", lpFechaInicio.getValue());
        appSettings.setString("fechaFin", lpFechaFin.getValue());
        /*
                return clientAPI.read(
                    "/Armadores/Services/s4hService.service", //Service
                    "TemporadaSet", //Entity
                    [], //
                    `$filter=IDEspecie eq '${lpEspecie}' and IDTemporada eq '${lpTemporada}'` //Filter //$filter=IDRuc eq '{{#Application/#ClientData/#Property:UserId}}'
                ).then(function (oData) {
        
                    try {
                        if (oData.length > 0) {
                            for (var i = 0; i < oData.length; i++) {
                                var item = oData.getItem(i);
                                spFilterTemporada.setValue(`FechaInicio eq '${item.FechaInicio}' and FechaFin eq '${item.FechaFin}'`);
        
                            }
                        }
                    } catch (ex) {
                        return clientAPI.getPageProxy().executeAction({
                            "Name": "/Armadores/Actions/ToastMessageGeneric.action",
                            "Properties": {
                                "Message": `${ex}`,
                            }
                        });
                    }
        
                    return;
                    //return clientAPI.getPageProxy().executeAction({"Name": "/Armadores/Actions/ClosePage.action"});
        
                }, function () {
        
                    return;
        
                    //return clientAPI.getPageProxy().executeAction({"Name": "/Armadores/Actions/ClosePage.action"});
        
                });
        
                */
    }




}
