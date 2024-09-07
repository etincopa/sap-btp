/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/UIComponent","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector","sap/ui/fl/support/apps/contentbrowser/utils/DataUtils"],function(C,U,F,a,L,D){"use strict";return C.extend("sap.ui.fl.support.apps.contentbrowser.controller.LayerContentMaster",{sNamespace:"",sLayer:"",oDataUtils:D,onInit:function(){var r=U.getRouterFor(this);r.getRoute("LayerContentMaster").attachMatched(this._onRouteMatched,this);},_onRouteMatched:function(r){var t=this;var R=r.getParameter("arguments");this.sLayer=R.layer;this.sNamespace=R.namespace||"";var p=this.getView().getContent()[0];p.setBusy(true);t.sNamespace=decodeURIComponent(t.sNamespace);p.setTitle(this._shortenNamespace());L.getContent(t.sLayer,t.sNamespace).then(t._onContentReceived.bind(t,p),function(){p.setBusy(false);}).then(function(){L.requestPending=false;});},_onContentReceived:function(p,d){var c=this.getView().getModel("content");c.setData(d);p.setBusy(false);this.filterListByQuery("");this.byId("search").setValue("");},onSearch:function(e){var q=e.getSource().getValue();this.filterListByQuery(q);},filterListByQuery:function(q){var f=[];if(q&&q.length>0){f=new F({filters:[new F("name",a.Contains,q),new F("fileType",a.Contains,q)],and:false});}var l=this.byId("masterComponentsList");var b=l.getBinding("items");b.filter(f,"content");},onContentSelected:function(e){var s=e.getSource();var c=s.getBindingContextPath().substring(1);var b=this.getView().getModel("content").getData();var d=b[c];var f=d.name;var g=b[c].fileType;var r=U.getRouterFor(this);this.sNamespace=(this.sNamespace?this.sNamespace:'/');if(g){var R={layer:this.sLayer,namespace:encodeURIComponent(this.sNamespace),fileName:f,fileType:g};r.navTo("ContentDetails",R);}else{this.sNamespace+=f+'/';r.navTo("LayerContentMaster",{layer:this.sLayer,namespace:encodeURIComponent(this.sNamespace)});}},navBack:function(){var r=U.getRouterFor(this);if(!this.sNamespace||this.sNamespace==="/"){r.navTo("Layers");}else{var s=this.sNamespace.split("/");s.splice(-2,1);var t=s.join("/");r.navTo("LayerContentMaster",{layer:this.sLayer,namespace:encodeURIComponent(t)},true);}},_shortenNamespace:function(){if(!this.sNamespace||this.sNamespace==='/'){return"["+this.sLayer+"] /";}var s=this.sNamespace.split('/');var n=s.length;if(n>2){return"["+this.sLayer+"] .../"+s[n-2];}return"["+this.sLayer+"] /"+this.sNamespace[n-1];},handleMessagePopoverPress:function(e){var s=e.getSource();sap.ui.require(["sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils"],function(E){E.handleMessagePopoverPress(s);});}});});
