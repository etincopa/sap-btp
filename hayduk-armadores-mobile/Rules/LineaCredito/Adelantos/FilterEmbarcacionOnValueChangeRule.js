
var clientAPI;

/**
 * Describe this function...
 */
export default function FilterEmbarcacionOnValueChangeRule(clientAPI) {
    let sReturnValue = clientAPI.getValue()[0].ReturnValue;
    let sDisplayValue = clientAPI.getValue()[0].DisplayValue;

    clientAPI.evaluateTargetPath("#Page:Adelantos/#Control:spEmbarcacion").setValue(sDisplayValue);
    let appSettings = require("@nativescript/core/application-settings");
    appSettings.setString("EmbarcacionIdAdelanto", sReturnValue);
}
