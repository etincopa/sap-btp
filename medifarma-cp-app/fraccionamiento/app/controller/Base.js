sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "mif/cp/fraccionamiento/util/http",
    "sap/ui/core/Fragment",
    "mif/cp/fraccionamiento/service/sync",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "mif/cp/fraccionamiento/service/config",
  ],
  function (
    Controller,
    http,
    Fragment,
    sync,
    MessageBox,
    BusyIndicator,
    grupoOrden,
    configSrv
  ) {
    "use strict";

    return Controller.extend("mif.cp.fraccionamiento.controller.Base", {
      init: async function () {
        this.oOwnerComponent = this.getOwnerComponent();
        this.oRouter = this.oOwnerComponent.getRouter();
        this.oLocalModel = this.oOwnerComponent.getModel("localModel");
        this.oServiceModel = this.oOwnerComponent.getModel("serviceModel");
        this.serviceModelOnlineV2 = await grupoOrden._getModelAuth(
          this.oOwnerComponent.getModel("serviceModelOnlineV2")
        );

        grupoOrden.init(
          this.oServiceModel,
          this.serviceModelOnlineV2,
          this.serviceModelOnlineV2
        );

        this.oConfig =
          this.getOwnerComponent().getManifestEntry("/sap.ui5/config");

        this.oConfiguracion = this.oLocalModel.getProperty("/Config");
        this.oResourceBundle = this.oOwnerComponent
          .getModel("i18n")
          .getResourceBundle();
        let config = this.getOwnerComponent().getManifestEntry(
          "/sap.app/applicationVersion"
        );

        let config2 = this.getOwnerComponent().getManifestEntry("/sap.ui5");

        var sAmbiente = config2.config.token.ambiente;
        sAmbiente = sAmbiente == "PRD" ? "" : " (" + sAmbiente + ")";

        this.oLocalModel.setProperty("/version", config.version + sAmbiente);
        this.offline = !this.oLocalModel.getProperty("/Online");
        this.actualizarReloj();

        sync.init(this.oServiceModel);
        configSrv.init(this.oServiceModel);
      },
      onLoadDB: async function (oEvent) {
        BusyIndicator.show(0);
        if (navigator.onLine) {
          try {
            MessageBox.information("Cargando registros, por favor espere ...");
            await sync.sync();
            await this.onLine();

            MessageBox.msgExitoso(
              "Carga de registro completa, estamos listo para ingresar en modo OFFLINE."
            );
          } catch (oError) {
            console.log(oError);
            MessageBox.msgError("Error al cargar registros...");
          }
        } else {
          MessageBox.msgAlerta(
            "Para sincronizar los registros es necesario tener una conexión..."
          );
        }
        BusyIndicator.hide();
      },
      onLine: async function () {
        const offlineUsuario = window.localStorage.getItem("usuario");
        const offlineClave = window.localStorage.getItem("clave");
        let result = await grupoOrden.auth(offlineUsuario, offlineClave);
        if (result.iCode == "1" && result.oResult.value) {
          var oUserLogin = result.oResult.value.data.results[0];
          if (!oUserLogin) {
            BusyIndicator.hide();
            return MessageBox.msgError(
              "El Usuario y/o contraseña incorrectos."
            );
          }

          if (!oUserLogin || !(oUserLogin.aRol && oUserLogin.aRol.length)) {
            BusyIndicator.hide();
            return MessageBox.msgError(
              "Error de acceso, puede que tu usuario no tiene permisos para acceder a la aplicación."
            );
          }
          //await sync.sync();

          var oUsuario = oUserLogin.oUsuario;
          oUsuario.aRol = oUserLogin.aRol;
          const oConfig = await configSrv.obtenerConfiguracion();
          this.oLocalModel.setProperty("/Config", oConfig);
          this.oLocalModel.setProperty("/Online", true);
          this.oLocalModel.setProperty("/InfoUsuario", oUsuario);

          let oOpciones = this.getPermisos(oUsuario.aRol);

          if (!oOpciones.MenuOpcion) {
            MessageBox.msgAlerta("No tiene permisos para ingresar al Menú.");
            BusyIndicator.hide();
            return;
          }

          this.oLocalModel.setProperty("/Opciones", oOpciones);

          BusyIndicator.hide();
          if (!oConfig.salaPesajeId) {
            BusyIndicator.show(0);
            BusyIndicator.hide();
            this.oRouter.navTo("configuracion");
          } else {
            this.oRouter.navTo("menu");
          }

          this.oLocalModel.setProperty(
            "/usuarioNombreCompleto",
            oUsuario.apellidoPaterno +
              " " +
              oUsuario.apellidoMaterno +
              ", " +
              oUsuario.nombre
          );

          window.localStorage.setItem("usuario", offlineUsuario);
          window.localStorage.setItem("clave", offlineClave);
          window.localStorage.setItem("InfoUsuario", JSON.stringify(oUsuario));
          window.localStorage.setItem("usuarioCodigo", oUsuario.usuario);
        }
      },
      actualizarReloj: function () {
        let self = this;
        this.oLocalModel.setProperty("/fecha", new Date());
        var bOnline = false;
        if (navigator.onLine) bOnline = true;
        this.oLocalModel.setProperty("/Online", bOnline);

        setTimeout(function () {
          self.actualizarReloj();
        }, 1000);
      },
      requestToken: function () {
        const config =
          this.getOwnerComponent().getManifestEntry("/sap.ui5/config");
        let url = config.oauth.url;
        url += "/oauth/token?grant_type=password";
        url += "&username=" + config.oauth.username;
        url += "&password=" + config.oauth.password;
        url += "&client_id=" + config.oauth.clientid;
        url += "&clientsecret=" + config.oauth.clientsecret;
        url += "&response_type=token";

        const headers = {
          Authorization:
            "Basic " +
            btoa(config.oauth.clientid + ":" + config.oauth.clientsecret),
        };

        return http.httpGet(url, headers);
      },
      doMessageboxActionCustom: function (sMessage, aOptionsBtn, contentWidth) {
        return new Promise(function (resolve, reject) {
          MessageBox.warning(sMessage, {
            icon: MessageBox.Icon.INFORMATION,
            title: "Confirmar",
            actions: aOptionsBtn,
            emphasizedAction: aOptionsBtn[0],
            contentWidth: !contentWidth ? "60%" : contentWidth,
            styleClass: "",
            onClose: function (oAction) {
              resolve(oAction);
            },
          });
        });
      },
      _UniqByKeepFirst: function (aData, key) {
        var seen = new Set();
        return aData.filter((item) => {
          var k = key(item);
          return seen.has(k) ? false : seen.add(k);
        });
      },
      openDialog: async function (dialogName, oParam) {
        const oView = this.getView();
        let oController = null;
        if (!window["Dialog" + dialogName]) {
          oController = new sap.ui.controller(
            "mif.cp.fraccionamiento.controller.fragment." + dialogName
          );
          window["Dialog" + dialogName] = await Fragment.load({
            id: oView.getId(),
            name: "mif.cp.fraccionamiento.view.fragment." + dialogName,
            controller: oController,
          });
          window["DialogController" + dialogName] = oController;
          this.getView().addDependent(window["Dialog" + dialogName]);
          oController.oView = this.getView();
          oController.oParam = oParam;
          oController.onInit();
        } else {
          oController = window["DialogController" + dialogName];
          oController.oView = this.getView();
          oController.oParam = oParam;
        }

        window["Dialog" + dialogName].open();
        if (oController.onAfterRendering) oController.onAfterRendering();
      },
      getPermisos: function (aAccion) {
        let oOpciones = {};
        oOpciones.MenuOpcion =
          aAccion.filter((d) => d.accion == "MOFRAC").length > 0;
        oOpciones.ConsolidadoDocumentos =
          aAccion.filter((d) => d.accion == "CDFRAC").length > 0;
        oOpciones.AtencionDocumentos =
          aAccion.filter((d) => d.accion == "ADFRAC").length > 0;
        oOpciones.FraccionarPesaje =
          aAccion.filter((d) => d.accion == "FPFRAC").length > 0;
        oOpciones.Pesaje =
          aAccion.filter((d) => d.accion == "PFRAC").length > 0;
        oOpciones.TaraManual =
          aAccion.filter((d) => d.accion == "TMFRAC").length > 0;
        oOpciones.PesarBultoSaldo =
          aAccion.filter((d) => d.accion == "PBFRAC").length > 0;
        oOpciones.NuevoBultoSaldo =
          aAccion.filter((d) => d.accion == "PBNUEV").length > 0;
        oOpciones.TrasladarHu =
          aAccion.filter((d) => d.accion == "TRASHU").length > 0;
        oOpciones.Configuracion =
          aAccion.filter((d) => d.accion == "OCFRAC").length > 0;
        oOpciones.ReembalajeHU =
          aAccion.filter((d) => d.accion == "RHUFRAC").length > 0;
        return oOpciones;
      },
      _factConvertDimension: function (
        dimencionFrom,
        subjectFrom,
        from,
        dimencionTo,
        to,
        fact
      ) {
        //this._factConvertDimension("VOLUMEN", 181.8, "L", "MASA", "KG", 0.909);
        var oDimen = {
          VOLUMEN: {
            MASA: {
              from: "L",
              to: "KG",
              operation: "*",
            },
          },
          MASA: {
            VOLUMEN: {
              from: "KG",
              to: "L",
              operation: "/",
            },
            UNIDAD: {
              from: "KG",
              to: "MLL",
              operation: "/",
            },
          },
          UNIDAD: {
            MASA: {
              from: "MLL",
              to: "KG",
              operation: "*",
            },
          },
        };

        /**
         * Evalua que las dimenciones y unidades de medidas cumplan con la logica de conversion
         */
        var oConvertFact = oDimen[dimencionFrom][dimencionTo];
        if (from == oConvertFact.from && to == oConvertFact.to) {
          if (oConvertFact.operation == "*") {
            oConvertFact.value = subjectFrom * fact;
            return oConvertFact;
          } else if (oConvertFact.operation == "/") {
            oConvertFact.value = subjectFrom / fact;
            return oConvertFact;
          }
          return "NONE";
        } else {
          return "NONE";
        }
      },
      _checkTipoBalanza: function (from, subject) {
        //this._checkTipoBalanza("KG", 181.8);
        var aTipoBalanzaReq = [
          { balanza: "ANALITICA", umb: "G", from: 0, to: 100, baseUmb: "G" },
          { balanza: "MESA", umb: "G", from: 100, to: 32000, baseUmb: "KG" },
          { balanza: "PISO", umb: "G", from: 32000, to: 150000, baseUmb: "KG" },
        ];

        subject = this._jsConvertUnits("MASA", from, "G", subject);

        var oTipoBalanzaReq = aTipoBalanzaReq.find((o) => {
          return subject > o.from && subject <= o.to;
        });

        return oTipoBalanzaReq;
      },
      _checkDimensionUnits: function (from, to) {
        //this._checkDimensionUnits( objBalanza.oUnidad.codigo, oFraccionamiento.unidad);
        to = to.toString().toUpperCase().trim();
        from = from.toString().toUpperCase().trim();

        var MASA = ["MCG", "MG", "G", "KG", "TON", "OZ", "LB"];
        var VOLUMEN = [
          "BOE",
          "FT3",
          "IN3",
          "YD3",
          "MM3",
          "CM3",
          "M3",
          "L",
          "ML",
          "CL",
          "DL",
          "HL",
        ];

        var UNIDAD = ["MLL"];

        var toDimension = VOLUMEN.includes(to)
          ? "VOLUMEN"
          : MASA.includes(to)
          ? "MASA"
          : "NONE";

        if (toDimension == "NONE") {
          toDimension = UNIDAD.includes(to)
            ? "UNIDAD"
            : MASA.includes(to)
            ? "MASA"
            : "NONE";
        }

        var fromDimension = VOLUMEN.includes(from)
          ? "VOLUMEN"
          : MASA.includes(from)
          ? "MASA"
          : "NONE";

        if (fromDimension == "NONE") {
          fromDimension = UNIDAD.includes(from)
            ? "UNIDAD"
            : MASA.includes(from)
            ? "MASA"
            : "NONE";
        }

        if (toDimension == "NONE" || fromDimension == "NONE") {
          // Una de las unidades de conversion no esta registrado en el calculo de conversion
          return "NONE";
        } else {
          if (toDimension == fromDimension) {
            //La unidades pertenecen a la misma dimension y pueden realizarse el calculo de conversion
            return toDimension;
          } else {
            // Requiere Aplicar factor de conversion por DIMENSIONES diferentes
            /**
             * VOLUMEN A MASA: se requiere que la unidad del volumen sea L (Litros)  para pasar a KG (Kilogramos)
             * MASA A VOLUMEN: se requiere que la unidad de la masa sea KG (Kilogramos) para pasar a  L (Litros)
             */
            return "FACT";
          }
        }
      },

      _jsConvertUnits: function (dimencion, from, to, subject) {
        //this._jsConvertUnits("MASA", "KG", "G", 165.2562);
        var oConversion = {
          special: {
            TEMPERATURA: {
              Kelvin: {
                toKelvin: function (e) {
                  return e;
                },
                toCelsius: function (e) {
                  return e - 273.15;
                },
                toFahrenheit: function (e) {
                  return e * (9 / 5) - 459.67;
                },
                toRankine: function (e) {
                  return e * (9 / 5);
                },
              },
              Celsius: {
                toKelvin: function (e) {
                  return e + 273.15;
                },
                toCelsius: function (e) {
                  return e;
                },
                toFahrenheit: function (e) {
                  return e * (9 / 5) + 32;
                },
                toRankine: function (e) {
                  return (e + 273.15) * (9 / 5);
                },
              },
              Fahrenheit: {
                toKelvin: function (e) {
                  return ((e + 459.67) * 5) / 9;
                },
                toCelsius: function (e) {
                  return ((e - 32) * 5) / 9;
                },
                toFahrenheit: function (e) {
                  return e;
                },
                toRankine: function (e) {
                  return e + 459.67;
                },
              },
              Rankine: {
                toKelvin: function (e) {
                  return (e * 5) / 9;
                },
                toCelsius: function (e) {
                  return ((e - 491.67) * 5) / 9;
                },
                toFahrenheit: function (e) {
                  return e;
                },
                toRankine: function (e) {
                  return (e * 9) / 5;
                },
              },
            },
          },
          master: {
            TEMPERATURA: {
              Celsius: "1",
              Kelvin: "1",
              Fahrenheit: "1",
              Rankine: "1",
            },
            DATA: {
              Bit: "1",
              Kilobit: "0.001",
              Megabit: "0.000001",
              Gigabit: "1.0e-9",
              Terabit: "1.0e-12",
              Petabit: "1.0e-15",
              Exabit: "1.0e-18",
              Zettabit: "1.0e-21",
              Yottabit: "1.0e-24",
              Byte: "0.125",
              Kilobyte: "0.00012207",
              Megabyte: "1.1920929e-7",
              Gigabyte: "1.16415322e-10",
              Terabyte: "1.13686838e-13",
              Petabyte: "1.11022302e-16",
              Exabyte: "1.08420217e-19",
              Zettabyte: "1.05879118e-22",
              Yottabyte: "1.03397577e-25",
            },
            DATA_TRASFER: {
              "Bit/Second": "1048576",
              "Bit/Minute": "62914560",
              "Bit/Hour": "3774873600",
              "Byte/Second": "131072",
              "Byte/Minute": "7864320",
              "Byte/Hour": "471859200",
              "Kilobit/Second": "1024",
              "Kilobit/Minute": "61440",
              "Kilobit/Hour": "3686400",
              "Kilobyte/Second": "128",
              "Kilobyte/Minute": "768",
              "Kilobyte/Hour": "460800",
              "Megabit/Second": "1",
              "Megabit/Minute": "60",
              "Megabit/Hour": "3600",
              "Megabyte/Second": "0.125",
              "Megabyte/Minute": "7.5",
              "Megabyte/Hour": "450",
              "Gigabit/Second": "0.000976563",
              "Gigabit/Minute": "0.05859378",
              "Gigabit/Hour": "3.5156268",
              "Gigabyte/Second": "0.00012207",
              "Gigabyte/Minute": "7.3242e-3",
              "Gigabyte/Hour": "0.439452",
              "Terabit/Second": "0.000000954",
              "Terabit/Minute": "5.724e-5",
              "Terabit/Hour": "3.4344e-3",
              "Terabyte/Second": "0.000000119",
              "Terabyte/Minute": "7.14e-6",
              "Terabyte/Hour": "4.284e-4",
              Ethernet: "0.1048576",
              "Ethernet(fast)": "0.01048576",
              "Ethernet(Gigabit)": "0.001048576",
              "ISDN(single)": "16.384",
              "ISDN(dual)": "8.192",
              "Modem(110)": "9532.509090909",
              "Modem(300)": "3495.253333333",
              "Modem(1200)": "873.8133333333",
              "Modem(2400)": "436.9066666667",
              "Modem(9600)": "109.2266666667",
              "Modem(14.4k)": "72.8177777778",
              "Modem(28.8k)": "36.4088888889",
              "Modem(33.6k)": "31.207619048",
              "Modem(56k)": "18.724571429",
              USB: "0.0873813333",
              "Firewire(IEEE-1394)": "0.00262144",
            },
            DISTANCIA: {
              Nanómetro: "1e+09",
              Micrómetro: "1e+06",
              Milímetro: "1000",
              Centimeter: "100",
              Decímetro: "10",
              Metro: "1.000",
              Kilómetro: "0.001",
              Picómetro: "1e+12",
              Femtómetro: "1e+15",
              Attommeter: "1e+18",
              Zeptometer: "1e+21",
              Yoctometer: "1e+24",
              Pulgada: "39.3701",
              Pie: "3.28084",
              Yarda: "1.09361",
              Milla: "0.000621371",
              "Milla(naútica)": "0.000539957",
              "Año luz": "1.057e-16",
              "Día luz": "3.860e-14",
              "Minuto luz": "5.5594e-11",
              "Segundo luz": "3.33564e-9",
              "Astron. Unit": "6.68459e-12",
              Parsec: "3.24078e-17",
              Chain: "0.0497097",
              Furlong: "0.00497097",
              Point: "2834.64",
              Cun: "30",
              Chi: "3",
              Li: "3000",
              Gongli: "6000",
            },
            FUERZA: {
              Newton: "1",
              Kilonewton: "0.001",
              Milinewton: "1000",
              Dina: "100000",
              "Joule/Metro": "1",
              Pond: "101.971621298",
              Kilopond: "0.101971621298",
            },
            POTENCIA: {
              Watt: "1",
              Milliwatt: "1000",
              Kilowatt: "0.001",
              Megawatt: "0.000001",
              "Joule/Segundo": "1",
              "Kilojoule/Segundo": "0.001",
              Horsepower: "0.001341",
              "Horsepower(metric)": "0.0013596",
              "Horsepower(Boiler)": "0.000102",
              "Decibel Milliwatt": "30",
              "Calories/Second": "0.238846",
              "Calories/Hour": "859.8456",
              "Kilocalories/Second": "0.000238846",
              "Kilocalories/Hour": "0.8598456",
              "Foot-Pound/Second": "0.737562",
              "Foot-Pound/Hour": "2655.22",
              "Newton Meter/Second": "1",
              "Newton Meter/Hour": "3600",
              "BTU/Second": "0.000947817",
              "BTU/Minute": "0.056869",
              "BTU/Hour": "3.41214",
            },
            PRESION: {
              Pascal: "1.0",
              Kilopascal: "0.001",
              Hectopascal: "0.01",
              Millipascal: "1000",
              "Newton/Metro cuadrado": "1",
              Bar: "0.00001",
              Millibar: "0.01",
              "Kip/Inch": "0.000000145",
              "Pounds/Inch": "0.000145038",
              Torr: "0.007500617",
              "Millimeter Mercury": "0.00750062",
              "Inches Mercury": "0.000295301",
            },
            RADIOACTIVIDAD: {
              Curie: "1",
              Kilocurie: "0.001",
              Millicurie: "1000",
              Microcurie: "1000000",
              Nanocurie: "1000000000",
              Picocurie: "1e+12",
              Becquerel: "3.7e+10",
              Terabecquerel: "0.037",
              Gigabecquerel: "37",
              Megabecquerel: "37000",
              Kilobecquerel: "37000000",
              Milliecquerel: "3.7e+13",
              Rutherford: "37000",
              "1/Second": "3.7e+10",
              "Disintegrations/Second": "3.7e+10",
              "Disintegrations/Minute": "2.22e+12",
            },
            TIEMPO: {
              Milisegundo: "604800000",
              Microsegundo: "604800000000",
              Nanosegundo: "604800000000000",
              Segundo: "604800",
              Minuto: "10080",
              Hora: "168",
              Día: "7",
              Semana: "1",
              "Mes(31)": "0.22580645",
              "Mes(30)": "0.2333333333",
              "Mes(29)": "0.24137931",
              "Mes(28)": "0.25",
              Año: "0.019165",
            },
            VELOCIDAD: {
              "Metro/Segundo": "4.4704e-1",
              "Metro/Hora": "1.609344e+3",
              "Kilometro/Hora": "1.609344",
              "Pie/Hora": "5.28e+3",
              "Yarda/Hora": "1.76e+3",
              "Millas/Hora": "1",
              Nudos: "8.68976242e-1",
              "Mach(SI Standard)": "1.51515152e-3",
              "Velocidad de la luz": "1.49116493e-9",
            },
            DENSIDAD: {
              "Kilogramo/Litro": "0.001",
              "Gramo/Litro": "1",
              "Milígramo/Litro": "1000",
              "Microgramo/Litro": "1000000",
              "Nanogramm/Liter": "1000000000",
              "Kilogramo/Metro cúbico": "1",
              "Gramo/Metro cúbico": "1000",
              "Kilogramo/Centímetro cúbico": "0.000001",
              "Gramo/Centímetro cúbico": "0.001",
              "Gramo/Milímetro cúbico": "0.000001",
              "Pound/Inch": "0.00003613",
              "Pound/Foot": "0.06242796",
              "Ounze/Inch": "0.00057804",
              "Ounze/Foot": "0.99884737",
            },
            VOLUMEN: {
              BOE: "6.28981",
              FT3: "35.31466621",
              IN3: "61023.74409473",
              YD3: "1.30796773",
              MM3: "1000000000",
              CM3: "1000000",
              M3: "1",
              L: "1000",
              ML: "1000000",
              CL: "100000",
              DL: "10000",
              HL: "10",
            },
            MASA: {
              MCG: "1000000",
              MG: "1000",
              G: "1",
              KG: "0.001",
              TON: "0.000001",
              OZ: "0.035273962",
              LB: "0.00220462262",
            },
            UNIDAD: {
              MLL: "1",
            },
          },
        };
        dimencion =
          dimencion.toUpperCase().substring(0, 1) + dimencion.substring(1);
        to = to.toString().toUpperCase().trim();
        from = from.toString().toUpperCase().trim();
        subject = subject.toString().toUpperCase().trim();
        var specialTest = false;
        for (var i in oConversion.special) {
          if (i == dimencion) {
            specialTest = i;
          }
        }
        if (specialTest !== false) {
          if (typeof oConversion.special[specialTest][from] !== "undefined") {
            return oConversion.special[specialTest][from]["to" + to](subject);
          }
          return false;
        }
        return (
          (oConversion.master[dimencion][to] /
            oConversion.master[dimencion][from]) *
          subject
        );
        //.toFixed(3)

        //jsConvertUnits('MASA', 'KG', 'G', '1');
        //jsConvertUnits('VOLUMEN', 'ML', 'L', '1000');
      },
    });
  }
);
