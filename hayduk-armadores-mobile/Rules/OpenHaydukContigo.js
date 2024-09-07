/**
* Describe this function...
* @param {IClientAPI} context
*/
export default async function OpenHaydukContigo(context) {
    console.info('[DEBUG] OpenHaydukContigo.js - start');
    // Get the Nativescript UI Dialogs Module
    const dialogs = context.nativescript.uiDialogsModule;
    // Get the Nativescript Utils Module
    const utilsModule = context.nativescript.utilsModule;
    let httpModule = require('@nativescript/core/http');
    let appSettings = require("@nativescript/core/application-settings");
    var urlToken = appSettings.getString("sUrlTokenHC");
    var urlHC = appSettings.getString("sUrlUsuarioHC");
    let sCorreo = appSettings.getString("correo");
    let sRuc = appSettings.getString("ruc");
    var usu = appSettings.getString("sUsuarioHC");
    var pass = appSettings.getString("sPasswordHC");
    /*if (sRuc == "")
        sRuc = "20601018781";
    if (sCorreo = "")
        sCorreo = "leonel.rojasaranda@gmail.com";*/
    var token = await getToken(urlToken, usu, pass, sRuc, sCorreo);
    var url = urlHC + token;
    //if (token == "")
        return context.getPageProxy().executeAction('/Armadores/Actions/Home/CrearCuentaHaydukContigo.action');
    //url = "https://www.hayduk.com.pe/";
    //return utilsModule.openUrl(url);
}
async function getToken(urlToken, usu, pass, sRuc, sCorreo) {
    console.info('[DEBUG] OpenHaydukContigo.js - getToken - start');
    let httpModule = require('@nativescript/core/http');
    return new Promise(function (resolve, reject) {
        httpModule.request({
            url: urlToken,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                "username": usu,
                "password": pass,
                "usernameUsuario": sCorreo,
                "rucUsuario": sRuc
            })
        }).then((response) => {
            const result = response.content.toJSON();
            var token = "";
            if (result.data != undefined )
                token = result.data.aT;
            resolve(token);
            // << (hide)
        }, (e) => {
            reject(false);
        });
    });
}