
var clientAPI;

/**
 * Describe this function...
 */
export default function OpenDocumentSuccess(clientAPI) {

    let res = clientAPI.getActionResult("oData");
    var oData = JSON.parse(res.data);
    let sIdOpenDocument = oData.sIdOpenDocument;
    let appSettings = require("@nativescript/core/application-settings");
    var armadorServiceUri = appSettings.getString("sArmadorBackUrl");
    let url = armadorServiceUri + "/OpenDocument?sIdOpenDocument=" + sIdOpenDocument;

    appSettings.setString("OpenDocumentUrl", url);

    return clientAPI.getPageProxy().executeAction({
        "Name": "/Armadores/Actions/OpenDocumentUrl.action"
    });

}
