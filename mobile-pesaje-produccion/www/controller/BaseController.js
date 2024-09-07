sap.ui.define(
  [
    "sap/ui/core/routing/History",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "../service/oDataService",
  ],
  function (
    History,
    Controller,
    UIComponent,
    mobileLibrary,
    JSONModel,
    formatter,
    oDataService
  ) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;
    var SRV_API = {
      api: "/api/v1/cp",
      srvOdata: "/v2/browse",
      srvOdataSapErp: "/v2/Z_PP_CENTRALPESADAS_SRV",
      origin:
        "https://medifarmadevqas-dev-rmd-cp-cp-srv.cfapps.us10.hana.ondemand.com",
      password: "",
      username: "",
    };

    return Controller.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.BaseController",
      {
        constructor: function () {
          this.oi18n = null;
          this.formatter = formatter;
          this.arguments = null;
          this.oMainModel = null;
          this.oRouter = null;
        },
        init: function () {
          this.oi18n = this.getResourceBundle();
          this.oMainModel = this.getOwnerComponent().getModel();
          this.oRouter = this.getRouter();
          this.oRouter.attachEvent(
            "routeMatched",
            {},
            this.onRouteMatched,
            this
          );
        },
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
          return UIComponent.getRouterFor(this);
          //return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
          return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        getUserLogin: function () {
          var dataUser = {};
          try {
            dataUser.email = sap.ushell.Container.getService("UserInfo")
              .getUser()
              .getEmail();
          } catch (oError) {}

          if (!dataUser.email) {
            try {
              var userModel = new JSONModel();
              userModel.loadData("/services/userapi/attributes", null, false);
              dataUser = userModel.getData();
            } catch (oError) {}
          }

          if (
            dataUser.email === "DEFAULT_USER" ||
            dataUser.email === undefined
          ) {
            if (
              window.location.href.includes("workspaces") ||
              window.location.href.includes("webidecp") ||
              window.location.href.includes("localhost")
            ) {
              dataUser.email = "elvis.percy.garcia.tincopa@everis.com";
            }
          }

          return dataUser;
        },

        _SRV_API: function () {
          return SRV_API;
        },
        _configServiceExternalApi: function () {
          const oConfig =
            this.getOwnerComponent().getManifestEntry("/sap.ui5/oConfig");

          //if (sap.ui.Device.os.android || sap.ui.Device.os.ios)
          if (!oConfig.destinations) {
            var oSrvApi = this._SRV_API();
            return oSrvApi.origin + oSrvApi.api;
          } else {
            return false;
          }
        },

        _configServiceExternal: function () {
          const oConfig =
            this.getOwnerComponent().getManifestEntry("/sap.ui5/config");

          //if (sap.ui.Device.os.android || sap.ui.Device.os.ios)
          if (!oConfig.destinations) {
            jQuery.sap.require("sap.ui.model.odata.datajs");
            var oSrvApi = this._SRV_API();

            var oModel = new sap.ui.model.odata.v2.ODataModel({
              serviceUrl: oSrvApi.origin + oSrvApi.srvOdata,
            });

            var oModelSapErp = new sap.ui.model.odata.v2.ODataModel({
              serviceUrl: oSrvApi.origin + oSrvApi.srvOdataSapErp,
            });
            return {
              oModel: oModel,
              oModelSapErp: oModelSapErp,
            };
          } else {
            return false;
          }

          /*oParameter = {
            serviceUrl:
              //"http://sapes5.sapdevcenter.com/sap/opu/odata/iwbep/GWSAMPLE_BASIC",
              "proxy/http/sapes5.sapdevcenter.com/sap/opu/odata/iwbep/GWSAMPLE_BASIC",
            user: "P2000546367",
            password: "SapGatewayPeru2019",
            headers: {
              "Access-Control-Allow-Origin": "http://localhost:8080",
              "Access-Control-Allow-Credentials": "true",
            },
          };*/
          /*
          var oParameter = {
            serviceUrl: "http://services.odata.org/Northwind/Northwind.svc",
            headers: {
              myHeader1: "value1",
              myHeader2: "value2",
            },
            serviceUrlParams: {
              myParam: "value1",
              myParam2: "value2",
            },
            metadataUrlParams: {
              myParam: "value1",
              myParam2: "value2",
            },
            user:"",
            password:""
          };
          
          var oModel = new sap.ui.model.odata.v2.ODataModel(oParameter);
          oModel.create("/Products", oData, {success: mySuccessHandler, error: myErrorHandler});
          */

          /*var oModel = new sap.ui.model.odata.ODataModel(
            oParameter.serviceUrl,
            true,
            oParameter.user,
            oParameter.password
          );*/
        },
        /**-----------------------------------------------*/
        /*              E V E N T S
        /**-----------------------------------------------*/

        _onQRScan: function () {
          //http://www.barcode-generator.org/

          var oOptions = this._optionsBarCode();
          return new Promise(function (resolve, reject) {
            //window.parent.cordova.plugins.barcodeScanner.scan
            //window.cordova.plugins.barcodeScanner.scan
            cordova.plugins.barcodeScanner.scan(
              function (oResult) {
                if (
                  [
                    //"CODE_128",
                    "QR_CODE",
                  ].includes(oResult.format)
                ) {
                  resolve(oResult);
                } else {
                  resolve(false);
                }
              },
              function (oError) {
                sap.ui.core.BusyIndicator.hide();
                console.log(oError);
                reject(oError);
              },
              oOptions
            );
          });
        },

        _optionsBarCode: function () {
          var oOptions = {
            preferFrontCamera: false, // iOS and Android
            showFlipCameraButton: true, // iOS and Android
            showTorchButton: true, // iOS and Android
            torchOn: true, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt: "Escanea el código QR", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
            orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations: true, // iOS
            disableSuccessBeep: false, // iOS and Android
          };

          return oOptions;
        },

        _onScanError: function (error) {
          console.log(oError);
          alert(oError);
        },

        /**-----------------------------------------------*/
        /*          M E T H O D S   C U S T O M
        /**-----------------------------------------------*/

        fnGetErpDinamic: function (oModel, sEntity, oParams, aFilter) {
          var oParameters = {
            entity: sEntity,
            urlParameters: JSON.stringify(oParams),
            filters: JSON.stringify(aFilter),
          };
          sap.ui.core.BusyIndicator.show(0);
          return new Promise(function (resolve, reject) {
            oDataService
              .oDataRead(oModel, "fnGetErpDinamic", oParameters, [])
              .then((oData) => {
                sap.ui.core.BusyIndicator.hide();
                var aResult = oData.fnGetErpDinamic.d
                  ? oData.fnGetErpDinamic.d.results
                  : null;
                if (!aResult && oData.fnGetErpDinamic) {
                  aResult = oData.fnGetErpDinamic.d
                    ? oData.fnGetErpDinamic.d.results
                    : null;
                }
                if (aResult && aResult.length > 0) {
                  resolve(aResult);
                }

                var oError = oData.error ? oData : null;
                if (!oError && oData.fnGetErpDinamic) {
                  oError = oData.fnGetErpDinamic.error
                    ? oData.fnGetErpDinamic
                    : null;
                }

                if (oError) {
                  reject(oError);
                } else {
                  resolve(false);
                }
              })
              .catch((oError) => {
                sap.ui.core.BusyIndicator.hide();
                reject(oError);
              });
          });
        },
        acPostErpDinamic: function (oModel, sEntity, oContent) {
          var oBody = {
            entity: sEntity,
            oBody: JSON.stringify(oContent),
          };

          sap.ui.core.BusyIndicator.show(0);
          return new Promise(function (resolve, reject) {
            oDataService
              .oDataCreate(oModel, "acPostErpDinamic", oBody)
              .then((oData) => {
                sap.ui.core.BusyIndicator.hide();
                var oResult = oData.data ? oData.data.acPostErpDinamic.d : null;
                if (oResult) {
                  resolve(oResult);
                } else {
                  var oError = oData.data
                    ? oData.data.acPostErpDinamic.error
                    : null;

                  if (oError) {
                    reject(oError);
                  } else {
                    resolve(false);
                  }
                }
              })
              .catch((oError) => {
                sap.ui.core.BusyIndicator.hide();
                reject(oError);
              });
          });
        },
        _getConstant: function (that, oModel) {
          var that = that;
          var oView = that.getView();
          var oModel = oModel;

          if (!oModel) {
            oModel = oView.getModel();
          }

          var oUrlParameters = {
            $expand: "oMaestraTipo",
          };
          that
            ._getODataDinamic(oModel, "Maestra", oUrlParameters, null, null)
            .then(
              (aResult) => {
                if (aResult) {
                  var aConstant = aResult.reduce(function (r, a) {
                    r[a.oMaestraTipo.tabla] = r[a.oMaestraTipo.tabla] || [];
                    r[a.oMaestraTipo.tabla].push({
                      oMaestraTipo_maestraTipoId: a.oMaestraTipo_maestraTipoId,
                      oMaestraTipo_tabla: a.oMaestraTipo.tabla,
                      oMaestraTipo_nombre: a.oMaestraTipo.nombre,
                      iMaestraId: a.iMaestraId,
                      contenido: a.contenido,
                      descripcion: a.descripcion,
                      orden: a.orden,
                      codigo: a.codigo,
                      codigoSap: a.codigoSap,
                      activo: a.activo
                        ? a.oMaestraTipo.activo
                          ? true
                          : false
                        : false,
                    });
                    return r;
                  }, Object.create(null));

                  that
                    .getView()
                    .setModel(new JSONModel(aConstant), "ConstantModel");
                }
              },
              function (oError) {
                console.log(oError);
                sap.ui.core.BusyIndicator.hide();
              }
            );
        },
        _getDataLogin: function () {
          return JSON.parse(window.localStorage.getItem("UserInfoModel"));
        },
        _getAcctions: function (sModulo) {
          var aData = this._getDataLogin();
          var oAccion = null;
          if (aData) {
            var oUser = aData.oUsuario;
            var aRol = aData.aRol;

            var dateFrom = formatter.getTimestampToMDY(
              new Date(oUser.fechaVigInicio)
            );
            var dateTo = formatter.getTimestampToMDY(
              new Date(oUser.fechaVigFin)
            );
            var dateNow = formatter.getTimestampToMDY(new Date());

            var from = new Date(dateFrom);
            var to = new Date(dateTo);
            var check = new Date(dateNow);

            //Valida si la fecha actual esta en el rango de vigencia del usuario
            if (check > from && check < to) {
              var aGroupRole = [];
              if (sModulo == "IFA") {
                //VERIFICACION IFA
                //REPORTE BULTO PENDIENTE CONFIRMAR
                aGroupRole = aRol["VIFA"];
                oAccion = {
                  ifaView: aGroupRole.find((o) => o.accion === "VIFAVIEW"), //INGRESAR MODULO
                  ifaSave: aGroupRole.find((o) => o.accion === "VIFAGUAR"), //GUARDAR
                  ifaConfirm: aGroupRole.find((o) => o.accion === "VIFACONF"), //CONFIRMAR
                  ifaReset: aGroupRole.find((o) => o.accion === "VIFARESET"), //RESETEAR
                  ifaFullControl: aGroupRole.find(
                    (o) => o.accion === "VIFAOWNER"
                  ), //CONTROL TOTAL
                };
              } else if (sModulo == "SAL") {
                //IMPRESION BULTO SALDO
                aGroupRole = aRol["ISAL"];
                oAccion = {
                  salView: aGroupRole.find((o) => o.accion === "ISALVIEW"), //INGRESAR MODULO
                  salSave: aGroupRole.find((o) => o.accion === "ISALGUAR"), //GUARDAR
                  salPrint: aGroupRole.find((o) => o.accion === "ISALIMPR"), //IMPRIMIR
                  salFullControl: aGroupRole.find(
                    (o) => o.accion === "ISALOWNER"
                  ), //CONTROL TOTAL
                };
              } else if (sModulo == "TRAS") {
                //ENTREGA A PRODUCCION
                aGroupRole = aRol["TRAS"];
                oAccion = {
                  enpView: aGroupRole.find((o) => o.accion === "TRASVIEW"), //INGRESAR MODULO
                  enpRecoger: aGroupRole.find((o) => o.accion === "EPRORECO"), //RECOGER
                  enpRecepcion: aGroupRole.find((o) => o.accion === "EPRORECE"), //RECEPCION
                  enpDevProduccion: aGroupRole.find(
                    (o) => o.accion === "EPRODPRD"
                  ), //DEVOLUCION PRODUCCION
                  enpDevAlmancen: aGroupRole.find(
                    (o) => o.accion === "EPRODALM"
                  ), //DEVOLUCION ALMACEN
                  enpFullControl: aGroupRole.find(
                    (o) => o.accion === "EPROOWNER"
                  ), //CONTROL TOTAL
                };
              }
            } else {
              /*Fecha Vigencia de usuario caducado, volver a logearse*/
              window.localStorage.setItem("login", JSON.stringify({}));
              return null;
            }
          }

          return oAccion;
        },
        _addConstantFilter: function (queryText) {
          var aFilters = [];
          if (queryText) {
            aFilters.push(
              new Filter(
                [
                  new Filter("<property>", FilterOperator.Contains, queryText),
                  new Filter("<property>", FilterOperator.Contains, queryText),
                ],
                false
              )
            );
          } else {
            aFilters = null;
          }
          return aFilters;
        },

        _weight: function (iValue) {
          return formatter.formatCoin(iValue);
        },

        _getFormatQr: function (sCode) {
          var sQr = sCode;
          var aQrVar = sQr.split("$");

          var oBulto = {};
          if (aQrVar.length == 1) {
            //Etiqueta
            var Etiqueta = aQrVar[0].trim();
            if (Etiqueta) {
              oBulto = {
                Etiqueta: Etiqueta,
                IdBulto: null,
                CodigoInsumo: null,
                Lote: null,
              };
              return oBulto;
            }
          } else if (aQrVar.length >= 3) {
            //QR Code
            var IdBulto = aQrVar[0].trim(),
              CodigoInsumo = aQrVar[1].trim(),
              Lote = aQrVar[2].trim();
            if (![IdBulto, CodigoInsumo, Lote].includes("")) {
              oBulto = {
                Etiqueta: null,
                IdBulto: IdBulto,
                CodigoInsumo: CodigoInsumo,
                Lote: Lote,
              };
              return oBulto;
            }
          }

          return false;
        },

        _getFormatQrProd: function (sCode) {
          var aQrVar = sCode.split("$");

          if (aQrVar.length === 4) {
            //QR Code
            let IdBulto = aQrVar[0].trim(),
              CodigoInsumo = aQrVar[1].trim(),
              Lote = aQrVar[2].trim(),
              Etiqueta = aQrVar[3].trim(),
              sType = "";

            if (
              IdBulto !== "" &&
              CodigoInsumo !== "" &&
              Lote !== "" &&
              Etiqueta !== ""
            )
              sType = "ENTERO";
            else if (IdBulto === "") sType = "FRACCION";
            else sType = "GRUPO";

            return {
              Etiqueta,
              IdBulto,
              CodigoInsumo,
              Lote,
              sType,
            };
          }

          return false;
        },

        _isBetween: function (start, end, x) {
          if (x >= start && x <= end) {
            return true;
          } else {
            return false;
          }
        },
        _getPercentChange: function (oldNumber, newNumber) {
          /*Porcentaje de diferencia de 2 numeros */
          var decreaseValue = oldNumber - newNumber;
          var result = (decreaseValue / oldNumber) * 100;
          result = result < 0 ? Math.abs(result) : result * -1;
          return result;
        },
        _valNumberPos: function (number, decimal) {
          if (number >= 0) {
            return this._decimalCount(number) > decimal
              ? this._toFixed(number, decimal)
              : formatter.formatCoin(number);
          } else {
            return 0;
          }
        },
        _decimalCount: function (number) {
          const decimalCount = (num) => {
            const numStr = String(num);
            if (numStr.includes(".")) {
              return numStr.split(".")[1].length;
            }
            return 0;
          };

          return decimalCount(number);
        },
        _toFixed: function (number, decimals) {
          var newnumber = new Number(number + "").toFixed(parseInt(decimals));
          return parseFloat(newnumber);
        },

        /**-----------------------------------------------*/
        /*         F R A G M E N T S / D I A L O G S
        /**-----------------------------------------------*/

        _openDialogDinamic: function (sSubFolderName, sDialog) {
          var sDialogName = "o" + sDialog;
          if (!this[sDialogName]) {
            this[sDialogName] = sap.ui.xmlfragment(
              "frg" + sDialog,
              rootPath +
                ".view." +
                (sSubFolderName ? sSubFolderName + "." : "") +
                sDialog,
              this
            );
            this.getView().addDependent(this[sDialogName]);
          }
          this[sDialogName].open();
        },
        _onCloseDialog: function (oSource) {
          //var oSource = oEvent.getSource();
          //var sCustom = oSource.data("custom");
          var oParent = oSource.getParent();
          oParent.close();
        },

        /**-----------------------------------------------*/
        /*              C O N S T A N T S
        /**-----------------------------------------------*/

        _getI18nText: function (sText) {
          return this.oView.getModel("i18n") === undefined
            ? false
            : this.oView.getModel("i18n").getResourceBundle().getText(sText);
        },
        _busPublish: function (sRouteName) {
          var bus = sap.ui.getCore().getEventBus();
          bus.publish("nav", "to", {
            id: sRouteName,
          });
        },
        _navTo: function (sRoute, oParameter) {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          if (oParameter) {
            oRouter.navTo(sRoute, oParameter);
          } else {
            oRouter.navTo(sRoute, true);
          }
        },
        onNavBack: function (oEvent) {
          var oInstance = History.getInstance();
          var oPreviousHash = oInstance.getPreviousHash();
          var oQueryParameters = this.getQueryParameters(window.location);
          if (
            oPreviousHash !== undefined ||
            oQueryParameters.navBackToLaunchpad
          ) {
            window.history.go(-1);
          } else {
            this._navTo("Inicio", null);
          }
        },
        getQueryParameters: function (oLocation) {
          var oDecodeURI = {};
          var aSearch = oLocation.search.substring(1).split("&");
          for (var iIndex = 0; iIndex < aSearch.length; iIndex++) {
            var aUri = aSearch[iIndex].split("=");
            oDecodeURI[aUri[0]] = decodeURIComponent(aUri[1]);
          }
          return oDecodeURI;
        },

        _UniqByKeepFirst: function (aData, key) {
          var seen = new Set();
          return aData.filter((item) => {
            var k = key(item);
            return seen.has(k) ? false : seen.add(k);
          });
        },
        md5: function (string) {
          function RotateLeft(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
          }

          function AddUnsigned(lX, lY) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = lX & 0x80000000;
            lY8 = lY & 0x80000000;
            lX4 = lX & 0x40000000;
            lY4 = lY & 0x40000000;
            lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
            if (lX4 & lY4) {
              return lResult ^ 0x80000000 ^ lX8 ^ lY8;
            }
            if (lX4 | lY4) {
              if (lResult & 0x40000000) {
                return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
              } else {
                return lResult ^ 0x40000000 ^ lX8 ^ lY8;
              }
            } else {
              return lResult ^ lX8 ^ lY8;
            }
          }

          function F(x, y, z) {
            return (x & y) | (~x & z);
          }
          function G(x, y, z) {
            return (x & z) | (y & ~z);
          }
          function H(x, y, z) {
            return x ^ y ^ z;
          }
          function I(x, y, z) {
            return y ^ (x | ~z);
          }

          function FF(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
          }

          function GG(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
          }

          function HH(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
          }

          function II(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
          }

          function ConvertToWordArray(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWords_temp1 = lMessageLength + 8;
            var lNumberOfWords_temp2 =
              (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
            var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
            var lWordArray = Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
              lWordCount = (lByteCount - (lByteCount % 4)) / 4;
              lBytePosition = (lByteCount % 4) * 8;
              lWordArray[lWordCount] =
                lWordArray[lWordCount] |
                (string.charCodeAt(lByteCount) << lBytePosition);
              lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] =
              lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
          }

          function WordToHex(lValue) {
            var WordToHexValue = "",
              WordToHexValue_temp = "",
              lByte,
              lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
              lByte = (lValue >>> (lCount * 8)) & 255;
              WordToHexValue_temp = "0" + lByte.toString(16);
              WordToHexValue =
                WordToHexValue +
                WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
            }
            return WordToHexValue;
          }

          function Utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {
              var c = string.charCodeAt(n);

              if (c < 128) {
                utftext += String.fromCharCode(c);
              } else if (c > 127 && c < 2048) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
              } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
              }
            }

            return utftext;
          }

          var x = Array();
          var k, AA, BB, CC, DD, a, b, c, d;
          var S11 = 7,
            S12 = 12,
            S13 = 17,
            S14 = 22;
          var S21 = 5,
            S22 = 9,
            S23 = 14,
            S24 = 20;
          var S31 = 4,
            S32 = 11,
            S33 = 16,
            S34 = 23;
          var S41 = 6,
            S42 = 10,
            S43 = 15,
            S44 = 21;

          string = Utf8Encode(string);

          x = ConvertToWordArray(string);

          a = 0x67452301;
          b = 0xefcdab89;
          c = 0x98badcfe;
          d = 0x10325476;

          for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
            b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
            a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
            c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
            c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
            b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
            a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
            a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
            a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
            a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
            d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
            c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
            a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
            c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
            b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
            c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
            d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
            c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
            a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
            d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
            b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
            a = AddUnsigned(a, AA);
            b = AddUnsigned(b, BB);
            c = AddUnsigned(c, CC);
            d = AddUnsigned(d, DD);
          }

          var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

          return temp.toLowerCase();
        },

        _device: function () {
          return {
            BROWSER: {
              FIREFOX: "ff",
              CHROME: "cr",
              SAFARI: "sf",
              ANDROID: "an",
            },
            OS: {
              WINDOWS: "win",
              MACINTOSH: "mac",
              LINUX: "linux",
              IOS: "iOS",
              ANDROID: "Android",
              BLACKBERRY: "bb",
              WINDOWS_PHONE: "winphone",
            },
            windows: true,
            mobile: true,
          };
        },
      }
    );
  }
);
