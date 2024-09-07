
var clientAPI;

/**
 * Describe this function...
 */
export default async function ExisteSolicitudCorreoRule(clientAPI) {

    let ruc = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');

    var btnEditarCorreoCtrl = clientAPI.evaluateTargetPath("#Page:TabDatos/#Control:btnEditarCorreo");
    var spcNuevoCorreoCtrl = clientAPI.evaluateTargetPath("#Page:TabDatos/#Control:spcNuevoCorreo");
    var correo = await existeSolicitudDato(clientAPI, ruc);
    if (correo == "") {
        btnEditarCorreoCtrl.setVisible(true);
        return "";
    }
    else {
        btnEditarCorreoCtrl.setVisible(false);
        return correo;
    }
}
async function existeSolicitudDato(clientAPI, ruc) {
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/armadorService.service", //Service
            "SolicitudDatoArmador", //Entity
            [], //
            `$filter=sUsuarioRegistro eq '${ruc}' and sEstado eq '1'`
        ).then(function (oData) {

            if (oData.length > 0) {
                for (var i = 0; i < oData.length; i++) {
                    var correo = oData._array[i].sCorreoProp;
                    resolve(correo);
                }
                resolve("");
            } else {
                resolve("");
            }

        }, function () {
            reject("");
        });
    });
}