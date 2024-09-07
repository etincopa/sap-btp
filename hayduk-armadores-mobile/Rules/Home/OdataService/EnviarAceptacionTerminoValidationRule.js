
var clientAPI;

/**
 * Describe this function...
 */
export default function EnviarAceptacionTerminoValidationRule(clientAPI) {
    let appSettings = require("@nativescript/core/application-settings");
    const Dialogs = clientAPI.nativescript.uiDialogsModule;
    let checkTermino = clientAPI.evaluateTargetPath("#Page:AceptarTerminoCondiciones/#Control:schAceptarTerminoId/#Value");
    if (!checkTermino) {
        appSettings.setString("terminoCondicionesAcepto", "0");
        Dialogs.alert({
            title: '',
            okButtonText: 'Aceptar',
            message: `Debe aceptar los términos y condiciones`
        });
    } else {
        appSettings.setString("terminoCondicionesAcepto", "1");
        return true;
    }
}
