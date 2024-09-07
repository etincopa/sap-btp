sap.ui.define(["sap/ui/core/mvc/ControllerExtension","sap/suite/ui/generic/template/detailTemplates/detailUtils","sap/suite/ui/generic/template/Canvas/extensionAPI/ExtensionAPI"],function(C,d,E){"use strict";return{getMethods:function(v,t,c){var b=d.getControllerBase(v,t,c);var o={onInit:function(){var a=c.getOwnerComponent();var r=a.getRequiredControls();b.onInit(r);},handlers:{},extensionAPI:new E(t,c,b)};o.handlers=Object.assign(b.handlers,o.handlers);v.onComponentActivate=b.onComponentActivate;v.getCurrentState=function(){var r=Object.create(null);var i=true;var s=function(a,e){if(!(a instanceof C)){throw new Error("State must always be set with respect to a ControllerExtension");}if(!i){throw new Error("State must always be provided synchronously");}var f=a.getMetadata().getNamespace();if(e){for(var g in e){r["$extension$"+f+"$"+g]=e[g];}}};c.templateBaseExtension.provideExtensionStateData(s);i=false;return r;};v.applyState=function(s,i){var e=Object.create(null);var I=true;var g=function(a){if(!(a instanceof C)){throw new Error("State must always be retrieved with respect to a ControllerExtension");}if(!I){throw new Error("State must always be restored synchronously");}var f=a.getMetadata().getNamespace();return e[f];};c.templateBaseExtension.restoreExtensionStateData(g,i);I=false;};return o;}};});
