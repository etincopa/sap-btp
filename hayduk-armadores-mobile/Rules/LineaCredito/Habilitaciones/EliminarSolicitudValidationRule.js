
var clientAPI;

/**
 * Describe this function...
 */
export default async function EliminarSolicitudValidationRule(clientAPI) {
     const Dialogs = clientAPI.nativescript.uiDialogsModule;
    var idWf = clientAPI.binding.sIDWorklow;
    let sUserId = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    var sFilter = "$filter=sIDRUC eq '" + sUserId + "' and sEstado eq '0' and sIDWorklow eq '" + idWf + "'";
    var result = await isValid(clientAPI, sFilter);
    if (!result) {
        Dialogs.alert({
            title: '',
            okButtonText: 'Aceptar',
            message: `La solicitud se encuentra aprobada, no puede ser modificada o eliminada.`
        });
    }
    return result;
}
async function isValid(clientAPI, sFilter) {
    const Dialogs = clientAPI.nativescript.uiDialogsModule;
    let httpModule = require('@nativescript/core/http');
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/armadorService.service", //Service
            "SolicitudPendHabilitacion", //Entity
            [], //
            sFilter
        ).then(function (oData) {

            if (oData.length > 0) {
                resolve(true);
            } else {

                resolve(false);
            }

        }, function () {
            Dialogs.alert({
                title: '',
                okButtonText: 'Aceptar',
                message: `Ha ocurrido un error, vuelva a intentarlo.`
            });
            reject(false);
        });
    });
}