
var clientAPI;

/**
 * Describe this function...
 */
export default async function NavToDescuentoDetailRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let ruc = clientAPI.evaluateTargetPath('#Application/#ClientData/#Property:UserId');
    await obtenerDescuento(clientAPI, ruc);
    return true;
}
async function obtenerDescuento(clientAPI, ruc) {
    let appSettings = require("@nativescript/core/application-settings");
    var emb = appSettings.getString("Embarcacion");
    let sFilter = `$filter=IDRuc eq '${ruc}' and Embarcacion eq '${emb}'`;
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "AdelantoLinCredDetSet", //Entity
            [], //
            sFilter
        ).then(function (oData) {

            if (oData.length > 0) {
                var item = oData.getItem(0);
                var embDesc = {
                    Matricula: item.Matricula,
                    Precio: item.Precio,
                    TmDesc: item.TmDesc,
                    TIgv: item.TIgv,
                    DescFep: item.DescFep,
                    DescAdelanto: item.DescAdelanto,
                    DescComb: item.DescComb,
                    DescMatServ: item.DescMatServ,
                    DescHab: item.DescHab,
                    DescDeco: item.DescDeco,
                    DescDetracc: item.DescDetracc,
                    DescSanPedro: item.DescSanPedro,
                    DescOtros: item.DescOtros,
                    SubtotalDctos: item.SubtotalDctos,
                    PagoTotal: item.PagoTotal,
                    Saldo: item.Saldo,
                    Embarcacion: item.Embarcacion
                };
                appSettings.setString("EmbarcacionDescuento", JSON.stringify(embDesc));
                resolve(item.IDEmbarcacion);
            } else {

                resolve(true);
            }

        }, function () {
            reject(false);
        });
    });
}