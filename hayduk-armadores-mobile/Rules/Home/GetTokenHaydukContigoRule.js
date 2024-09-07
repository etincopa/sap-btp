
var clientAPI;

/**
 * Describe this function...
 */
export default function GetTokenHaydukContigoRule(clientAPI) {
    console.info('[DEBUG] GetTokenHaydukContigoRule.ts - GetTokenHaydukContigoRule');

    let httpModule = require('@nativescript/core/http');
    let appSettings = require("@nativescript/core/application-settings");
    var UrlLoginHC = appSettings.getString("UrlLoginHC");
    if (UrlLoginHC != "" && UrlLoginHC != undefined)
        return UrlLoginHC;
    var urlToken = appSettings.getString("sUrlTokenHC");
    var urlHC = appSettings.getString("sUrlUsuarioHC");
    let sCorreo = appSettings.getString("correo");
    let sRuc = appSettings.getString("ruc");
    var usu = appSettings.getString("sUsuarioHC");
    var pass = appSettings.getString("sPasswordHC");

    //var token = await getToken(urlToken, usu, pass, sRuc, sCorreo);
    //var url = urlHC + token;
    return "https://www.hayduk.com.pe/";
}
// async function getToken(urlToken, usu, pass, sRuc, sCorreo) {
//     let httpModule = require('@nativescript/core/http');
//     return new Promise(function (resolve, reject) {
//         httpModule.request({
//             url: urlToken,
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             content: JSON.stringify({
//                 "username": usu,
//                 "password": pass,
//                 "usernameUsuario": sCorreo,
//                 "rucUsuario": sRuc
//             })
//         }).then((response) => {
//             const result = response.content.toJSON();
//             var token = "";
//             if (result.data !== undefined)
//                 token = result.data.aT;
//             resolve(token);
//             // << (hide)
//         }, (e) => {
//             reject(false);
//         });
//     });
// }