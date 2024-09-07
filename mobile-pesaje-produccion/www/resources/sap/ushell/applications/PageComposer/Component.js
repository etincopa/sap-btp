//Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/UIComponent","./controller/CopyDialog","./controller/DeleteDialog.controller","./controller/ErrorDialog"],function(U,C,D,E){"use strict";return U.extend("sap.ushell.applications.PageComposer.Component",{metadata:{"manifest":"json"},init:function(){U.prototype.init.apply(this,arguments);this.getRouter().initialize();this.getModel("PageRepository").setHeaders({"sap-language":sap.ushell.Container.getUser().getLanguage(),"sap-client":sap.ushell.Container.getLogonSystem().getClient()});},showErrorDialog:function(e){E.open(e);},createTransportComponent:function(p){return this.createComponent({async:true,usage:"transportInformation",componentData:{"package":p}});}});});
