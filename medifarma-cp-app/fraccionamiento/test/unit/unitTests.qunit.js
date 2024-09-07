/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"commedifarma.cp./usuario-fraccionamiento/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
