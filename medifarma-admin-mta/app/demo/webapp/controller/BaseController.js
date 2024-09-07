sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/m/MessageBox",
    "administrador/service/iasScimService",
    "sap/ui/model/json/JSONModel",
    "administrador/service/oDataService",
  ],
  function (
    Controller,
    UIComponent,
    mobileLibrary,
    MessageBox,
    iasScimService,
    JSONModel,
    oDataService
  ) {
    "use strict";
    var desarrollo = false;
    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("administrador.controller.BaseController", {
      /**
       * Convenience method for accessing the router.
       * @public
       * @returns {sap.ui.core.routing.Router} the router for this component
       */
      getRouter: function () {
        return UIComponent.getRouterFor(this);
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

      getI18nText: function (sText) {
        return this.oView.getModel("i18n").getResourceBundle().getText(sText);
      },
      /**
       * Getter for the resource bundle.
       * @public
       * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
       */
      getResourceBundle: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },
      /**
       * Event handler when the share by E-Mail button has been clicked
       * @public
       */
      onShareEmailPress: function () {
        var oViewModel =
          this.getModel("objectView") || this.getModel("userlistView");
        URLHelper.triggerEmail(
          null,
          oViewModel.getProperty("/shareSendEmailSubject"),
          oViewModel.getProperty("/shareSendEmailMessage")
        );
      },
      _getUserInfo: function (oDataIas) {
        if (oDataIas && oDataIas.Resources && oDataIas.Resources.length) {
          var aUser =
            oDataIas.Resources[0][
              "urn:sap:cloud:scim:schemas:extension:custom:2.0:User"
            ];
          var oInfo = {
            company: "",
            email: oDataIas.Resources[0].emails[0].value,
            emails: oDataIas.Resources[0].emails,
            firstName: oDataIas.Resources[0].name.givenName,
            groups: oDataIas.Resources[0].groups,
            lastName: oDataIas.Resources[0].name.familyName,
            loginName: oDataIas.Resources[0].userName,
            name: oDataIas.Resources[0].userName,
            userP:
              oDataIas.Resources[0][
                "urn:ietf:params:scim:schemas:extension:sap:2.0:User"
              ].userId,
            ruc: "",
          };
          if (aUser !== undefined) {
            oInfo.ruc =
              oDataIas.Resources[0][
                "urn:sap:cloud:scim:schemas:extension:custom:2.0:User"
              ].attributes[0].value;
          }
          var oResolve = new sap.ui.model.json.JSONModel(oInfo);
          return oResolve;
        } else {
          if(oDataIas && oDataIas.error) {
            MessageBox.error(
              oDataIas.error
            );
          }
          return null;
        }
      },
      getUserLoginIas: async function () {
        var that = this;
        var oUser = await that._getUserLogin();
        sap.ui.core.BusyIndicator.show(0);

        var oUserLogin = await iasScimService
          .readUserIasInfo(oUser.email)
          .catch((oError) => {
            console.log(oError);
          });

        if (!oUserLogin) {
          var oUserLogin = await oDataService
            .oDataRead(
              that.getView().getModel(),
              "fnUserByEmail",
              { emails: oUser.email },
              []
            )
            .catch((oError) => {
              console.log(oError);
            });

          oUserLogin = that._getUserInfo(oUserLogin.fnUserByEmail);
        }
        if (oUserLogin) {
          var aGroups = [];
          var sInclude = "ADM_";

          oUserLogin.getData().groups.forEach((oItem) => {
            /**
             * <Aplicativo>_<Rol>
             * 
             * Prefijo ADM_ : Identificar el rol que tendrá el usuario dentro del aplicativo de administración.
              ADM_ADMIN : Control total para todos los sistemas
              ADM_CP    : Control para Central de Pesadas (CP)
              ADM_RMD   : Control para Registro Manufactura Digital (RMD)
             */

            var sNameRol = oItem.display.toUpperCase();
            if (sNameRol.includes(sInclude)) {
              var sRole = sNameRol.substring(
                sNameRol.lastIndexOf(sInclude + "_") + (sInclude.length + 1),
                sNameRol.length
              );
              oItem.display = sNameRol;
              oItem.sistema = sRole;
              aGroups.push(oItem);
            }
          });

          var aGroupAdmin = aGroups.filter(o=> o.display == (sInclude + "ADMIN"));
          if(aGroupAdmin.length > 0) {
            /**
             * Verificar si existe el rol ADMIN
             */
            oUserLogin.getData().groups = aGroupAdmin;
          } else {
            oUserLogin.getData().groups = aGroups;
          }

          sap.ui.core.BusyIndicator.hide();
          sap.ui.getCore().setModel(oUserLogin, "UserLoginModel");
          that.getView().setModel(oUserLogin, "UserLoginModel");
          let UserInfoModel = that.getModel("UserInfoModel");
          UserInfoModel.getData().sistema =
            oUserLogin.getData().groups[0].sistema;
          that.getModel("UserInfoModel").refresh(true);
        } else {
          MessageBox.error(
            "No se puede continuar, vuelve a intentarlo actualizando la pagina o comuniquese con un administrador si el error persiste."
          );
          return false;
        }

        return oUserLogin.getData();
      },
      _getUserLogin: async function () {
        var dataUser = {};
        try {
          var url = this.getBaseURL() + "/user-api/currentUser";
          var oModel = new JSONModel();

          oModel.loadData(url);
          await oModel.dataLoaded();
          dataUser = oModel.getData();
          var userModel = new JSONModel();
          //userModel.loadData("/services/userapi/attributes", null, false);
          //dataUser = userModel.getData();
        } catch (oError) {
          console.log(oError);
        }

        if (desarrollo) {
          dataUser = {
            firstname: "Elvis",
            lastname: "Garcia",
            email: "elvis.percy.garcia.tincopa@everis.com",
            name: "elvis.percy.garcia.tincopa@everis.com",
            displayName: "Elvis Garcia (elvis.percy.garcia.tincopa@everis.com)",
          };
        }

        if (!dataUser.email) {
          try {
            dataUser.email = sap.ushell.Container.getService("UserInfo")
              .getUser()
              .getEmail();
          } catch (oError) {
            console.log(oError);
          }
        }

        if (dataUser.email === "DEFAULT_USER" || dataUser.email === undefined) {
          if (
            window.location.href.includes("workspaces") ||
            window.location.href.includes("webidecp") ||
            window.location.href.includes("localhost")
          ) {
            dataUser.email = "elvis.percy.garcia.tincopa@everis.com"; //Rol: ADMIN
            //dataUser.email = "oscar.chungparedes.sa@everis.nttdata.com"; //Rol: CP
            //dataUser.email = "ryepegav@everis.com"; //Rol: RMD
          }
        }
        return dataUser;
      },
      getBaseURL: function () {
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
        return appModulePath;
      },
    });
  }
);
