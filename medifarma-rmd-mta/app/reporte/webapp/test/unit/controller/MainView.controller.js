/*global QUnit*/

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/mvc/Controller",
	"mif/rmd/reporte/controller/MainView.controller",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/_ODataMetaModelUtils",
	"sap/ui/model/odata/ODataMetaModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/Context",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/m/List",
	"sap/m/DisplayListItem",
	"sap/base/Log",
	"sap/ui/thirdparty/datajs"
], function (ManagedObject, Controller, MainViewController, sinon, sinonqunit, ResourceModel, JSONModel, _ODataMetaModelUtils,
	ODataMetaModel,
	ODataModel,
	CountMode,
	Filter,
	FilterOperator,
	Sorter,
	Context,
	Label,
	Panel,
	List,
	ListItem,Log) {
	"use strict";
	var sURI = "http://localhost:8080/srv_api/v2/browse/";
	sURI = "/proxy/http/" + sURI.replace("http://", "");

	/* QUnit.module("MainView Controller");

	QUnit.test("I should test the MainView controller", function (assert) {
		var oMainViewController = new MainViewController();
		oMainViewController.onInit();
		assert.ok(oMainViewController);
	}); */

	QUnit.module("MainView Controller", {
		beforeEach: function () {
			this.oMainViewController = new MainViewController();
			this.oMainViewController.onInit();
			this.oViewStub = new ManagedObject({});
			//Obtenemos la vista associada al controlador
			sinon.stub(Controller.prototype, "getView").returns(this.oViewStub);

			this._oResourceModel = new ResourceModel({
				bundleUrl: sap.ui.require.toUrl("mif/rmd/reporte") + "/i18n/i18n.properties"
			});

		},

		afterEach: function () {
			Controller.prototype.getView.restore();
			this.oViewStub.destroy();
			this._oResourceModel.destroy();
		}
	});

	QUnit.test("Test Init MainView controller", function (assert) {
		var oMainViewController = new MainViewController();
		var oInit = oMainViewController.onInit();
		assert.ok(oMainViewController);
	});

	function removeSharedServicedata(sURI) {
		var sServiceURI = sURI.replace(/\/$/, "");
		if (ODataModel.mServiceData && ODataModel.mServiceData[sServiceURI]) {
			delete ODataModel.mServiceData[sServiceURI];
		}
	}


	function initModel() {
		var sURI;
		if (typeof arguments[0] === 'string') {
			sURI = arguments[0];
		} else {
			sURI = arguments[0].serviceUrl;
		}

		removeSharedServicedata(sURI);

		// create arguments array with leading "null" value so that it can be passed to the apply function
		var aArgs = [null].concat(Array.prototype.slice.call(arguments, 0));

		// create factory function by calling "bind" with the provided arguments
		var Factory = ODataModel.bind.apply(ODataModel, aArgs);

		// the factory will create the model with the arguments above
		var oModel = new Factory();
		return oModel;
	}

	/* 	QUnit.test("test oDataModel - oMetadata shared across models", function(assert){
			var done = assert.async();
			var mOptions = {
					json : true,
					loadMetadataAsync: true
				};
			var oModel = initModel(sURI, mOptions);
			var oModel2 = {};

			oModel.oMetadata.attachLoaded(function() {
				Log.debug("test 1 - metadata loaded is fired on metadata onload of model1");
			});

			oModel.attachMetadataLoaded(function(){
				assert.ok(oModel.getServiceMetadata() != null, "First model: Service metadata is available");
				oModel.destroy();
				oModel2 = new ODataModel(sURI, mOptions);

				var bFiredAtMetadata = false;

				new Promise(function(fnResolve, fnReject) {

					oModel2.oMetadata.attachLoaded(function() {
						Log.debug("test 2 - metadata loaded is fired on metadata");
						bFiredAtMetadata = true;
					});
					// attach again and wait for the metadataloaded event at the model itself,
					//fail if event is fired at the metadata object
					oModel2.attachMetadataLoaded(function() {
						Log.debug("metadata loaded is fired");
						assert.ok(oModel2.getServiceMetadata() != null, "Second model: Service metadata is available");
						if (!bFiredAtMetadata) {
							fnResolve();
						} else {
							fnReject();
						}
					});

				}).then(function(){
					assert.ok(true, 'Metadata loaded fired at model only');
				}, function(e){
					Log.debug("metadata promise failed");
					assert.ok(false, 'Metadata loaded fired at metadata object');
				}).finally(done);

			});
		}); */

	QUnit.module("ODataModel read ", {
		beforeEach: function (assert) {
			this.oModel = initModel(sURI, true);
		},
		afterEach: function () {
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("test oDataModel - oMetadata shared across models", function (assert) {
		this.oModel = initModel(sURI, true);
		var done = assert.async();
		var mOptions = {
			json: true,
			loadMetadataAsync: true
		};
		this.oModel = initModel(sURI, mOptions);
		var oModel2 = {};

		this.oModel.oMetadata.attachLoaded(function () {
			Log.debug("test 1 - metadata loaded is fired on metadata onload of model1");
		});

		this.oModel.attachMetadataLoaded(function () {
			assert.ok(this.oModel.getServiceMetadata() != null, "First model: Service metadata is available");
			this.oModel.destroy();
			oModel2 = new ODataModel(sURI, mOptions);

			var bFiredAtMetadata = false;

			new Promise(function (fnResolve, fnReject) {

				oModel2.oMetadata.attachLoaded(function () {
					Log.debug("test 2 - metadata loaded is fired on metadata");
					bFiredAtMetadata = true;
				});
				// attach again and wait for the metadataloaded event at the model itself,
				//fail if event is fired at the metadata object
				oModel2.attachMetadataLoaded(function () {
					Log.debug("metadata loaded is fired");
					assert.ok(oModel2.getServiceMetadata() != null, "Second model: Service metadata is available");
					if (!bFiredAtMetadata) {
						fnResolve();
					} else {
						fnReject();
					}
				});

			}).then(function () {
				assert.ok(true, 'Metadata loaded fired at model only');
			}, function (e) {
				Log.debug("metadata promise failed");
				assert.ok(false, 'Metadata loaded fired at metadata object');
			}).finally(done);

		}.bind(this));
	});

	QUnit.test("Test MAESTRA odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/MAESTRA", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "MAESTRA", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test RMD odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/RMD", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "RMD", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test MD_ES_EQUIPO odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/MD_ES_EQUIPO", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "MD_ES_EQUIPO", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test RMD_ESTRUCTURA odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/RMD_ESTRUCTURA", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "RMD_ESTRUCTURA", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test RMD_ES_PASO odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/RMD_ES_PASO", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "RMD_ES_PASO", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test RMD_ES_EQUIPO odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/RMD_ES_EQUIPO", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "RMD_ES_EQUIPO", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test RMD_ES_UTENSILIO odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/RMD_ES_UTENSILIO", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "RMD_ES_UTENSILIO", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test RMD_ES_ESPECIFICACION odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/RMD_ES_ESPECIFICACION", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "RMD_ES_ESPECIFICACION", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test RMD_ES_RE_INSUMO odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/RMD_ES_RE_INSUMO", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "RMD_ES_RE_INSUMO", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test RMD_ES_ETIQUETA odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/RMD_ES_ETIQUETA", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "RMD_ES_ETIQUETA", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("Test RMD_ES_PASO_INSUMO_PASO odata", function (assert) {
		var done = assert.async();
		this.oModel.read("/RMD_ES_PASO_INSUMO_PASO", null, null, true, function (oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "RMD_ES_PASO_INSUMO_PASO", "request uri does not have parameters");
			done();
		}, function () {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});


});