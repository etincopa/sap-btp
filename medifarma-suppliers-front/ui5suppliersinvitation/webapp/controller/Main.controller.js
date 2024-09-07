// eslint-disable-next-line no-undef
sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    'sap/ui/core/BusyIndicator'
    // eslint-disable-next-line no-unused-vars
], function (BaseController, JSONModel, MessageBox, BusyIndicator) {
    "use strict";

    return BaseController.extend("com.everis.ui5suppliersinvitation.controller.Main", {

        onInit: function () {
        },
        validarEmail: function (valor) {
            const correo = this.byId("email").getValue();
            var emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
            if (emailRegex.test(correo)){
                this.sendInvitation(correo)
             } else {
                 MessageBox.error("Por favor ingrese un Correo Valido");
                 return;
             }
          },
        sendInvitation: function (correo) {
            var that = this;
           
            BusyIndicator.show(0);
             var sRuc = this.byId("idRuc").getValue();
             var sRazonSocial = this.byId("idRazonSocial").getValue();
             if (sRuc.length == 11 && sRazonSocial.length > 0) {
                const oData = {
                    "Mail": correo,
                    "Ruc": sRuc,
                    "RazonSocial": sRazonSocial,
                    "Mensaje": ""
                };

                this.getModel("SUPPLIERS_SRV").create("/EmailSet", oData, {
                    success: function (oResponse) {
                        BusyIndicator.hide();
                        that.byId("idRuc").setValue("");
                        that.byId("idRazonSocial").getValue("");
                        that.byId("idRazonSocial").getValue("");
                        MessageBox.success(`Invitación a "${oResponse.Mail}" enviada satisfactoriamente`);
                    },
                    error: function (oError) {
                        BusyIndicator.hide();
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    }
                });
            } else {
                BusyIndicator.hide();
                if(sRuc.length != 11){
                    MessageBox.error("Por favor ingrese un Ruc con 11 digitos");
                }else{
                    MessageBox.error("Por favor llene todos los campos correspondientes");
                }
                
            }

        }
    });

});
