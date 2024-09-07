sap.ui.define(
  [
    "../Base",
    "mif/cp/fraccionamiento/util/formatter",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    formatter,
    grupoOrden,
    BusyIndicator,
    MessageBox,
    MessageToast
  ) {
    "use strict";

    return Controller.extend(
      "mif.cp.fraccionamiento.controller.fragment.BultoEntero",
      {
        formatter: formatter,
        onInit: async function () {
          await this.init();
          grupoOrden.init(
            this.oServiceModel,
            this.serviceModelOnlineV2,
            this.serviceModelOnlineV2
          );
        },
        onAfterRendering: function () {
          this.cargarDatos();
        },
        cargarDatos: async function () {
          try {
            BusyIndicator.show(0);
            this.byId("idTableBultoEntero").clearSelection();

            const aFactor = await grupoOrden.obtenerFactor();
            this._setProperty("/aFactor", aFactor);

            const oFraccionamiento = this.oLocalModel.getProperty(
              "/Detalle_Fraccionamiento"
            );
            var aBultos = [];
            if (oFraccionamiento.numPedido) {
              try {
                aBultos = await grupoOrden.obtenerBultosERP(
                  [oFraccionamiento.numPedido],
                  [oFraccionamiento.ordenNumero],
                  [oFraccionamiento.codigoInsumo],
                  [oFraccionamiento.loteInsumo]
                );
                
                aBultos = aBultos.filter(
                  (e) =>
                    e.CodigoInsumo == oFraccionamiento.codigoInsumo &&
                    e.Lote == oFraccionamiento.loteInsumo &&
                    e.Orden == oFraccionamiento.ordenNumero &&
                    +e.Fraccion == +oFraccionamiento.numFraccion &&
                    +e.Subfraccion == +oFraccionamiento.numSubFraccion
                );

                aBultos = aBultos.filter((o) => {
                  var dFechaAte = new Date(
                    Number(o.FechaAte.replace(/\D/g, ""))
                  );
                  o.FechaAte = new Date(
                    dFechaAte.setDate(dFechaAte.getDate() + 1)
                  );
                  o.bruto = +o.CantidadA + +o.Tara;
                  return o.IdBulto;
                });

                if (aBultos.length == 0) {
                  BusyIndicator.hide();
                  MessageBox.information(
                    this.oResourceBundle.getText("deseaNoHayEnteros")
                  );
                  this.byId("dialogBultoEntero").close();
                  return;
                }

                
              } catch (error) {
                BusyIndicator.hide();
                MessageBox.msgError(
                  this.oResourceBundle.getText("mensajeOcurrioError")
                );
              }
            }

            aBultos.sort((a, b) =>
                  +a.NroItem > +b.NroItem ? 1 : +b.NroItem > +a.NroItem ? -1 : 0
                );
            this.oLocalModel.setProperty("/BultoEntero_Bultos", aBultos);
            BusyIndicator.hide();
          } catch (error) {
            BusyIndicator.hide();
            MessageBox.msgError(
              this.oResourceBundle.getText("mensajeOcurrioError")
            );
          }
        },
        formatDateJson: function (d) {
          var m = d.match(/\/Date\((\d+)\)\//);
          return m ? new Date(+m[1]) : null;
        },
        onAceptarPress: function () {
          this.byId("dialogBultoEntero").close();
        },
        onCancelarPress: function () {
          const self = this;
          MessageBox.confirm(
            this.oResourceBundle.getText("deseaCerrarVentana"),
            {
              actions: ["SI", "NO"],
              title: "Confirmar",
              onClose: function (sAction) {
                if (sAction == "SI") {
                  self.byId("dialogBultoEntero").close();
                }
              },
            }
          );
        },
        onBultoEnteroRowSelected: async function (oEvent) {
          this.oBulto = null;
          var oRowSelect = this._getSelectRowTable("idTableBultoEntero");
          if (oRowSelect) {
            this.oBulto = oRowSelect;
          } else {
            MessageToast.show("Selecione un item.");
          }
        },
        onUsarComoSaldoPress: async function () {
          BusyIndicator.show(0);

          try {
            var self = this;
            var aBultos = this.oLocalModel.getProperty("/BultoEntero_Bultos");

            var sUsuario = window.localStorage.getItem("usuarioCodigo");
            var oFraccionamiento = this.oLocalModel.getProperty(
              "/Detalle_Fraccionamiento"
            );
            var oRowSelect = this._getSelectRowTable("idTableBultoEntero");
            if (oRowSelect) {
              var aBultosEnteros = this.oLocalModel.getProperty(
                "/BultoEntero_Bultos"
              );
              if (aBultosEnteros.length !== +oRowSelect.NroItem) {
                MessageBox.msgAlerta("No se puede Usar como saldo.");
                BusyIndicator.hide();
                return;
              }

              MessageBox.confirm("¿Está seguro de usar como Saldo?", {
                actions: ["SI", "NO"],
                title: "Confirmar",
                onClose: async function (sAction) {
                  if (sAction == "SI") {
                    var oBulto = aBultos.find(
                      (b) =>
                        b.Pedido == oFraccionamiento.numPedido &&
                        b.IdBulto == oRowSelect.IdBulto
                    );

                    var oUrlParam = [
                      {
                        Pedido: oFraccionamiento.numPedido,
                        Centro: oBulto.Centro,
                        Orden: oFraccionamiento.ordenNumero,
                        CodigoInsumo: oFraccionamiento.codigoInsumo,
                        Lote: oFraccionamiento.loteInsumo,
                        Tipo: "ENTERO",
                        NroItem: (+oRowSelect.NroItem).toString(),
                        IdBulto: oRowSelect.IdBulto,
                        CantidadA: oRowSelect.CantidadA,
                        Tara: oRowSelect.Tara,
                        UnidadM: oRowSelect.UnidadM,
                        Almacen: oBulto.Almacen,
                        Status: oBulto.Status,
                        Fraccion: oRowSelect.Fraccion,
                        Subfraccion: oRowSelect.Subfraccion,
                        Etiqueta: "",
                        UsuarioAte: sUsuario,
                        Impresion: "",
                        Reimpresion: "",
                        DocMat: "",
                        CantConsumida: "0",
                        Dml: "D",
                        SS: "X",
                      },
                      {
                        Pedido: oFraccionamiento.numPedido,
                        Centro: oBulto.Centro,
                        Orden: oFraccionamiento.ordenNumero,
                        CodigoInsumo: oFraccionamiento.codigoInsumo,
                        Lote: oFraccionamiento.loteInsumo,
                        Tipo: "SALDO",
                        NroItem: (+oRowSelect.NroItem).toString(),
                        IdBulto: oRowSelect.IdBulto,
                        CantidadA: oRowSelect.CantidadA,
                        Tara: oRowSelect.Tara,
                        UnidadM: oRowSelect.UnidadM,
                        Almacen: oBulto.Almacen,
                        Status: oBulto.Status,
                        Fraccion: oRowSelect.Fraccion,
                        Subfraccion: oRowSelect.Subfraccion,
                        Etiqueta: "",
                        UsuarioAte: sUsuario,
                        Impresion: "",
                        Reimpresion: "",
                        DocMat: "",
                        CantConsumida: "0",
                        Dml: "",
                        SS: "X",
                      },
                    ];
                    var oAtendido = await grupoOrden.acSetEtiquetaErp(
                      oUrlParam
                    );
                    if (oAtendido) {
                      MessageBox.msgAlerta(
                        "El bulto: " +
                          oRowSelect.IdBulto +
                          " se convirtio a SALDO."
                      );
                      BusyIndicator.hide();
                      self.cargarDatos();
                    }
                  } else {
                    BusyIndicator.hide();
                  }
                },
              });
            } else {
              BusyIndicator.hide();
              MessageBox.msgAlerta("Selecione un item.");
            }
          } catch (error) {
            MessageBox.msgError(
              this.oResourceBundle.getText("mensajeOcurrioError")
            );
            BusyIndicator.hide();
          }
        },
        onTararEnteroPress: function () {
          var oRowSelect = this._getSelectRowTable("idTableBultoEntero");
          if (
            oRowSelect &&
            ["KG", "G"].includes(oRowSelect.UnidadM.toUpperCase())
          ) {
            var iNewTara = oRowSelect.Tara;
            if (oRowSelect.UnidadM.toLowerCase() == "kg") {
              iNewTara = iNewTara * 1000;
            }

            this.oLocalModel.setProperty(
              "/Tarar_Tara",
              formatter.peso(iNewTara)
            );
            this.oLocalModel.setProperty("/Tarar_InicioKeyPad", true);
            this.onOpenFragment("Tarar");
          } else {
            if (oRowSelect) {
              MessageToast.show(
                "No esta permitido el ajuste de tara para la unidad: " +
                  oRowSelect.UnidadM
              );
            } else {
              MessageToast.show("Selecione un item.");
            }
          }
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
        onActualizarPress: async function () {
          
          var that = this;
          var sUsuario = window.localStorage.getItem("usuarioCodigo");
          var oConfiguracion = this.oLocalModel.getProperty("/Config");
          BusyIndicator.show(0);

          var tara = this.oLocalModel.getProperty("/Tarar_Tara");

          var umInsumo = this.oBulto.UnidadM;

          var cantPesar = tara;
          var cantBalanza = tara;
          var umBalanza = "G";
          var oPeso = this._factConversion(
            cantPesar,
            umInsumo,
            cantBalanza,
            umBalanza
          );
          var iNewTara = oPeso.oFactorToBalanza.peso;

          if (+iNewTara == 0) {
            MessageBox.msgError("El valor ingresado debe ser mayor a CERO");
            BusyIndicator.hide();
            return;
          }

          var aBultoUpd = [];
          var oAction = await this.doMessageboxActionCustom(
            "¿Cómo quiere actualizar la tara?",
            ["SELECCION", "TODOS", "CANCELAR"],
            "43%"
          );
          if (oAction === "CANCELAR") {
            BusyIndicator.hide();
            return false;
          } else if (oAction === "SELECCION") {
            var oRowSelect = this.oBulto;
            oRowSelect.Tara = iNewTara;
            oRowSelect.FechaAte =
              formatter.getTimestampToYMD(new Date(oRowSelect.FechaAte)) +
              "T00:00:00.0000000";
            aBultoUpd.push(that._deleteProperties(oRowSelect));
          }
          if (oAction === "TODOS") {
            var aBultos = this.oLocalModel.getProperty("/BultoEntero_Bultos");

            aBultos.forEach(function (e) {
              e.Tara = iNewTara;
              e.FechaAte =
                formatter.getTimestampToYMD(new Date(e.FechaAte)) +
                "T00:00:00.0000000";
              aBultoUpd.push(that._deleteProperties(e));
            });
          }
          /**Generar etiqueta IFA */
          var oAtendido = await grupoOrden.acSetEtiquetaErp(aBultoUpd);
          if (oAtendido) {
            oAtendido = oAtendido.data.AtendidoItemSet.results[0];
            BusyIndicator.hide();
            this.onCloseFragment("Tarar");
            this.cargarDatos();
          }
        },
        _deleteProperties: function (oBultoFormat) {
          var oBulto = Object.assign({}, oBultoFormat);
          delete oBulto.DescripInsumo;
          delete oBulto.EtiquetaGroup;
          //delete oBulto.FechaAte;
          //delete oBulto.HoraAte;
          delete oBulto.FechaTras;
          delete oBulto.Mblnr;
          delete oBulto.Mjahr;
          delete oBulto.TypeTras;
          delete oBulto.bruto;
          delete oBulto.__metadata;
          return oBulto;
        },
        onOpenFragment: function (sDialog) {
          //let sDialog = "Tarar";
          var rootPath = "mif.cp.fraccionamiento";
          if (!this["o" + sDialog]) {
            this["o" + sDialog] = sap.ui.xmlfragment(
              "frg" + sDialog,
              rootPath + ".view.fragment." + sDialog,
              this
            );
            this.getView().addDependent(this["o" + sDialog]);
          }
          this["o" + sDialog].open();
        },
        onCloseFragment: function (sDialog) {
          //let sDialog = "Tarar";
          var rootPath = "mif.cp.fraccionamiento";
          if (!this["o" + sDialog]) {
          }
          this["o" + sDialog].close();
        },
        onCloseDialog: function (oEvent) {
          var oSource = oEvent.getSource();
          this._onCloseDialog(oSource);
        },

        _onCloseDialog: function (oSource) {
          //var oSource = oEvent.getSource();
          //var sCustom = oSource.data("custom");
          var oParent = oSource.getParent();
          oParent.close();
        },
        onImprimirPress: async function () {
          BusyIndicator.show(0);
          var sUsuario = window.localStorage.getItem("usuarioCodigo");
          var oConfiguracion = this.oLocalModel.getProperty("/Config");
          
          var oRowSelect = this._getSelectRowTable("idTableBultoEntero");
          if (oRowSelect) {
            var aEtiqueta = [];
            var aNoEtiqueta = [];
            var oAction = await this.doMessageboxActionCustom(
              "¿Cómo quieres imprimir?",
              ["SELECCION", "TODOS", "CANCELAR"],
              "45%"
            );
            if (oAction === "CANCELAR") {
              BusyIndicator.hide();
              return false;
            } else if (oAction === "SELECCION") {
              if (oRowSelect.Etiqueta) {
                aEtiqueta.push(oRowSelect.Etiqueta);
              }
            }
            if (oAction === "TODOS") {
              var aBultos = this.oLocalModel.getProperty("/BultoEntero_Bultos");

              aBultos.forEach(function (e) {
                if (e.Etiqueta) {
                  aEtiqueta.push(e.Etiqueta);
                } else {
                  aNoEtiqueta.push(e.IdBulto);
                }
              });
            }

            if (aEtiqueta.length) {
              try {
                var oResp = await grupoOrden.fnSendPrintBulto({
                  impresoraId: oConfiguracion.impresora,
                  etiqueta: aEtiqueta.join(","),
                  usuario: sUsuario,
                });

                if (aNoEtiqueta.length) {
                  MessageBox.msgError(
                    "Existen bultos sin etiquetas asignadas: " +
                      aNoEtiqueta.join(" , ")
                  );
                }

                if (oResp.iCode == "1") {
                  oResp = oResp.oResult.value.data;
                } else {
                  MessageBox.msgError("Ocurrio un error al imprimir.");
                }
              } catch (oError) {
                console.log(oError);
                MessageToast.show("ERROR GENERAL AL IMPRIMIR.");
              }
            } else {
              MessageBox.msgAlerta("Bultos sin etiquetas para imprimir.");
            }
          } else {
            MessageToast.show("Selecione un item.");
          }

          BusyIndicator.hide();
        },
        onRefrescarPress: function () {
          this.cargarDatos();
        },
        _getSelectRowTable: function (sIdTable) {
          var oTable = this.byId(sIdTable);
          var iIndex = oTable.getSelectedIndex();
          var sPath;
          if (iIndex < 0) {
            return false;
          } else {
            sPath = oTable.getContextByIndex(iIndex).getPath();
            var oRowSelect = oTable
              .getModel("localModel")
              .getContext(sPath)
              .getObject();
            return oRowSelect;
          }
        },
        _factConversion: function (
          cantPesar,
          umInsumo,
          cantBalanza,
          umBalanza
        ) {
          var aFactConversion = this._getProperty("/aFactor");
          var aTipoBalanzaReq = [
            { balanza: "ANALITICA", umb: "G", from: 0, to: 100 },
            { balanza: "MESA", umb: "G", from: 100, to: 32000 },
            { balanza: "PISO", umb: "G", from: 32000, to: 150000 },
          ];

          var iFact = 1;
          if (umBalanza.toUpperCase() === umInsumo.toUpperCase()) {
            iFact = 1;
          } else {
            var oFactConversion = aFactConversion.find((o) => {
              return (
                o.codigoSap == umInsumo.toUpperCase() &&
                o.codigo == umBalanza.toUpperCase()
              );
            });

            iFact = +oFactConversion.campo1;
          }

          var iCantFact = +cantPesar;
          if (umInsumo.toUpperCase() === "KG") {
            iCantFact = +cantPesar * 1000;
          }
          var oTipoBalanzaReq = aTipoBalanzaReq.find((o) => {
            return iCantFact > o.from && iCantFact <= o.to;
          });

          var iPesoFact = +cantBalanza * iFact;

          return {
            oInsumo: {
              peso: cantPesar,
              umb: umInsumo,
            },
            oBalanza: {
              tipo: oTipoBalanzaReq ? oTipoBalanzaReq.balanza : "",
              peso: cantBalanza,
              umb: umBalanza,
            },
            oFactorToBalanza: {
              peso: iPesoFact,
              umb: umInsumo,
              factor: iCantFact,
            },
          };
        },
        _getProperty: function (sName) {
          return this.oLocalModel.getProperty(sName);
        },
        _setProperty: function (sName, value) {
          return this.oLocalModel.setProperty(sName, value);
        },
      }
    );
  }
);
