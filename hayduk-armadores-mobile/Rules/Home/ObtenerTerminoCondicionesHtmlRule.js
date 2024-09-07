
var clientAPI;

/**
 * Describe this function...
 */
export default function ObtenerTerminoCondicionesHtmlRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    let tcHtml = appSettings.getString("terminoCondicionesHtml");
    return tcHtml;
}
