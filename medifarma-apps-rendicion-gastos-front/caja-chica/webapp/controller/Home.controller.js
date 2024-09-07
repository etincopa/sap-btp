sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/base/Log",
    "../lib/Backend",
    "../lib/Developer",
    "../lib/Sharepoint"
  ],
  function (
    Controller,
    MessageBox,
    MessageToast,
    JSONModel,
    Filter,
    FilterOperator,
    Log,
    Backend,
    Developer,
    Sharepoint
  ) {
    "use strict";
    return Controller.extend("com.everis.apps.cajachicaff.controller.Home", {
      onInit: function () {
        sap.ui.core.BusyIndicator.show(0);
        var that = this;
        this._initConfig();

        Log.info("[CC] Home.controller - onInit", "onInit");

        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel"),
          oisMobile = sap.ui.Device.system.phone;

        oModel.attachMetadataFailed(() => {
          MessageBox.error("Error al comunicarse con el servidor. Intentar de nuevo más tarde.", {
            actions: ["Volver al Portal"],
            emphasizedAction: "Volver al Portal",
            onClose: function () {
              that.onGoShellHome();
            }
          });
        });

        Backend.initialize(this.getOwnerComponent().getModel("UtilsModel"));

        Backend
          .getParameters("RENDICION_GASTOS", null)
          .then((aParameters) => {
            Log.info("[CC] Home.controller - onInit", "Parameters loaded");

            const aParamsToParse = this.getOwnerComponent().getModel("Config").getData().parameters;

            return Backend.parseParameters(aParameters, aParamsToParse);
          })
          .then((paramValues) => {
            sap.ui.getCore().setModel(new JSONModel(paramValues["CAJA_CHICA"]), "ParametersModel");
            this._initSharepoint(paramValues["SHAREPOINT"]);
            // this.setLocalModels();
            // this.setupValidation();
            return this.getUserApi();
          })
          .then((oUserApi) => {
            sap.ui.getCore().setModel(new JSONModel(oUserApi), "userIAS");

            //BRAD CAMBIO displayName POR NAME name
            return new Promise((resolve, reject) => {
              oModel.read("/IasSet('" + oUserApi.name + "')", {
                // oModel.read("/IasSet('Q08275964')", {
                //Prueba QAS @pguevarl
                //oModel.read("/IasSet('25837469')", { //Prueba DEV
                success: (result) => {
                  Log.info("[CC] Home.controller - onInit", "IasSet loaded " + oUserApi.name);

                  if (result.Bukrs !== null && result.Bukrs !== "" && result.Bukrs !== undefined) {
                    sap.ui.getCore().setModel(result, "oModelIas");
                    result.Zfondo = this.getView().byId("idDFondoFijo").getSelectedKey().toUpperCase();
                    if (result.Zfondo === "") {
                      result.Zfondo = this.getView().byId("idFondoFijo").getSelectedKey().toUpperCase();
                    }
                    sap.ui.getCore().setModel(result, "InfoIas");
                    this.getView().byId("idDSociedad").setValue(result.Bukrs);
                    this.getView().byId("idSociedadM").setValue(result.Bukrs);
                    this.fnListarCajasDisponibles();
                  } else {
                    MessageBox.error("Su usuario no se encuentra asignado al proceso de aprobación.", {
                      actions: ["Volver al Portal"],
                      emphasizedAction: "Volver al Portal",
                      onClose: function () {
                        that.onGoShellHome();
                      }
                    });
                  }
                  resolve();
                },
                error: function (xhr, status, error) {
                  MessageBox.error(error);
                  reject(error);
                },
              });
            });
          })
          .catch((err) => {
            Log.error("[CC] Home.controller - onInit", err);
            MessageBox.error("Ha ocurrido un error al recuperar la informacion del usuario");
          })
          .finally(() => {
            sap.ui.getCore().setModel(new JSONModel({}), "HomeLoadedModel");
            Log.info("[CC] Home.controller - onInit", "Home finished loading");

            sap.ui.core.BusyIndicator.hide();
          });

        if (!oisMobile) {
          const path = jQuery.sap.getModulePath("com.everis.apps.cajachicaff.assets", "/customer-logo.png");
          this.byId("idImgCliente").setSrc(path);
          this.getView().byId("idFormFondoF").setVisible(false);
          this.getView().byId("idPValidacion").setVisible(true);
        } else {
          this.getView().byId("idPValidacion").setVisible(false);
        }

        var oModelCajasDisponibles = new JSONModel([]);
        this.getView().setModel(oModelCajasDisponibles, "oModelCajasDisponibles");
      },
      _initConfig: function () {
        if (Developer.isTestMode()) {
          Log.setLevel(Log.Level.DEBUG);
          Log.info("[CC] Home.controller - _initConfig", "Modo test activado");
        } else {
          Log.setLevel(Log.Level.INFO);
        }
      },

      _initSharepoint: function (oValues) {
        Sharepoint.setValueRoot(oValues.ROOT_DIRECTORY);
        Sharepoint.setUrl(oValues.URL);
        Sharepoint.setGetTokenFn(() => {
          return Backend.getSharepointToken("RENDICION_GASTOS");
        });
      },
      getUserApi: function () {
        return new Promise((resolve, reject) => {
          let sEmail = "";

          if (sap.ushell !== undefined) {
            sEmail = sap.ushell.Container.getUser().getEmail();
          }

          if (sEmail) {
            Log.info("[CC] Home.controller getUserApi - User Mail", sEmail);
          } else if (Developer.isTestMode()) {
            sEmail = "hmunoz@everis.com";
          }

          const sPath = 'iasscim/Users?filter=emails.value eq "' + sEmail + '"';
          const sUrl = this.getOwnerComponent().getManifestObject().resolveUri(sPath);
          $.ajax({
            url: sUrl,
            cache: false,
            contentType: false,
            processData: false,
            type: "GET",
            success: function (data) {
              let oData = {};
              //let aAttributes = oDataTemp.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
              oData = {
                company: "",
                email: data.Resources[0].emails[0].value,
                emails: data.Resources[0].emails[0].value,
                firstName: data.Resources[0].name.givenName,
                groups: data.Resources[0].groups,
                lastName: data.Resources[0].name.familyName,
                loginName: data.Resources[0].userName,
                name: data.Resources[0].userName, // Se usa para validar usuario en SAP
                ruc: "",
              };

              Log.info("[CC] Home.controller - getUserApi - IAS SCIM API Result", JSON.stringify(oData));

              resolve(oData);
            },
            error: function (error) {
              reject(error);
            },
          });
        });
      },
      onIrMasterDetalleDes: function () {
        // var sSociedad = this.byId("idDSociedad").getValue();
        // var sFondoFijo = this.byId("idDFondoFijo").getValue().toUpperCase();
        var sFondoFijo = this.byId("idDFondoFijo").getSelectedKey().toUpperCase();

        // if (sSociedad === "1000" && sFondoFijo.toUpperCase() === "C002") {
        // 	//this.fnValidarIngreso();
        // 	var oRouter = this.getOwnerComponent().getRouter();
        // 	oRouter.navTo("masterDetalleFF");
        // } else {
        // 	MessageBox.error(
        // 		"Usuario no tiene autorización para el fondo ingresado."
        // 	);
        // }
        sFondoFijo = sFondoFijo.toUpperCase();

        this.fnValidarIngreso(sFondoFijo);
      },
      onIrMasterDetalleDesPho: function () {
        var sFondoFijo = this.byId("idFondoFijo").getSelectedKey();

        sFondoFijo = sFondoFijo.toUpperCase();

        this.fnValidarIngreso(sFondoFijo);
      },
      fnValidarIngreso: function (Zfondo) {
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel"),
          aFilter = [],
          InfoIas = sap.ui.getCore().getModel("InfoIas");
        sap.ui.core.BusyIndicator.show(0);
        InfoIas.Zfondo = Zfondo.toUpperCase();
        aFilter.push(new Filter("Gjahr", FilterOperator.EQ, String(new Date().getFullYear())));
        aFilter.push(new Filter("Bukrs", FilterOperator.EQ, InfoIas.Bukrs));
        aFilter.push(new Filter("Id", FilterOperator.EQ, "1"));
        aFilter.push(new Filter("Zfondo", FilterOperator.EQ, Zfondo));
        aFilter.push(new Filter("Val2", FilterOperator.EQ, InfoIas.Sysid));
        //	aFilter.push(new Filter("Zcat", FilterOperator.EQ, oSolicitudSeleccionado.Zcat));
        oModel.read("/ValidacionSet", {
          filters: aFilter,
          success: (oData) => {
            sap.ui.core.BusyIndicator.hide();
            var msg = oData.results[0];
            if (msg.Val2 === "S") {
              //		if(true){ //Prueba
              MessageToast.show(msg.Val3);
              var oRouter = this.getOwnerComponent().getRouter();
              oRouter.navTo("masterDetalleFF", { origin: "1" });
            } else {
              MessageBox.error(msg.Val3);
            }
          },
          error: function (xhr) {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.error(xhr);
          },
        });
      },
      onGoShellHome: function () {
        var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

        oCrossAppNavigator.toExternal({
          target: {
            shellHash: "#Shell-home",
          },
        });
      },

      fnListarCajasDisponibles: function () {
        const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel"),
          aFilter = [],
          InfoIas = sap.ui.getCore().getModel("InfoIas");
        aFilter.push(new Filter("Bukrs", FilterOperator.EQ, InfoIas.Bukrs));
        aFilter.push(new Filter("UsnamScp", FilterOperator.EQ, InfoIas.Sysid));
        oModel.read("/FondoFijoSet", {
          filters: aFilter,
          success: (oData) => {
            this.getView().getModel("oModelCajasDisponibles").setData(oData.results);
          },
          error: (xhr) => {
            MessageBox.error(xhr);
          },
        });
      },
    });
  }
);
