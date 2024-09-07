/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/everis/suppliers/tilepotracking/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});