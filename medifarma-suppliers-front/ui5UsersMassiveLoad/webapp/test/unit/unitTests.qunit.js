/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/everis/suppliers/ui5UsersMassiveLoad/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
