sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	'sap/m/MessageBox',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/Button',
	'sap/m/Text',
	'sap/m/StandardListItem',
	'sap/ui/core/BusyIndicator',
	'sap/ui/model/odata/v4/ODataModel',
	'sap/ui/model/odata/OperationMode',
	'sap/ui/model/Filter',
	"sap/ui/model/FilterOperator",
	"com/everis/monitorDocumentos/controller/baseController",
	"sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageToast, MessageBox, Dialog, Text, Button, List, StandardListItem,
	BusyIndicator, ODataModel, OperationMode, Filter, FilterOperator, baseController, History) {
	"use strict";
	return baseController.extend("com.everis.monitorDocumentos.controller.detailPVenta", {
		inputId: "",
		
		sPathTbl: "",
		sDeleteIndex: "",
		oRegistroModel: "",
		handleRouteMatched: function (oEvent) {
			var idReserva = oEvent.getParameters().data.idDocumento,
				model = new JSONModel();
			var that = this;
			that.getReservaModel(idReserva);
		},
		onInit: function () {
			sap.ui.core.BusyIndicator.show();
				this.getOwnerComponent().getModel("oDataModelVenta").metadataLoaded().then(function (odata) {
					sap.ui.core.BusyIndicator.hide();
				});
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("detailPVenta").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			//	this.oRouter.getTarget("TargetDetail").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.onRouteMatched();
			//	this.loadControls();
		},
		onRouteMatched: function (oEvent) {
			// binding view code and all
			this.i18n = this.getModel("i18n");
			this.oRegistroModel = new JSONModel({});
			//this.getOwnerComponent().getModel("oRegistroModel");
			this.items = [];
		},
		onChangeInput: function (evt) {
			var id = evt.getParameter("id");
			this.setEnableClearForm(id);
		},
		onODataCentro: function (Object) {
			var query = "/CentroSet";
			var aFilter = [];
			var _this = this;
			aFilter.push(new Filter("IdSociedad","EQ",Object.Sociedad));
			aFilter.push(new Filter("IdCentro","EQ",Object.Centro));
			//var queryTable = "/zreservaSet('" + idReserva + "')/ToReservaPosciones";
			this.getOwnerComponent().getModel("oDataModelVenta").read(query, {
				filters:aFilter,
				success: function (res) {
					_this._byId("inputCentro").setText(res.results[0].IdCentro+" - "+ res.results[0].Descripcion);
				},
				error: function (err) {
					var msj = "";
					if (err.responseText !== undefined) {
						var e = JSON.parse(err.responseText);
						msj = e.error.message.value;
					}
					_this.showMessageBox(msj, "error");
				}
			});
		},
		onODataSociedad: function (Object) {
			var query = "/SociedadSet";
			var _this = this;
			//var queryTable = "/zreservaSet('" + idReserva + "')/ToReservaPosciones";
			this.sociedad = Object.Sociedad;
			this.getOwnerComponent().getModel("oDataModelVenta").read(query, {
				success: function (res) {
					for (var i=0; i<res.results.length; i++) {
						if(_this.sociedad === res.results[i].IdSociedad){
							_this._byId("txtSociedad").setText(res.results[i].IdSociedad+" - "+ res.results[i].Nombre);
						}
					}
				},
				error: function (err) {
					var msj = "";
					if (err.responseText !== undefined) {
						var e = JSON.parse(err.responseText);
						msj = e.error.message.value;
					}
					_this.showMessageBox(msj, "error");
				}
			});
		},
		_byId: function (sName) {
			var cmp = this.byId(sName);
			if (!cmp) {
				cmp = sap.ui.getCore().byId(sName);
			}
			return cmp;
		},
		onODataAlmacen: function (Object) {
			var query = "/AlmacenSet";
			var aFilter = [];
			var _this = this;
			aFilter.push(new Filter("IdCentro","EQ",Object.Centro));
			aFilter.push(new Filter("IdAlmacen","EQ",Object.Almacen));
			
			this.getOwnerComponent().getModel("oDataModelVenta").read(query, {
				filters:aFilter,
				success: function (res) {
					_this._byId("TextAlmacen").setText(res.results[0].IdAlmacen+" - "+ res.results[0].Descripcion);
				},
				error: function (err) {
					var msj = "";
					if (err.responseText !== undefined) {
						var e = JSON.parse(err.responseText);
						msj = e.error.message.value;
					}
					_this.showMessageBox(msj, "error");
				}
			});
		},
		onBackHome: function () {
			
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);
			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				//	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.navTo("default", true);
			}
		},
		getQueryParameters: function (oLocation) {
			
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},

		/****************************************************/
		getReservaModel: function (idReserva) {
			var that = this;
				var query = "/CabeceraSet";
			var aFilter = [];
			aFilter.push(new Filter("NroSolicitud","EQ",idReserva));
			//var queryTable = "/zreservaSet('" + idReserva + "')/ToReservaPosciones";
			this.getOwnerComponent().getModel("oDataModelVenta").read(query, {
				urlParameters:{
					"$expand":"PosicionSet"
				},
				filters:aFilter,
				success: function (res) {
					that.getView().setModel(new JSONModel({NroSolicitud:String(res.results[0].NroSolicitud)}),"Head");
					for(var i in res.results[0].PosicionSet.results){
						var data = res.results[0].PosicionSet.results[i];
						data.Pos = data.Pos.replace(/^0+/, '');                         
						data.NroMaterial = data.NroMaterial.replace(/^0+/, '');                         
						switch (data.Estado){
							case '1':
								data.TextEstado = "Aprobado";
								data.Icon = "sap-icon://circle-task-2";
								data.State = "Success";
								break;
							case '0':
								data.TextEstado = "Rechazado";
								data.Icon = "sap-icon://circle-task-2";
								data.State = "Error";
								break;
							case '4':
								data.TextEstado = "Rechazado";
								data.Icon = "sap-icon://circle-task-2";
								data.State = "Error";
								break;
							case '5':
								data.TextEstado = "Anulado";
								data.Icon = "sap-icon://circle-task-2";
								data.State = "Error";
								break;
							default:
								data.TextEstado = "Pendiente";
								data.Icon = "sap-icon://circle-task-2";
								data.State = "Warning";
						}
						
					}
					that.onODataAlmacen(res.results[0]);
					that.onODataCentro(res.results[0]);
					that.onODataSociedad(res.results[0]);
					that.getView().setModel(new JSONModel(res.results[0]),"oDetallePV");
					//that.getView().getModel("oDetallePV").setData(res[0].results);
					that.getView().getModel("oDetallePV").updateBindings();
				},
				error: function (err) {
					var msj = "";
					if (err.responseText !== undefined) {
						var e = JSON.parse(err.responseText);
						msj = e.error.message.value;
					}
					that.showMessageBox(msj, "error");
				}
			});
		},

	});
});