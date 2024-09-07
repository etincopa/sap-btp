/*!
 * © 2021, Everis Peru
 */
sap.ui.define([],function(){"use strict";const t={};t.isTestMode=function(){if(!this._testMode){this._testMode=window.location.host.includes("localhost")||window.location.host.includes("workspaces-ws")}return this._testMode};return t});