// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/AppConfiguration","sap/base/Log","sap/ui/thirdparty/jquery"],function(A,L,q){"use strict";var o=["deleteTile","actionModeActive","catalogTileClick","dashboardTileClick","dashboardTileLinkClick"],E=sap.ui.getCore().getEventBus(),t=this,l={};function s(c){var m=sap.ushell.services.AppConfiguration.getMetadata();l[c]={};l[c].startTime=new Date();l[c].title=m.title;}function a(c){var d=0;try{d=(new Date()-l[c].startTime)/1000;sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Time in Application (sec)",d,[l[c].title]);}catch(e){L.warning("Duration in application "+c+" could not be calculated",null,"sap.ushell.components.homepage.FLPAnalytics");}}function h(c,d,D){var f=hasher.getHash(),g;window.swa.custom1={ref:f};switch(d){case"appOpened":s(f);sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Opened","Direct Launch",[l[f].title]);E.unsubscribe("sap.ushell","appOpened",h);break;case"bookmarkTileAdded":g=window.document.title;sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Personalization","Save as Tile",[g,D&&D.group&&D.group.title?D.group.title:"",D&&D.group&&D.group.id?D.group.id:"",D&&D.tile&&D.tile.title?D.tile.title:g]);break;case"actionModeActive":sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Personalization","Enter Action Mode",[D.source]);break;case"catalogTileClick":sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Launch point","Catalog",[]);break;case"dashboardTileClick":sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Launch point","Homepage",[]);break;case"dashboardTileLinkClick":sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Launch point","Tile Group Link",[]);break;default:break;}}function b(c){var f,T,d;if(c.getParameter("from")&&c.getParameter("to")){f=c.getParameter("from").getId().replace("application-","").replace("applicationShellPage-","");window.swa.custom1={ref:f};a(f);d=c.getParameter("to");T=d.getId().replace("application-","").replace("applicationShellPage-","");s(T);window.swa.custom1={ref:T};sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Opened","Fiori Navigation",[l[T].title]);}}q(window).on("unload",function(c){var d=window.location.hash.substr(1);a(d);});try{sap.ui.getCore().byId("viewPortContainer").attachAfterNavigate(b,t);}catch(e){L.warning("Failure when subscribing to viewPortContainer 'AfterNavigate' event",null,"sap.ushell.components.homepage.FLPAnalytics");}E.subscribe("sap.ushell.services.Bookmark","bookmarkTileAdded",h,t);o.forEach(function(i){E.subscribe("launchpad",i,h,t);});E.subscribe("sap.ushell","appOpened",h,t);},false);
