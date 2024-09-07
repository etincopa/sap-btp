/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/medifarma/cp/pesajeimpresionbultosaldo/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});