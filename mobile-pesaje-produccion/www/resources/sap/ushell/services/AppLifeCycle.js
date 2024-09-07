// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/base/EventProvider","sap/ushell/TechnicalParameters"],function(E,T){"use strict";var S="appLoaded";function A(a,c,p,C){var o,e,v;this.getCurrentApplication=function(){return o;};this.attachAppLoaded=function(d,f,l){e.attachEvent(S,d,f,l);};this.detachAppLoaded=function(f,l){e.detachEvent(S,f,l);};this.prepareCurrentAppObject=function(b,d,h,f){s(b,d,h,f);};e=new E();if(sap.ushell.Container.runningInIframe===undefined||sap.ushell.Container.runningInIframe()===false){r();}function r(){v=sap.ui.getCore().byId("viewPortContainer");if(!v||typeof v.attachAfterNavigate!=="function"){jQuery.sap.log.error("Error during instantiation of AppLifeCycle service","Could not attach to afterNavigate event","sap.ushell.services.AppLifeCycle");return;}v.attachAfterNavigate(function(b){var d,f,g,h,i,H=false;if(b.mParameters.toId.indexOf("applicationShellPage")===0){f=b.mParameters.to.getApp();}else if(b.mParameters.toId.indexOf("application")===0){f=b.mParameters.to;}if(f&&typeof f.getComponentHandle==="function"&&f.getComponentHandle()){h=f.getComponentHandle().getInstance();}else if(f){d=f.getAggregation("child");if(d){h=d.getComponentInstance();}}else{h=sap.ui.getCore().getComponent(b.mParameters.to.getComponent());}if(h){i=h.getId();H=i.indexOf("Shell-home-component")!==-1||i.indexOf("Shell-appfinder-component")!==-1;}g=f&&typeof f.getApplicationType==="function"&&f.getApplicationType();if((!g||g==="URL")&&h){g="UI5";}s(g,h,H,f);});}function s(b,d,h,f){o={applicationType:b,componentInstance:d,homePage:h,getTechnicalParameter:function(P){return T.getParameterValue(P,d,f,b);},getIntent:function(){var H=hasher&&hasher.getHash();if(!H){return Promise.reject("Could not identify current application hash");}var g=sap.ushell.Container.getServiceAsync("URLParsing");return g.then(function(P){return P.parseShellHash(H);});}};setTimeout(function(){e.fireEvent(S,o);},0);}}A.hasNoAdapter=true;return A;},true);
