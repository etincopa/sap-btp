
var clientAPI;

/**
 * Describe this function...
 */
export default async function TipoBancoListRule(clientAPI) {
    var list = await getTipoBanco(clientAPI);
    return list;
}
async function getTipoBanco(clientAPI) {
    return new Promise(function (resolve, reject) {
        clientAPI.read(
            "/Armadores/Services/s4hService.service", //Service
            "TipoBancoSet", //Entity
            []
        ).then(function (oData) {

            if (oData.length > 0) {
                const aValues = [];
                for (var i = 0; i < oData.length; i++) {
                    var id = oData._array[i].IDTipoBanco;
                    var banco = oData._array[i].Descripcion;
                    aValues.push(
                        {
                            DisplayValue: banco,
                            ReturnValue: id
                        }
                    );
                }
                resolve(aValues);
            } else {
                resolve("");
            }

        }, function () {
            reject("");
        });
    });
}