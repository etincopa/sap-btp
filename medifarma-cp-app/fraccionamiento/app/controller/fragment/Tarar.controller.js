sap.ui.define(
  [
    "mif/cp/fraccionamiento/controller/Base",
    "mif/cp/fraccionamiento/util/formatter",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "sap/ui/core/BusyIndicator",
  ],
  function (Controller, formatter, MessageBox, grupoOrden, BusyIndicator) {
    "use strict";

    return Controller.extend(
      "mif.cp.fraccionamiento.controller.fragment.Tarar",
      {
        formatter: formatter,
        onInit: async function () {
          await this.init(this.oServiceModel);
          grupoOrden.init(
            this.oServiceModel,
            this.serviceModelOnlineV2,
            this.serviceModelOnlineV2
          );
        },
        onAfterRendering: function () {
          const pendiente = this.oLocalModel.getProperty("/Pesaje_Pendiente");
          this.oLocalModel.setProperty("/Tarar_Tara", "0.000");
          this.oLocalModel.setProperty("/Tarar_InicioKeyPad", true);
        },
        onKeyPadUndoPress: function (e) {
          let sText = this.oLocalModel.getProperty("/Tarar_Tara");
          sText = sText.substring(0, sText.length - 1);

          if (sText == "") {
            sText = "0.000";
            this.oLocalModel.setProperty("/Tarar_InicioKeyPad", true);
          }
          this.oLocalModel.setProperty("/Tarar_Tara", sText);
        },
        onKeyPadPress: function (oEvent) {
          const oControl = oEvent.getSource();

          let sText = this.oLocalModel.getProperty("/Tarar_Tara");
          if (this.oLocalModel.getProperty("/Tarar_InicioKeyPad")) {
            sText = "";
            this.oLocalModel.setProperty("/Tarar_InicioKeyPad", false);
          }

          const fNumber = new Number(sText + oControl.getText());

          if (!isNaN(fNumber)) {
            this.oLocalModel.setProperty(
              "/Tarar_Tara",
              sText + oControl.getText()
            );
          }
        },
        /*
        onActualizarTodoPress: async function(){
            BusyIndicator.show(0);
            const sGrupoOrdenFraccionamientoId = this.oParam.oBulto.oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId;
            const sGrupoOrdenBultoId = "";
            const fTara = this.oLocalModel.getProperty("/Tarar_Tara");
            const sUsuario = window.localStorage.getItem("usuarioCodigo"); 
            
            await grupoOrden.actualizarTaraBulto(sGrupoOrdenFraccionamientoId, sGrupoOrdenBultoId, fTara, sUsuario)

			const oFraccionamiento = this.oLocalModel.getProperty("/Detalle_Fraccionamiento");
			
            this.byId("dialogTarar").close();
        },
        onActualizarPress: async function(){
            BusyIndicator.show(0);
            const sGrupoOrdenFraccionamientoId = this.oParam.oBulto.oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId;
            const sGrupoOrdenBultoId = this.oParam.oBulto.grupoOrdenBultoId;
            const fTara = this.oLocalModel.getProperty("/Tarar_Tara");
            const sUsuario = window.localStorage.getItem("usuarioCodigo"); 
            
            await grupoOrden.actualizarTaraBulto(sGrupoOrdenFraccionamientoId, sGrupoOrdenBultoId, fTara, sUsuario)

			const oFraccionamiento = this.oLocalModel.getProperty("/Detalle_Fraccionamiento");
			
            BusyIndicator.hide()
            this.byId("dialogTarar").close();
        },*/
        onCancelarPress: function () {
          const self = this;
          MessageBox.confirm(
            this.oResourceBundle.getText("deseaCerrarVentana"),
            {
              actions: ["SI", "NO"],
              title: "Confirmar",
              onClose: function (sAction) {
                if (sAction == "SI") {
                  self.byId("dialogTarar").close();
                }
              },
            }
          );
        },
      }
    );
  }
);
