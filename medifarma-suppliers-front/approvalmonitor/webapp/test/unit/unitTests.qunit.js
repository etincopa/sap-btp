/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/everis/suppliers/approvalmonitor/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});