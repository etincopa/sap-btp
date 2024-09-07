/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/Device","sap/base/security/encodeXML","sap/base/util/isPlainObject"],function(q,D,e,a){"use strict";var B,b,L,P,T,M,H,l;var S=(function($,d){var c,s,f,g,t=0,m=3000,h=2,j=3,r=1,o={},k={btnStart:"startE2ETrace",selLevel:"logLevelE2ETrace",taContent:"outputE2ETrace",infoText:"Ent-to-End trace is running in the background."+" Navigate to the URL that you would like to trace."+" The result of the trace will be shown in dialog after the trace is terminated.",infoDuration:5000},n={dvLoadedLibs:"LoadedLibs",dvLoadedModules:"LoadedModules"};function p(i,v,G,I,J){i.push("<tr class='sapUiSelectable'><td class='sapUiSupportTechInfoBorder sapUiSelectable'><label class='sapUiSupportLabel sapUiSelectable'>",e(I),"</label><br>");var K=J;if(typeof J==="function"){K=J(i)||"";}i.push(e(K));i.push("</td></tr>");}function u(G,I,J,K,N){p(G,I,J,K,function(G){G.push("<table class='sapMSupportTable' border='0' cellspacing='5' cellpadding='5' width='100%'><tbody>");q.each(N,function(i,v){var O="";if(v!==undefined&&v!==null){if(typeof(v)=="string"||typeof(v)=="boolean"||(Array.isArray(v)&&v.length==1)){O=v;}else if(Array.isArray(v)||a(v)){O=JSON.stringify(v);}}p(G,false,false,i,""+O);});G.push("</tbody></table>");});}function w(G){o={version:G.commonInformation.version,build:G.commonInformation.buildTime,change:G.commonInformation.lastChange,useragent:G.commonInformation.userAgent,docmode:G.commonInformation.documentMode,debug:G.commonInformation.debugMode,bootconfig:G.configurationBootstrap,config:G.configurationComputed,loadedlibs:G.loadedLibraries,modules:G.loadedModules,uriparams:G.URLParameters,appurl:G.commonInformation.applicationHREF};var I=["<table class='sapUiSelectable' border='0' cellspacing='5' cellpadding='5' width='100%'><tbody class='sapUiSelectable'>"];p(I,true,true,"SAPUI5 Version",function(i){i.push(o.version," (built at ",o.build,", last change ",o.change,")");});p(I,true,true,"User Agent",function(i){i.push(o.useragent,(o.docmode?", Document Mode '"+o.docmode+"'":""));});p(I,true,true,"Debug Sources",function(i){i.push((o.debug?"ON":"OFF"));});p(I,true,true,"Application",o.appurl);u(I,true,true,"Configuration (bootstrap)",o.bootconfig);u(I,true,true,"Configuration (computed)",o.config);u(I,true,true,"URI Parameters",o.uriparams);p(I,true,true,"End-to-End Trace",function(i){i.push("<label class='sapUiSupportLabel'>Trace Level:</label>","<select id='"+x(k.selLevel)+"' class='sapUiSupportTxtFld' >","<option value='low'>LOW</option>","<option value='medium' selected>MEDIUM</option>","<option value='high'>HIGH</option>","</select>");i.push("<button id='"+x(k.btnStart)+"' class='sapUiSupportBtn'>Start</button>");i.push("<div class='sapUiSupportDiv'>");i.push("<label class='sapUiSupportLabel'>XML Output:</label>");i.push("<textarea id='"+x(k.taContent)+"' class='sapUiSupportTxtArea sapUiSelectable' readonly ></textarea>");i.push("</div>");});p(I,true,true,"Loaded Libraries",function(J){J.push("<ul class='sapUiSelectable'>");q.each(o.loadedlibs,function(i,v){if(v&&(typeof(v)==="string"||typeof(v)==="boolean")){J.push("<li class='sapUiSelectable'>",i+" "+v,"</li>");}});J.push("</ul>");});p(I,true,true,"Loaded Modules",function(i){i.push("<div class='sapUiSupportDiv sapUiSelectable' id='"+x(n.dvLoadedModules)+"'></div>");});I.push("</tbody></table>");return new H({content:I.join("").replace(/\{/g,"&#123;").replace(/\}/g,"&#125;")});}function x(i){return c.getId()+"-"+i;}function y(v,G){var I="Modules";var J=0,K=[];J=G.length;q.each(G.sort(),function(i,O){K.push(new L({text:" - "+O}).addStyleClass("sapUiSupportPnlLbl"));});var N=new P({expandable:true,expanded:false,headerToolbar:new T({design:l.ToolbarDesign.Transparent,content:[new L({text:I+" ("+J+")",design:l.LabelDesign.Bold})]}),content:K});N.placeAt(x(v),"only");}function z(i){if(c.traceXml){c.$(k.taContent).text(c.traceXml);}if(c.e2eLogLevel){c.$(k.selLevel).val(c.e2eLogLevel);}y(n.dvLoadedModules,o.modules);c.$(k.btnStart).one("tap",function(){c.e2eLogLevel=c.$(k.selLevel).val();c.$(k.btnStart).addClass("sapUiSupportRunningTrace").text("Running...");c.traceXml="";c.$(k.taContent).text("");i.start(c.e2eLogLevel,function(v){c.traceXml=v;});M.show(k.infoText,{duration:k.infoDuration});c.close();});}function A(){if(c){return c;}c=new b({title:"Technical Information",horizontalScrolling:true,verticalScrolling:true,stretch:D.system.phone,buttons:[new B({text:"Close",press:function(){c.close();}})],afterOpen:function(){S.off();},afterClose:function(){S.on();}}).addStyleClass("sapMSupport");return c;}function C(i){if(i.touches){var v=i.touches.length;if(v>j){d.removeEventListener('touchend',E);return;}switch(v){case h:s=Date.now();d.addEventListener('touchend',E);break;case j:if(s){t=Date.now()-s;g=i.touches[v-1].identifier;}break;}}}function E(i){d.removeEventListener('touchend',E);if(t>m&&(i.touches.length===h)&&i.changedTouches.length===r&&i.changedTouches[0].identifier===g){t=0;s=0;F();}}function F(){sap.ui.require(["sap/ui/core/support/ToolsAPI","sap/ui/core/support/trace/E2eTraceLib","sap/ui/core/HTML","sap/m/library","sap/m/Button","sap/m/Dialog","sap/m/Label","sap/m/Panel","sap/m/Toolbar","sap/m/MessageToast"],function(i,v,_,G,I,J,K,N,O,Q){H=_;l=G;B=I;b=J;L=K;P=N;T=O;M=Q;var R=A();R.removeAllAggregation("content");R.addAggregation("content",w(i.getFrameworkInformation()));c.open();z(v);});}return({on:function(){if(!f&&"ontouchstart"in d){f=true;d.addEventListener("touchstart",C);}return this;},off:function(){if(f){f=false;d.removeEventListener("touchstart",C);}return this;},open:function(){F();},isEventRegistered:function(){return f;}}).on();}(q,document));return S;},true);
