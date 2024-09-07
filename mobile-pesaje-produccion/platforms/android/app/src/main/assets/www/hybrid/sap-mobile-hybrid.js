/* hybrid capacity bootstrap
 *
 * This has to happen after sapui5 bootstrap, and before first application page is loaded.
 */

sap.hybrid = {
  loadCordova: false,

  setCordova: function () {
    sap.hybrid.loadCordova = true;
  },

  packUrl: function (url, route) {
    var result;
    if (route.manual) {
      // routes requires a manually created Mobile Destination with Rewrite on Backend and via CP App set
      result = route.path; // keep the original path
    } else {
      // OData routes that can be proxied through the automatically created CP Destination
      var connection = (
        fiori_client_appConfig.appID +
        "_" +
        route.destination
      ).substr(0, 63); // max length cap by SCPms DB
      result = "/" + connection;
    }
    var path = url.substring(
      route.path.endsWith("/") ? route.path.length - 1 : route.path.length
    ); // the remaining URL path
    result += (route.entryPath ? route.entryPath : "") + path;
    return result;
  },

  appLogon: function (appConfig) {
    var context = {};
    var url = appConfig.fioriURL;
    if (
      url &&
      (url.indexOf("https://") === 0 || url.indexOf("http://") === 0)
    ) {
      if (url.indexOf("https://") === 0) {
        context.https = true;
        url = url.substring("https://".length);
      } else {
        context.https = false;
        url = url.substring("http://".length);
      }

      if (url.indexOf("?") >= 0) {
        url = url.substring(0, url.indexOf("?"));
      }
      if (url.indexOf("/") >= 0) {
        url = url.split("/")[0];
      }
      if (url.indexOf(":") >= 0) {
        context.serverHost = url.split(":")[0];
        context.serverPort = url.split(":")[1];
      }
    }

    // set auth element
    if (appConfig.auth) {
      context.auth = appConfig.auth;
    }

    // If communicatorId is set then use it to be compatible with existing values. Otherwise, use the default "REST".
    // By doing so logon core does not need to send ping request to server root URL, which will cause authentication issue.
    // It occurs when the root URL uses a different auth method from the application's endpoint URL, as application can only handle authentication on its own endpoint URL.
    context.communicatorId = appConfig.communicatorId
      ? appConfig.communicatorId
      : "REST";

    // Set disablePasscode to true if you want to hide the passcode screen
    context.custom = {
      disablePasscode: false,
    };

    if (
      "serverHost" in context &&
      "serverPort" in context &&
      "https" in context
    ) {
      // start SCPms logon
      sap.hybrid.kapsel.doLogonInit(
        context,
        appConfig.appID,
        sap.hybrid.startApp
      );
      /*
			  try {
				  sap.hybrid.kapsel.doLogonInit(context, appConfig.appID, sap.hybrid.openStore);
			  } catch (oError){
				  console.log("appLogon: sap.hybrid.kapsel.doLogonInit")
				  console.error(oError);
			  }
			  */
    } else {
      console.error("context data for logon are not complete");
    }
  },

  bootStrap: function () {
    if (sap.hybrid.loadCordova) {
      // bind to Cordova event
      document.addEventListener(
        "deviceready",
        function () {
          // check if app configuration is available
          if (
            fiori_client_appConfig &&
            fiori_client_appConfig.appID &&
            fiori_client_appConfig.fioriURL
          ) {
            if (window.webkit && window.webkit.messageHandlers) {
              // iOS WkWebView
              jQuery.sap.require("sap.ui.thirdparty.datajs");
              OData.defaultHttpClient =
                sap.AuthProxy.generateODataHttpClient2(); // use AuthProxy to send cross domain OData requests
            }
            sap.hybrid.appLogon(fiori_client_appConfig);
          } else {
            console.error(
              "Can't find app configuration probably due to a missing appConfig.js in the app binary."
            );
          }
        },
        false
      );
    } else {
      console.error("Cordova is not loaded");
    }
  },

  loadComponent: function (componentName) {
    sap.ui.getCore().attachInit(function () {
      // not support sap.ushell navigation
      sap.ui.require(
        ["sap/m/Shell", "sap/ui/core/ComponentContainer"],
        function (Shell, ComponentContainer) {
          // initialize the UI component
          new Shell({
            app: new ComponentContainer({
              height: "100%",
              name: componentName,
            }),
          }).placeAt("content");
        }
      );
    });
  },
  /**
   * -------------------------------------------
   *
   * 				CUSTOM FUNCTION
   *
   * -------------------------------------------
   */

  /**
   * plugins:
   * cordova plugin add cordova-plugin-network-information
   * cordova plugin add kapsel-plugin-logger --searchpath %KAPSEL_HOME%/plugins
   * cordova plugin add kapsel-plugin-odata --searchpath %KAPSEL_HOME%/plugins
   */

  /**
   * El complemento Kapsel Offline OData habilita una aplicación basada en OData versión 2.0
   * que tiene sus datos enviados a través de un servidor SMP o SAP Mobile Services
   * para usarse cuando un dispositivo o emulador está fuera de línea (Offline)
   * creando una tienda en el dispositivo.
   *
   * NOTA:
   * - La tienda fuera de línea tiene un límite de 16 GB.
   * - El tiempo de descarga inicial, el tamaño de la base de datos y
   * los tiempos de actualización pueden verse afectados por la
   * cantidad de datos almacenados en el dispositivo.
   */
  openStore: function () {
    console.log("In openStore");
    jQuery.sap.require("sap.ui.thirdparty.datajs"); //Required when using SAPUI5 and the Kapsel Offline Store

    try {
      console.log(mobile_appRoutes[0].destination);
    } catch (oError) {}

    var aRoute = [
      {
        destination: "S4H_HTTP_BASIC_CP",
        path: "/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV/",
      },
      {
        destination: "CP_SRV",
        path: "/v2/browse/",
      },
    ];
    var sAppID = fiori_client_appConfig.appID;

    var oProperty = {
      host: sap.hybrid.kapsel.appContext.registrationContext.serverHost,
      port: sap.hybrid.kapsel.appContext.registrationContext.serverPort,
      https: sap.hybrid.kapsel.appContext.registrationContext.https,
    };

    var oPropertiesErp = {
      name: "store_Z_PP_CENTRALPESADAS_SRV",
      serviceRoot: sAppID + "_" + aRoute[0].destination + aRoute[0].path,

      definingRequests: {
        OrdenSet: "/OrdenSet",
      },
    };

    var oPropertiesHana = {
      name: "store_HANA_CENTRALPESADAS_SRV",
      serviceRoot: sAppID + "_" + aRoute[1].destination + aRoute[1].path,

      definingRequests: {
        Maestra: "/Maestra?$expand=oMaestraTipo",
      },
    };

    storeZPPCENTRALPESADASSRV = sap.OData.createOfflineStore({
      ...oProperty,
      ...oPropertiesErp,
    });
    storeHANACENTRALPESADASSRV = sap.OData.createOfflineStore({
      ...oProperty,
      ...oPropertiesHana,
    });

    var openStoreSuccessCallback = function () {
      console.log("In openStoreSuccessCallback");
      sap.OData.applyHttpClient(); //Offline OData calls can now be made against datajs.
      sap.Xhook.disable(); // temporary workaround to ensure the offline app can work in WKWebView

      //sap.hybrid.openStoreCustom(oRequest);

      sap.hybrid.startApp();
    };

    var openStoreSuccessCallback2 = function () {
      console.log("In openStoreSuccessCallback2");
      sap.OData.applyHttpClient(); //Offline OData calls can now be made against datajs.
      sap.Xhook.disable(); // temporary workaround to ensure the offline app can work in WKWebView
    };

    var openStoreErrorCallback = function (error) {
      console.log("In openStoreErrorCallback");
      console.log(error);
      alert("An error occurred" + JSON.stringify(error));
    };

    storeZPPCENTRALPESADASSRV.open(
      openStoreSuccessCallback2,
      openStoreErrorCallback
    );

    storeHANACENTRALPESADASSRV.open(
      openStoreSuccessCallback,
      openStoreErrorCallback
    );
  },

  openStoreCustom: function (oRequest) {
    if (!oRequest) {
      var uri =
        sap.hybrid.kapsel.appContext.applicationEndpointURL +
        "_" +
        "CP_SRV/v2/browse/Maestra"; //JSON format is less verbose than atom/xml
      var oHeaders = {};
      oRequest = {
        headers: oHeaders,
        requestUri: uri,
        method: "GET",
      };
    }

    OData.read(
      oRequest,
      function (oResp) {
        console.log(oResp);
        var aResult = oResp.results;
        var aFilter = [];

        for (var key in aResult) {
          oItem = aResult[key];
          aFilter.push("Werks eq '" + oItem.codigoSap + "'");
        }

        var aRoute = [
          {
            destination: "S4H_HTTP_BASIC_CP",
            path: "/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV/",
          },
          {
            destination: "CP_SRV",
            path: "/v2/browse/",
          },
        ];
        var sAppID = fiori_client_appConfig.appID;

        var oProperty = {
          host: sap.hybrid.kapsel.appContext.registrationContext.serverHost,
          port: sap.hybrid.kapsel.appContext.registrationContext.serverPort,
          https: sap.hybrid.kapsel.appContext.registrationContext.https,
        };

        var oPropertiesErp = {
          name: "store_Z_PP_CENTRALPESADAS_SRV",
          serviceRoot: sAppID + "_" + aRoute[0].destination + aRoute[0].path,

          definingRequests: {
            OrdenSet: "/OrdenSet?$filter=" + aFilter.join(" or "),
          },
        };
        storeZPPCENTRALPESADASSRV = sap.OData.createOfflineStore({
          ...oProperty,
          ...oPropertiesErp,
        });

        sap.ui.core.BusyIndicator.show(0);
        storeZPPCENTRALPESADASSRV.open(function (res) {
          sap.ui.core.BusyIndicator.hide();
          console.log("In openStoreSuccessCallback");
          sap.OData.applyHttpClient(); //Offline OData calls can now be made against datajs.
          sap.Xhook.disable(); // temporary workaround to ensure the offline app can work in WKWebView
        }, openStoreErrorCallback);
      },
      function (error) {
        console.log("odataError ProduccionSet");
        console.log(error);
      }
    );
  },

  /**
   * La tienda fuera de línea puede actualizar los datos llamando a store.refresh().
   */
  refreshStore: function () {
    console.log("Offline events: refreshStore");
    if (!storeZPPCENTRALPESADASSRV) {
      console.log(
        "The store must be open before it can be refreshed: storeZPPCENTRALPESADASSRV"
      );
      return;
    }
    if (!storeHANACENTRALPESADASSRV) {
      console.log(
        "The store must be open before it can be refreshed: storeHANACENTRALPESADASSRV"
      );
      return;
    }
    sap.ui.core.BusyIndicator.show();

    storeZPPCENTRALPESADASSRV.refresh(
      sap.hybrid.refreshStoreCallback,
      sap.hybrid.errorCallback,
      null,
      sap.hybrid.progressCallback
    );

    storeHANACENTRALPESADASSRV.refresh(
      sap.hybrid.refreshStoreCallback,
      sap.hybrid.errorCallback,
      null,
      sap.hybrid.progressCallback
    );
  },

  refreshStoreCallback: function () {
    sap.ui.core.BusyIndicator.hide();
    console.log("Offline events: refreshStoreCallback");
  },

  /**
   * Una vez que se ha creado la tienda fuera de línea,
   * los cambios locales realizados en ella se pueden enviar a través de una llamada a store.flush()
   */
  flushStore: function () {
    console.log("Offline events: flushStore");
    if (!storeZPPCENTRALPESADASSRV) {
      console.log(
        "The store must be open before it can be flushed: storeZPPCENTRALPESADASSRV"
      );
      return;
    }
    if (!storeHANACENTRALPESADASSRV) {
      console.log(
        "The store must be open before it can be flushed: storeHANACENTRALPESADASSRV"
      );
      return;
    }
    sap.ui.core.BusyIndicator.show();

    storeZPPCENTRALPESADASSRV.flush(
      sap.hybrid.flushStoreCallback,
      sap.hybrid.errorCallback,
      null,
      sap.hybrid.progressCallback
    );

    storeHANACENTRALPESADASSRV.flush(
      sap.hybrid.flushStoreCallback,
      sap.hybrid.errorCallback,
      null,
      sap.hybrid.progressCallback
    );
  },

  flushStoreCallback: function () {
    sap.ui.core.BusyIndicator.hide();
    console.log("Offline events: flushStoreCallback");
    //sap.hybrid.refreshStore();
  },

  errorCallback: function (error) {
    sap.ui.core.BusyIndicator.hide();
    console.log("Offline events: errorCallback");
    alert("An error occurred: " + JSON.stringify(error));
  },

  progressCallback: function (progressStatus) {
    // console.log("Offline events: progressCallback");
    sap.ui.core.BusyIndicator.hide();
    var status = progressStatus.progressState;
    var lead = "unknown";
    if (status === sap.OfflineStore.ProgressState.STORE_DOWNLOADING) {
      lead = "Downloading ";
    } else if (status === sap.OfflineStore.ProgressState.REFRESH) {
      lead = "Refreshing ";
    } else if (status === sap.OfflineStore.ProgressState.FLUSH_REQUEST_QUEUE) {
      lead = "Flushing ";
    } else if (status === sap.OfflineStore.ProgressState.DONE) {
      lead = "Complete ";
    } else {
      alert("Unknown status in progressCallback");
    }
    console.log(
      lead +
        "Sent: " +
        progressStatus.bytesSent +
        "  Received: " +
        progressStatus.bytesRecv +
        "   File Size: " +
        progressStatus.fileSize
    );
  },

  closeStore: function () {
    if (!storeZPPCENTRALPESADASSRV) {
      updateStatus2("The store must be opened before it can be closed");
      return;
    }
    console.log("EventLogging: closeStore");
    updateStatus2("store.close called");
    storeZPPCENTRALPESADASSRV.close(closeStoreSuccessCallback, errorCallback);
  },

  closeStoreSuccessCallback: function () {
    console.log("EventLogging: closeStoreSuccessCallback");
    sap.OData.removeHttpClient();
    updateStatus1("Store is CLOSED.");
    updateStatus2("Store closed");
  },

  clearStore: function () {
    console.log("EventLogging: clearStore");
    if (!storeZPPCENTRALPESADASSRV) {
      updateStatus2("The store must be closed before it can be cleared");
      return;
    }
    storeZPPCENTRALPESADASSRV.clear(clearStoreSuccessCallback, errorCallback);
  },

  clearStoreSuccessCallback: function () {
    console.log("EventLogging: clearStoreSuccessCallback");
    updateStatus1("");
    updateStatus2("Store is CLEARED");
    storeZPPCENTRALPESADASSRV = null;
  },

  updateStatus1: function (msg) {
    document.getElementById("statusID").innerHTML =
      msg + " " + getDeviceStatusString();
    console.log("EventLogging: " + msg + " " + getDeviceStatusString());
  },

  updateStatus2: function (msg) {
    var d = new Date();
    document.getElementById("statusID2").innerHTML =
      msg +
      " at " +
      addZero(d.getHours()) +
      ":" +
      addZero(d.getMinutes()) +
      "." +
      addZero(d.getSeconds());
    console.log(
      "EventLogging: " +
        msg +
        " at " +
        addZero(d.getHours()) +
        ":" +
        addZero(d.getMinutes()) +
        "." +
        addZero(d.getSeconds())
    );
  },

  allowToGPS: function () {
    var permissions = cordova.plugins.permissions;
    var aPermission = [
      permissions.WRITE_EXTERNAL_STORAGE,
      permissions.CAMERA,
      permissions.GEOLOCATION,
    ];

    permissions.checkPermission(
      aPermission,
      function (status) {
        if (!status.has) {
          var errorCallback = function () {
            console.warn("Camera or Accounts permission is not turned on");
          };

          permissions.requestPermissions(
            aPermission,
            function (status) {
              sap.hybrid._createFolder();
              if (!status.has) errorCallback();
            },
            errorCallback
          );
        }
      },
      alert
    );
  },
};
