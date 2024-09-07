
var clientAPI;

/**
 * Describe this function...
 */
export default async function AdelantoRegSumValue(clientAPI) {

    let appSettings = require("@nativescript/core/application-settings");
    var embarcacionId = appSettings.getString("EmbarcacionIdAdelanto");
    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    let sFilter = `$filter=IDRuc eq '${sUserId}' and Embarcacion eq '${embarcacionId}'`;
    let sTemporadaFilter = `$filter=IDEspecie eq '0000' and IDTemporada eq '0000'`;
 
    try {
        //let spEspecie = clientAPI.evaluateTargetPath("#Page:Adelantos/#Control:spEspecie").getValue();
        //let spTemporada = clientAPI.evaluateTargetPath("#Page:Adelantos/#Control:spTemporada").getValue();

        let spTemporada = await getTemporada(clientAPI);
        //let sIDEspecie = spEspecie.toString().substr(0, spEspecie.indexOf(' '));
        //let sEspecieDen = spEspecie.toString().substr(spEspecie.indexOf(' ') + 1);
        sTemporadaFilter = `$filter=IDEspecie eq '01' and IDTipo eq 'ADELTEMP' and IDTemporada eq '${spTemporada}'`;

        //$filter=IDRuc eq '20487379353'
    } catch (error) {
        var spTemporada = await getTemporada(clientAPI);
        sTemporadaFilter = `$filter=IDEspecie eq '01' and IDTipo eq 'ADELTEMP' and IDTemporada eq '${spTemporada}'`;
    }

    //let containerProxy = clientAPI.getPageProxy().getControl('stAdelanto');
    //let sotAdelanto = containerProxy.getControl('SectionObjectTable0');
    //let specifierAdelanto = sotAdelanto.getTargetSpecifier();
    //let qo1 = specifierAdelanto.getQueryOptions();

    var iMonto = 0;

    return clientAPI.read(
        "/Armadores/Services/s4hService.service", //Service
        "TemporadaSet", //Entity
        [], //
        sTemporadaFilter //Filter
    ).then(function (oData) {

        if (oData.length > 0) {
            for (var i = 0; i < oData.length; i++) {
                var item = oData.getItem(i);
                sFilter = sFilter + " and (FechaInicio eq '" + item.FechaInicio + "') and (FechaFin eq '" + item.FechaFin + "')"
                //break;
            }

            return clientAPI.read(
                "/Armadores/Services/s4hService.service", //Service
                "AdelantoRegSet", //Entity
                [], //
                sFilter //  and IDTemporada eq '${lpTemporada}' Filter //$filter=IDRuc eq '{{#Application/#ClientData/#Property:UserId}}'
            ).then(function (oData) {
                let sMonto = "$(C,0.00 ,USD)";

                try {
                    if (oData.length > 0) {
                        for (var i = 0; i < oData.length; i++) {
                            var item = oData.getItem(i);
                            iMonto = iMonto + parseFloat(String(item.Monto).trim());
                        }

                        iMonto = decimalAdjust('round', iMonto, -2);
                        sMonto = "$(C," + iMonto + " ," + item.Moneda + ")";
                    }
                } catch (ex) {
                    return clientAPI.getPageProxy().executeAction({
                        "Name": "/Armadores/Actions/ToastMessageGeneric.action",
                        "Properties": {
                            "Message": `${ex}`,
                        }
                    });
                }

                //clientAPI.getPageProxy().getClientData().AdelantoRegSumMonto = iMonto;

                return sMonto;

            }, function () {
                return "$(C,0.00 ,USD)";

            });

        } else {
            return clientAPI.getPageProxy().executeAction({
                "Name": "/Armadores/Actions/ToastMessageGeneric.action",
                "Properties": {
                    "Message": `No hay registros de temporadas: ${sTemporadaFilter}`
                }
            });
        }
    }, function () {
        return clientAPI.getPageProxy().executeAction({
            "Name": "/Armadores/Actions/ToastMessageGeneric.action",
            "Properties": {
                "Message": `No hay registros de temporadas ${sTemporadaFilter}.`
            }
        });
    });
}


function decimalAdjust(type, value, exp) {
    // Si el exp no está definido o es cero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o el exp no es un entero...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}


async function getTemporada(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    var temp = appSettings.getString("TemporadaAdelanto");
    if (temp != "" && temp != undefined)
        return temp;
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "TemporadaSet", //Entity
            [], //
            `$filter=IDEspecie eq '01'`
        ).then(function (oData) {

            if (oData.length > 0) {
                appSettings.setString("TemporadaAdelanto", oData._array[0].IDTemporada);
                appSettings.setString("FechaInicioAdelanto", oData._array[0].FechaInicio);
                appSettings.setString("FechaFinAdelanto", oData._array[0].FechaFin);
                resolve(oData._array[0].IDTemporada);
            } else {
                resolve("");
            }

        }, function () {
            reject("");
        });
    });
}