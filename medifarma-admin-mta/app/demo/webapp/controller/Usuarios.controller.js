sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/ui/model/json/JSONModel",
    "administrador/controller/BaseController",
    "administrador/model/formatter",
    "administrador/service/oDataService",
    "administrador/service/iasScimService",
    "administrador/service/Log",
    "administrador/lib/Sheet",
    "sap/ui/core/BusyIndicator",
  ],
  function (
    MessageBox,
    Filter,
    FilterOperator,
    FilterType,
    SimpleType,
    ValidateException,
    JSONModel,
    BaseController,
    formatter,
    oDataService,
    iasScimService,
    log,
    Sheet,
    BusyIndicator
  ) {
    "use strict";
    var that;
    var oBusyDialog = new sap.m.BusyDialog();
    var goUserLogin = null,
      gsUsuarioLogin = "";
    const rootPath = "administrador";
    const constanteEtapa = "ETAPA_PRODUCCION";
    const constanteArea = "AREA_TRABAJO";
    var filterEstadoId = "";
    var gaSystem = [];
    return BaseController.extend("administrador.controller.Usuarios", {
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       * @memberOf administrador.view.Maestra
       */
      formatter: formatter,
      onInit: function () {
        that = this;
        that.oModelCapService = that.getOwnerComponent().getModel("capService");
        that.oModel = that.getOwnerComponent().getModel();
        that.oModelErp = this.getOwnerComponent().getModel("PRODUCCION_SRV");
        that.oModelErpNec =
          this.getOwnerComponent().getModel("NECESIDADESRMD_SRV");

        that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        that.oRouter
          .getTarget("MenuUsuario")
          .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));

        log.init(that.oModelCapService);
      },
      onAfterRendering: function () {},
      _handleRouteMatched: async function (oEvent) {
        var that = this;
        /**
         * Obtiene el Rol (Grupo) asignado al usuario en IAS
         */
        goUserLogin = await this.getUserLoginIas();

        if (!goUserLogin) {
          sap.ui.core.BusyIndicator.show(0);
          return false;
        }
        if (!goUserLogin.groups.length) {
          sap.ui.core.BusyIndicator.show(0);
          MessageBox.error(
            "USUARIO SIN ROL PARA ESTA APLICACION, " +
              "COMUNIQUESE CON UN ADMINISTRADOR PARA ASIGNAR EL ROL: ADM_XXXX"
          );
          return;
        }

        this.getView().setModel(new JSONModel([]), "UserListModel");
        this.getView().setModel(new JSONModel([]), "MaestraModel");
        this.getView().setModel(new JSONModel([]), "SistemaModel");
        this.getView().setModel(new JSONModel([]), "Log");

        this.getView().setModel(
          new JSONModel({
            queryText: "",
            isNew: false,
          }),
          "CriteriaModel"
        );

        var oColumnCP = {};
        var oColumnRMD = {
          seccionProduccion: false,
        };

        try {
          gsUsuarioLogin = sap.ushell.Container.getService("UserInfo")
            .getUser()
            .getEmail();

          /**
           * Verifica y evalua el tipo del rol asignado al usuario
           */
          goUserLogin.groups.forEach((oItem) => {
            if (oItem.sistema == "ADMIN") {
              //Si es admin control total a todos los sistemas
              oColumnCP = {};
              oColumnRMD = {};
              gaSystem = [];
              return false;
            }

            if (oItem.sistema == "RMD") {
              oColumnRMD.seccionProduccion = true;
            }
            gaSystem.push({ val: oItem.sistema, id: "" });
          });

          this.getView().setModel(
            new JSONModel({ ...oColumnCP, ...oColumnRMD }),
            "ShowColumn"
          );

          /**
           * Obtiene datos maestros y datos para los parametros
           */
          await this._getSistema(null);
          await this._getMaestra(null);
          this.onGetNivelOdata();
          this._getUsuario(null);
        } catch (oError) {
          console.log("Error All Init");
          sap.ui.core.BusyIndicator.hide();
        }
      },
      /**
       * @Description
       * Funcion que obtiene del servicio oData los registros de sistemas registradas para la solucion
       *
       * @param   none
       * @return  {sap.ui.model.Filter} aFilter
       * @History
       * v1.0 – Version inicial
       *
       */
      _getSistema: async function (aFilter) {
        if (!aFilter) aFilter = [];
        var EQ = FilterOperator.EQ;
        aFilter.push(new Filter("activo", EQ, true));
        gaSystem.forEach((oItem) => {
          aFilter.push(new Filter("codigo", EQ, oItem.val));
        });

        var oResp = await that
          ._getOdataDinamic(this.getView().getModel(), "Sistema", {}, aFilter)
          .catch((oError) => {});

        if (oResp) {
          var aSystem = oResp.results;
          that.getView().getModel("SistemaModel").setData(aSystem);
          gaSystem.forEach((oItem) => {
            var oSystem = aSystem.find((o) => o.codigo == oItem.val);
            oItem.id = oSystem.sistemaId;
          });
        }
        oBusyDialog.close();
      },

      _getOdataDinamic: function (oModel, sEntity, oUrlParameters, aFilter) {
        return new Promise(function (resolve, reject) {
          oDataService
            .oDataRead(oModel, sEntity, oUrlParameters, aFilter)
            .then(function (oResp) {
              resolve(oResp);
            })
            .catch(function (oError) {
              reject(oError);
            });
        });
      },

      _getUsuario: function (aFilter) {
        var that = this;
        if (!aFilter) aFilter = [];

        var aSystem = that.getView().getModel("SistemaModel").getData();
        var aFilterSistema = [];
        aSystem.forEach((oItem) => {
          aFilterSistema.push(`oSistema_sistemaId eq ${oItem.sistemaId}`);
        });

        var urlParameters = {
          $expand: `aSistemas($filter=${aFilterSistema.join(
            " or "
          )};$expand=oSistema)`,
        };
        oDataService
          .oDataRead(
            this.getView().getModel(),
            "Usuario",
            urlParameters,
            aFilter
          )
          .then(
            function (result) {
              var aResult = result.results;
              var oNow = new Date();

              for (var key in aResult) {
                var oUser = aResult[key];
                oUser.vigente = formatter.isDateBT(
                  oUser.fechaVigInicio,
                  oUser.fechaVigFin,
                  oNow
                );
                if (oUser.oMaestraNivel != null) {
                  oUser.oMaestraNivel = oUser.oMaestraNivel.split(","); //mapping array
                }
                if (oUser.aSistemas.results !== 0) {
                  var aSistemas = [];
                  oUser.aSistemas.results.forEach((oSistema) => {
                    aSistemas.push(oSistema.oSistema_sistemaId);
                  });
                  oUser.sSistemas = aSistemas;
                }
              }
              if (filterEstadoId) {
                var alistAux = [];

                for (var key in aResult) {
                  var oUser = aResult[key];
                  if (
                    oUser.vigente === JSON.parse(filterEstadoId.toLowerCase())
                  ) {
                    alistAux.push(oUser);
                  }
                }
                aResult = alistAux;
              }
              aResult.sort((a, b) =>
                a.usuario > b.usuario ? 1 : b.usuario > a.usuario ? -1 : 0
              );
              that.getView().getModel("UserListModel").setData(aResult);
              oBusyDialog.close();
            }.bind(this),
            function (error) {
              oBusyDialog.close();
            }
          );
      },
      _getMaestra: async function (aFilter) {
        var that = this;
        var oUrlParameters = {
          $expand: "oMaestraTipo",
        };

        if (!aFilter) aFilter = [];
        var EQ = FilterOperator.EQ;
        aFilter.push(new Filter("activo", EQ, true));

        var oResp = await that
          ._getOdataDinamic(
            this.getView().getModel(),
            "Maestra",
            oUrlParameters,
            aFilter
          )
          .catch((oError) => {});

        var aSystem = that.getView().getModel("SistemaModel").getData();
        if (oResp) {
          var aResult = oResp.results;

          /**
           * Filtrar Maestra Globales y que las pertenecen a un sistema (Segun Rol usuario login).
           */
          var aConstantFilter = [];
          var aConstantSystem = [];
          var aConstantGlobal = aResult.filter((oItem) => {
            return oItem.oSistema_sistemaId == null;
          });
          for (const key in aSystem) {
            const oElement = aSystem[key];
            var aConstantTemp = aResult.filter((oItem) => {
              return oItem.oSistema_sistemaId == oElement.sistemaId;
            });

            if (aConstantTemp)
              aConstantSystem = aConstantSystem.concat(aConstantTemp);
          }

          aConstantFilter = aConstantSystem.concat(aConstantGlobal);

          /**
           * Agrupar Maestra por Tipo
           */
          var aConstant = aConstantFilter.reduce(function (r, a) {
            var sKey = a.oMaestraTipo.tabla.toUpperCase();
            r[sKey] = r[sKey] || [];
            r[sKey].push({
              oMaestraTipo_maestraTipoId: a.oMaestraTipo_maestraTipoId,
              oMaestraTipo_tabla: a.oMaestraTipo.tabla,
              oMaestraTipo_nombre: a.oMaestraTipo.nombre,
              iMaestraId: a.iMaestraId,
              contenido: a.contenido,
              descripcion: a.descripcion,
              orden: a.orden,
              codigo: a.codigo,
              codigoSap: a.codigoSap,
              oSistema_sistemaId: a.oSistema_sistemaId,
              activo: a.activo ? (a.oMaestraTipo.activo ? true : false) : false,
            });
            return r;
          }, Object.create(null));

          that.getView().getModel("MaestraModel").setData(aConstant);
        }
        oBusyDialog.close();
      },
      onSearchDocument: function (oEvent) {
        if (oEvent.getParameter("clearButtonPressed")) {
          return;
        }
        let that = this;
        let oModel = this.getView().getModel("sapErp");
        let oModelNewUser = oEvent
          .getSource()
          .getBindingContext("UserListModel");
        let oNewUser = oModelNewUser.getObject();
        var aFilters = [];
        aFilters.push(
          new Filter("Icnum", FilterOperator.EQ, oNewUser.numeroDocumento)
        );
        sap.ui.core.BusyIndicator.show(0);
        oDataService
          .oDataRead(oModel, "PersonalSet", null, aFilters)
          .then((oResult) => {
            sap.ui.core.BusyIndicator.hide();
            if (oResult.results) {
              var oNow = new Date();
              var oUserSap = oResult.results[0];

              oNewUser.nombre = oUserSap.Vorna.toUpperCase(); // nombre: PA0002
              oNewUser.apellidoPaterno = oUserSap.Nachn.toUpperCase(); // apellido paterno:  PA0002
              oNewUser.apellidoMaterno = oUserSap.Nach2.toUpperCase(); //apellido materno: PA0002
              oNewUser.correo = oUserSap.UsridLong.toLowerCase(); //correo: PA0105
              oNewUser.telefono = oUserSap.Telnr; // telefonos: PA0006
              oNewUser.fechaVigInicio = oUserSap.Begda; //fecha inicio: PA0016
              oNewUser.fechaVigFin = oUserSap.Ctedt
                ? oUserSap.Ctedt
                : new Date("12/31/9999"); //fecha fin: PA0016
              oNewUser.fechaRegistro = oNow;
              oNewUser.vigente = formatter.isDateBT(
                oUserSap.Begda,
                oUserSap.Ctedt,
                oNow
              );
              oNewUser.usuarioSap = oUserSap.Pernr;
              oNewUser.usuarioIas = "";
              oNewUser.loginSap = oUserSap.Usersap; //Usuario de Logeo

              var sName = oNewUser.nombre;
              if (oNewUser.usuario === "" || !oNewUser.usuario) {
                oNewUser.usuario =
                sName.charAt(0) +
                that
                  .deleteAccented(oNewUser.apellidoPaterno)
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .substring(0, 10) +
                oNewUser.apellidoMaterno.charAt(0);
              }
              that.getView().getModel("UserListModel").refresh(true);
            } else {
              MessageBox.error(
                "No se encontro registros con el Documento ingresado"
              );
            }

            sap.ui.core.BusyIndicator.show(0);
            iasScimService
              .readUserIasInfo(oNewUser.correo)
              .then((oResponse) => {
                sap.ui.core.BusyIndicator.hide();
                var oUserIas = oResponse.getData();
                oNewUser.usuarioIas = oUserIas.userP;
                that.getView().getModel("UserListModel").refresh(true);
              })
              .catch((oError) => {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.error(
                  "No se encontro registro el usuario en el IAS."
                );
              })
              .finally((oFinal) => {});
          })
          .catch((oError) => {
            sap.ui.core.BusyIndicator.hide();

            oNewUser.nombre = ""; // nombre: PA0002
            oNewUser.apellidoPaterno = ""; // apellido paterno:  PA0002
            oNewUser.apellidoMaterno = ""; //apellido materno: PA0002
            oNewUser.correo = ""; //correo: PA0105
            oNewUser.telefono = ""; // telefonos: PA0006
            oNewUser.fechaVigInicio = ""; //fecha inicio: PA0016
            oNewUser.fechaVigFin = null; //fecha fin: PA0016
            oNewUser.fechaRegistro = null;
            oNewUser.vigente = false;
            oNewUser.usuarioIas = "";
            oNewUser.usuarioSap = "";
            oNewUser.usuario = "";
            that.getView().getModel("UserListModel").refresh(true);
          })
          .finally((oFinal) => {});
      },

      getPersonalInformationHCM: function (SessionId, dataNewUser) {
        BusyIndicator.show(0);
        let urlGlobal = "https://hcm19preview.sapsf.com/sfapi/v1/soap?wsdl";
        let soapMessage =
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sfobject.sfapi.successfactors.com">' +
          "<soapenv:Header/>" +
          "<soapenv:Body>" +
          "<urn:query>" +
          "<urn:queryString>" +
          "SELECT person, personal_information, address_information, employment_information, job_information FROM CompoundEmployee WHERE PERSON_ID_EXTERNAL = " +
          "'19999988'" +
          " ORDER BY start_date ASC" +
          "</urn:queryString>" +
          "</urn:query>" +
          "</soapenv:Body>" +
          "</soapenv:Envelope>";

        document.cookie = "JSESSIONID=" + SessionId + "; path=/sfapi";
        $.ajax({
          url: urlGlobal,
          contentType: "text/xml; charset=utf-8",
          type: "POST",
          crossDomain: true,
          xhrFields: { withCredentials: true },
          dataType: "xml",
          cache: false,
          data: soapMessage,
          async: false,
          headers: {
            JSESSIONID: SessionId,
            "Content-Type": "text/xml;charset=utf-8",
            Cookie: "JSESSIONID=" + SessionId,
          },
          success: function (data, textStatus, request) {
            let oData = that.xmlToJson(data);
            BusyIndicator.hide();
          },
          error: function (jqXHR, textStatus, errorThrown) {
            MessageBox.error("Error al ejecutar el WSDL.");
            BusyIndicator.hide();
          },
        });
      },

      //Covertir XML a JSON.
      xmlToJson: function (xml) {
        try {
          // Create the return object
          var obj = {};

          if (xml.nodeType == 1) {
            // element
            // do attributes
            if (xml.attributes.length > 0) {
              obj["@attributes"] = {};
              for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
              }
            }
          } else if (xml.nodeType == 3) {
            // text
            obj = xml.nodeValue;
          }

          // do children
          if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
              var item = xml.childNodes.item(i);
              var nodeName = item.nodeName;
              if (typeof obj[nodeName] == "undefined") {
                obj[nodeName] = this.xmlToJson(item);
              } else {
                if (typeof obj[nodeName].push == "undefined") {
                  var old = obj[nodeName];
                  obj[nodeName] = [];
                  obj[nodeName].push(old);
                }
                obj[nodeName].push(this.xmlToJson(item));
              }
            }
          }
          return obj;
        } catch (err) {
          MessageBox.error(err.message);
        }
      },

      onSearch: function (oEvent) {
        var queryText = oEvent.getParameter("query");

        var aFilters = this._addConstantFilter(queryText);

        var sParam = this.getView().getModel("CriteriaModel").getData();
        if (!aFilters) {
          if (sParam.nivelId || sParam.plantaId || sParam.EstadoId) {
            aFilters = [];
          }
        }

        if (sParam.nivelId)
          aFilters.push(
            new Filter("oMaestraNivel", FilterOperator.Contains, sParam.nivelId)
          );
        if (sParam.plantaId)
          aFilters.push(
            new Filter(
              "oMaestraSucursal_codigo",
              FilterOperator.Contains,
              sParam.plantaId
            )
          );
        if (sParam.EstadoId) {
          filterEstadoId = sParam.EstadoId;
        } else {
          filterEstadoId = "";
        }
        this._getUsuario(aFilters);
      },
      _addConstantFilter: function (queryText) {
        var aFilters = [];
        if (queryText) {
          aFilters.push(
            new Filter(
              [
                new Filter("usuario", FilterOperator.Contains, queryText),
                new Filter("nombre", FilterOperator.Contains, queryText),
                new Filter(
                  "apellidoPaterno",
                  FilterOperator.Contains,
                  queryText
                ),
                new Filter(
                  "apellidoMaterno",
                  FilterOperator.Contains,
                  queryText
                ),
                new Filter("correo", FilterOperator.Contains, queryText),
                new Filter(
                  "numeroDocumento",
                  FilterOperator.Contains,
                  queryText
                ),
              ],
              false
            )
          );
        } else {
          aFilters = null;
        }
        return aFilters;
      },
      onNewRegister: function () {
        var that = this;

        var aUserListModel = this.getView().getModel("UserListModel").getData();
        var oAddNewUser = aUserListModel.find((d) => d.bAddNewUser);

        if (!oAddNewUser) {
          var oCriteria = this.getView().getModel("CriteriaModel");
          oCriteria.setProperty("/isNew", true);
          oCriteria.setProperty("/isEdit", true);
          //let oTable = this.getView().byId("tbUserList").getRows();

          var bShowCP = false;
          goUserLogin.groups.forEach((oItem) => {
            if (oItem.sistema == "CP") {
              //Mostrar controles si tiene el rol CP
              bShowCP = true;
              return false;
            }
          });

          aUserListModel.unshift({
            usuario: "",
            nombre: "",
            correo: "",
            edit: true,
            editSistema: true,
            editSeccion: !bShowCP,
            del: false,
            bAddNewUser: true,
            aNuevosSistemas: [],
            aSistemas: {
              results: [],
            },
          });

          that.getView().getModel("UserListModel").refresh();
          oCriteria.refresh();

          oBusyDialog.close();
        }
      },
      onCancel: function () {
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        this.getView().getModel("CriteriaModel").setProperty("/isEdit", false);
        this.getView().getModel("CriteriaModel").setProperty("/isNew", false);
        var aFilters = this._addConstantFilter(oCriteria.queryText);
        this._getUsuario(aFilters);
      },
      onEdit: function (oEvent) {
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        var oContext = oEvent.getSource().getBindingContext("UserListModel");
        var oObject = oContext.getObject();
        var oPath = oContext.getPath();
        var index = parseInt(oPath.substring(oPath.lastIndexOf("/") + 1), 10);

        if (!oCriteria.isEdit) {
          this.getView().getModel("CriteriaModel").setProperty("/isEdit", true);
          var oUserListModel = this.getView()
            .getModel("UserListModel")
            .getData();
          var oItemSelected = oUserListModel[index];
          oItemSelected.edit = true;
          oItemSelected.del = false;
          var aUsuarioSistema = oObject.aSistemas.results;
          var aListaNiveles = [];
          var aSistemas = [];
          aUsuarioSistema.forEach((oUsuarioSistema) => {
            var oSistema = oUsuarioSistema.oSistema;
            aSistemas.push(oSistema);
            if (
              oItemSelected.oMaestraSucursal_codigo !== "" &&
              oItemSelected.oMaestraSucursal_codigo
            ) {
              this.onChangePlanta(null, oItemSelected.oMaestraSucursal_codigo);
            }
            this.getView().getModel("UserListModel").refresh();

            //cambio de Nivel segun RMD o CP
            var aNivelesSAP = this.getView()
              .getModel("aListaNivelesSAP")
              .getData();
            var aNivelesHANA = this.getView()
              .getModel("aListaNivelesHANA")
              .getData();

            if (oSistema.codigo === "RMD") {
              aListaNiveles = aListaNiveles.concat(aNivelesSAP);
              //Indicar  el numero de niveles que se seleccionara
              this.getView().setModel(
                new JSONModel([{ numNiv: 0 }]),
                "numNivelSelected"
              );
            } else if (oSistema.codigo === "CP") {
              aListaNiveles = aListaNiveles.concat(aNivelesHANA);
              //Indicar  el numero de niveles que se seleccionara
              this.getView().setModel(
                new JSONModel([{ numNiv: 1 }]),
                "numNivelSelected"
              );
            }
          });
          this.refreshControlSeccion(oItemSelected, aSistemas);
          oEvent
            .getSource()
            .getParent()
            .getParent()
            .mAggregations.cells[5].setModel(
              new JSONModel(aListaNiveles),
              "aListaNiveles"
            );
        }
      },
      onLiveChange: function (oEvent, mProperty) {
        //var oModel = oEvent.getSource().getModel("UserListModel");
        var oValues = oEvent.getParameters();
        var oData = oEvent
          .getSource()
          .getBindingContext("UserListModel")
          .getObject();
        oData[mProperty] = oValues.newValue;
        //oModelrefresh(true);
        //console.log("onLiveChange");
      },
      onPressLog: async function (oEvent) {
        var oContext = oEvent.getSource().getBindingContext("UserListModel");
        var oPath = oContext.getPath();
        var index = parseInt(oPath.substring(oPath.lastIndexOf("/") + 1), 10);
        var oUserListModel = this.getView().getModel("UserListModel").getData();
        var oItemSelected = oUserListModel[index];

        that.getView().getModel("Log").setProperty("/LogDetalle", []);

        var aFilters = [];
        aFilters.push(
          new Filter("codigo", FilterOperator.EQ, oItemSelected.usuarioId)
        );
        oDataService
          .oDataRead(this.getView().getModel(), "LOG_DETALLE", null, aFilters)
          .then(
            function (d) {
              d.results.forEach((element) => {
                let oMaestraEstado = null;
              });

              d.results.forEach(function (e) {
                (e.valorAnterior = log.formatoFechaLog(e.valorAnterior)),
                  (e.valorActual = log.formatoFechaLog(e.valorActual));
              });

              that
                .getView()
                .getModel("Log")
                .setProperty("/LogDetalle", d.results);

              if (!that.oLog) {
                that.oLog = sap.ui.xmlfragment(
                  "frgLog",
                  rootPath + ".view.dialog.Log",
                  that
                );
                that.getView().addDependent(that.oLog);
              }

              that.oLog.open();

              oBusyDialog.close();
            }.bind(this),
            function (error) {
              oBusyDialog.close();
            }
          );
      },
      onPressClose: function (oEvent) {
        var oSource = oEvent.getSource();
        var sCustom = oSource.data("custom");
        var oParent = oSource.getParent();
        oParent.close();
      },
      onSave: function (oEvent) {
        var that = this;
        var oModel = that.getView().getModel();
        var oUserLogin = sap.ui.getCore().getModel("UserLoginModel").getData();
        var oContext = oEvent.getSource().getBindingContext("UserListModel");
        var oObject = oContext.getObject();

        var bValidateUser = that.onValidateUser(oObject);
        var bValidateUserSystem = that.onValidateUserSystem(oObject);
        var oCriteria = this.getView().getModel("CriteriaModel").getData();

        if (
          (!oObject.sSistemas || !oObject.sSistemas.length) &&
          (!oObject.aNuevosSistemas || !oObject.aNuevosSistemas.length)
        ) {
          MessageBox.alert("Ingrese el Sistema.");
          return;
        }
        if (bValidateUser === true && oCriteria.isNew === true) {
          MessageBox.alert("El usuario ya se encuentra registrado");
          return;
        }
        if (bValidateUserSystem && oCriteria.isNew === true) {
          MessageBox.alert("El usuario " + " ya se encuentra registrado");
          return;
        }

        var aCell = oEvent.getSource().getParent().getParent().getCells();
        var aInputs = [
          //Usuario
          sap.ui.getCore().byId(aCell[0].getItems()[0].getId()),
          //DNI
          sap.ui.getCore().byId(aCell[1].getItems()[0].getId()),
          //Usuario IAS
          //Sistema
          //Planta
          //Nivel
          //Tipo Usuario
          //Fecha Inicio Vigencia
          //Fecha Fin Vigencia
          //Vigencia
          //Sección Producción
          //Mail
          sap.ui.getCore().byId(aCell[11].getItems()[0].getId()),
          //Nombre Usuario
          sap.ui.getCore().byId(aCell[12].getItems()[0].getId()),
          //Apellido Paterno Usuario
          sap.ui.getCore().byId(aCell[13].getItems()[0].getId()),
          //Apellido Materno Usuario
          sap.ui.getCore().byId(aCell[14].getItems()[0].getId()),
          //Teléfono Contacto
          //Móvil Contacto
          //Fecha Registro
          //Acciones
        ];

        var bValidationError = false;
        aInputs.forEach(function (oInput) {
          bValidationError = this._validateInput(oInput) || bValidationError;
        }, this);

        if (bValidationError) {
          oBusyDialog.close();
          MessageBox.alert(
            this.getI18nText("msgRequerido") +
              " : " +
              "Usuario, Correo, Nombre, Apellidos"
          );
          return;
        }

        if (
          (!oObject.sSistemas || !oObject.sSistemas.length) &&
          (!oObject.aNuevosSistemas || !oObject.aNuevosSistemas.length)
        ) {
          MessageBox.alert(
            this.getI18nText("msgRequerido") + " : " + "Sistema"
          );
          return;
        }

        if (!oObject.oMaestraNivel) {
          MessageBox.alert(this.getI18nText("msgRequerido") + " : " + "Nivel");
          return;
        }

        if (
          (!oObject.usuarioSap || oObject.usuarioSap === "") &&
          oObject.codigo === "CP"
        ) {
          MessageBox.alert(
            "El usuario no cuenta con un codigo de empleado asociado ('pernr')"
          );
          return;
        }

        if (oObject.usuario.length > 12) {
          MessageBox.alert(
            "El campo de usuario no puede exceder los 12 caracteres."
          );
          return;
        }

        var oEntityData = {
          usuarioIas: oObject.usuarioIas,
          usuario: oObject.usuario.toUpperCase(),
          usuarioSap: oObject.usuarioSap,
          numeroDocumento: oObject.numeroDocumento,
          clave: oObject.numeroDocumento,
          nombre: oObject.nombre,
          apellidoPaterno: oObject.apellidoPaterno,
          apellidoMaterno: oObject.apellidoMaterno,
          telefono: oObject.telefono,
          Movil: oObject.Movil,
          correo: oObject.correo,
          seccionId: oObject.seccionId,
          seccionTxt: oObject.seccionTxt,
          oMaestraNivel: oObject.oMaestraNivel.join(),
          oMaestraTipoUsuario_codigo: oObject.oMaestraTipoUsuario_codigo,
          fechaVigInicio: oObject.fechaVigInicio,
          fechaVigFin: oObject.fechaVigFin,
          oMaestraSucursal_codigo: oObject.oMaestraSucursal_codigo,
          loginSap: oObject.loginSap,
          activo: true,
        };

        if (!oCriteria.isNew) {
          oEntityData.usuarioId = oObject.usuarioId;
          oEntityData.usuarioActualiza = gsUsuarioLogin;
          oEntityData.fechaActualiza = new Date();
        } else {
          oEntityData.usuarioRegistro = gsUsuarioLogin;
          oEntityData.fechaRegistro = new Date();
        }

        MessageBox.confirm(this.getI18nText("msgConfirmAdd"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              if (oCriteria.isNew) {
                oDataService.oDataCreate(oModel, "Usuario", oEntityData).then(
                  function (result) {
                    let oCreatedUser = result.data;
                    var aSistemas = [];
                    for (var i = 0; i < oObject.aNuevosSistemas.length; i++) {
                      var oSistema = oObject.aNuevosSistemas[i];

                      var sEntity = "/UsuarioSistema";
                      var sKeyEntity = oModel.createKey(sEntity, {
                        oUsuario_usuarioId: oCreatedUser.usuarioId,
                        oSistema_sistemaId: oSistema.sistemaId,
                      });

                      var oUsuarioSistema = {
                        oUsuario_usuarioId: oCreatedUser.usuarioId,
                        oSistema_sistemaId: oSistema.sistemaId,

                        /*--- auditoriaBase ---*/
                        terminal: "",
                        fechaRegistro: new Date(),
                        usuarioRegistro: gsUsuarioLogin,
                        activo: true,

                        /* --------DML para registros masivos-------- */
                        dml: oSistema.dml,
                        entity: sEntity,
                        keyEntity: sKeyEntity,
                      };

                      aSistemas.push(oUsuarioSistema);
                    }
                    oDataService
                      .oDataDmlMasive(oModel, aSistemas)
                      .then(
                        function (oResult) {
                          console.log("Exito UsuarioSistema: ", oResult);
                        },
                        function (oError) {
                          console.log("Error UsuarioSistema: ", oError);
                        }.bind(this)
                      )
                      .finally(() => {
                        that
                          .getView()
                          .getModel("CriteriaModel")
                          .setProperty("/isEdit", false);
                        that
                          .getView()
                          .getModel("CriteriaModel")
                          .setProperty("/isNew", false);
                        var aFilters = that._addConstantFilter(
                          oCriteria.queryText
                        );
                        that._getUsuario(aFilters);
                        MessageBox.success(that.getI18nText("msgCreado"));
                        oBusyDialog.close();
                      });
                  }.bind(this),
                  function (oError) {
                    oBusyDialog.close();
                    var oRespText = JSON.parse(oError.responseText).error;
                    if (
                      oRespText.message.value.toUpperCase() ==
                      "ENTITY ALREADY EXISTS"
                    ) {
                      MessageBox.error(
                        "El usuario ya existe, intente con otro usuario."
                      );
                    }
                  }
                );
              } else {
                var sKeyEntity = oModel.createKey("/Usuario", {
                  usuarioId: oEntityData.usuarioId,
                });
                delete oEntityData.clave;
                oDataService.oDataUpdate(oModel, sKeyEntity, oEntityData).then(
                  function (result) {
                    let oUpdatedUser = result.data;
                    if (oObject.aNuevosSistemas) {
                      var aSistemas = [];
                      for (var i = 0; i < oObject.aNuevosSistemas.length; i++) {
                        var oSistema = oObject.aNuevosSistemas[i];

                        var sEntity = "/UsuarioSistema";
                        var sKeyEntity = oModel.createKey(sEntity, {
                          oUsuario_usuarioId: oUpdatedUser.usuarioId,
                          oSistema_sistemaId: oSistema.sistemaId,
                        });

                        var oUsuarioSistema = {
                          oUsuario_usuarioId: oUpdatedUser.usuarioId,
                          oSistema_sistemaId: oSistema.sistemaId,

                          /*--- auditoriaBase ---*/
                          terminal: "",
                          fechaRegistro: new Date(),
                          usuarioRegistro: gsUsuarioLogin,
                          activo: true,

                          /* --------DML para registros masivos-------- */
                          dml: oSistema.dml,
                          entity: sEntity,
                          keyEntity: sKeyEntity,
                        };

                        aSistemas.push(oUsuarioSistema);
                      }
                      oDataService
                        .oDataDmlMasive(oModel, aSistemas)
                        .then(
                          function (oResult) {
                            console.log("Exito UsuarioSistema: ", oResult);
                          },
                          function (oError) {
                            console.log("Error UsuarioSistema: ", oError);
                          }.bind(this)
                        )
                        .finally(() => {
                          that
                            .getView()
                            .getModel("CriteriaModel")
                            .setProperty("/isEdit", false);
                          var aFilters = that._addConstantFilter(
                            oCriteria.queryText
                          );
                          that._getUsuario(aFilters);
                          MessageBox.success(that.getI18nText("msgActualiza"));
                          oBusyDialog.close();
                        });
                    } else {
                      that
                        .getView()
                        .getModel("CriteriaModel")
                        .setProperty("/isEdit", false);
                      var aFilters = that._addConstantFilter(
                        oCriteria.queryText
                      );
                      that._getUsuario(aFilters);
                      MessageBox.success(that.getI18nText("msgActualiza"));
                      oBusyDialog.close();
                    }
                  }.bind(this),
                  function (error) {
                    oBusyDialog.close();
                  }
                );
              }
            } else oBusyDialog.close();
          },
        });
      },
      onDelete: function (oEvent) {
        var that = this;
        var oContext = oEvent.getSource().getBindingContext("UserListModel");
        var oObject = oContext.getObject();
        var id = oObject.usuarioId;
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        var oUserLogin = sap.ui.getCore().getModel("UserLoginModel").getData();
        let MessageConfirm = oObject.activo
          ? this.getI18nText("msgConfirmDarBaja")
          : this.getI18nText("msgConfirmActivar");
        MessageBox.confirm(MessageConfirm, {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              var sKeyEntity = oModel.createKey("/Usuario", {
                usuarioId: id,
              });
              let oData = {
                fechaActualiza: new Date(),
                usuarioActualiza: gsUsuarioLogin,
                activo: oObject.activo ? false : true,
              };
              oDataService.oDataUpdate(oModel, sKeyEntity, oData).then(
                function (result) {
                  oBusyDialog.close();
                  that
                    .getView()
                    .getModel("CriteriaModel")
                    .setProperty("/isEdit", false);
                  var aFilters = that._addConstantFilter(oCriteria.queryText);
                  that._getUsuario(aFilters);
                  MessageBox.success(that.getI18nText("msgActualiza"));
                }.bind(this),
                function (error) {
                  oBusyDialog.close();
                  MessageBox.error(that.getI18nText(error.message));
                }
              );
            } else oBusyDialog.close();
          },
        });
      },
      onResetPass: function (oEvent) {
        var that = this;
        var oContext = oEvent.getSource().getBindingContext("UserListModel");
        var oObject = oContext.getObject();
        MessageBox.confirm(this.getI18nText("msgConfirmResetPass"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              var urlParameters = {
                usuarioId: oObject.usuarioId.toString(),
                correo: oObject.correo.toString(),
              };
              sap.ui.core.BusyIndicator.show(0);
              oDataService
                .oDataRead(that.oModel, "fnResetPassword", urlParameters, [])
                .then((oData) => {
                  sap.ui.core.BusyIndicator.hide();
                  var aResult = oData.results;
                  if (!aResult && oData.fnResetPassword) {
                    aResult = oData.fnResetPassword.results;
                  }
                  if (aResult && aResult.length > 0) {
                    var oResult = aResult[0];
                    if (oResult.bStatus) {
                      MessageBox.information(
                        oResult.sMessage + " : " + oResult.value
                      );
                    } else {
                      if (oResult.oError) {
                        MessageBox.error(oResult.oError);
                      } else {
                        MessageBox.error(oResult.sMessage);
                      }
                    }
                  } else {
                    MessageBox.error(that._getI18nText("E000400"));
                  }
                })
                .catch((oError) => {
                  sap.ui.core.BusyIndicator.hide();
                  that._customErrorMessage(oError);
                })
                .finally((oFinal) => {});
            } else oBusyDialog.close();
          },
        });
      },
      _validateInput: function (oInput) {
        var sValueState = "None";
        var bValidationError = false;
        var oBinding = oInput.getBinding("value");

        try {
          oBinding.getType().validateValue(oInput.getValue());
        } catch (oException) {
          sValueState = "Error";
          bValidationError = true;
        }
        if (oInput.sId.includes("input")) {
          oInput.setValueState(sValueState);
        } else {
          try {
            oInput.getParent().setValueState(sValueState);
          } catch (oException) {}
        }

        return bValidationError;
      },
      customEMailType: SimpleType.extend("email", {
        formatValue: function (oValue) {
          return oValue;
        },

        parseValue: function (oValue) {
          //parsing step takes place before validating step, value could be altered here
          return oValue;
        },

        validateValue: function (oValue) {
          // The following Regex is only used for demonstration purposes and does not cover all variations of email addresses.
          // It's always better to validate an address by simply sending an e-mail to it.
          var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
          if (!oValue.match(rexMail)) {
            throw new ValidateException(
              "'" + oValue + "' is not a valid e-mail address"
            );
          }
        },
      }),
      onChangePlanta: async function (oEvent, sCodigo) {
        sap.ui.core.BusyIndicator.show(0);
        let aFilters = [];
        aFilters.push(new Filter("AtinnText", "EQ", constanteArea));
        //metodo obtener areas de SAP
        let oResponse = await oDataService.oDataRead(
          this.oModelErpNec,
          "CaracteristicasSet",
          null,
          aFilters
        );
        var oModel = new JSONModel(oResponse.results);
        oModel.setSizeLimit(999999999);
        this.getView().setModel(oModel, "aListArea");
        sap.ui.core.BusyIndicator.hide();
      },
      onChangeSistema: function (oEvent) {
        var oCodigoSelected = oEvent
          .getSource()
          .getSelectedItem()
          .getProperty("additionalText");
        var oContext = oEvent.getSource().getBindingContext("UserListModel");
        var oPath = oContext.getPath();
        var index = parseInt(oPath.substring(oPath.lastIndexOf("/") + 1), 10);

        var oUserListModel = this.getView().getModel("UserListModel").getData();
        var oItemSelected = oUserListModel[index];

        oItemSelected.editSeccion = oCodigoSelected != "CP";
        if (!oItemSelected.editSeccion && oItemSelected.seccionId) {
          oItemSelected.seccionId = "";
          oItemSelected.seccionTxt = "";
        }
        //Cambio de nivel segun CP o RMD

        if (oItemSelected.editSeccion === true) {
          var aNivelesSAP = this.getView()
            .getModel("aListaNivelesSAP")
            .getData();

          var infoSAP = new JSONModel(aNivelesSAP);
          //RMD
          //oEvent.getSource().getParent().mAggregations.cells[5].setEditable(true);
          oEvent
            .getSource()
            .getParent()
            .mAggregations.cells[5].setSelectedItems();
          oEvent
            .getSource()
            .getParent()
            .mAggregations.cells[5].setModel(infoSAP, "aListaNiveles");
          //Modelo para indicar el numero de niveles seleccionados
          this.getView().setModel(
            new JSONModel([{ numNiv: 0 }]),
            "numNivelSelected"
          );
        } else {
          var aNivelesHANA = this.getView()
            .getModel("aListaNivelesHANA")
            .getData();

          aNivelesHANA = aNivelesHANA.filter((o) => {
            return o.oSistema_sistemaId == oItemSelected.oSistema_sistemaId;
          });
          var infoHANA = new JSONModel(aNivelesHANA);
          //CP
          oEvent
            .getSource()
            .getParent()
            .mAggregations.cells[5].setSelectedItems();
          oEvent
            .getSource()
            .getParent()
            .mAggregations.cells[5].setModel(infoHANA, "aListaNiveles");
          //oEvent.getSource().getParent().mAggregations.cells[5].setEditable(false);

          //Modelo para indicar el numero de niveles seleccionados
          this.getView().setModel(
            new JSONModel([{ numNiv: 1 }]),
            "numNivelSelected"
          );
        }
      },
      /**
       * @Description
       * Evento del boton "Exportar" que genera el documento XLSX
       * el evento hace uso de la libreria externa Sheet para la generacion del documentos XLSX
       * -  Libreria: ../lib/Sheet.js
       *
       * @param   {object} oEvent
       * @return  none
       * @History
       * v1.0 – Version inicial
       *
       */
      onExportXLSReport: function (oEvent) {
        var aReportResume = this.getView().getModel("UserListModel").getData();
        var aConstant = this.getView().getModel("MaestraModel").getData();
        var oInfoUserLogin = sap.ui
          .getCore()
          .getModel("UserLoginModel")
          .getData();

        var wb = XLSX.utils.book_new();
        wb.Props = {
          Title: "REPORTE DE USUARIOS",
          Subject: "TITAN",
          Author: "MEDIFARMA",
          CreatedDate: new Date(),
        };

        wb.SheetNames.push("USUARIO");

        var ws_header = [
          "Usuario",
          "N° Documento",
          "Usuario P IAS",
          "Sistema",
          "Planta",
          "Nivel",
          "Tipo Usuario",
          "Fecha Vigencia Inicio",
          "Fecha Vigencia Fin",
          "Estado Vigencia",
        ];

        if (oInfoUserLogin) {
          if (["RMD", "ADMIN"].includes(oInfoUserLogin.groups[0].sistema)) {
            ws_header.push("Sección Producción");
          }
        }

        var ws_header2 = [
          "Correo",
          "Nombres",
          "Ap. Paterno",
          "Ap. Materno",
          "Telefono Fijo",
          "Móvil",
          "Fecha Registro",
        ];

        ws_header = ws_header.concat(ws_header2);

        var ws_data = [];

        ws_data.push(ws_header);

        aReportResume.sort((a, b) =>
          a.usuario > b.usuario ? 1 : b.usuario > a.usuario ? -1 : 0
        );

        for (var key in aReportResume) {
          var oNow = new Date();
          var report = aReportResume[key];

          var oPlanta;
          if (aConstant["PLANTA"]) {
            oPlanta = aConstant["PLANTA"].find(
              (o) => o.codigo === report.oMaestraSucursal_codigo
            ); //PLANTA
          }
          /*var oNivel = aConstant["NIVEL"].find(
            (o) => o.codigo === report.oMaestraNivel
          ); //NIVEL*/
          var oTipoUsuario = aConstant["TIPO_USUARIO"].find(
            (o) => o.codigo === report.oMaestraTipoUsuario_codigo
          ); //TIPO_USUARIO
          var bVigencia = formatter.isDateBT(
            report.fechaVigInicio,
            report.fechaVigFin,
            oNow
          );
          var ws_content = [
            report.usuario,
            report.numeroDocumento,
            report.usuarioIas,
            report.aSistemas.results
              .map((oResult) => oResult.oSistema.nombre)
              .join(),
            oPlanta ? oPlanta.contenido : "", //PLANTA
            report.oMaestraNivel ? report.oMaestraNivel.join(",") : "", //NIVEL
            oTipoUsuario ? oTipoUsuario.contenido : "", //TIPO_USUARIO
            formatter.getTimestampToDMY(report.fechaVigInicio),
            formatter.getTimestampToDMY(report.fechaVigFin),
            bVigencia ? "Vigente" : "No Vigente",
          ];

          if (oInfoUserLogin) {
            if (
              oInfoUserLogin.groups[0].sistema === "RMD" ||
              oInfoUserLogin.groups[0].sistema === "ADMIN"
            ) {
              ws_content.push(report.seccionTxt);
            }
          }

          var ws_content2 = [
            report.correo,
            report.nombre,
            report.apellidoPaterno,
            report.apellidoMaterno,
            report.telefono,
            report.Movil,
            formatter.getTimestampToDMY(report.fechaRegistro),
          ];

          ws_content = ws_content.concat(ws_content2);

          ws_data.push(ws_content);
        }

        var wsSheet = XLSX.utils.aoa_to_sheet(ws_data);

        for (var key in wsSheet) {
          if (key !== "!ref") {
            wsSheet[key]["s"] = {
              fill: {
                patternType: "none", // none / solid
                fgColor: {
                  rgb: "FF6666",
                },
              },
              font: {
                name: "Arial",
                sz: 24,
                bold: true,
                color: {
                  rgb: "FFFFAA00",
                },
              },
            };
          }
        }

        wb.Sheets["USUARIO"] = wsSheet;
        XLSX.write(wb, {
          bookType: "xlsx",
          bookSST: true,
          type: "binary",
        });

        XLSX.writeFile(
          wb,
          "REPORTE_USUARIOS" + formatter.getTimestampToYMD(new Date()) + ".xlsx"
        );
      },
      _customErrorMessage: function (oError) {
        try {
          var aMessages = JSON.parse(oError.responseText).error.innererror
            .errordetails;
          var aMessageHtml = [];
          var sMessageType = "";
          aMessages.forEach(function (oMessage) {
            if (oMessage.message.includes("violated for association")) {
              sMessageType =
                "No se pudo realizar la acción, registro asociado a otras entidades.";
            }
            aMessageHtml.push("<li>" + oMessage.message + "</li>");
          });

          MessageBox.error(sMessageType ? sMessageType : oError.message, {
            title: "Error",
            details: "" + "<ul>" + aMessageHtml.join(" ") + "</ul>",
            styleClass: sResponsivePaddingClasses,
          });
        } catch (oErr) {
          MessageBox.error(oError.message);
        }
      },
      onGetNivelOdata: async function () {
        BusyIndicator.show(0);
        let aFilters = [];
        aFilters.push(new Filter("AtinnText", "EQ", constanteEtapa));
        let oResponse = await oDataService.oDataRead(
          this.oModelErpNec,
          "CaracteristicasSet",
          null,
          aFilters
        );
        oResponse.results.sort(function (a, b) {
          return a.Atzhl - b.Atzhl;
        });

        oResponse.results.forEach((oNivel) => {
          oNivel.Atwrt = `RMD_${oNivel.Atwrt}`;
        });

        console.log("________");
        console.log(oResponse.results);
        var aNivelesTotal = [];
        aNivelesTotal = aNivelesTotal.concat(oResponse.results);
        let info = new JSONModel(oResponse.results);
        this.getView().setModel(info, "aListaNiveles");
        this.getView().setModel(info, "aListaNivelesSAP");

        //Obeniendo niveles de HANA para CP
        var aNivelHana = that.getView().getModel("MaestraModel").getData()[
          "NIVEL"
        ];

        let aListaNivelHana = [];
        aNivelHana.forEach(function (oItem) {
          let oJson = {
            Atwrt: `CP_${oItem.contenido}`,
            Atzhl: oItem.codigo,
            oSistema_sistemaId: oItem.oSistema_sistemaId,
          };
          aListaNivelHana.push(oJson);
        });
        let info2 = new JSONModel(aListaNivelHana);

        this.getView().setModel(info2, "aListaNivelesHANA");

        aNivelesTotal = aNivelesTotal.concat(aListaNivelHana);
        let infoTotal = new JSONModel(aNivelesTotal);

        this.getView().setModel(infoTotal, "aListaNiveles");
        BusyIndicator.hide();
      },
      handleSelectionChange: function (oEvent) {
        console.log(oEvent);
        var aNumNiveRMD_CP = this.getView()
          .getModel("numNivelSelected")
          .getData();
        var oMultiCombo = oEvent.getSource();
        var aSelectedKeys = oMultiCombo.mProperties.selectedKeys;

        if (aSelectedKeys.length > 1) {
          if (aNumNiveRMD_CP[0].numNiv === 1) {
            aSelectedKeys.shift();
            oMultiCombo.setSelectedKeys(aSelectedKeys);
          }
        }
        console.log("--------");
      },
      handleSistemaSelectionChange: function (oEvent) {
        var oSource = oEvent.getSource();
        var aSelectedItems = oSource.getSelectedItems();
        var oTableRow = oEvent.getSource().getParent();
        var oSelectedUser = oTableRow
          .getBindingContext("UserListModel")
          .getObject();
        var aNuevosSistemas = [];
        var aSistemasActuales = oSelectedUser.aSistemas.results;
        // sistemas eliminados
        aSistemasActuales.forEach((oSistemaActual) => {
          var bFound = false;
          aSelectedItems.forEach((oSelectedItem) => {
            var oSistema = oSelectedItem
              .getBindingContext("SistemaModel")
              .getObject();
            if (oSistemaActual.oSistema_sistemaId === oSistema.sistemaId) {
              bFound = true;
            }
          });
          if (!bFound) {
            oSistemaActual.oSistema.dml = "D";
          } else {
            delete oSistemaActual.oSistema.dml;
          }
          aNuevosSistemas.push(oSistemaActual.oSistema);
        });
        // sistemas añadidos
        aSelectedItems.forEach((oSelectedItem) => {
          var oSistema = oSelectedItem
            .getBindingContext("SistemaModel")
            .getObject();
          var bFound = false;
          aSistemasActuales.forEach((oSistemaActual) => {
            if (oSistemaActual.oSistema_sistemaId === oSistema.sistemaId) {
              bFound = true;
            }
          });
          if (!bFound) {
            oSistema.dml = "C";
            aNuevosSistemas.push(oSistema);
          }
        });
        oSelectedUser.aNuevosSistemas = aNuevosSistemas;
        this.refreshControlSeccion(oSelectedUser, aNuevosSistemas);
        this.refreshListaNiveles(oSource);
      },

      refreshControlSeccion: function (oUsuario, aSistemas) {
        var bRmdPresente = false;
        aSistemas.forEach((oSistema) => {
          if (oSistema.codigo == "RMD" && oSistema.dml !== "D") {
            bRmdPresente = true;
          }
        });
        oUsuario.editSeccion = bRmdPresente;
      },

      refreshListaNiveles: function (oMultiComboSistema) {
        var aListaSistemas = oMultiComboSistema.getSelectedItems();
        var aListaNiveles = [];
        aListaSistemas.forEach((oSelectedItem) => {
          var oSistema = oSelectedItem
            .getBindingContext("SistemaModel")
            .getObject();
          var oCodigoSelected = oSistema.codigo;
          var oItemSelected = oMultiComboSistema
            .getBindingContext("UserListModel")
            .getObject();

          if (!oItemSelected.editSeccion && oItemSelected.seccionId) {
            oItemSelected.seccionId = "";
            oItemSelected.seccionTxt = "";
          }
          //Cambio de nivel segun CP o RMD

          if (oCodigoSelected === "RMD") {
            var aNivelesSAP = this.getView()
              .getModel("aListaNivelesSAP")
              .getData();

            aListaNiveles = aListaNiveles.concat(aNivelesSAP);
            //RMD
            //oEvent.getSource().getParent().mAggregations.cells[5].setEditable(true);
            //Modelo para indicar el numero de niveles seleccionados
            this.getView().setModel(
              new JSONModel([{ numNiv: 0 }]),
              "numNivelSelected"
            );
          } else {
            var aNivelesHANA = this.getView()
              .getModel("aListaNivelesHANA")
              .getData();

            aNivelesHANA = aNivelesHANA.filter((o) => {
              return o.oSistema_sistemaId == oSistema.sistemaId;
            });
            aListaNiveles = aListaNiveles.concat(aNivelesHANA);
            //oEvent.getSource().getParent().mAggregations.cells[5].setEditable(false);

            //Modelo para indicar el numero de niveles seleccionados
            this.getView().setModel(
              new JSONModel([{ numNiv: 1 }]),
              "numNivelSelected"
            );
          }
        });
        var oMulticomboNiveles =
          oMultiComboSistema.getParent().mAggregations.cells[5];
        var aKeysNivelesActuales = oMulticomboNiveles.getSelectedKeys();
        var aKeysNivelesNuevos = [];
        aListaNiveles.forEach((oNivel) => {
          var sKeyNivel = oNivel.Atwrt;
          if (aKeysNivelesActuales.includes(sKeyNivel)) {
            aKeysNivelesNuevos.push(sKeyNivel);
          }
        });
        oMulticomboNiveles.setSelectedItems();
        oMulticomboNiveles.setModel(
          new JSONModel(aListaNiveles),
          "aListaNiveles"
        );
        oMulticomboNiveles.setSelectedKeys(aKeysNivelesNuevos);
      },

      onValidateUser: function (oObject) {
        let aListUsers = this.getView().getModel("UserListModel").getData();
        let bValidation = false;

        aListUsers.forEach(function (oItem) {
          if (oItem.__metadata) {
            if (
              String(oObject.oSistema_sistemaId) ===
                String(oItem.oSistema_sistemaId) &&
              (oObject.numeroDocumento === oItem.numeroDocumento ||
                oObject.usuario === oItem.usuario)
            ) {
              bValidation = true;
              return;
            }
          }
        });

        return bValidation;
      },
      onValidateUserSystem: function (oObject) {
        let aListUsers = this.getView().getModel("UserListModel").getData();
        let bValidation = false;

        aListUsers.forEach(function (oItem) {
          if (oItem.__metadata) {
            /* if(oObject.numeroDocumento === oItem.numeroDocumento){
                        bValidation = true;
                        return;
                    }  */
            if (
              oObject.usuario === oItem.usuario &&
              String(oObject.oSistema_sistemaId) ===
                String(oItem.numeroDocumento)
            ) {
              bValidation = true;
              return;
            }
          }
        });

        return bValidation;
      },
      deleteAccented: function (string) {
        return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      },
      // ,
      // // Validacion de un combobox
      // _validateComboBox: function (oInput) {
      //     var sValueState = "None";
      //     var bValidationError = false;
      //     var oBinding = oInput.getBinding("key");

      //     if (oBinding.vValue === "") {
      //         sValueState = "Error";
      //         bValidationError = true;
      //     }

      //     oInput.setValueState(sValueState);

      //     return bValidationError;
      // }
    });
  }
);
