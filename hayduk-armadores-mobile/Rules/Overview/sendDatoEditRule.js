var clientAPI;

/**
 * Describe this function...
 */
export default function sendDatoEditRule(clientAPI) {
    console.info('[DEBUG] sendDatoEditRule - start');

    let txtEmailEdit = clientAPI.evaluateTargetPath("#Page:TabDatosEdit/#Control:EmailEdit");
    let lblMessage = clientAPI.evaluateTargetPath("#Page:TabDatosEdit/#Control:lblMessageDato");


    var sEmail = txtEmailEdit.getValue().trim();

    txtEmailEdit.setValue(sEmail);
    if (sEmail.length <= 100 && sEmail.length >= 5) {
        if (sEmail.indexOf("@") < 1 || sEmail.lastIndexOf(".") - sEmail.indexOf("@") < 2) {
            lblMessage.setVisible(true);
            lblMessage.setValue("Ingrese un correo valido: _@_._");

            return clientAPI.executeAction('/Armadores/Actions/Overview/Message/sendDatoEditMessajeAction.action');
        } else {
            lblMessage.setVisible(false);
            lblMessage.setValue("");
            return clientAPI.executeAction('/Armadores/Actions/Overview/Message/SolicitudDatoArmadorConfirm.action');
        }

    } else {
        lblMessage.setVisible(true);
        lblMessage.setValue("Longitud del correo (Minimo 5 - Maximo 100) caracteres");
        return clientAPI.executeAction('/Armadores/Actions/Overview/Message/sendDatoEditMessajeAction.action');
    }
}
