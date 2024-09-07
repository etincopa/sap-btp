
var clientAPI;

/**
 * Describe this function...
 */
export default async function HomeSuccessRule(clientAPI) {
    var id = await getTerminoActivo(clientAPI);
    if (id != "") {
        var result = await getAceptoTermino(clientAPI, id);
        if (!result)
            return clientAPI.executeAction('/Armadores/Actions/Home/NavToAceptarTerminoCondiciones.action');
    }
    return true;
}
async function getTerminoActivo(clientAPI) {
    let httpModule = require('@nativescript/core/http');
    var sFilter = "$filter=xEnUso eq true";
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/armadorService.service", //Service
            "TerminoCondiciones", //Entity
            [], //
            sFilter
        ).then(function (oData) {
            let appSettings = require("@nativescript/core/application-settings");
            if (oData.length > 0) {
                var item = oData.getItem(0);
                var id = item.sTerminoCondicionesId;
                appSettings.setString("terminoCondicionesHtml", item.sHtml);
                appSettings.setString("terminoCondicionesId", item.sTerminoCondicionesId);
                appSettings.setString("terminoCondicionesAcepto", "0");
                resolve(id);
            } else {

                resolve("");
            }

        }, function () {
            reject("");
        });
    });
}
async function getAceptoTermino(clientAPI, sTerminoCondicionesId) {
    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    var sFilter = `$filter=sRUC eq '${sUserId}' and sTerminoCondicionesId eq '${sTerminoCondicionesId}'`;
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/armadorService.service", //Service
            "AceptacionTermino", //Entity
            [], //
            sFilter
        ).then(function (oData) {

            if (oData.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }

        }, function () {
            reject(false);
        });
    });
}