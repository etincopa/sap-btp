
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerTokenSuccessRule(clientAPI) {
    console.info('[DEBUG] ObtenerTokenSuccessRule.ts - start');

    let actionResult = clientAPI.getActionResult("result");
    var response = actionResult.data;

    console.info('[DEBUG] ObtenerTokenSuccessRule.ts - start', JSON.stringify(response));

    var token = "";
    if (response.data != undefined)
        token = response.data.aT;
    const utilsModule = clientAPI.nativescript.utilsModule;
    let appSettings = require("@nativescript/core/application-settings");
    var urlHC = appSettings.getString("sUrlUsuarioHC");
    var url = urlHC + token;
    appSettings.setString("UrlLoginHC", url);
    console.info('[DEBUG] ObtenerTokenSuccessRule.ts - UrlLoginHC', url);
    if (token == "")
        return clientAPI.getPageProxy().executeAction('/Armadores/Actions/Home/CrearCuentaHaydukContigo.action');
    else {
        const platform = clientAPI.nativescript.platformModule;
        if (platform.isAndroid) {
            console.info('[DEBUG] ObtenerTokenSuccessRule.ts - about to execute action OpenHaydukContigo.action');
            // return clientAPI.getPageProxy().executeAction('/Armadores/Actions/Home/OpenHaydukContigo.action');
            return clientAPI.getPageProxy().executeAction(
                {
                    "Name": '/Armadores/Actions/Home/OpenHaydukContigo.action',
                }
            ).then((o) => {
                console.info('[DEBUG] ObtenerTokenSuccessRule.ts - success', o);
            }).catch((error) => {
                console.error('[DEBUG] ObtenerTokenSuccessRule.ts - error', error.toString());
            });
        }
        if (platform.isIOS) {
            utilsModule.openUrl(url);
        }
        /*var AdvancedWebView = require('nativescript-advanced-webview');
        AdvancedWebView.init();
        var opts = {
            url: url,
            toolbarColor: '#003d5d',
            toolbarControlsColor: '#333', // iOS only
            showTitle: true, // Android only
            isClosed: function (res) {
                console.log('closed it', res);
            }
        };*/
        /*setTimeout(function () {
        }, 1000);*/
        //AdvancedWebView.openAdvancedUrl(opts);
    }
}
