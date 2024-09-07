
var clientAPI;

/**
 * Describe this function...
 */
export default function AdelantoFilterTemporada(clientAPI) {

    let appSettings = require("@nativescript/core/application-settings");
    var embarcacionId = appSettings.getString("EmbarcacionIdAdelanto");
    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    let sFilter = `$filter=IDRuc eq '${sUserId}' and Embarcacion eq '${embarcacionId}'`;


    let sReturnValue = clientAPI.getValue()[0].ReturnValue; // {IDTemporada}
    let sDisplayValue = clientAPI.getValue()[0].DisplayValue; //{IDTemporada}: {FechaInicio}-{FechaFin}

    let containerProxy = clientAPI.getPageProxy().getControl('stAdelanto');
    if (!containerProxy.isContainer()) {
        return;
    }

    let sotAdelantoReg = containerProxy.getControl('SectionObjectTable0');
    let specifier = sotAdelantoReg.getTargetSpecifier();
    

    //var sDisplayValue = "{IDTemporada}: {FechaInicio}-{FechaFin}";
    sDisplayValue = sDisplayValue.substring(sDisplayValue.indexOf(":") + 1);
    var sFechaInicio = sDisplayValue.substring(0, sDisplayValue.indexOf("-")).trim();
    var sFechaFin = sDisplayValue.substring(sDisplayValue.indexOf("-") + 1).trim();



    //let qo1 = specifier.getQueryOptions();
    let qo = sFilter + " and (FechaInicio eq '" + sFechaInicio + "') and (FechaFin eq '" + sFechaFin + "')";
    specifier.setQueryOptions(qo);
    sotAdelantoReg.setTargetSpecifier(specifier);

    
}
