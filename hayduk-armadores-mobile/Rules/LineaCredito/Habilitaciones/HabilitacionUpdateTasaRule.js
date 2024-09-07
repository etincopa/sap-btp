
var clientAPI;

/**
 * Describe this function...
 */
export default async function HabilitacionUpdateTasaRule(clientAPI) { 
    let ruc = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
        
    var spNumDoc = clientAPI.evaluateTargetPath("#Page:SolicitudPendHabilitacionDetail/#Control:spNumDoc").getValue();
    var spSociedad = clientAPI.evaluateTargetPath("#Page:SolicitudPendHabilitacionDetail/#Control:spSociedad").getValue();
    var spEjercicio = clientAPI.evaluateTargetPath("#Page:SolicitudPendHabilitacionDetail/#Control:spEjercicio").getValue();
    var spPosicion = clientAPI.evaluateTargetPath("#Page:SolicitudPendHabilitacionDetail/#Control:spPosicion").getValue();

    var sTasa = await getTasaS4H(clientAPI, spNumDoc,spSociedad,spEjercicio,spPosicion);     
    clientAPI.evaluateTargetPath("#Page:SolicitudPendHabilitacionDetail/#Control:spTasaDescuento").setValue(sTasa);

    return "returnn";
}
async function getTasaS4H(clientAPI, spNumDoc,spSociedad,spEjercicio,spPosicion) {
    if (spNumDoc == ""      || spNumDoc == undefined    ||
        spSociedad == ""    || spSociedad == undefined  ||
        spEjercicio == ""   || spEjercicio == undefined ||
        spPosicion == ""    || spPosicion == undefined  )
        return "0";
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "TipoTasaSet", //Entity
            [], //
            `$filter=IDSociedad eq '${spSociedad}' and IDDocumento eq '${spNumDoc}' and IDEjercicio eq '${spEjercicio}' and IDPosicion eq '${spPosicion}'`
        ).then(function (oData) {
            if (oData.length > 0) {                
                resolve(oData._array[0].Tasa);
            } else {
                resolve("0");
            }
        }, function () {
            reject("0");
        });
    });
}