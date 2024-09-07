sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/everis/apps/cajachicaff/controller/DocumentService",
    "sap/m/MessageToast",
    "com/everis/apps/cajachicaff/model/Formatter",
    "sap/base/Log",
    "sap/ui/core/BusyIndicator",
    "../lib/Backend",
    "../lib/Developer",
    "../lib/Sharepoint",
  ],
  function (
    Controller,
    MessageBox,
    JSONModel,
    Filter,
    FilterOperator,
    DS,
    MessageToast,
    Formatter,
    Log,
    BusyIndicator,
    Backend,
    Developer,
    Sharepoint
  ) {
    "use strict";
    return Controller.extend("com.everis.apps.cajachicaff.controller.MasterDetalleFF", {
      _formatter: Formatter,
      _xmlFragmentObjetoCostoHelp: "com.everis.apps.cajachicaff.fragment.objetoCostoDialogHelp",
      _xmlFragmentTipoObjetoCostoHelp: "com.everis.apps.cajachicaff.fragment.tipoObjetoCostoDialogHelp",
      _xmlFragmentOrdenHelp: "com.everis.apps.cajachicaff.fragment.ordenDialogHelp",
      onInit: function () {
        Log.info("[CC] MasterDetalleFF.controller - onInit", "onInit");

        this.getOwnerComponent()
          .getRouter()
          .getRoute("masterDetalleFF")
          .attachMatched(() => {
            Log.info("[CC] MasterDetalleFF.controller - onInit", "attachMatched");

            // Verify if Home.controller has loaded
            const oHomeLoadedModel = sap.ui.getCore().getModel("HomeLoadedModel");
            if (!oHomeLoadedModel) {
              this.getOwnerComponent().getRouter().navTo("home");
              return;
            }

            //Variables DocumentService
            let fileUploadImagenes = new JSONModel([]);
            let idrepositorio = "ea56a4f9aff8479818fc49e5"; //QAS
            let route = {};

            this._parameters = sap.ui.getCore().getModel("ParametersModel").getData();

            this._initState();

            Log.info("[CC] MasterDetalleFF.controller - onInit", "Ambiente: " + this._parameters.AMBIENTE);

            // let oModelDev = new JSONModel([]);
            // this.getView().setModel(oModelDev, "DocumentsDevolucion");
            //	let obj = [];
            route.subcarpeta01 = "FONDOFIJO";
            route.subcarpeta02 = "SOLICITUDES";
            route.subcarpeta03 = "GASTOS";
            route.subcarpeta04 = "DEVOLUCION";
            route.solicitud = "6000000044100024";
            sap.ui.getCore().setModel(fileUploadImagenes, "fileUploadImagenes");
            sap.ui.getCore().setModel(idrepositorio, "idrepositorio");
            //sap.ui.getCore().setModel(carpetaP, "carpetaP");
            sap.ui.getCore().setModel(route, "route");
            sap.ui.getCore().setModel(this._parameters.AMBIENTE, "ambiente");

            //LR 30/12
            let oModelView = new JSONModel([]);
            this.getView().setModel(oModelView, "Documentos");

            //	sap.ui.getCore().setModel(obj, "obj");
            // let oModel = new JSONModel([]);
            // this.getView().setModel(oModel, "Documents");
            /*********11/09/2019*******/
            let temp = this.usuarioIasAdmin() ? true : false;
            let temp2 = {
              lableTipoObjetoCosto: "Tipo Objeto Costo",
              labelObjetoCosto: "Centro de Coste",
              enableObjetoCosto: true,
              isAdmin: temp,
            };
            this.getView().setModel(new JSONModel(temp2), "oGeneral");

            let temp_ = {
              tiposObjetosCosto: [],
              objetosCosto: [],
              Rstyp: {
                code: "",
                name: "",
              },
              Kostl: {
                code: "",
                name: "",
              },
              Bukrs: {
                code: "",
              },
            };
            this.oVariablesJSONModel = new JSONModel(temp_);
            this.getView().setModel(this.oVariablesJSONModel, "oVariablesJSONModel");
            let // oisMobile = sap.ui.Device.system.phone,
              // oVariablesGlobales = {},
              oJGasto = [],
              oJSolicitud = [];
            //   oModelMaster = this.getOwnerComponent().getModel("oCajaChicaFFModel");
            // sap.ui.getCore().setModel(oModelMaster, "oModelMaster");
            sap.ui.getCore().setModel(oJGasto, "oJGasto");
            sap.ui.getCore().setModel(oJSolicitud, "oJSolicitud");
            // oVariablesGlobales.repeticion = 0;
            // sap.ui.getCore().setModel(oVariablesGlobales, "oVariablesGlobales");

            // if (!oisMobile) {
            //   this.getView().byId("idPagCrearSolicitud").setShowNavButton(false);
            // }

            const oModel = new JSONModel([]);
            this.getView().setModel(oModel, "Documents");
            let oModelDev = new JSONModel([]);
            this.getView().setModel(oModelDev, "DocumentsDevolucion");
            let oModelDocSolicitud = new JSONModel([]);
            this.getView().setModel(oModelDocSolicitud, "DocumentsSolicitud");

            let oisMobile = sap.ui.Device.system.phone,
              oVariablesGlobales = {},
              JGasto = [],
              JSolicitud = [],
              oModelMaster = this.getOwnerComponent().getModel("oCajaChicaFFModel");
            sap.ui.getCore().setModel(oModelMaster, "oModelMaster");
            sap.ui.getCore().setModel(JGasto, "JGasto");
            sap.ui.getCore().setModel(JSolicitud, "JSolicitud");
            oVariablesGlobales.repeticion = 0;
            oVariablesGlobales.carpetaFondoFijo = "FONDOFIJO";
            oVariablesGlobales.carpetaSolicitud = "SOLICITUDES";
            oVariablesGlobales.carpetaGasto = "GASTOS";
            oVariablesGlobales.carpetaDevolucion = "DEVOLUCION";
            sap.ui.getCore().setModel(oVariablesGlobales, "oVariablesGlobales");

            if (!oisMobile) {
              // this.getView().byId("idPagCrearGasto").setShowNavButton(false);
              this.getView().byId("idPagCrearSolicitud").setShowNavButton(false);
              // this.getView().byId("idPagDetSolicitud").setShowNavButton(false);
              // this.getView().byId("idPagDetGasto").setShowNavButton(false);
            }

            this.oRegistroModel = this.getView().getModel("oRegistroModel");
            this.getSAPEmailSolicitante();

            // this.onCargarListaMSolicitud();
            // this.onCargarListaGastos();
            // this.onMostrarPorCaja();
            // this.loadCentroCostoList();
            this.onCrearSolicitud();
          }, this);
      },
      onBeforeRendering: function () {
        if (Developer.isTestMode()) {
          this.getView().byId("btnTest").setVisible(true);
        }
      },
      _initState: function () {
        Log.info("[CC] MasterDetalleFF.controller - _initState", "_initState");

        this.state = {
          cajaSolicitante: null,
          isCajaReembolso: false,
          plans: "",
          tablaFiltro: this._parameters.FILTRO_TABLA,
          campoFiltro: this._parameters.FILTRO_CAMPO,
        };

        this.listaGasto = [];
        this.oVariablesJSONModel = "";
      },
      //Funcion para cambiar de pagina
      _onNavToPage: function (sID) {
        this._onGetSplitAppObj().to(this.createId(sID));
      },
      //Funcion para obtener el id del split(se usa en el cambio de pagina)
      _onGetSplitAppObj: function () {
        return this.byId("idSplitFondoFijo");
      },
      onPrimerGastos: function (oPrimerGasto) {
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel");
        let InfoIas = sap.ui.getCore().getModel("InfoIas");
        BusyIndicator.show(0);
        oModel.read("/FondoFijoSet(Bukrs='" + InfoIas.Bukrs + "',Zfondo='" + InfoIas.Zfondo + "')", {
          success: (result) => {
            BusyIndicator.hide();
            sap.ui.getCore().setModel(result, "InfoFondoFijo");
            this.byId("idPagDetGasto").setTitle("Declaracion de G. N°" + oPrimerGasto.Belnr);
            let oModelFondoFijo = sap.ui.getCore().getModel("InfoFondoFijo");
            let oModelIas = sap.ui.getCore().getModel("oModelIas");
            let sZfondo, sZcat;
            sZfondo = oPrimerGasto.Zfondo + " - " + oModelFondoFijo.Txt50;
            sZcat = oPrimerGasto.Zcat + " - " + oPrimerGasto.Txt50;
            oPrimerGasto.sZfondoCompleto = sZfondo;
            oPrimerGasto.sZcatCompleto = sZcat;
            oPrimerGasto.Kostl = oModelIas.Kostl;
            oPrimerGasto.BktxtDoc = oPrimerGasto.BktxtDoc.substr(0, 9);
            sap.ui.getCore().setModel(oPrimerGasto, "oGastoSeleccionado");
            this.getView().byId("idFragDetGasto--idDetGastos").setModel(new JSONModel(oPrimerGasto));
            this.getView().byId("idFragDetGasto--idDetDevolucionReembolso").setModel(new JSONModel(oPrimerGasto));
            this.fnCargarTablaDetGastos();
          },
          error: () => {
            BusyIndicator.hide();
          },
        });
      },
      //llenado de lista de gastos
      onCargarListaGastos: function () {
        let aFilter = [];
        let oModelMaestro = sap.ui.getCore().getModel("oModelMaster");
        let InfoIas = sap.ui.getCore().getModel("InfoIas");
        if (typeof InfoIas === "undefined" || InfoIas === "") {
          this.onIrHome();
        } else {
          aFilter.push(new Filter("Bukrs", FilterOperator.EQ, InfoIas.Bukrs));
          aFilter.push(new Filter("Type", FilterOperator.EQ, "G"));
          aFilter.push(new Filter("Zfondo", FilterOperator.EQ, InfoIas.Zfondo));
          BusyIndicator.show(0);
          let usuario = this.usuarioIasAdmin() ? "Admin" : InfoIas.Sysid;
          this.headers = {
            usuario: usuario,
          };
          oModelMaestro.read("/GastoSet", {
            filters: aFilter,
            headers: this.headers,
            success: (result) => {
              BusyIndicator.hide();
              if (result.results.length > 0) {
                this.fnObtenerImporteTotalGastos(result.results);
                $.each(result.results, function (key, value) {
                  let monto = String(value.Wrbtr);
                  value.Wrbtr = monto.substring(0, monto.length - 1);
                  //LR 30/12
                  value.Wrbtr = parseFloat(value.Wrbtr).toFixed(2);
                  //agrego un campo para hacer un flitro luego
                  value.fechaSeteada = this.setFormatterDate(value.Bldat, "0");
                });

                let oPrimerGasto = result.results[result.results.length - 1];
                let listaGastotmp = new JSONModel(result.results);
                this.listaGasto = result.results;
                listaGastotmp.setSizeLimit(999999999);
                this.getView().byId("idFragListaGastos--idListaGasto").setModel(listaGastotmp);

                this.onPrimerGastos(oPrimerGasto);
              }
            },
            error: () => {
              BusyIndicator.hide();
            },
          });
        }
      },
      onSeleccionGastos: function (oEvent) {
        let oGastoSeleccionado = oEvent.getSource().getBindingContext().getObject();
        oGastoSeleccionado.sZfondoCompleto = "";
        oGastoSeleccionado.sZcatCompleto = "";
        this.byId("idPagDetGasto").setTitle("Declaración de G. N°" + oGastoSeleccionado.Belnr);
        // let oModelFondoFijo = sap.ui.getCore().getModel("InfoFondoFijo");
        // let sZfondo, sZcat;
        let oModelIas = sap.ui.getCore().getModel("oModelIas");
        oGastoSeleccionado.Kostl = oModelIas.Kostl;
        oGastoSeleccionado.BktxtDoc = oGastoSeleccionado.BktxtDoc.substr(0, 9);
        sap.ui.getCore().setModel(oGastoSeleccionado, "oGastoSeleccionado");
        this.getView().byId("idFragDetGasto--idDetGastos").setModel(new JSONModel(oGastoSeleccionado));
        this.getView().byId("idFragDetGasto--idDetDevolucionReembolso").setModel(new JSONModel(oGastoSeleccionado));
        this.fnCargarTablaDetGastos();
        this._onNavToPage("idPagDetGasto");
        //llamar odata donde se debe modificar el formulario y la tabla detalle
      },
      //llena la tabla detalle de gasto
      fnCargarTablaDetGastos: function () {
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel"),
          aFilter = [],
          oGastoSeleccionado = sap.ui.getCore().getModel("oGastoSeleccionado");
        this.getView().byId("idFragDetGasto--idTablaDetGastos").setModel(new JSONModel([]));
        aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oGastoSeleccionado.Bukrs));
        aFilter.push(new Filter("Belnr", FilterOperator.EQ, oGastoSeleccionado.Belnr));
        aFilter.push(new Filter("Gjahr", FilterOperator.EQ, oGastoSeleccionado.Gjahr));
        BusyIndicator.show(0);
        oModel.read("/DetGastoSet", {
          filters: aFilter,
          success: (result) => {
            BusyIndicator.hide();

            // let sNroGasto = oGastoSeleccionado.Belnr + oGastoSeleccionado.Bukrs + oGastoSeleccionado.Gjahr;
            // let ambiente = sap.ui.getCore().getModel("ambiente");
            // let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
            // let RucSociedad = sap.ui.getCore().getModel("oModelIas");
            // let route = sap.ui.getCore().getModel("route");
            //let carpetaP = sap.ui.getCore().getModel("carpetaP");

            //let sDir = "/cmis/" + idrepositorio + "/root/" + carpetaP + "/" + ambiente + "/" + "20100108292" + "/FondoFijo";
            // let sDir = "/cmis/" + idrepositorio + "/root/" + ambiente + "/" + RucSociedad.Paval + "/" + route.subcarpeta01;

            //	let imagenes = this.ListarDocumentos(sDir, sNroGasto);
            this.fnCargarDataOperacion();
            this.loadCentroCostoList();
            let operaciones = sap.ui.getCore().getModel("aComboOperacion");

            $.each(result.results, function (key, value) {
              /*	if (typeof (imagenes[key]) !== "undefined") {
								value.urlImagen = imagenes[key].url;
							}*/

              if (value.Mwskz === "C7") {
                value.Mwskz = "0%";
              } else {
                value.Mwskz = "18%";
              }

              $.each(operaciones, function (keyOp, valueOp) {
                if (valueOp.Zcat === value.ZCat) {
                  value.ZCat = valueOp.Txt50;
                }
              });
            });

            sap.ui.getCore().setModel(result.results, "idTablaDetGastos");
            this.getView().byId("idFragDetGasto--idTablaDetGastos").setModel(new JSONModel(result.results));
          },
          error: (xhr, status, error) => {
            BusyIndicator.hide();
            MessageBox.error(error);
          },
        });
      },
      usuarioIasAdmin: function () {
        // TODO:
        let userIAS = sap.ui.getCore().getModel("userIAS").getData();
        let bol = false;
        if (userIAS.groups != undefined) {
          if (typeof userIAS.groups === "string" && userIAS.groups === "FI_COLB_ADM_FOND_FIJ_ENTR_REND") {
            bol = true;
          } else if (typeof userIAS.groups === "object") {
            bol = userIAS.groups.find(function (oItem) {
              return oItem === "FI_COLB_ADM_FOND_FIJ_ENTR_REND";
            })
              ? true
              : false;
          }
        }

        return bol;
      },
      //llenado de lista Master de solicitud
      onCargarListaMSolicitud: function () {
        let aFilter = [];
        let oModelMaestroSolicitudes = sap.ui.getCore().getModel("oModelMaster");
        let InfoIas = sap.ui.getCore().getModel("InfoIas");
        if (typeof InfoIas === "undefined" || InfoIas === "") {
          this.onIrHome();
        } else {
          aFilter.push(new Filter("Bukrs", FilterOperator.EQ, InfoIas.Bukrs));
          aFilter.push(new Filter("Type", FilterOperator.EQ, "S"));
          aFilter.push(new Filter("Zfondo", FilterOperator.EQ, InfoIas.Zfondo));
          BusyIndicator.show(0);
          let usuario = this.usuarioIasAdmin() ? "Admin" : InfoIas.Sysid;
          this.headers = {
            usuario: usuario,
          };
          oModelMaestroSolicitudes.read("/SolicitudSet", {
            filters: aFilter,
            headers: this.headers,
            success: (result) => {
              BusyIndicator.hide();
              let oPrimerSolicitud = result.results[result.results.length - 1];
              $.each(result.results, (key, value) => {
                let monto = String(value.Wrbtr);
                value.Wrbtr = monto.substring(0, monto.length - 1);
                value.fechaSeteada = this.setFormatterDate(value.Bldat, "0");
              });
              let listaSol = new JSONModel(result.results);
              listaSol.setSizeLimit(999999999);

              this.getView().byId("idFragListaSolicitud--idListaSolicitud").setModel(listaSol);
              this.fnObtenerImporteTotalSolicitudes(result.results);
              if (oPrimerSolicitud.Status !== "A") {
                this.byId("idCrearGastoxSol").setVisible(false);
              } else {
                this.byId("idCrearGastoxSol").setVisible(true);
              }
              this.onPrimerSolicitud(oPrimerSolicitud);
            },
            error: () => {
              BusyIndicator.hide();
            },
          });
        }
      },
      //llenar Primer solicitud
      onPrimerSolicitud: function (oPrimerSolicitud) {
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel");
        let InfoIas = sap.ui.getCore().getModel("InfoIas");
        BusyIndicator.show(0);
        oModel.read("/FondoFijoSet(Bukrs='" + InfoIas.Bukrs + "',Zfondo='" + InfoIas.Zfondo + "')", {
          success: (result) => {
            BusyIndicator.hide();
            sap.ui.getCore().setModel(result, "InfoFondoFijo");
            this.byId("idPagDetSolicitud").setTitle("Solicitud N°" + oPrimerSolicitud.Belnr);
            let oModelFondoFijo = sap.ui.getCore().getModel("InfoFondoFijo");
            let oModelIas = sap.ui.getCore().getModel("oModelIas");
            let sZfondo, sZcat;
            sZfondo = oPrimerSolicitud.Zfondo + " - " + oModelFondoFijo.Txt50;
            sZcat = oPrimerSolicitud.Zcat + " - " + oPrimerSolicitud.Txt50;
            oPrimerSolicitud.sZfondoCompleto = sZfondo;
            oPrimerSolicitud.sZcatCompleto = sZcat;
            oPrimerSolicitud.Kostl = oModelIas.Kostl;
            sap.ui.getCore().setModel(oPrimerSolicitud, "oSolicitudSeleccionada");
            this.getView().byId("idFragDetSolicitud--idDetSolicitud").setModel(new JSONModel(oPrimerSolicitud));
            this.onCargarTablaDetSolicitud();
          },
          error: () => {
            BusyIndicator.hide();
          },
        });
      },
      //llena la tabla detalle de solicitud ///funcion provisional
      onCargarTablaDetSolicitud: function () {
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel"),
          aFilter = [],
          oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
        aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oSolicitudSeleccionada.Bukrs));
        aFilter.push(new Filter("Belnr", FilterOperator.EQ, oSolicitudSeleccionada.Belnr));
        aFilter.push(new Filter("Gjahr", FilterOperator.EQ, oSolicitudSeleccionada.Gjahr));
        BusyIndicator.show(0);
        oModel.read("/DetSolicitudSet", {
          filters: aFilter,
          success: (result) => {
            BusyIndicator.hide();
            $.each(result.results, function (key, value) {
              let monto = String(value.Wrbtr);
              value.Wrbtr = monto.substring(0, monto.length - 1);
            });
            sap.ui.getCore().setModel(result.results, "oTablaDetSolicitud");
            this.getView().byId("idFragDetSolicitud--idTablaDetSolicitud").setModel(new JSONModel(result.results));
          },
          error: (xhr, status, error) => {
            BusyIndicator.hide();
            MessageBox.error(error);
          },
        });
      },
      onIrListaMGasto: function () {
        this.onCargarListaGastos();
        this.onIrListaDGastos();
        this._onNavToPage("idListaGastos");
      },
      onIrListaMSolicitud: function () {
        this.onCargarListaMSolicitud();
        this.onCargarListaGastos();
        this.onIrListaDSolicitud();
        this._onNavToPage("idListaSolicitud");
      },
      onIrListaDSolicitud: function () {
        this.fnLimpiarCamposCrearSolicitud();
        this.fnLimpiarCamposCrearGastos();
        this._onNavToPage("idPagDetSolicitud");
      },
      onIrListaDGastos: function () {
        this._onNavToPage("idPagDetGasto");
      },
      onIrHome: function () {
        this.onIrListaDSolicitud();
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("home");
      },
      //{@pguevarl - observacion Pto. 2 - agregué la función onFilterSunat
      onFilterSunat: function () {
        let idTipoDocS = this.getView().byId("idFragCrearGasto--idTipoDocS").getSelectedKey(),
          idCorr = this.getView().byId("idFragCrearGasto--idCorr"),
          idSerie = this.getView().byId("idFragCrearGasto--idSerie");

        if (idTipoDocS == "05") {
          idSerie.setMaxLength(4);
          idSerie.setPlaceholder("XXXX"); //serie
          idCorr.setMaxLength(11);
          idCorr.setPlaceholder("XXXXXXXXXXX"); //correlativo
        } else if (idTipoDocS == "12") {
          idSerie.setMaxLength(20);
          idSerie.setPlaceholder("XXXX"); //serie
          idCorr.setMaxLength(20);
          idCorr.setPlaceholder("XXXXXXXX"); //correlativo
        } else if (idTipoDocS == "00") {
          idSerie.setMaxLength(20);
          idSerie.setPlaceholder("XXXX"); //serie
          idCorr.setMaxLength(20);
          idCorr.setPlaceholder("XXXXXXXX"); //correlativo
        } else if (idTipoDocS == "11") {
          idSerie.setMaxLength(20);
          idSerie.setPlaceholder("XXXX"); //serie
          idCorr.setMaxLength(15);
          idCorr.setPlaceholder("XXXXXXXX"); //correlativo
        } else if (idTipoDocS == "13") {
          idSerie.setMaxLength(20);
          idSerie.setPlaceholder("XXXX"); //serie
          idCorr.setMaxLength(20);
          idCorr.setPlaceholder("XXXXXXXX"); //correlativo
        } else {
          idSerie.setValue("");
          idSerie.setMaxLength(4);
          idSerie.setPlaceholder("XXXX"); //serie
          idCorr.setValue(""); //correlativo
          idCorr.setMaxLength(8);
          idCorr.setPlaceholder("XXXXXXXX"); //correlativo
        }
      },
      //}@pguevarl
      fnServicioGrabarDetalleGasto: function (aTablaDetGasto) {
        //LR se agrego para que no permita dar varios click .
        this.getView().byId("btnGrabar").setEnabled(false);
        //se agrego para que no permita dar varios click .
        let oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
          oModelMaestroSolicitudes = sap.ui.getCore().getModel("oModelMaster"),
          aFilaDetGasto = {};

        let oEntrada = aTablaDetGasto[oVariablesGlobales.Flag];
        aFilaDetGasto = oEntrada;
        sap.ui.getCore().setModel(aFilaDetGasto, "aFilaDetGasto");
        let imagen = oEntrada.Imagen;
        delete oEntrada.Imagen;

        delete oEntrada.path;

        //	aEntrada.Nrpos = String(aEntrada.Nrpos); //28.08.2019
        oModelMaestroSolicitudes.create("/DetGastoSet", oEntrada, {
          success: () => {
            oVariablesGlobales.Flag++;

            if (oVariablesGlobales.Flag === aTablaDetGasto.length) {
              oVariablesGlobales.Flag = 0;
              this.onCargarListaGastos();
              MessageBox.success("Se ha registrado el gasto " + oEntrada.Belnr);
              oEntrada.Imagen = imagen;
              //this.fnSubirArchivos();
              this.fnWorkFlow(oEntrada, "G");
              this.fnLimpiarCamposCrearGastos();
              this.onIrListaDSolicitud();
              BusyIndicator.hide();
              //LR desbloquee el boton
              this.getView().byId("btnGrabar").setEnabled(true); //pguevarl
            } else {
              oEntrada.Imagen = imagen;
              this.fnServicioGrabarDetalleGasto(aTablaDetGasto);
            }
          },
          error: () => {
            //this.getView().byId("btnGrabar").setEnabled(true);//pguevarl - comenté esto porque estaba mal declarado
            this.getView().byId("btnGrabar").setEnabled(true); //pguevarl
            BusyIndicator.hide();
            let msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + oEntrada.Nrpos + ".";
            this.showMessageBox(msj, "error");
            return;
          },
        });
      },
      fnWorkFlow: function (oData) {
        var that = this;
        return new Promise((resolve, reject) => {
          $.ajax({
            url: that._getAppModulePath() + "/bpmworkflowruntime/v1/xsrf-token",
            method: "GET",
            async: false,
            headers: {
              "X-CSRF-Token": "Fetch",
            },
            success: function (result, xhr, data) {
              let sToken = data.getResponseHeader("X-CSRF-Token");
              that.fnStartInstanceS(sToken, oData).then(() => {
                resolve();
              }).catch((error) => {
                console.log(error);
                reject();
              });
            },
            error: function (error) {
              console.log(error);
              reject();
            }
          });
        });
      },
      //Llamar a la pagina de crear solicitud
      onCrearSolicitud: function () {
        Log.info("[CC] MasterDetalleFF.controller - onCrearSolicitud", "onCrearSolicitud");

        this.getView().byId("idFragCrearSolicitud--idFechaCont")._bMobile = true;
        this.getView().byId("idFragCrearSolicitud--idFecha")._bMobile = true;

        this.getView().byId("idFragCrearSolicitud--idFecha").setValue(this.fnFormatearFechaVista(new Date()));
        this.getView().byId("idFragCrearSolicitud--idFechaCont").setValue(this.fnFormatearFechaVista(new Date()));

        this.getView().byId("idFragCrearSolicitud--idFecha").setMinDate(new Date());
        this.getView().byId("idFragCrearSolicitud--idFechaCont").setMinDate(new Date());

        let oModelMaestroSolicitudes = sap.ui.getCore().getModel("oModelMaster"),
          InfoIas = sap.ui.getCore().getModel("InfoIas"),
          sZfondo,
          sZcat,
          sZfondoNom;

        let oSolicitudSeleccionada = {};
        oModelMaestroSolicitudes.read("/OperacionSet(Bukrs='" + InfoIas.Bukrs + "',Zcat='F001')", {
          success: (result) => {
            BusyIndicator.hide();
            this.sZcatNom = result.Txt50;
            oSolicitudSeleccionada.Zcat = result.Zcat;

            oModelMaestroSolicitudes.read(
              "/FondoFijoSet(Bukrs='" + InfoIas.Bukrs + "',Zfondo='" + InfoIas.Zfondo + "')",
              {
                success: (resultF) => {
                  BusyIndicator.hide();
                  sap.ui.getCore().setModel(resultF, "InfoFondoFijo");
                  this.sZfondo = InfoIas.Zfondo + " - " + resultF.Txt50;
                  this.sZcat = "F001 - " + this.sZcatNom;
                  this.sZfondoNom = resultF.Txt50;
                  oSolicitudSeleccionada.Zfondo = resultF.Zfondo;
                  oSolicitudSeleccionada.sZfondoCompleto = this.sZfondo;
                  oSolicitudSeleccionada.sZcatCompleto = this.sZcat;
                  oSolicitudSeleccionada.Hkont = resultF.Hkont;
                  oSolicitudSeleccionada.Waers = resultF.Waers;

                  this.sZfondo = oSolicitudSeleccionada.Zfondo + " - " + this.sZfondoNom;
                  oSolicitudSeleccionada.sZfondoCompleto = this.sZfondo;
                  oSolicitudSeleccionada.sZcatCompleto = this.sZcat;
                  // if (typeof oSolicitudSeleccionada.Kostl === "undefined") {
                  // 	oSolicitudSeleccionada.Kostl = oSolicitudSeleccionada.Kostl;
                  // }

                  this.getView()
                    .byId("idFragCrearSolicitud--frmCrearSoli")
                    .setModel(new JSONModel(oSolicitudSeleccionada));
                  sap.ui.getCore().setModel(oSolicitudSeleccionada, "oCreacionSolicitud");

                  // this.onNavToPage("idPagCrearSolicitud");
                  let oTable = this.getView().byId("idFragCrearSolicitud--idTableCrearSolicitud");
                  oTable.setModel(new JSONModel([]));
                },
                error: () => {
                  BusyIndicator.hide();
                },
              }
            );
          },
          error: function () {
            BusyIndicator.hide();
          },
        });
      },
      /**
       * Obtiene Aprobadores del Nivel X
       * @param {object} oData Parameters
       * @param {integer} iNivel Nivel de aprobación
       * @returns {Array} Array of approvers
       */
      _getAprobadoresNivel: function (oData, iNivel) {
        return new Promise((resolve, reject) => {
          const query =
            "/zinaprobadoresSet(" +
            "Bukrs='" +
            oData.sociedad +
            "'," +
            "Prcid='" +
            oData.proceso +
            "'," +
            "Rulid='" +
            oData.regla +
            "'," +
            "Tskid='" +
            oData.tarea +
            "'," +
            "Tabname='" +
            oData.filtroTabla +
            "'," +
            "Fieldname='" +
            oData.filtroCampo +
            "'," +
            "Value='" +
            // InfoIas.Plans +
            oData.valor +
            "'," +
            "Isfound=false," +
            "TabSearch='" +
            oData.busquedaTabla +
            "'," +
            "FieldSearch='" +
            oData.busquedaCampo +
            "')/zaprobadoresmultout";

          const oModel = this.getOwnerComponent().getModel("oUtilitiesModel");

          oModel.read(query, {
            success: (response) => {
              if (response.results !== undefined) {
                if (response.results.length > 0) {
                  Log.info(
                    "[CC] MasterDetalleFF.controller - _getAprobadorNivel - Aprobador Nivel X",
                    response.results[0].Low
                  );
                  resolve(response.results);
                } else {
                  // this.showMessageBox(this.getI18nText("appSinAprobadorPrimerNivel"), "error");
                  reject(this.getI18nText("appSinAprobadorNivelX", [iNivel.toString()]));
                }
              }
            },
            error: (error) => {
              // TODO: Verificar que muestre mensaje de error
              // this.showMessageBox(this.getI18nText("appErrorMsg"), "error");
              Log.error(
                `[CC] MasterDetalleFF.controller - _getAprobadorNivel - Aprobador Nivel ${iNivel.toString()}`,
                error
              );
              reject(this.getI18nText("appErrorMsg"));
            },
          });
        });
      },
      onCrearNuevaSolicitud: function () {
        Log.info("[CC] MasterDetalleFF.controller - onCrearNuevaSolicitud", "onCrearNuevaSolicitud");

        //Verifica si existe aprobador del primer nivel
        /********* Obteniene lista de aprobadores desde SAP ********/
        const sKstrg = this.getView().byId("idFragCrearSolicitud--inputTipImp").getValue().split(" - ", 1)[0];
        let sAufnr = "",
          sKostl = "";
        if (sKstrg == "K") {
          sKostl = this.getView().byId("idFragCrearSolicitud--inputCeCo").getValue().split(" - ", 1)[0];
          sAufnr = "";
          this.state.tablaFiltro = "CSKS";
          this.state.campoFiltro = "KOSTL";
          this.state.plans = sKostl;
        } else if (sKstrg == "F") {
          sKostl = "";
          sAufnr = this.getView().byId("idFragCrearSolicitud--inputCeCo").getValue().split(" - ", 1)[0];
          this.state.tablaFiltro = "COBL";
          this.state.campoFiltro = "AUFNR";
          this.state.plans = sAufnr;
        }

        const oData = {
          sociedad: sap.ui.getCore().getModel("InfoIas").Bukrs,
          proceso: this._parameters.PROCESO,
          regla: this._parameters.REGLA,
          tarea: this._parameters.SOLICITUD_NIVEL_APROBACION_1,
          filtroTabla: this.state.tablaFiltro,
          filtroCampo: this.state.campoFiltro,
          valor: this.state.plans,
          busquedaTabla: this._parameters.BUSQUEDA_TABLA,
          busquedaCampo: this._parameters.BUSQUEDA_CAMPO,
        };

        BusyIndicator.show(0);

        this._getAprobadoresNivel(oData, 1)
        //  .then(() => {
          //  oData.tarea = this._parameters.SOLICITUD_NIVEL_APROBACION_2;
            //return this._getAprobadoresNivel(oData, 2);
         // })
          .then(() => {
            return this.onNuevoDetSolicitud();
          })
          .catch((sErrorMessage) => {
            this.showMessageBox(sErrorMessage, "error");
          });
      },
      /**
       * Valida información de la nueva solicitud.
       * @returns {boolean} Resultado de la validación
       */
      _validarNuevaSolicitud: function () {
        var bValido = true;
        let aDetalle = this.getView().byId("idFragCrearSolicitud--idTableCrearSolicitud").getModel().getData(),
          sMsjErrorCamposObligatorios = this.getI18nText("txtCompletarCamposObligatorios");

        if (aDetalle.length <= 0) {
          MessageBox.error("Debe ingresar al menos un detalle de solicitud");
          bValido = false;
        }
        //obtengo los ID
        let oFondo = this.getView().byId("idFragCrearSolicitud--idfondo"),
          oFecDoc = this.getView().byId("idFragCrearSolicitud--idFecha"),
          FechCon = this.getView().byId("idFragCrearSolicitud--idFechaCont"),
          oOperacion = this.getView().byId("idFragCrearSolicitud--idOperacion"),
          oCuenMayor = this.getView().byId("idFragCrearSolicitud--idCuentaMyr"),
          oImport = this.getView().byId("idFragCrearSolicitud--idImporteTotal"),
          oWaers = this.getView().byId("idFragCrearSolicitud--idWaers"),
          oRef = this.getView().byId("idFragCrearSolicitud--idReferencia"),
          oTipoObjCosto = this.getView().byId("idFragCrearSolicitud--inputTipImp"),
          oObjCosto = this.getView().byId("idFragCrearSolicitud--inputCeCo"),
          oObservaciones = this.getView().byId("idFragCrearSolicitud--inputObser");

        //Seteo el estado a ninguno para recien poder validar si es que estan vacios
        oFondo.setValueState("None");
        oFecDoc.setValueState("None");
        oOperacion.setValueState("None");
        oCuenMayor.setValueState("None");
        oImport.setValueState("None");
        FechCon.setValueState("None");
        oWaers.setValueState("None");
        oRef.setValueState("None");
        oTipoObjCosto.setValueState("None");
        oObjCosto.setValueState("None");
        oObservaciones.setValueState("None");

        //valido si algun campo esta vacio
        if (this.onValidarVacio(oFondo.getValue())) {
          oFondo.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        if (this.onValidarVacio(oFecDoc.getValue())) {
          oFecDoc.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        if (this.onValidarVacio(oOperacion.getValue())) {
          oOperacion.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        if (this.onValidarVacio(oCuenMayor.getValue())) {
          oCuenMayor.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        if (this.onValidarVacio(oImport.getValue())) {
          oImport.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        if (this.onValidarVacio(FechCon.getValue())) {
          FechCon.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        if (this.onValidarVacio(oWaers.getValue())) {
          oWaers.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        if (this.onValidarVacio(oRef.getValue())) {
          oRef.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        if (this.onValidarVacio(oTipoObjCosto.getValue())) {
          oTipoObjCosto.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        if (this.onValidarVacio(oObjCosto.getValue())) {
          oObjCosto.setValueState("Error");
          MessageBox.error(sMsjErrorCamposObligatorios);
          bValido = false;
        }
        return bValido;
      },
      _getDatosSolicitud: function () {
        return {
          fondo: this.getView().byId("idFragCrearSolicitud--idfondo").getValue(),
          fechaSolicitud: this.getView().byId("idFragCrearSolicitud--idFecha").getValue(),
          fechaContable: this.getView().byId("idFragCrearSolicitud--idFechaCont").getValue(),
          operacion: this.getView().byId("idFragCrearSolicitud--idOperacion").getValue(),
          cuentaDeMayor: this.getView().byId("idFragCrearSolicitud--idCuentaMyr").getValue(),
          importe: this.getView().byId("idFragCrearSolicitud--idImporteTotal").getValue(),
          moneda: this.getView().byId("idFragCrearSolicitud--idWaers").getValue(),
          referencia: this.getView().byId("idFragCrearSolicitud--idReferencia").getValue(),
          tipoObjetoCosto: this.getView().byId("idFragCrearSolicitud--inputTipImp").getValue(),
          objetoCosto: this.getView().byId("idFragCrearSolicitud--inputCeCo").getValue(),
          observaciones: this.getView().byId("idFragCrearSolicitud--inputObser").getValue(),
        };
      },
      onNuevoDetSolicitud: function () {
        Log.info("[CC] MasterDetalleFF.controller - onNuevoDetSolicitud", "onNuevoDetSolicitud");
        //LR 13/12/19
        //this.getView().byId("btnGrabar").setEnabled(false);
        //variables de los datos del fondo del usuario
        let oModelFondoFijo = sap.ui.getCore().getModel("InfoFondoFijo"),
          fMontoEvaluar = 0,
          oRegistroModel = this.getView().getModel("oRegistroModel");

        const oSolicitud = this._getDatosSolicitud();

        if (!this._validarNuevaSolicitud()) {
          BusyIndicator.hide();
          return;
        }

        let oCabSol = {},
          oInfoIas = sap.ui.getCore().getModel("InfoIas"),
          // oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada"),
          oModelMaestroSolicitudes = sap.ui.getCore().getModel("oModelMaster");

        oModelMaestroSolicitudes.read("/sumagsSet(Bukrs='" + oInfoIas.Bukrs + "',Zfondo='" + oInfoIas.Zfondo + "')", {
          success: (result) => {
            //Calcular si el monto total de los importes en verde es mayor o igual al del importe total que se genera
            //fMontoEvaluar = Number(oImport.getValue()) + oVariablesGlobales.ImporteTotalSolicitudes;
            fMontoEvaluar = Number(oSolicitud.importe) + Number(result.Ssolicitud);
            if (Number(oModelFondoFijo.ZfLimite) < fMontoEvaluar) {
              // let diferencia = fMontoEvaluar - Number(oModelFondoFijo.ZfLimite);
              MessageBox.error(
                "No existe Fondo en la Caja " + oSolicitud.fondo + ", para más información comuníquese con el área de Contabilidad."
              );
              return;
            }

            //luego de la validación guardo los valores en un json para añadirlos a la tabla detalle
            let sBktxt = oInfoIas.Pname.substring(0, 25);
            oCabSol.Bukrs = oInfoIas.Bukrs;
            oCabSol.Belnr = "";
            oCabSol.Gjahr = "";
            oCabSol.Usnam = oInfoIas.Sysid;
            oCabSol.Zfondo = oSolicitud.fondo.substr(0, 4);
            oCabSol.Budat = this.fnFormatearFechaSAP(oSolicitud.fechaContable) + "T00:00:00";
            oCabSol.Bldat = this.fnFormatearFechaSAP(oSolicitud.fechaSolicitud) + "T00:00:00";

            //	oCabSol.Budat = this.fnFormatearFechaSAP(FechCon) + "T00:00:00";
            //	oCabSol.Bldat = this.fnFormatearFechaSAP(oFecDoc) + "T00:00:00";
            oCabSol.Xblnr = oSolicitud.referencia;
            oCabSol.Type = "S";
            oCabSol.Waers = oSolicitud.moneda;
            oCabSol.Wrbtr = oSolicitud.importe;
            oCabSol.Status = "";
            oCabSol.Augdt = this.fnFormatearFechaSAP(oSolicitud.fechaSolicitud) + "T00:00:00";
            //	oCabSol.Augdt = this.fnFormatearFechaSAP(oFecDoc) + "T00:00:00";
            oCabSol.Xreverse = "";
            oCabSol.Bktxt = sBktxt;
            oCabSol.Buzei = "001";
            oCabSol.Bschl = "";
            oCabSol.Koart = "";
            oCabSol.Shkzg = "";
            oCabSol.Dmbrt = oSolicitud.importe;
            oCabSol.Sgtxt = "";
            //oCuenMayor.getValue();
            //oCabSol.Hkont = "1419002000";
            oCabSol.Hkont = oSolicitud.cuentaDeMayor;
            oCabSol.Zcat = oSolicitud.operacion.substr(0, 4);
            oCabSol.Txt50 = "";

            oCabSol.Kstrg = oRegistroModel.getData().Rstyp.code;

            if (oCabSol.Kstrg === "F") {
              oCabSol.Aufnr = oRegistroModel.getData().Kostl.code;
            } else {
              oCabSol.Kostl = oRegistroModel.getData().Kostl.code;
            }

            oCabSol.Zobserv = oSolicitud.observaciones;

            BusyIndicator.show(0);
            oModelMaestroSolicitudes.create("/SolicitudSet", oCabSol, {
              success: (oData, oResponse) => {
                // debugger;
                this.getView().byId("btnGrabar").setEnabled(true);
                let msg = JSON.parse(oResponse.headers["sap-message"]);
                if (msg.severity === "success") {
                  //MessageBox.success(msg.message);
                  this.fnGrabarDetalleSolicitud(oData);
                } else {
                  BusyIndicator.hide();
                  MessageBox.error(msg.message);
                }
              },
              error: (oError) => {
                // debugger;
                this.getView().byId("btnGrabar").setEnabled(true);
                // Error
                BusyIndicator.hide();
                if (oError.responseText !== "") {
                  let txt = "Error desconocido";
                  try {
                    txt =
                      JSON.parse(oError.responseText).error.message.value +
                      "\n" +
                      JSON.parse(oError.responseText).error.code;
                  } catch (e) {
                    if (oError.responseText[0]) {
                      txt = $("message", oError.responseText)[0].textContent;
                    }
                  }
                  MessageBox.error(txt);
                } else {
                  MessageBox.error(
                    "Ocurrió un error al intentar crear su documento, póngase en contacto con su departamento de Sistemas."
                  );
                }
              },
            });
            //al terminar debe añadirse acá el limpiado de los campos
          },
          error: (error) => {
            console.log(error);
            MessageBox.error(`Ocurrió un error al intentar recuperar fondos de la caja ${oSolicitud.fondo}.`);
            BusyIndicator.hide();
          },
        });
      },
      fnAgregarDetalleSolicitud: function () {
        let oModelFondoFijo = sap.ui.getCore().getModel("InfoFondoFijo"),
          // iLimiteSol = 350,
          fMontoEvaluar = 0,
          oDetSol = {};
        let oDes = this.getView().byId("idFragCrearSolicitud--idDes"),
          oImport = this.getView().byId("idFragCrearSolicitud--idImporteTotal"),
          oWaers = this.getView().byId("idFragCrearSolicitud--idWaers"),
          oFondo = this.getView().byId("idFragCrearSolicitud--idfondo"),
          FechCon = this.getView().byId("idFragCrearSolicitud--idFechaCont"),
          oFecDoc = this.getView().byId("idFragCrearSolicitud--idFecha"),
          oImporteDet = this.getView().byId("idFragCrearSolicitud--idImporteDetalle");

        let InfoIas = sap.ui.getCore().getModel("InfoIas");
        // oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
        let oTable = this.getView().byId("idFragCrearSolicitud--idTableCrearSolicitud");

        let aTemp = oImporteDet.getValue();
        oImporteDet.setValue(String(Number(aTemp)));
        oDes.setValueState("None");
        oImporteDet.setValueState("None");

        if (this.onValidarVacio(oDes.getValue())) {
          oDes.setValueState("Error");
          return;
        }

        if (this.onValidarVacio(oImporteDet.getValue())) {
          oImporteDet.setValueState("Error");
          return;
        }

        fMontoEvaluar = Number(oImport.getValue()) + Number(oImporteDet.getValue());
        if (fMontoEvaluar > Number(oModelFondoFijo.ZiLimite)) {
          let diferencia = fMontoEvaluar - Number(oModelFondoFijo.ZiLimite);
          diferencia = parseFloat(diferencia).toFixed(2); //LR 13/12/19
          MessageBox.error("El monto de la solicitud excede por " + diferencia);
          return;
        }

        oDetSol.Bukrs = InfoIas.Bukrs;
        oDetSol.Belnr = "";
        oDetSol.Gjahr = "";
        oDetSol.Fondo = oFondo.getValue().substr(0, 4);
        oDetSol.Usuario = "";
        oDetSol.Bldat = this.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
        oDetSol.Budat = this.fnFormatearFechaSAP(FechCon.getValue()) + "T00:00:00";

        /*		oDetSol.Bldat = this.fnFormatearFechaSAP(oFecDoc) + "T00:00:00";
					oDetSol.Budat = this.fnFormatearFechaSAP(FechCon) + "T00:00:00";*/
        oDetSol.Blart = "";
        oDetSol.Detalle = oDes.getValue();
        oDetSol.Wrbtr = oImporteDet.getValue();
        oDetSol.Waers = oWaers.getValue();

        if (oDetSol.Wrbtr === "0") {
          MessageBox.error("El importe debe ser diferente de cero");
          return;
        }

        let aFilas = oTable.getModel().getData();
        if (aFilas.length === 0) {
          //LR 30/12
          oImport.setValue(parseFloat(oImporteDet.getValue()).toFixed(2));
          oDetSol.Nrpos = "1";
          aFilas.push(oDetSol);
          oTable.setModel(new JSONModel(aFilas));
          oTable.getModel().refresh(true);
          this.byId("idFragCrearSolicitud--idImporteDetalle").setValue("");
          this.byId("idFragCrearSolicitud--idDes").setValue("");
        } else {
          let sSuma = 0;
          $.each(aFilas, function (key, value) {
            sSuma += Number(value.Wrbtr);
          });
          let icalculo = Number(oDetSol.Wrbtr) + sSuma;
          /*if (icalculo > iLimiteSol) {
					let resta = icalculo - iLimiteSol;
					let texto = "Esta superando el monto de su limite de fondo por " + resta + ".";
					MessageBox.error(
						texto
					);
					return;
				}*/
          let Nrpos = aFilas[aFilas.length - 1];
          oDetSol.Nrpos = String(Number(Nrpos.Nrpos) + 1);
          aFilas.push(oDetSol);
          oTable.setModel(new JSONModel(aFilas));
          oTable.getModel().refresh(true);
          //LR 30/12
          this.byId("idFragCrearSolicitud--idImporteTotal").setValue(parseFloat(icalculo).toFixed(2));
          this.byId("idFragCrearSolicitud--idImporteDetalle").setValue("");
          this.byId("idFragCrearSolicitud--idDes").setValue("");
        }
        sap.ui.getCore().setModel(aFilas, "oModelTablaDetSolicitud");
      },
      fnGrabarDetalleSolicitud: function (oData) {
        let oModelTablaDetSolicitud = sap.ui.getCore().getModel("oModelTablaDetSolicitud"),
          oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
        oVariablesGlobales.Flag = 0;
        let oFecDoc = this.getView().byId("idFragCrearSolicitud--idFecha"),
          FechCon = this.getView().byId("idFragCrearSolicitud--idFechaCont"),
          Budat_ = this.fnFormatearFechaSAP(FechCon.getValue()) + "T00:00:00",
          Bldat_ = this.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";

        $.each(oModelTablaDetSolicitud, (key, value) => {
          value.Nrpos = String(value.Nrpos);
          value.Belnr = oData.Belnr;
          value.Bukrs = oData.Bukrs;
          value.Gjahr = oData.Gjahr;
          value.Blart = oData.Blart;
          value.Budat = Budat_;
          value.Bldat = Bldat_;
        });

        this.fnServicioDetSolicitud(oModelTablaDetSolicitud);
      },
      fnServicioDetSolicitud: function (oModelTablaDetSolicitud) {
        var that =this;
        let oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
          oModelMaestroSolicitudes = sap.ui.getCore().getModel("oModelMaster");

        let oDocumento = oModelTablaDetSolicitud[oVariablesGlobales.Flag];

        BusyIndicator.show(0);

        oModelMaestroSolicitudes.create("/DetSolicitudSet", oDocumento, {
          success: () => {
            oVariablesGlobales.Flag++;

            if (oVariablesGlobales.Flag === oModelTablaDetSolicitud.length) {
              oVariablesGlobales.Flag = 0;
              this.fnWorkFlow(oDocumento).then(() => {
                return that.fnSubirObservacionDS(oDocumento);
              }).then(() => {
                return that.uploadArchiveLink(oDocumento);
              }).then(() => {
                that.fnLimpiarCamposCrearSolicitud();
                MessageBox.success("Se ha registrado la solicitud " + oDocumento.Belnr);                
              }).catch((error) => {
                console.log(error);
                BusyIndicator.hide();
              });
            } else {
              this.fnServicioDetSolicitud(oModelTablaDetSolicitud);
            }
          },
          error: (error) => {
            console.log(error);
            BusyIndicator.hide();
            let msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + oDocumento.Nrpos + ".";
            this.showMessageBox(msj, "error");
            return;
          },
        });
      },
      onValidarVacio: function (valor) {
        valor = valor === undefined ? "" : valor;
        if (!valor || 0 === valor.trim().length) {
          return true;
        } else {
          return false;
        }
      },
      fnChangeTxt: function () {
        //let op = this.getView().byId("idFragCrearGasto--idOperacion").getValue();
        //	let op = oEvent.getSource()
        let op = this.getView().byId("idFragCrearGasto--idOperacion").getSelectedKey();
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel"),
          InfoIas = sap.ui.getCore().getModel("InfoIas");
        BusyIndicator.show(0);
        oModel.read("/OperacionSet(Bukrs='" + InfoIas.Bukrs + "',Zcat='" + op + "')", {
          success: (result) => {
            BusyIndicator.hide();
            if (result.Txt50 !== "") {
              //this.getView().byId("idFragCrearGasto--idOperacion2").setValue(result.Txt50);
              this.getView().byId("idFragCrearGasto--idCuentaMyr").setValue(result.Hkont);
              this.getView().byId("idFragCrearGasto--idButtonAdd").setVisible(true);
            } else {
              //	this.getView().byId("idFragCrearGasto--idOperacion2").setValue("No existe operacion");
              this.getView().byId("idFragCrearGasto--idCuentaMyr").setValue("No existe Cuenta Mayor");
              this.getView().byId("idFragCrearGasto--idButtonAdd").setVisible(false);
            }
          },
          error: () => {
            BusyIndicator.hide();
          },
        });
      },
      fnBorraFila: function (oEvent) {
        let nameControl = oEvent.getSource().data("nameControl");
        let oFila = oEvent.getSource().getParent(),
          oTbl = this.getView().byId(nameControl),
          idx = Number(oFila.getBindingContextPath().split("/")[1]),
          oImporteTotal = this.getView().byId("idFragCrearSolicitud--idImporteTotal");

        if (idx !== -1) {
          let oModel = oTbl.getModel(),
            data = oModel.getData();
          oImporteTotal.setValue(Number(oImporteTotal.getValue().replace(',', '')) - Number(data[idx].Wrbtr));
          data.splice(idx, 1);
          // Check return value of data. // If data has an hierarchy. Ex: data.results
          // let removed =data.results.splice(idx,1);
          oModel.setData(data);
        }

        let aDataPos = oTbl.getModel().getData(),
          iPosicion = 0;

        $.each(aDataPos, function (pos, ele) {
          iPosicion++;
          ele.Nrpos = String(iPosicion);
        });
        oTbl.getModel().setData(aDataPos);
      },
      fnBorraFilaGasto: function (oEvent) {
        let nameControl = oEvent.getSource().data("nameControl");
        let oFila = oEvent.getSource().getParent(),
          oTbl = this.getView().byId(nameControl),
          aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
          idx = oFila.getBindingContextPath(),
          oImporteTotal = this.getView().byId("idFragCrearGasto--idImporteTotal");
        idx = idx.charAt(idx.lastIndexOf("/") + 1);

        if (idx !== -1) {
          oImporteTotal.setValue(oImporteTotal.getValue() - Number(aTablaDetGasto[idx].Wrbtr));
          let oModel = oTbl.getModel(),
            data = oModel.getData();
          // removed = data.splice(idx, 1),
          // removedDetGasto = aTablaDetGasto.splice(idx, 1);
          // Check return value of data. // If data has an hierarchy. Ex: data.results
          // let removed =data.results.splice(idx,1);
          oModel.setData(data);
        }

        let aDataPos = oTbl.getModel().getData(),
          iPosicion = 0;

        $.each(aDataPos, function (pos, ele) {
          iPosicion++;
          ele.Nposit = iPosicion;
        });
        oTbl.getModel().setData(aDataPos);

        let iPosicionG = 0;

        $.each(aTablaDetGasto, function (pos, ele) {
          iPosicionG++;
          ele.Nrpos = iPosicionG;
        });
        sap.ui.getCore().setModel(aTablaDetGasto, "aTablaDetGasto");
      },
      onChangeImportes: function (oEvent) {
        let nameControl = oEvent.getSource().data("nameControl"),
          cad = this.getView().byId(nameControl).getValue(),
          cade = cad.replace(/[^0-9.]/, ""),
          oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
        oVariablesGlobales.repeticion = 0;
        for (let i = 0; i < cade.length; i++) {
          if (cade.charAt(i) == ".") {
            oVariablesGlobales.repeticion++;
          }
        }
        if (oVariablesGlobales.repeticion >= 2) {
          cade = cade.substr(0, cade.length - 1);
          oVariablesGlobales.repeticion = 0;
        }
        for (let pos = 0; pos < cade.length; pos++) {
          if (cade.charAt(pos) === ".") {
            cade = cade.substr(0, pos + 3);
          }
        }
        if (cade.indexOf(".") >= 0) {
          //es un decimal
          let t = cade.split(".");
          cade = (t[0].length ? parseInt(t[0]).toString() : "0") + "." + t[1].padEnd(2, "0");
        } else {
          cade = (cade.length ? parseInt(cade).toString() : "0") + ".00";
        }
        this.getView().byId(nameControl).setValue(cade);
      },
      fnSelectOperacion: function (oEvent) {
        //seleccionamos el key de div
        let aResultados = sap.ui.getCore().getModel("aResultados").getData();
        let sKey = oEvent.getSource().getSelectedKey();
        let aSDiv = [];

        $.each(aResultados, (pos, ele) => {
          if (ele.Type === "ZLSDV" && ele.Pkey === sKey) {
            aSDiv.push(ele);
          }
        });
        this.getView().byId("sSubdiv").setModel(new JSONModel(aSDiv));
      },
      fnCargarDataOperacion: function () {
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel"),
          aComboOperacion = [],
          aFilter = [],
          oSolicitudSeleccionado = sap.ui.getCore().getModel("oSolicitudSeleccionada");
        BusyIndicator.show(0);
        aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oSolicitudSeleccionado.Bukrs));
        aFilter.push(new Filter("Type", FilterOperator.EQ, "G"));
        //	aFilter.push(new Filter("Zcat", FilterOperator.EQ, oSolicitudSeleccionado.Zcat));
        oModel.read("/OperacionSet", {
          filters: aFilter,
          success: (result) => {
            BusyIndicator.hide();
            $.each(result.results, function (pos, ele) {
              aComboOperacion.push(ele);
            });
            sap.ui.getCore().setModel(aComboOperacion, "aComboOperacion");
            this.getView().byId("idFragCrearGasto--idOperacion").setModel(new JSONModel(aComboOperacion));
          },
          error: () => {
            BusyIndicator.hide();
          },
        });
      },
      fnCargarDataComboSunat: function () {
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel"),
          aComboSunat = [];
        BusyIndicator.show(0);
        oModel.read("/ListasSet", {
          success: (result) => {
            BusyIndicator.hide();
            $.each(result.results, function (pos, ele) {
              aComboSunat.push(ele);
            });
            this.getView().byId("idFragCrearGasto--idTipoDocS").setModel(new JSONModel(aComboSunat));
          },
          error: () => {
            BusyIndicator.hide();
          },
        });
      },
      fnFormatearFechaVista: function (pValue) {
        if (pValue !== null && pValue !== undefined) {
          let d = new Date(pValue);
          let month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = "" + d.getFullYear();

          if (month.length < 2) month = "0" + month;
          if (day.length < 2) day = "0" + day;

          return [day, month, year].join("-");
        } else {
          return "";
        }
      },
      fnFormatearFechaSAP: function (pValue) {
        //	pValue = pValue.getValue();
        let iDia = pValue.substr(0, 2);
        let iMes = pValue.substr(3, 2);
        let iYear = pValue.substr(6, 4);
        return [iYear, iMes, iDia].join("-");
      },
      fnFormatearFechaFactura2: function (pValue) {
        let iDia = pValue.substring(0, 2);
        let iYear = pValue.substring(6, 10);
        let iMes = Number(pValue.substring(3, 5));
        if (iMes < 10) {
          iMes = "0" + iMes;
        }
        return [iDia, iMes, iYear].join(".");
      },
      fnFormatearFechaFactura1: function (pValue) {
        let iDia = Number(pValue.getDate());
        if (iDia < 10) {
          iDia = "0" + iDia;
        }
        let iYear = pValue.getFullYear();
        let iMes = pValue.getMonth() + 1;
        if (iMes < 10) {
          iMes = "0" + iMes;
        }
        return [iDia, iMes, iYear].join(".");
      },
      fnObtenerImporteTotalSolicitudes: function (Solicitud) {
        let oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
          fSuma = 0;
        oVariablesGlobales.ImporteTotalSolicitudes = 0;

        $.each(Solicitud, function (key, value) {
          if (value.Status === "A") {
            fSuma += Number(value.Wrbtr);
          }
        });
        oVariablesGlobales.ImporteTotalSolicitudes = fSuma;
      },
      fnObtenerImporteTotalGastos: function (Gastos) {
        let oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
          fSuma = 0;
        oVariablesGlobales.ImporteTotalGastos = 0;

        $.each(Gastos, function (key, value) {
          if (value.Status === "A") {
            fSuma += Number(value.Wrbtr);
          }
        });
        oVariablesGlobales.ImporteTotalSolicitudes = fSuma;
      },
      fnEventoDevolucion: function () {
        let oInputDev = this.getView().byId("idFragCrearGasto--idDevolucion"),
          oCheckDev = this.getView().byId("idFragCrearGasto--idCheckDevol");
        let btnAdjDevolucion = this.getView().byId("idFragCrearGasto--btnAdjDevolucion");

        if (oCheckDev.getSelected() === true) {
          oInputDev.setEditable(true);
          btnAdjDevolucion.setEnabled(true);
        } else {
          this.getView().getModel("DocumentsDevolucion").setData([]);
          oInputDev.setEditable(false);
          btnAdjDevolucion.setEnabled(false);
        }
        if (this.state.cajaSolicitante === this._parameters.CAJA_REEMBOLSO) {
          if (oCheckDev.getSelected() === true) {
            this.getView().byId("idFragCrearGasto--idCheckReembolso").setSelected(false);
            this.fnEventoReembolso();
          }
        }
      },
      fnLimpiarCamposCrearSolicitud: function () {
        //obtengo los ID
        let oFondo = this.getView().byId("idFragCrearSolicitud--idfondo"),
          oFecDoc = this.getView().byId("idFragCrearSolicitud--idFecha"),
          oOperacion = this.getView().byId("idFragCrearSolicitud--idOperacion"),
          oCuenMayor = this.getView().byId("idFragCrearSolicitud--idCuentaMyr"),
          oImport = this.getView().byId("idFragCrearSolicitud--idImporteTotal"),
          FechCon = this.getView().byId("idFragCrearSolicitud--idFechaCont"),
          oWaers = this.getView().byId("idFragCrearSolicitud--idWaers"),
          oRef = this.getView().byId("idFragCrearSolicitud--idReferencia"),
          oDes = this.getView().byId("idFragCrearSolicitud--idDes"),
          oImporteDetalle = this.getView().byId("idFragCrearSolicitud--idImporteDetalle"),
          oTipoObjCosto = this.getView().byId("idFragCrearSolicitud--inputTipImp"),
          oObjCosto = this.getView().byId("idFragCrearSolicitud--inputCeCo"),
          oObservaciones = this.getView().byId("idFragCrearSolicitud--inputObser");
        //Seteo el estado a ninguno para recien poder validar si es que estan vacios
        oFondo.setValueState("None");
        oFecDoc.setValueState("None");
        oOperacion.setValueState("None");
        oCuenMayor.setValueState("None");
        oImport.setValueState("None");
        FechCon.setValueState("None");
        oWaers.setValueState("None");
        oRef.setValueState("None");
        oDes.setValueState("None");
        oImporteDetalle.setValueState("None");
        oTipoObjCosto.setValueState("None");
        oObjCosto.setValueState("None");
        oObservaciones.setValueState("None");

        // this.getView().byId("idFragCrearSolicitud--idFecha").setValue("");
        oDes.setValue("");
        // this.getView().byId("idFragCrearSolicitud--idFechaCont").setValue("");
        this.getView().byId("idFragCrearSolicitud--idReferencia").setValue("");
        oImporteDetalle.setValue("");
        oImport.setValue("0.00");

        oTipoObjCosto.setValue("");
        oObjCosto.setValue("");
        oObservaciones.setValue("");

        let oTable = this.getView().byId("idFragCrearSolicitud--idTableCrearSolicitud");
        oTable.setModel(new JSONModel([]));

        //LIMPIAR ADJUNTO
        const oAdjModel = this.getView().getModel("DocumentsSolicitud");
        oAdjModel.setData([]);
      },
      fnLimpiarCamposCrearGastos: function () {
        let oIdTipoDocS = this.getView().byId("idFragCrearGasto--idTipoDocS"),
          oIdCorr = this.getView().byId("idFragCrearGasto--idCorr"),
          oIdRuc = this.getView().byId("idFragCrearGasto--idRUC"),
          oIdIndImp = this.getView().byId("idFragCrearGasto--idIndImp"),
          oIdCuentaMyr = this.getView().byId("idFragCrearGasto--idCuentaMyr"),
          oIdImporteD = this.getView().byId("idFragCrearGasto--idImporteD"),
          oIdSerie = this.getView().byId("idFragCrearGasto--idSerie"),
          oIdRazSoc = this.getView().byId("idFragCrearGasto--idRazSoc"),
          oIdCheckDevol = this.getView().byId("idFragCrearGasto--idCheckDevol"),
          oIdDevolucion = this.getView().byId("idFragCrearGasto--idDevolucion"),
          oIdImporteTotal = this.getView().byId("idFragCrearGasto--idImporteTotal"),
          oIdFechaFactura = this.getView().byId("idFragCrearGasto--idFechaFactura");
        if (this.state.isCajaReembolso) {
          let oIdCheckReembolso = this.getView().byId("idFragCrearGasto--idCheckReembolso"),
            oIdReembolso = this.getView().byId("idFragCrearGasto--idReembolso");
          oIdReembolso.setValue("");
          oIdReembolso.setEditable(false);
          oIdCheckReembolso.setSelected(false);
        }
        oIdCorr.setValue("");
        oIdRuc.setValue("");
        this.getView().byId("idFragCrearGasto--idImporteD").setValue("");
        oIdSerie.setValue("");
        oIdRazSoc.setValue("");
        oIdFechaFactura.setValue("");
        oIdImporteD.setValue("");
        oIdCheckDevol.setSelected(false);
        oIdImporteTotal.setValue("");
        oIdDevolucion.setValue("");

        oIdCorr.setValueState("None");
        oIdRuc.setValueState("None");
        oIdIndImp.setValueState("None");
        oIdCuentaMyr.setValueState("None");
        oIdImporteD.setValueState("None");
        oIdSerie.setValueState("None");
        oIdRazSoc.setValueState("None");
        oIdFechaFactura.setValueState("None");
        oIdTipoDocS.setValueState("None");
        oIdImporteD.setValueState("None");

        this.getView().getModel("DocumentsDevolucion").setData([]);
        this.getView().getModel("DocumentsDevolucion").updateBindings();
        this.getView().getModel("Documents").setData([]);
        this.getView().getModel("Documents").updateBindings();
        let oTable = this.getView().byId("idFragCrearGasto--idTablaDetGastos");
        oTable.setModel(new JSONModel([]));
      },
      //Obtiene el archivo desde el control sapui5 FileUploader
      onChangeDoc: function (oEvent) {
        let fileUploadImagenes = sap.ui.getCore().getModel("fileUploadImagenes");

        if (oEvent.getParameter("files") != undefined && oEvent.getParameter("files")[0] != undefined) {
          fileUploadImagenes[0] = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
        } else {
          fileUploadImagenes.splice(0, 1);
        }
        sap.ui.getCore().setModel(fileUploadImagenes, "fileUploadImagenes");
        return fileUploadImagenes;
      },

      obtenerCantidadArchivos: function (sTipoDoc, sIdDoc) {
        //Get VariableGlobal
        let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
        //let carpetaP = sap.ui.getCore().getModel("carpetaP");
        let route = sap.ui.getCore().getModel("route");
        route.subcarpeta02 = sTipoDoc;
        route.solicitud = sIdDoc;

        BusyIndicator.show(0);
        let cantarchivos = 0;
        //let repoUrl = "/cmis/" + idrepositorio + "/root/" + carpetaP + "/" + route.subcarpeta01 + "/" + route.subcarpeta02 + "/" + route.solicitud +"/";
        let repoUrl =
          "/cmis/" +
          idrepositorio +
          "/root/" +
          route.subcarpeta01 +
          "/" +
          route.subcarpeta02 +
          "/" +
          route.solicitud +
          "/";
        $.ajax(repoUrl + "?cmisselector=children", {
          type: "GET",
          cache: false,
          processData: false,
          contentType: false,
          async: false,
          success: function (response) {
            cantarchivos = response.objects.length;
            BusyIndicator.hide();
          },
          error: function (error) {
            console.log(error);
            if (error.responseJSON.exception === "objectNotFound") {
              console.log("Error!! no se puede obtener cantidad de archivos");
            }
            BusyIndicator.hide();
          },
        });
        return cantarchivos;
      },

      oCrearSubCarpetas: function (url1, foldername) {
        let sDireccion;
        let data = {
          "propertyId[0]": "cmis:objectTypeId",
          "propertyValue[0]": "cmis:folder",
          "propertyId[1]": "cmis:name",
          "propertyValue[1]": foldername,
          cmisaction: "createFolder",
        };
        let formData = new FormData();
        jQuery.each(data, function (key, value) {
          formData.append(key, value);
        });
        $.ajax(url1, {
          type: "POST",
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          async: false,
          success: function () {
            sDireccion = url1 + "/" + foldername;
          }.bind(this),
          error: function () {
            BusyIndicator.hide();
          },
        });
        return sDireccion;
      },
      oListarCarpetas: function (url) {
        let obj = [];
        $.ajax(url + "?cmisselector=children", {
          type: "GET",
          cache: false,
          processData: false,
          contentType: false,
          async: false,
          success: function (response) {
            $.each(response.objects, function (idx, item) {
              obj.push({
                folderName: item.object.properties["cmis:name"].value,
              });
            });
          },
          error: function (error) {
            console.log(error);
            if (error.responseJSON.exception === "objectNotFound") {
              console.log("Error!! no se puede obterner cantidad de archivos");
            }
          },
        });
        return obj;
      },
      //Subir archivo
      fnImport: function (dt) {
        let ambiente = sap.ui.getCore().getModel("ambiente");
        let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
        //let carpetaP = sap.ui.getCore().getModel("carpetaP");
        let fileUploadImagenes = sap.ui.getCore().getModel("fileUploadImagenes");
        let sDireccion;

        //let RucSociedad = sap.ui.getCore().getModel("RucSociedad");
        //Url Estatico
        let RucSociedad = sap.ui.getCore().getModel("oModelIas");
        let route = sap.ui.getCore().getModel("route");
        //let sUrl = "/cmis/" + idrepositorio + "/root/" + carpetaP + "/" + ambiente + "/" + RucSociedad.Paval + "/FondoFijo";
        let sUrl = "/cmis/" + idrepositorio + "/root/" + ambiente + "/" + RucSociedad.Paval + "/" + route.subcarpeta01;
        //Complemento Url
        let sUrlplus = dt.Belnr + dt.Bukrs + dt.Gjahr; //sNumeroDoc+sSociedad+sEjercicio
        let status;
        let sDataFolder = this.oListarCarpetas(sUrl);
        $.each(sDataFolder, function (idex, item) {
          if (!status) {
            if (sUrlplus === item.folderName) {
              sDireccion = sUrl + "/" + sUrlplus;
              status = true;
            } else {
              sDireccion = false;
            }
          }
        });
        if (sDireccion === false) {
          sDireccion = this.oCrearSubCarpetas(sUrl, sUrlplus);
        }

        let count = this.oListarCarpetas(sDireccion);
        let namefile = "detalle_gasto_" + (count.length + 1);

        let data = {
          "propertyId[0]": "cmis:objectTypeId",
          "propertyValue[0]": "cmis:document",
          "propertyId[1]": "cmis:name",
          "propertyValue[1]": namefile,
          cmisaction: "createDocument",
        };

        let formData = new FormData();
        formData.append("datafile", fileUploadImagenes[0]);
        jQuery.each(data, function (key, value) {
          formData.append(key, value);
        });

        $.ajax(sDireccion, {
          type: "POST",
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          async: false,
          success: function () {
            BusyIndicator.hide();
            fileUploadImagenes = [];
          }.bind(this),
          error: function (error) {
            BusyIndicator.hide();
            sap.m.MessageBox.error("No se pudo subir el archivo. Error: " + error.responseJSON.message);
          },
        });
      },
      obtenerSolicitud: function (sTipoDoc, sIdDoc) {
        let route = sap.ui.getCore().getModel("route");
        let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
        //let carpetaP = sap.ui.getCore().getModel("carpetaP");
        let obj = [];
        route.subcarpeta02 = sTipoDoc;
        route.solicitud = sIdDoc;
        //let repoUrl = "/cmis/" + idrepositorio + "/root/" + carpetaP + "/" + route.subcarpeta01 + "/" + route.subcarpeta02 + "/";
        let repoUrl = "/cmis/" + idrepositorio + "/root/" + route.subcarpeta01 + "/" + route.subcarpeta02 + "/";
        $.ajax(repoUrl + "?cmisselector=children", {
          type: "GET",
          cache: false,
          processData: false,
          contentType: false,
          async: false,
          success: function (response) {
            $.each(response.objects, function (idx, item) {
              obj.push({
                file: item.object.properties["cmis:name"].value,
              });
            });
          },
          error: function (error) {
            console.log(error);
            if (error.responseJSON.exception === "objectNotFound") {
              console.log("Error!! no se puede obterner cantidad de archivos");
            }
          },
        });
        return obj;
      },

      //Funcion para extraer archivos por carpetas

      ListarDocumentos: function (dir, stext) {
        let dirr = dir + "/" + stext;
        let archivos = [];

        $.ajax(dirr + "?cmisselector=children", {
          type: "GET",
          cache: false,
          processData: false,
          contentType: false,
          async: false,
          success: function (respon) {
            $.each(respon.objects, function (id, itm) {
              archivos.push({
                url: dirr + "/" + itm.object.properties["cmis:name"].value,
                fileName: itm.object.properties["cmis:name"].value,
                documentId: itm.object.properties["cmis:objectId"].value,
                Type: itm.object.properties["cmis:objectTypeId"].value,
                mimeType: itm.object.properties["cmis:contentStreamMimeType"].value,
              });
            });
          },
          error: function (error) {
            console.log(error);
            if (error.responseJSON.exception === "objectNotFound") {
              console.log("Error!! no se puede obterner cantidad de archivos");
            }
          },
        });
        return archivos;
      },
      fnFetchToken: function () {
        let sToken;
        $.ajax({
          url: this._getAppModulePath() + "/bpmworkflowruntime/v1/xsrf-token",
          method: "GET",
          async: false,
          headers: {
            "X-CSRF-Token": "Fetch",
          },
          success: function (result, xhr, data) {
            sToken = data.getResponseHeader("X-CSRF-Token");
          },
        });
        return sToken;
      },
      fnStartInstanceS: function (token, oData) {
        var that = this;
        return new Promise((resolve, reject) => {
          let oModelTablaDetSolicitud = sap.ui.getCore().getModel("oModelTablaDetSolicitud"),
            aData = {},
            InfoIas = sap.ui.getCore().getModel("InfoIas"),
            oTotal = {},
            oRegistroModel = that.getView().getModel("oRegistroModel"),
            oModelMaestroSolicitudes = sap.ui.getCore().getModel("oModelMaster");

          oTotal.Detalle = "Total";
          oTotal.Wrbtr = that.getView().byId("idFragCrearSolicitud--idImporteTotal").getValue();
          oModelTablaDetSolicitud.push(oTotal);

          let oOperacion = that.getView().byId("idFragCrearSolicitud--idOperacion"),
            oCuentaDeMayor = that.getView().byId("idFragCrearSolicitud--idCuentaMyr"),
            oFondoFijo = that.getView().byId("idFragCrearSolicitud--idfondo"),
            oMoneda = that.getView().byId("idFragCrearSolicitud--idWaers"),
            oReferenciaGeneral = that.getView().byId("idFragCrearSolicitud--idReferencia");

          let oTipoObjCosto = that.getView().byId("idFragCrearSolicitud--inputTipImp"),
            oObjCosto = that.getView().byId("idFragCrearSolicitud--inputCeCo"),
            oObservaciones = that.getView().byId("idFragCrearSolicitud--inputObser");

          aData.Bukrs = oData.Bukrs;
          aData.Belnr = oData.Belnr;
          aData.Gjahr = oData.Gjahr;
          aData.Prcid = that._parameters.PROCESO;
          aData.Rulid = "";
          aData.Iskid = that._parameters.SOLICITUD_NIVEL_APROBACION_1;
          aData.IskidL2 = that._parameters.SOLICITUD_NIVEL_APROBACION_2;
          aData.Tabname = that.state.tablaFiltro;
          aData.Fieldname = that.state.campoFiltro;
          // aData.Value = InfoIas.Plans;
          aData.Value = that.state.plans;
          aData.Isfound = false;
          aData.Tabname_search = that._parameters.BUSQUEDA_TABLA;
          aData.Fieldname_search = that._parameters.BUSQUEDA_CAMPO;
          aData.Usuario = InfoIas.Sysid;
          aData.Fecha = that.fnFormatearFechaVista(new Date());
          aData.ImporteTotal =
            that.getView().byId("idFragCrearSolicitud--idImporteTotal").getValue() +
            " " +
            that.getView().byId("idFragCrearSolicitud--idWaers").getValue();
          aData.DetalleSol = oModelTablaDetSolicitud;
          aData.CorporativeEmail = InfoIas.CorporativeEmail;
          aData.PersonalEmail = InfoIas.PersonalEmail;
          aData.Type = "S";
          aData.Nivel = "1";
          //agrega el nombre del personal
          aData.Pname = InfoIas.Pname.substring(0, 25);

          aData.SociedadTxt = InfoIas.Butxt;

          aData.Operacion = oOperacion.getValue();
          aData.CuentaDeMayor = oCuentaDeMayor.getValue();
          aData.FondoFijo = oFondoFijo.getValue();
          aData.Moneda = oMoneda.getValue();
          aData.ReferenciaGeneral = oReferenciaGeneral.getValue();

          aData.Kstrg = oTipoObjCosto.getValue();
          let sTypo = oRegistroModel.getData().Rstyp.code;

          if (sTypo === "F") {
            aData.Aufnr = oObjCosto.getValue();
          } else {
            aData.Kostl = oObjCosto.getValue();
          }

          aData.Zobserv = oObservaciones.getValue();
          aData.idFolderSolicitudGenerada = oRegistroModel.getData().idFolderSolicitudGenerada;
          aData.identificadorAplicacion = "Fondo Fijo";

          BusyIndicator.show(0);

          $.ajax({
            url: that._getAppModulePath() + "/bpmworkflowruntime/v1/workflow-instances",
            method: "POST",
            async: false,
            contentType: "application/json",
            headers: {
              "X-CSRF-Token": token,
            },
            data: JSON.stringify({
              definitionId: "wf_cajachicaff",
              context: aData,
            }),
            success: (result) => {
              if (result.status === "RUNNING") {
                console.log("Solicitud Enviada");
                let oActualizarWorkflowId = {};
                oActualizarWorkflowId.IdWorkflow = result.id;
                oActualizarWorkflowId.Type = "U";
                oModelMaestroSolicitudes.update(
                  "/SolicitudSet(Bukrs='" + aData.Bukrs + "',Belnr='" + aData.Belnr + "',Gjahr='" + aData.Gjahr + "')",
                  oActualizarWorkflowId,
                  {
                    success: () => {
                      console.log("Se actualizó id de workflow");
                      MessageToast.show(that.getI18nText("msgWorkflowSuccess"));
                      BusyIndicator.hide();
                      resolve();
                    },
                    error: (error) => {
                      console.log(error);
                      console.log("No se actualizó id de workflow");
                      MessageBox.error(that.getI18nText("msgWorkflowError"));
                      reject();
                    },
                  }
                );
              } else {
                console.log("No se envio la solicitud");
                MessageBox.error(that.getI18nText("msgWorkflowError"));
                reject();
              }
            },
            error: (error) => {
              console.log(error);
              MessageBox.error(that.getI18nText("msgWorkflowError"));
              reject();
            }
          });
        });
      },
      fnStartInstanceG: function (token, oData) {
        let aTablaDetGasto = sap.ui.getCore().getModel("oTableGastoWorkflow"),
          aData = {},
          InfoIas = sap.ui.getCore().getModel("InfoIas");
        aData.Bukrs = oData.Bukrs;
        aData.Belnr = oData.Belnr;
        aData.Gjahr = oData.Gjahr;

        aData.Prcid = this._parameters.PROCESO;
        aData.Rulid = "";
        aData.Iskid = this._parameters.GASTO_NIVEL_APROBACION_1;
        aData.IskidL2 = this._parameters.GASTO_NIVEL_APROBACION_2;
        aData.Tabname = this.state.tablaFiltro;
        aData.Fieldname = this.state.campoFiltro;
        aData.Value = InfoIas.Plans;
        aData.Isfound = false;
        aData.Tabname_search = this._parameters.BUSQUEDA_TABLA;
        aData.Fieldname_search = this._parameters.BUSQUEDA_CAMPO;
        aData.Usuario = InfoIas.Sysid;
        aData.Fecha = this.fnFormatearFechaVista(new Date());
        let sImporteRendido = this.getView().byId("idFragCrearGasto--idImporteTotal").getValue();
        let sMoneda = this.getView().byId("idFragCrearGasto--idWaers").getValue();
        let sImporteSolicitud = this.getView().byId("idFragCrearGasto--idImporteS").getValue();
        aData.ImporteTotal = sImporteRendido + " " + sMoneda; //Importe de solicitud
        aData.ImporteRendido = sImporteRendido + " " + sMoneda;
        aData.hasReembolsoDevolucion = false;
        let oIdCheckDevol = this.getView().byId("idFragCrearGasto--idCheckDevol"),
          oIdCheckReembolso = this.getView().byId("idFragCrearGasto--idCheckReembolso");

        //LR 30/12/2019
        sImporteSolicitud = parseFloat(sImporteSolicitud).toFixed(2);
        sImporteRendido = parseFloat(sImporteRendido).toFixed(2);

        if (oIdCheckDevol.getSelected() === true) {
          aData.hasReembolsoDevolucion = true;
          aData.ImporteReembolsoDevolucion =
            String(parseFloat(sImporteSolicitud - sImporteRendido).toFixed(2)) + " " + sMoneda;
          aData.TextoReembolsoDevolucion = " y un importe de devolución de " + aData.ImporteReembolsoDevolucion;
        }
        if (oIdCheckReembolso.getSelected() === true) {
          aData.hasReembolsoDevolucion = true;
          aData.ImporteReembolsoDevolucion =
            String(parseFloat(sImporteRendido - sImporteSolicitud).toFixed(2)) + " " + sMoneda;
          aData.TextoReembolsoDevolucion = " y un importe de reembolso de " + aData.ImporteReembolsoDevolucion;
        }

        //LR 26/12
        let anio, mes, dia;
        $.each(aTablaDetGasto, function (key, value) {
          anio = value.Bldat.substr(0, 4);
          mes = value.Bldat.substr(4, 2);
          dia = value.Bldat.substr(6, 2);
          value.Bldat = dia + "/" + mes + "/" + anio;
        });

        aData.DetalleSol = aTablaDetGasto;
        aData.CorporativeEmail = InfoIas.CorporativeEmail;
        aData.PersonalEmail = InfoIas.PersonalEmail;
        aData.Type = "G";
        aData.Nivel = 1;
        //agrega el nombre del personal
        aData.Pname = InfoIas.Pname.substring(0, 25);
        aData.identificadorAplicacion = "Fondo Fijo";

        $.ajax({
          url: this._getAppModulePath() + "/bpmworkflowruntime/v1/workflow-instances",
          method: "POST",
          async: false,
          contentType: "application/json",
          headers: {
            "X-CSRF-Token": token,
          },
          data: JSON.stringify({
            definitionId: "wf_cajachicaff",
            context: aData,
          }),
          success: function (result) {
            if (result.status === "RUNNING") {
              console.log("Solicitud Enviada");
            } else {
              console.log("No se envio la solicitud");
            }
          },
        });
      },
      fnAbrir_2: function (oEvent) {
        let posUrl = oEvent.getSource().data("posUrl");
        if (posUrl !== null) {
          sap.m.URLHelper.redirect(posUrl, true);
        } else {
          MessageBox.alert("No contiene archivo guardado");
        }
      },
      cloneObj: function (mainObj) {
        return JSON.parse(JSON.stringify(mainObj));
      },
      onFilterG: function () {
        this.onFilter("G");
      },
      onFilterS: function () {
        this.onFilter("S");
      },
      onFilter: function (tipo) {
        this._oDialog = sap.ui.xmlfragment("Filtros", "com.everis.apps.cajachicaff.fragment.FilterDialog", this);
        this._oDialog.open();
        sap.ui.getCore().byId("Filtros--idConstante").setValue(tipo);
      },
      onFiltrar: function () {
        let filtro = sap.ui.getCore().byId("Filtros--idFilterPrincipal"),
          stipDoc = sap.ui.getCore().byId("Filtros--idConstante").getValue(),
          oFecha = this.setFormatterDate(sap.ui.getCore().byId("Filtros--idFecha").getDateValue(), "1"),
          numDoc = sap.ui.getCore().byId("Filtros--idNumDoc"),
          oList,
          tipo = sap.ui.getCore().byId("Filtros--idTipo"),
          aFilter = [];
        let key = filtro.getSelectedKey(),
          keyTipo = tipo.getSelectedKey();
        if (key === "0") {
          aFilter.push(new Filter("Belnr", FilterOperator.Contains, numDoc.getValue()));
        } else if (key === "1") {
          aFilter.push(new Filter("Status", FilterOperator.Contains, keyTipo));
        } else if (key === "2") {
          aFilter.push(new Filter("fechaSeteada", FilterOperator.Contains, oFecha));
        }

        if (stipDoc === "G") {
          oList = this.getView().byId("idFragListaGastos--idListaGasto");
        } else {
          oList = this.getView().byId("idFragListaSolicitud--idListaSolicitud");
        }
        let oBinding = oList.getBinding("items");
        oBinding.filter(aFilter, "Application");
        oBinding.refresh(true);
        this._oDialog.destroy();
      },
      onChangePrincipal: function () {
        let filtro = sap.ui.getCore().byId("Filtros--idFilterPrincipal"),
          numDoc = sap.ui.getCore().byId("Filtros--idNumDoc"),
          oFecha = sap.ui.getCore().byId("Filtros--idFecha"),
          tipo = sap.ui.getCore().byId("Filtros--idTipo");
        let key = filtro.getSelectedKey();
        if (key === "0") {
          numDoc.setVisible(true);
          tipo.setVisible(false);
          oFecha.setVisible(false);
        } else if (key === "1") {
          numDoc.setVisible(false);
          tipo.setVisible(true);
          oFecha.setVisible(false);
        } else if (key === "2") {
          numDoc.setVisible(false);
          tipo.setVisible(false);
          oFecha.setVisible(true);
        }
      },
      onCancelar: function () {
        this._oDialog.destroy();
      },
      onESC: function () {
        this._oDialog.destroy();
      },
      setFormatterDate: function (pValue, val) {
        if (pValue !== null && pValue !== undefined) {
          let d = new Date(pValue);
          if (val === "0") {
            d.setDate(d.getDate() + 1);
          } else {
            d.setDate(d.getDate());
          }

          let month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();
          if (month.length < 2) month = "0" + month;
          if (day.length < 2) day = "0" + day;

          return [day, month, year].join("-");
        } else {
          return "";
        }
      },
      fnPresionarBoleta: function (oEvent) {
        // debugger;
        // let fila = oEvent.getSource().getBindingContext().getObject();
        // let oImgBase = this.fnGetBase64(fila.oImagen);
        // let tipo = fila.oImagen["type"];
        // LR 31/12

        // let aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto");
        // let oButton = oEvent.getSource();
        let idx = oEvent.getSource().getParent().getBindingContextPath();

        this.getView().getModel("Documentos").setData([]);
        idx = idx = idx.charAt(idx.lastIndexOf("/") + 1);

        let adj = sap.ui.getCore().getModel("aTablaDetGasto")[idx].Imagen;
        this.getView().getModel("Documentos").setData(adj);
        $.estadoFiles = 2;
        if (this._dialogAttach) {
          this._dialogAttach = sap.ui.xmlfragment("com.everis.apps.cajachicaff.fragment.AttachView", this);
          this.getView().addDependent(this._dialogAttach);
        }
        this._dialogAttach.open();
      },
      fnGetBase64: function (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.fnAbrirArchivo(file, reader.result);
        };
        reader.onerror = (error) => {
          console.log("Error: ", error);
        };
      },
      fnAbrirArchivo: function (file, fileB) {
        let element = document.createElement("a");
        element.setAttribute("href", fileB);
        element.setAttribute("download", file["name"]);
        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      },
      onValidRuc: function (oEvent) {
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel");
        let input = oEvent.getSource();
        let val = oEvent.getSource().getValue();
        if (val !== this.onValidNumber(input.getValue())) {
          input.setValue(this.onValidNumber(input.getValue()));
        }
        if (val.length === 11) {
          // let sPath
          let sPath = oModel.createKey("zrucSet", {
            IpRuc: val,
          });
          oModel.read("/" + sPath, {
            success: (result) => {
              console.log(result);
              if (result.EpReturn) {
                this.getView().byId("idFragCrearGasto--idRazSoc").setValue(result.EpName);
              } else {
                let msj = "Proveedor no registrado, comuníquese con su Administrador.\nN° RUC ingresado: " + val;
                input.setValue("");
                MessageBox.warning(msj);
              }
            },
            error: () => {
              let msj = "Proveedor no registrado, comuníquese con su Administrador.\nN° RUC ingresado: " + val;
              input.setValue("");
              MessageBox.warning(msj);
            },
          });
        } else {
          this.getView().byId("idFragCrearGasto--idRazSoc").setValue("");
        }
      },
      onValidNumber: function (str) {
        return str.replace(/[^\d]/g, "");
      },
      getI18nText: function (val, params) {
        if (params && params.length > 0) {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(val, params);
        } else {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(val);
        }
      },
      getI18n: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },
      onOpenDialogAttach: function () {
        //if (!this._dialogAttach) {
        this._dialogAttach = sap.ui.xmlfragment("com.everis.apps.cajachicaff.fragment.Attach", this);
        this.getView().addDependent(this._dialogAttach);
        //}
        this._dialogAttach.open();
      },
      onOpenDialogAttachDevolucion: function () {
        if (!this._dialogAttachDevolucion) {
          this._dialogAttachDevolucion = sap.ui.xmlfragment(
            "com.everis.apps.cajachicaff.fragment.AttachDevolucion",
            this
          );
          this.getView().addDependent(this._dialogAttachDevolucion);
        }
        this._dialogAttachDevolucion.open();
      },
      onCloseDialogAttachDevolucion: function () {
        this._dialogAttachDevolucion.close();
      },
      onFileDeleted: function (oEvent) {
        let dataView = this.getView().getModel("Documents").getData();
        // 	idx;
        // let files = dataView;
        BusyIndicator.show();
        //let objectFile = oEvent.getSource().getBindingContext("Documents").getObject();
        let objectFile = oEvent.getSource().getBindingContext("Documents").getPath();
        let sPath = objectFile.split("/")[1];
        dataView.splice(sPath, 1);
        this.getView().getModel("Documents").updateBindings();
        BusyIndicator.hide();
      },
      onPressItemDownload: function (oEvent) {
        let oSource = oEvent.getSource();
        let object = oSource.getBindingContext().getObject();
        //sap.m.URLHelper.redirect(url,true);

        //	let blob = new Blob(object.size, {type : object.size});
        let file_path = object.url;
        let a = document.createElement("A");
        a.href = file_path;
        a.download = file_path.substr(file_path.lastIndexOf("/") + 1);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        //	window.location.href = object.url;
        //sap.ui.core.util.File.save(blob,object.name.slice(0,object.name.lastIndexOf(".")), object.mimeType.split("/")[1]);
        //	sap.ui.core.util.File.save(blob,object.name.slice(0,object.name.lastIndexOf(".")), object.name.slice(object.name.lastIndexOf(".")+1));
      },
      onCloseDialogAttach: function () {
        this._dialogAttach.close();
        this._dialogAttach.destroy();
      },
      onChange: function (oEvent) {
        // let dataView = this.getView().getModel("Documents").getData();
        BusyIndicator.show();
        let file = oEvent.getParameter("files")[0];
        //let file = oEvent.getParameter("files");
        let jsondataAdjunto;
        this.base64coonversionMethod(file).then((result) => {
          jsondataAdjunto = {
            LoioId: jQuery.now().toString(),
            flagLogioId: true,
            Descript: this.llamada(file.name).replace("." + this.getFileExtension(file.name), ""), //pguevarl - file.name.replace("." + this.getFileExtension(file.name), ""),
            DocType: this.getFileExtension(file.name),
            mimeType: file.type,
            FileName: this.llamada(file.name), //pguevarl - file.name
            Data: result,
          };
          this.getView().getModel("Documents").getData().unshift(jsondataAdjunto);
          this.getView().getModel("Documents").refresh();
          this.getView().getModel("Documents").updateBindings(true);
          BusyIndicator.hide();
        });
      },
      onChangeDevolucion: function (oEvent) {
        let oModelDocDevolucion = this.getView().getModel("DocumentsDevolucion");
        BusyIndicator.show();
        let file = oEvent.getParameter("files")[0];
        //let file = oEvent.getParameter("files");
        let jsondataAdjunto;
        this.base64coonversionMethod(file).then((result) => {
          jsondataAdjunto = {
            LoioId: jQuery.now().toString(),
            flagLogioId: true,
            Descript: this.llamada(file.name).replace("." + this.getFileExtension(file.name), ""), //pguevarl - file.name.replace("." + this.getFileExtension(file.name), ""),
            DocType: this.getFileExtension(file.name),
            mimeType: file.type,
            FileName: this.llamada(file.name), //pguevarl - file.name,
            Data: result,
          };
          oModelDocDevolucion.getData().unshift(jsondataAdjunto);
          oModelDocDevolucion.refresh();
          oModelDocDevolucion.updateBindings(true);
        });
      },
      handleUploadComplete: function () {
        alert("handleUploadComplete");
      },
      base64coonversionMethod: function (file) {
        return new Promise((resolve) => {
          let reader = new FileReader();
          reader.onload = (readerEvt) => {
            let binaryString = readerEvt.target.result;
            //resolve(this.base64toHEX(btoa(binaryString)));
            resolve(this.getBlobFromFile(binaryString));
            // console.log(this.toHexString(binaryString))
            // resolve(binaryString);
          };
          reader.readAsDataURL(file);
          //reader.readAsBinaryString(file);
        });
      },
      base64toHEX: function (base64) {
        let raw = atob(base64);
        let HEX = "",
          _hex;
        for (let i = 0; i < raw.length; i++) {
          _hex = raw.charCodeAt(i).toString(16);
          HEX += _hex.length == 2 ? _hex : "0" + _hex;
        }
        return HEX.toUpperCase();
      },
      getBlobFromFile: function (sFile) {
        let contentType = sFile.substring(5, sFile.indexOf(";base64,"));

        let base64_marker = "data:" + contentType + ";base64,";
        let base64Index = base64_marker.length;
        contentType = contentType || "";
        let sliceSize = 512;
        let byteCharacters = window.atob(sFile.substring(base64Index)); //method which converts base64 to binary
        let byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          let slice = byteCharacters.slice(offset, offset + sliceSize);
          let byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          let byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        let blob = new Blob(byteArrays, {
          type: contentType,
        });

        return blob;
      },
      getFileExtension: function (filename) {
        let ext = /^.+\.([^.]+)$/.exec(filename);
        return ext == null ? "" : ext[1];
      },
      fnSubirArchivosDevolucion: function (gasto) {
        // sIdGasto = "" + gasto.Belnr + gasto.Bukrs + gasto.Gjahr;
        let param = {};
        param.Belnr = gasto.Belnr;
        param.Bukrs = gasto.Bukrs;
        param.Gjahr = gasto.Gjahr;

        this.fnImportDevolucion(param);
      },
      fnImportDevolucion: function (oEvent) {
        let route = sap.ui.getCore().getModel("route");
        let RucSociedad = sap.ui.getCore().getModel("oModelIas");
        route.carpetaSociedad = RucSociedad.Paval;
        let gasto = oEvent.Belnr + "" + oEvent.Bukrs + oEvent.Gjahr;
        this.gastDS2 = gasto;
        let aFiles = this.getView().getModel("DocumentsForPosition").getData();
        let aFilesDev = this.getView().getModel("DocumentsDevolucion").getData();
        let pathSegments = [];
        let oDictionary = {
          ambiente: undefined,
          app: undefined,
          ruc: undefined,
          tipo: undefined,
          nrosolicitud: undefined,
          posicion: {},
        };
        let aFilesDS = [];
        for (let i = 0; i < aFiles.length; i++) {
          aFiles[i].path =
            this._parameters.AMBIENTE +
            "/" +
            route.carpetaSociedad +
            "/" +
            route.subcarpeta01 +
            "/" +
            route.subcarpeta03 +
            "/" +
            gasto +
            "/" +
            aFiles[i].Nrpos;
          for (let j = 0; j < aFiles[i].Imagen.length; j++) {
            let file = aFiles[i].Imagen[j];
            let oFilesDS = {};
            oFilesDS.name = file.FileName;
            oFilesDS.path = aFiles[i].path;
            oFilesDS.BlobFile = file.Data;
            aFilesDS.push(oFilesDS);
          }
          pathSegments.push({
            path: aFiles[i].path,
            name: aFiles[i].Nrpos,
            posicion: aFiles[i].Nrpos,
            type: "posicion",
          });
          oDictionary.posicion[aFiles[i].Nposit] = undefined;
        }

        pathSegments.push({
          path:
            this._parameters.AMBIENTE +
            "/" +
            route.carpetaSociedad +
            "/" +
            route.subcarpeta01 +
            "/" +
            route.subcarpeta03 +
            "/" +
            gasto,
          name: gasto,
          posicion: undefined,
          type: "nrosolicitud",
        });

        pathSegments.push({
          path:
            this._parameters.AMBIENTE +
            "/" +
            route.carpetaSociedad +
            "/" +
            route.subcarpeta01 +
            "/" +
            route.subcarpeta03,
          name: route.subcarpeta03,
          posicion: undefined,
          type: "tipo",
        });

        pathSegments.push({
          path: this._parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + route.subcarpeta01,
          name: route.subcarpeta01,
          posicion: undefined,
          type: "app",
        });

        pathSegments.push({
          path: this._parameters.AMBIENTE + "/" + route.carpetaSociedad,
          name: route.carpetaSociedad,
          posicion: undefined,
          type: "ruc",
        });

        pathSegments.push({
          path: this._parameters.AMBIENTE,
          name: this._parameters.AMBIENTE,
          posicion: undefined,
          type: "ambiente",
        });
        DS.sendFiles(pathSegments, aFilesDS, oDictionary, this)
          .then((sResolve) => {
            jQuery.sap.log.info(sResolve);
            if (aFilesDev.length > 0) {
              pathSegments = [];
              oDictionary = {
                ambiente: undefined,
                app: undefined,
                ruc: undefined,
                tipo: undefined,
                nrosolicitud: undefined,
              };
              for (let i = 0; i < aFilesDev.length; i++) {
                aFilesDev[i].path =
                  this._parameters.AMBIENTE +
                  "/" +
                  route.carpetaSociedad +
                  "/" +
                  route.subcarpeta01 +
                  "/" +
                  route.subcarpeta04 +
                  "/" +
                  this.gastDS2;

                aFilesDev[i].name = aFilesDev[i].FileName;
                aFilesDev[i].BlobFile = aFilesDev[i].Data;
              }

              pathSegments.push({
                path:
                  this._parameters.AMBIENTE +
                  "/" +
                  route.carpetaSociedad +
                  "/" +
                  route.subcarpeta01 +
                  "/" +
                  route.subcarpeta04 +
                  "/" +
                  this.gastDS2,
                name: this.gastDS2,
                posicion: undefined,
                type: "nrosolicitud",
              });

              pathSegments.push({
                path:
                  this._parameters.AMBIENTE +
                  "/" +
                  route.carpetaSociedad +
                  "/" +
                  route.subcarpeta01 +
                  "/" +
                  route.subcarpeta04,
                name: route.subcarpeta04,
                posicion: undefined,
                type: "tipo",
              });

              pathSegments.push({
                path: this._parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + route.subcarpeta01,
                name: route.subcarpeta01,
                posicion: undefined,
                type: "app",
              });

              pathSegments.push({
                path: this._parameters.AMBIENTE + "/" + route.carpetaSociedad,
                name: route.carpetaSociedad,
                posicion: undefined,
                type: "ruc",
              });

              //oDictionary.RI = undefined;

              pathSegments.push({
                path: this._parameters.AMBIENTE,
                name: this._parameters.AMBIENTE,
                posicion: undefined,
                type: "ambiente",
              });

              DS.sendFiles(pathSegments, aFilesDev, oDictionary, this)
                .then((sResolve2) => {
                  jQuery.sap.log.info(sResolve2);
                  this.getView().getModel("DocumentsDevolucion").setData([]);
                })
                .catch((sError2) => {
                  jQuery.sap.log.error(sError2);
                  BusyIndicator.hide();
                });
            }
          })
          .catch((sError) => {
            jQuery.sap.log.error(sError);
            BusyIndicator.hide();
          });
      },
      fnAbrir: function (oEvent) {
        let oSource = oEvent.getSource();
        let id = oSource.getId();
        let route = sap.ui.getCore().getModel("route");
        let RucSociedad = sap.ui.getCore().getModel("oModelIas");
        route.carpetaSociedad = RucSociedad.Paval;
        let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
        let formDetGasto = this.getView().byId("idFragDetGasto--idDetDevolucionReembolso").getModel().getData();
        let urlDS = null;

        if (id.indexOf("btnDownloadTable") > -1) {
          let tableData = oSource.getParent().getParent().getModel().getData();
          let sPath = oSource.getBindingContext().getPath().split("/")[1];
          let object = tableData[sPath];
          urlDS =
            this._parameters.AMBIENTE +
            "/" +
            route.carpetaSociedad +
            "/" +
            route.subcarpeta01 +
            "/" +
            route.subcarpeta03 +
            "/" +
            object.Belnr +
            object.Bukrs +
            object.Gjahr +
            "/" +
            object.Nrpos;
        } else {
          urlDS =
            this._parameters.AMBIENTE +
            "/" +
            route.carpetaSociedad +
            "/" +
            route.subcarpeta01 +
            "/" +
            route.subcarpeta04 +
            "/" +
            formDetGasto.Belnr +
            formDetGasto.Bukrs +
            formDetGasto.Gjahr;
        }

        if (!this._dialogDownload) {
          this._dialogDownload = sap.ui.xmlfragment("com.everis.apps.cajachicaff.fragment.DownloadFile", this);
          this.getView().addDependent(this._dialogDownload);
        }
        let aDownload = [];
        let xhttp = new XMLHttpRequest(),
          that = this;
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            let children = JSON.parse(this.responseText);
            //	let str = "<ul>";
            //let repoUrl = "/cmis/" + idrepositorio + "/root/" + urlDS + "/";
            let repoUrl = this.responseURL + "/";
            for (let i = 0; i < children.objects.length; i++) {
              let oDownload = {};
              if (children.objects[i].object.properties["cmis:baseTypeId"].value == "cmis:folder") {
                // Do nothing
              } else {
                let name = children.objects[i].object.properties["cmis:name"].value;
                let mimeType = children.objects[i].object.properties["cmis:contentStreamMimeType"].value;
                let size = children.objects[i].object.properties["cmis:contentStreamLength"].value;

                oDownload.url = repoUrl + name;
                oDownload.name = name;
                oDownload.mimeType = mimeType;
                oDownload.size = size;
                //	str += '<li><a href="' + repoUrl + name + '">' + name + '</a></li>';
              }

              aDownload.push(oDownload);
            }

            that._dialogDownload.setModel(new JSONModel(aDownload));
            that._dialogDownload.getModel().updateBindings();
            that._dialogDownload.open();
            //	str += "</ul>";
            //	document.getElementById("listchildren").innerHTML = str;
          } else if (this.readyState == 4 && this.status == 404) {
            MessageBox.warning(that.getI18nText("noAdjunt"));
          }
        };
        xhttp.open("GET", "/cmis/" + idrepositorio + "/root/" + urlDS, true);
        xhttp.send();
      },
      uploadComplete: function () {
        BusyIndicator.hide();
      },
      onCloseDialogDownload: function () {
        this._dialogDownload.close();
      },
      onMostrarPorCaja: function () {
        console.log("Caja Reembolso-> " + this._parameters.CAJA_REEMBOLSO);
        let InfoIas = sap.ui.getCore().getModel("InfoIas");
        if (InfoIas.Zfondo !== undefined) {
          this.state.cajaSolicitante = InfoIas.Zfondo;
        } else {
          this.state.cajaSolicitante = this._parameters.CAJA_REEMBOLSO;
        }
        console.log("Caja del Solicitante-> " + this.state.cajaSolicitante);
        if (this.state.cajaSolicitante === this._parameters.CAJA_REEMBOLSO) {
          this.state.isCajaReembolso = true;
          this.getView().byId("idFragCrearGasto--idElementReembolso").setVisible(true);
        } else {
          this.state.isCajaReembolso = false;
          this.getView().byId("idFragCrearGasto--idElementReembolso").setVisible(false);
        }
      },
      fnEventoReembolso: function () {
        let oInputReem = this.getView().byId("idFragCrearGasto--idReembolso"),
          oCheckReem = this.getView().byId("idFragCrearGasto--idCheckReembolso");
        if (oCheckReem.getSelected() === true) {
          this.getView().byId("idFragCrearGasto--idCheckDevol").setSelected(false);
          this.getView().getModel("DocumentsDevolucion").setData([]);
          this.fnEventoDevolucion();
          oInputReem.setEditable(true);
        } else {
          oInputReem.setValue("");
          oInputReem.setEditable(false);
        }
      },
      onFileDeletedDevolucion: function (oEvent) {
        let dataView = this.getView().getModel("DocumentsDevolucion").getData();
        // 	idx;
        // let files = dataView;
        BusyIndicator.show();
        //let objectFile = oEvent.getSource().getBindingContext("Documents").getObject();
        let objectFile = oEvent.getSource().getBindingContext("DocumentsDevolucion").getPath();
        let sPath = objectFile.split("/")[1];
        dataView.splice(sPath, 1);
        this.getView().getModel("DocumentsDevolucion").updateBindings();
        BusyIndicator.hide();
      },
      onToast: function (message, f) {
        MessageToast.show(message, {
          duration: 1500,
          width: "22em",
          onClose: f,
        });
      },
      showMessageBox: function (msg, Method) {
        if (Method === "warning") {
          sap.m.MessageBox.warning(msg, {
            title: "Alerta",
            actions: ["Aceptar"],
            onClose: function () {},
          });
        }
        if (Method === "error") {
          sap.m.MessageBox.error(msg, {
            title: "Error",
            actions: ["Aceptar"],
            onClose: function () {},
          });
        }
        if (Method === "show") {
          sap.m.MessageBox.show(msg, {
            title: "Mensaje",
            actions: ["Aceptar"],
            onClose: function () {},
          });
        }
        if (Method === "success") {
          sap.m.MessageBox.success(msg, {
            title: "Éxito",
            actions: ["Aceptar"],
            onClose: function () {},
          });
        }
      },
      /*--------Centro de coste - Objeto de Costo MatchCode - ----------*/
      handleValueHelp_obj: function (oEvent) {
        let tipObjCosto = this.oRegistroModel.getProperty("/Rstyp/code");
        if (tipObjCosto === "K") {
          this.handleValueHelp_cc(oEvent);
        }
        if (tipObjCosto === "F") {
          this.handleValueHelp_or(oEvent);
        }
      },
      loadTipoObjetoCosto: function () {
        let v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
        let v_centro = this.oRegistroModel.getProperty("/Werks/code");
        let v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
        this._oModelHeaders = {
          bukrs: v_soc,
          werks: v_centro,
          lgort: v_almacen,
        };
        this.getOwnerComponent()
          .getModel("oUtilitiesModel")
          .read("/ztipoobjcostoreservaSet", {
            headers: this._oModelHeaders,
            success: (res) => {
              BusyIndicator.hide();
              if (res.results.length > 0) {
                let temp = [];
                res.results.map((x) => {
                  if (x.Rstyp !== "U") {
                    temp.push(x);
                  }
                });
                this.oRegistroModel.setProperty("/tiposObjetosCosto/", temp);
              } else {
                this.oRegistroModel.setProperty("/tiposObjetosCosto/", "");
              }
              this.byId("inputTipImp").setEnabled(true);
            },
            error: function () {
              let msj = this.getI18nText("appErrorMsg");
              this.showMessageBox(msj, "warning");
            },
          });
      },
      loadCentroCostoList: function () {
        let sSociedad = sap.ui.getCore().getModel("InfoIas").Bukrs;
        let sCentroCosto = sap.ui.getCore().getModel("InfoIas").Kostl;
        this._oModelHeaders = {
          bukrs: sSociedad,
        };
        this.getOwnerComponent()
          .getModel("oUtilitiesModel")
          .read("/zobjcostoSet", {
            headers: this._oModelHeaders,
            success: (res) => {
              if (res.results.length > 0) {
                let element = [];
                element = res.results.filter((ele) => {
                  return ele.Kostl === sCentroCosto;
                });
                if (element.length === 1) {
                  console.log(element);
                  //	this.getView().byId("idFragCrearGasto--idCeco").setValue(element[0].Kostl + " - " + element[0].Ktext);
                  this.getView()
                    .getModel()
                    .setProperty("/KostlKtext", element[0].Kostl + " - " + element[0].Ktext);
                  this.oVariablesJSONModel.setProperty("/Kostl/code", element[0].Kostl);
                  this.oVariablesJSONModel.setProperty("/Kostl/name", element[0].Ktext);
                }
                this.oVariablesJSONModel.setProperty("/objetosCosto/", res.results);
              } else {
                this.oVariablesJSONModel.setProperty("/objetosCosto/", "");
              }
            },
            error: () => {
              let msj = this.getI18nText("appErrorMsg");
              this.showMessageBox(msj, "warning");
            },
          });
      },
      onCloseDialogCentroCosto: function (evt) {
        let oSelectedItem = evt.getParameter("selectedItem");
        if (oSelectedItem) {
          let oInput = sap.ui.getCore().byId(this.inputId);
          let code_ = oSelectedItem.getInfo();
          let name_ = oSelectedItem.getTitle();
          let desc_ = code_ + " - " + name_;
          oInput.setValue(desc_);
          // let dialogName = evt.getSource().getProperty("title");
          // this.oGeneral.setProperty("/enableObjetoCosto", true);
          // this.oVariablesJSONModel.setProperty("/Kostl/code", code_);
          // this.oVariablesJSONModel.setProperty("/Kostl/name", name_);
          this.oRegistroModel.setProperty("/Kostl/code", code_);
          this.oRegistroModel.setProperty("/Kostl/name", name_);
        }
        this._valueHelpDialog = null;
        evt.getSource().getBinding("items").filter([]);
      },
      onSerieChange: function (oEvent) {
        let oInput = oEvent.getSource();
        let reference = oInput.getValue().toUpperCase().replace(/\s/g, "");
        //{@pguevarl - agregué
        let idTipoDocS = this.getView().byId("idFragCrearGasto--idTipoDocS").getSelectedKey();
        //@}pguevarl
        if (!/[^a-zA-Z0-9]/.test(reference)) {
          //oInput.setValue(reference.padStart(4, 0)); //@pguevarl - comentado
          //{@pguevarl - agregué
          if (idTipoDocS == "05") {
            if (oInput.getValue().length <= 3) {
              oInput.setValue(reference.padStart(3, 0));
            } else if (oInput.getValue().length == 4) {
              oInput.setValue(reference.padStart(4, 0));
            }
          } else if (idTipoDocS !== "12" && idTipoDocS !== "00" && idTipoDocS !== "11" && idTipoDocS !== "13") {
            oInput.setValue(reference.padStart(4, 0));
          }
          //@}pguevarl
        } else {
          return MessageToast.show("No se permiten caracteres especiales");
        }
        return null;
      },
      onSerieLiveChange: function (oEvent) {
        let oInput = oEvent.getSource();
        let reference = oInput.getValue().toUpperCase().replace(/\s/g, "");
        if (/[^a-zA-Z0-9]/.test(reference)) {
          let index = reference.length - 1;
          oInput.setValue(reference.slice(0, index));
        }
      },
      onCorrelativoChange: function (oEvent) {
        let oInput = oEvent.getSource();
        let reference = oInput.getValue().toUpperCase().replace(/\s/g, "");
        //{@pguevarl - agregué
        let idTipoDocS = this.getView().byId("idFragCrearGasto--idTipoDocS").getSelectedKey();
        //@}pguevarl
        if (!/[^a-zA-Z0-9]/.test(reference)) {
          //oInput.setValue(reference.padStart(8, 0)); //@pguevarl - comentado
          //{@pguevarl - agregué
          if (oInput.getValue().length == 0) {
            oInput.setValueState("Error");
            return MessageToast.show("El correlativo debe tener al menos 1 caracter");
          } else {
            oInput.setValueState("None");
          }
          if (
            idTipoDocS == "05" ||
            idTipoDocS == "12" ||
            idTipoDocS == "00" ||
            idTipoDocS == "11" ||
            idTipoDocS == "13"
          ) {
            if (oInput.getValue().length == 0) {
              oInput.setValueState("Error");
              return MessageToast.show("El correlativo debe tener al menos 1 caracter");
            } else {
              oInput.setValueState("None");
            }
          } else {
            oInput.setValue(reference.padStart(8, 0));
          }
          //@}pguevarl
        } else {
          return MessageToast.show("No se permiten caracteres especiales");
        }

        return null;
      },
      onlyNumber: function (oEvent) {
        let _oInput = oEvent.getSource();
        let val = _oInput.getValue();
        val = val.replace(/[^\d]/g, "");
        _oInput.setValue(val);
      },
      //{@pguevarl - agregué la función codificarEntidad para el punto 3
      codificarEntidad: function (str2, bSolicitud) {
        let array = [];
        let longitud = str2.length;
        for (let i = str2.length - 1; i >= 0; i--) {
          array.unshift(["", str2[i].charCodeAt(), ";"].join(""));
        }
        let texto = array.join("");
        while (longitud > 0) {
          //pguevarl
          //vocales X
          //ñ
          texto = texto.replace("241;", "110;");
          //Ñ
          texto = texto.replace("209;", "78;");
          //a
          texto = texto.replace("228;", "97;");
          texto = texto.replace("226;", "97;");
          texto = texto.replace("224;", "97;");
          texto = texto.replace("229;", "97;");
          //A
          texto = texto.replace("196;", "65;");
          texto = texto.replace("197;", "65;");
          texto = texto.replace("192;", "65;");
          texto = texto.replace("195;", "65;");
          //e
          texto = texto.replace("234;", "101;");
          texto = texto.replace("235;", "101;");
          texto = texto.replace("232;", "101;");
          //E
          texto = texto.replace("202;", "69;");
          texto = texto.replace("200;", "69;");
          //i
          texto = texto.replace("239;", "105;");
          texto = texto.replace("236;", "105;");
          //I
          texto = texto.replace("206;", "73;"); // Í,I
          texto = texto.replace("207;", "73;"); // Í,I
          //o
          texto = texto.replace("242;", "111;"); // ó,o
          texto = texto.replace("244;", "111;"); // ó,o
          //O
          texto = texto.replace("210;", "79;"); // Ó,O
          texto = texto.replace("213;", "79;"); // Ó,O
          //u
          texto = texto.replace("249;", "117;"); // ú,u
          texto = texto.replace("251;", "117;"); // ú,u
          texto = texto.replace("252;", "117;"); // ú,u
          //U
          texto = texto.replace("217;", "85;"); // Ú,U
          texto = texto.replace("219;", "85;"); // Ú,U
          texto = texto.replace("220;", "85;"); // Ú,U

          //vocales minusculas
          texto = texto.replace("225;", "97;"); // á,a
          texto = texto.replace("233;", "101;"); // é,e
          texto = texto.replace("237;", "105;"); // í,i
          texto = texto.replace("243;", "111;"); // ó,o
          texto = texto.replace("250;", "117;"); // ú,u
          //vocales MAYUSCULAS
          texto = texto.replace("193;", "65;"); // Á,A
          texto = texto.replace("201;", "69;"); // É,E
          texto = texto.replace("205;", "73;"); // Í,I
          texto = texto.replace("211;", "79;"); // Ó,O
          texto = texto.replace("218;", "85;"); // Ú,U
          //numeros
          if (!bSolicitud) {
            texto = texto.replace("48;", ""); // 0
          }

          longitud--;
        }

        return texto;
      },
      //}@pguevarl
      //{@pguevarl - agregué la función decodificarEntidad para el punto 3
      decodificarEntidad: function (str1) {
        let texto = str1.replace(/(\d+);/g, function (match, dec) {
          if (dec >= 48 && dec <= 57) {
            //numeros
            return String.fromCharCode(dec);
          } else if (dec >= 97 && dec <= 122) {
            //minusculas
            return String.fromCharCode(dec);
          } else if (dec >= 65 && dec <= 90) {
            //mayúsculas
            return String.fromCharCode(dec);
          } else if (
            //simbolos
            dec == 45 || // -
            dec == 95 || // _
            dec == 46 || // .
            dec == 32 || // espacio
            dec == 39 // '
          ) {
            return String.fromCharCode(dec);
          } else {
            return "";
          }
        });
        return texto;
      },
      //}@pguevarl
      //{@pguevarl - agregué la función llamada para el punto 3
      llamada: function (text, bSolicitud = false) {
        //se añade segundo parámetro para evitar que se supriman los "0" del nombre del adjunto para solicitudes
        let fin = this.codificarEntidad(text, bSolicitud);
        fin = this.decodificarEntidad(fin);
        return fin;
      },
      //}@pguevarl

      /*--------Tipo Objeto de Costo MatchCode----------*/
      handleValueHelp_ti: function (oEvent) {
        this.inputId = oEvent.getSource().getId();
        // create value help dialog
        if (!this._valueHelpDialog) {
          this._valueHelpDialog = sap.ui.xmlfragment(this._xmlFragmentTipoObjetoCostoHelp, this);
          let v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
          let v_centro = this.oRegistroModel.getProperty("/Werks/code");
          let v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
          this._oModelHeaders = {
            bukrs: v_soc,
            werks: v_centro,
            lgort: v_almacen,
          };

          BusyIndicator.show();
          this.getOwnerComponent()
            .getModel("oUtilitiesModel")
            .read("/ztipoobjcostoreservaSet", {
              headers: this._oModelHeaders,
              success: (res) => {
                if (res.results.length > 0) {
                  let temp = [];
                  res.results.map((x) => {
                    if (x.Rstyp !== "U") {
                      temp.push(x);
                    }
                  });
                  this.oRegistroModel.setProperty("/tiposObjetosCosto/", temp);
                } else {
                  this.oRegistroModel.setProperty("/tiposObjetosCosto/", "");
                }
                BusyIndicator.hide();
              },
              error: () => {
                BusyIndicator.hide();
                let msj = this.getI18nText("appErrorMsg");
                this.showMessageBox(msj, "warning");
              },
            });
          this.getView().addDependent(this._valueHelpDialog);
        }
        //create a filter for the binding
        let sInputValue = this.byId(this.inputId).getValue();
        let oFilter = null;
        oFilter = this.filterTipoObjetoCosto(sInputValue);
        this._valueHelpDialog.getBinding("items").filter([oFilter]);
        // open value help dialog filtered by the input value
        this._valueHelpDialog.open(sInputValue);
      },

      filterTipoObjetoCosto: function (sInputValue) {
        let sTemp = sInputValue.split(" - ");
        let oFilter = null;
        if (sTemp.length > 1) {
          let sMesscode = sTemp[0];
          let sName = sTemp[1];
          oFilter = new Filter(
            [
              new Filter("Rsttx", FilterOperator.Contains, sName),
              new Filter("Rstyp", FilterOperator.Contains, sMesscode),
            ],
            false
          );
        } else {
          oFilter = new Filter(
            [
              new Filter("Rsttx", FilterOperator.Contains, sInputValue),
              new Filter("Rstyp", FilterOperator.Contains, sInputValue),
            ],
            false
          );
        }
        return oFilter;
      },

      _handleValueHelpSearch_ti: function (evt) {
        let sInputValue = evt.getParameter("value");
        let oFilter = null;
        oFilter = this.filterTipoObjetoCosto(sInputValue);
        evt.getSource().getBinding("items").filter([oFilter]);
      },

      handleValueHelp_cc: function (oEvent) {
        this.inputId = oEvent.getSource().getId();
        // create value help dialog
        if (!this._valueHelpDialog) {
          this._valueHelpDialog = sap.ui.xmlfragment(this._xmlFragmentObjetoCostoHelp, this);
          let v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
          let v_centro = this.oRegistroModel.getProperty("/Werks/code");
          // let v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
          let v_tipObjCosto = this.oRegistroModel.getProperty("/Rstyp/code");
          this._oModelHeaders = {
            bukrs: v_soc,
            werks: v_centro,
            // "lgort": v_almacen,
            Rstyp: v_tipObjCosto,
          };

          BusyIndicator.show();

          this.getOwnerComponent()
            .getModel("oUtilitiesModel")
            .read("/zobjcostoSet", {
              headers: this._oModelHeaders,
              success: (res) => {
                if (res.results.length > 0) {
                  this.oRegistroModel.setProperty("/objetosCosto/", res.results);
                } else {
                  this.oRegistroModel.setProperty("/objetosCosto/", "");
                }
                BusyIndicator.hide();
              },
              error: () => {
                BusyIndicator.hide();
                let msj = this.getI18nText("appErrorMsg");
                this.showMessageBox(msj, "warning");
              },
            });
          this.getView().addDependent(this._valueHelpDialog);
        }
        //create a filter for the binding
        let sInputValue = this.byId(this.inputId).getValue();
        let oFilter = null;
        oFilter = this.filterObjetoCosto_(sInputValue);
        this._valueHelpDialog.getBinding("items").filter([oFilter]);
        // open value help dialog filtered by the input value
        this._valueHelpDialog.open(sInputValue);
      },

      _handleValueHelpSearch_cc: function (evt) {
        let sInputValue = evt.getParameter("value");
        let oFilter = null;
        oFilter = this.filterObjetoCosto_(sInputValue);
        evt.getSource().getBinding("items").filter([oFilter]);
      },

      filterObjetoCosto_: function (sInputValue) {
        let sTemp = sInputValue.split(" - ");
        let oFilter = null;
        if (sTemp.length > 1) {
          let sMesscode = sTemp[0];
          let sName = sTemp[1];
          oFilter = new Filter(
            [
              new Filter("Kostl", FilterOperator.Contains, sMesscode),
              new Filter("Ktext", FilterOperator.Contains, sName),
            ],
            false
          );
        } else {
          oFilter = new Filter(
            [
              new Filter("Kostl", FilterOperator.Contains, sInputValue),
              new Filter("Ktext", FilterOperator.Contains, sInputValue),
            ],
            false
          );
        }
        return oFilter;
      },

      /*--------Orden - Objeto de Costo MatchCode - ----------*/
      handleValueHelp_or: function (oEvent) {
        this.inputId = oEvent.getSource().getId();
        // create value help dialog
        if (!this._valueHelpDialog) {
          this._valueHelpDialog = sap.ui.xmlfragment(this._xmlFragmentOrdenHelp, this);
          let v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
          // let v_centro = this.oRegistroModel.getProperty("/Werks/code");
          let v_centro = "1400"; //placeholder para no mostrar control vacío
          let v_tipObjCosto = this.oRegistroModel.getProperty("/Rstyp/code");
          this._oModelHeaders = {
            bukrs: v_soc,
            werks: v_centro,
            Rstyp: v_tipObjCosto,
          };

          BusyIndicator.show();

          this.getOwnerComponent()
            .getModel("oUtilitiesModel")
            .read("/zordenSet", {
              headers: this._oModelHeaders,
              success: (res) => {
                if (res.results.length > 0) {
                  this.oRegistroModel.setProperty("/ordenes/", res.results);
                } else {
                  this.oRegistroModel.setProperty("/ordenes/", "");
                }
                BusyIndicator.hide();
              },
              error: () => {
                BusyIndicator.hide();
                let msj = this.getI18nText("appErrorMsg");
                this.showMessageBox(msj, "warning");
              },
            });
          this.getView().addDependent(this._valueHelpDialog);
        }
        //create a filter for the binding
        let sInputValue = this.byId(this.inputId).getValue();
        let oFilter = null;
        oFilter = this.filterOrden_(sInputValue);
        this._valueHelpDialog.getBinding("items").filter([oFilter]);
        // open value help dialog filtered by the input value
        this._valueHelpDialog.open(sInputValue);
      },

      _handleValueHelpSearch_or: function (evt) {
        let sInputValue = evt.getParameter("value");
        let oFilter = null;
        oFilter = this.filterOrden_(sInputValue);
        evt.getSource().getBinding("items").filter([oFilter]);
      },

      filterOrden_: function (sInputValue) {
        let sTemp = sInputValue.split(" - ");
        let oFilter = null;
        if (sTemp.length > 1) {
          let sMesscode = sTemp[0];
          let sName = sTemp[1];
          oFilter = new Filter(
            [
              new Filter("Ktext", FilterOperator.Contains, sName),
              new Filter("Aufnr", FilterOperator.Contains, sMesscode),
            ],
            false
          );
        } else {
          oFilter = new Filter(
            [
              new Filter("Ktext", FilterOperator.Contains, sInputValue),
              new Filter("Aufnr", FilterOperator.Contains, sInputValue),
            ],
            false
          );
        }
        return oFilter;
      },

      onTipImp: function (code) {
        this.oRegistroModel.setProperty("/Rstyp/code", code);
      },

      onCeCo: function (code, name) {
        this.oRegistroModel.setProperty("/Kostl/code", code);
        this.oRegistroModel.setProperty("/Kostl/value", name);
      },

      afterSelectItem: function (dialogName, code, name, desc) {
        switch (dialogName) {
          case this.getI18nText("appTituloDialogoTipoObjetoCostoHelp"):
            this.onTipImp(code);
            break;
          case this.getI18nText("appTituloDialogoObjetoCostoHelp"):
            this.onCeCo(code, name);
            break;
          default:
            break;
        }
      },

      _handleValueHelpClose: function (evt) {
        let oSelectedItem = evt.getParameter("selectedItem");
        if (oSelectedItem) {
          let oInput = sap.ui.getCore().byId(this.inputId);
          let code_ = oSelectedItem.getInfo();
          let name_ = oSelectedItem.getTitle();
          let desc_ = code_ + " - " + name_;
          oInput.setValue(desc_);
          let dialogName = evt.getSource().getProperty("title");
          this.afterSelectItem(dialogName, code_, name_, desc_);
        }
        this._valueHelpDialog = null;
        evt.getSource().getBinding("items").filter([]);
      },

      getThisUserInformation: function () {
        // let userModel = new JSONModel();
        // userModel.loadData("/userapi/user-api/attributes", null, false);
        // this.getView().setModel(userModel.getData(), "userapi");
        // return userModel.getData().name;

        return sap.ui.getCore().getModel("userIAS").getData().name;
      },

      getSAPEmailSolicitante: function () {
        let sUser = this.getThisUserInformation();
        //let sUser = "Q08275964"; //test
        this.oRegistroModel.setProperty("/UsuarioSolicitante", sUser);
        let query = "/zemailSet(UserId='" + sUser + "')";
        let isExistEmail = false;
        this.getOwnerComponent()
          .getModel("oUtilitiesModel")
          .read(query, {
            success: (res) => {
              if (res.EmailCorp !== undefined && res.EmailCorp !== "") {
                this.oRegistroModel.setProperty("/EmailCorporativoSolicitante", res.EmailCorp);
                isExistEmail = true;
              }
              if (res.EmailPers !== undefined && res.EmailPers !== "") {
                this.oRegistroModel.setProperty("/EmailPersonalSolicitante", res.EmailPers);
                isExistEmail = true;
              }
              if (!isExistEmail) {
                let msj =
                  "Su usuario no tiene registrado un correo electrónico Corporativo en SAP ERP. Usuario " + sUser + ".";
                this.showMessageBox(msj, "warning");
              }
              if (res.Butxt !== undefined && res.Butxt !== "") {
                this.oRegistroModel.setProperty("/SociedadSolicitante", res.Bukrs);
                this.oRegistroModel.setProperty("/Bukrs/value", res.Bukrs + " - " + res.Butxt);
              }
              if (res.Bukrs !== undefined && res.Bukrs !== "") {
                this.oRegistroModel.setProperty("/SociedadSolicitante", res.Bukrs);
                this.oRegistroModel.setProperty("/Bukrs/code", res.Bukrs);
              } else {
                let msj2 = "Usted no tiene sociedad asignada en SAP ERP. Usuario " + sUser + ".";
                MessageBox.error(msj2);
              }
            },
            error: (err) => {
              BusyIndicator.hide();
              let msj = "Su usuario no se encuentra registrado en SAP ERP. Usuario " + sUser + ".";
              MessageBox.warning(msj);
            },
          });
      },

      fnSubirObservacionDS: function (oEntrada) {
        var that = this;
        return new Promise((resolve, reject) => {
          var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
          var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
          var sSolicitud = oEntrada.Belnr + oEntrada.Bukrs + oEntrada.Gjahr;

          const aFiles = that.getView().getModel("DocumentsSolicitud").getData();
          if (aFiles.length === 0) {
            resolve();
          }
          const sPath = `${oParametersModel.AMBIENTE}/${oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
            return oSociedad.valueLow === oEntrada.Bukrs
          }).valueHigh}/${oVariablesGlobales.carpetaFondoFijo}/${oVariablesGlobales.carpetaSolicitud}/${sSolicitud}`;

          BusyIndicator.show(0);

          // Create folder
          Sharepoint
            .createFolderDeep(sPath)
            .then(() => {
              const aFilesToUpload = aFiles.map((x) => {
                return {
                  folderName: "",
                  fileName: x.FileName,
                  data: x.Data,
                  size: x.Data.size,
                };
              });

              // Upload files
              return Sharepoint.saveFiles(sPath, aFilesToUpload);
            })
            .then((sResolve) => {
              MessageToast.show(that.getI18nText("msgSharepointSuccess"));
              that.oVariablesJSONModel.setProperty("/idFolderSolicitudGenerada", sResolve);
              BusyIndicator.hide();
              resolve();
            })
            .catch((error) => {
              Log.error("[CC] MasterDetalleFF.controller - fnSubirObservacionDS", error);
              MessageBox.error(that.getI18nText("msgSharepointError"));
              reject();
            });
        });
      },

      blobToBase64String: function (blobFile) {
        return new Promise(function (resolve) {
          var reader = new FileReader();
          reader.onload = function (readerEvt) {
            var base64String = readerEvt.target.result;
            resolve(base64String);
          };
          reader.readAsDataURL(blobFile);
        });
      },

      uploadArchiveLink: function (oDocument) {
        var that = this;
        return new Promise((resolve, reject) => {
          var oModelFondoFijo = that.getOwnerComponent().getModel("oCajaChicaFFModel");
          var aFiles = that.getView().getModel("DocumentsSolicitud").getData();
          if (aFiles.length === 0) {
            resolve();
          }
          var aFilesTobeConverted = [];
          aFiles.forEach((oFile) => {
            aFilesTobeConverted.push(that.blobToBase64String(oFile.Data));
          });
          BusyIndicator.show(0);
          Promise.all(aFilesTobeConverted).then((aBase64String) => {
            var oArchiveLinkPayload = {
              Bukrs: oDocument.Bukrs,
              Belnr: oDocument.Belnr,
              Gjahr: oDocument.Gjahr,
              Modulo: "FI",
              ArchiveDocSet: []
            };
            aBase64String.forEach((sBase64String, index) => {
              var sFileName = aFiles[index].FileName;
              oArchiveLinkPayload.ArchiveDocSet.push({
                Bukrs: oDocument.Bukrs,
                Belnr: oDocument.Belnr,
                Gjahr: oDocument.Gjahr,
                Bas64: sBase64String.split(",")[1],
                Exten: sFileName.substring(sFileName.lastIndexOf(".") + 1).toUpperCase(),
                Nombre: sFileName,
                Return: ""
              });
            });
            oModelFondoFijo.create("/ArchiveHeaderSet", oArchiveLinkPayload, {
              success: function (oResponse) {
                console.log(oResponse);
                MessageToast.show(that.getI18nText("msgArchiveLinkSuccess"));
                that.getView().getModel("DocumentsSolicitud").setData([]);
                BusyIndicator.hide();
                resolve();
              },
              error: function (oError) {
                console.error("[ArchiveLink - Carga SAP]", oError);
                MessageBox.error(that.getI18nText("msgArchiveLinkError"));
                reject();
              }
            });
          }).catch((oError) => {
            console.error("[ArchiveLink - Conversión Blob]", oError);
            MessageBox.error(that.getI18nText("msgArchiveLinkError"));
            reject();
          });
        });
      },

      onChangeSolicitud: function (oEvent) {
        Log.info("[CC] MasterDetalleFF.controller - onChangeSolicitud", "onChangeSolicitud");

        let oModelDocSolicitud = this.getView().getModel("DocumentsSolicitud");
        BusyIndicator.show();
        let file = oEvent.getParameter("files")[0];
        let jsondataAdjunto;
        this.base64coonversionMethod(file).then((result) => {
          jsondataAdjunto = {
            LoioId: jQuery.now().toString(),
            flagLogioId: true,
            //se añade segundo parámetro para evitar que se supriman los "0" del nombre del adjunto para solicitudes
            Descript: this.llamada(file.name, true).replace("." + this.getFileExtension(file.name), ""),
            DocType: this.getFileExtension(file.name),
            mimeType: file.type,
            //se añade segundo parámetro para evitar que se supriman los "0" del nombre del adjunto para solicitudes
            FileName: this.llamada(file.name, true),
            Data: result,
          };
          oModelDocSolicitud.getData().unshift(jsondataAdjunto);
          oModelDocSolicitud.refresh();
          oModelDocSolicitud.updateBindings(true);
        });
      },

      onFileDeletedSolicitud: function (oEvent) {
        let dataView = this.getView().getModel("DocumentsSolicitud").getData();
        // let files = dataView;
        BusyIndicator.show();
        let objectFile = oEvent.getSource().getBindingContext("DocumentsSolicitud").getPath();
        let sPath = objectFile.split("/")[1];
        dataView.splice(sPath, 1);
        this.getView().getModel("DocumentsSolicitud").updateBindings();
        BusyIndicator.hide();
      },

      onOpenDialogAttachSolicitud: function () {
        if (!this._dialogAttachSolicitud) {
          this._dialogAttachSolicitud = sap.ui.xmlfragment(
            "com.everis.apps.cajachicaff.fragment.AttachSolicitud",
            this
          );
          this.getView().addDependent(this._dialogAttachSolicitud);
        }
        this._dialogAttachSolicitud.open();
      },

      onCloseDialogAttachSolicitud: function () {
        this._dialogAttachSolicitud.close();
      },

      onTest: function () {
        // Test 1
        // Sharepoint.createFolder("CARPETA ABC", "Carpeta de Prueba_1").then((oResult) => {
        // });
        // Test 2
        // Sharepoint.downloadFiles("CARPETA ABC/TEST").then((oResult) => {
        // });
        // Test 3
        // const aFiles = this.getView().getModel("DocumentsSolicitud").getData();
        // const aFiles2 = aFiles.map((x) => {
        //   return {
        //     folderName: "",
        //     fileName: x.FileName,
        //     data: x.Data,
        //     size: x.Data.size,
        //   };
        // });
        // Sharepoint
        //   .saveFiles("CARPETA ABC/Carpeta de Prueba_3", aFiles2, { delete_existing_files: true })
        //   .then((aFiles2) => {
        //     debugger;
        //   });

        // Test 4
        // Sharepoint.createFolderDeep("Carpeta ABC/TEST/Test C").then((oResult) => {
        //   debugger;
        // });

        this.fnFetchToken();
      },
      _getAppModulePath: function () {
        const appId = this.getOwnerComponent().getManifestEntry("/sap.app/id"),
        appPath = appId.replaceAll(".", "/");
        
        return jQuery.sap.getModulePath(appPath);
      }
    });
  }
);
