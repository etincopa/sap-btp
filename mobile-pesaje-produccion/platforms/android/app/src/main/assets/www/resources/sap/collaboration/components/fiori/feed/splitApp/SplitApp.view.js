/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/mvc/JSView","sap/m/SplitApp"],function(J,S){"use strict";sap.ui.jsview("sap.collaboration.components.fiori.feed.splitApp.SplitApp",{getControllerName:function(){return"sap.collaboration.components.fiori.feed.splitApp.SplitApp";},createContent:function(c){this.sPrefixId=this.getViewData().controlId;this.oSplitApp=new S(this.sPrefixId+"splitApp");return this.oSplitApp;}});});
