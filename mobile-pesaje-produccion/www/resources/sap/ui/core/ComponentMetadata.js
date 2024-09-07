/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/base/ManagedObjectMetadata','sap/ui/core/Manifest','sap/base/Log','sap/base/util/extend','sap/base/util/deepExtend','sap/base/util/isPlainObject','sap/base/util/LoaderExtensions'],function(M,b,L,e,d,c,f){"use strict";var C=window["sap-ui-config"]||{};var s=0;if(C['xx-nosync']==='warn'||/(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search)){s=1;}if(C['xx-nosync']===true||C['xx-nosync']==='true'||/(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search)){s=2;}var g=function(a,o){M.apply(this,arguments);};g.prototype=Object.create(M.prototype);g.prototype.constructor=g;g.preprocessClassInfo=function(o){if(o&&typeof o.metadata==="string"){o.metadata={_src:o.metadata};}return o;};g.prototype.applySettings=function(o){var S=this._oStaticInfo=o.metadata;var n=this.getName(),p=n.replace(/\.\w+?$/,"");if(S._src){if(S._src=="component.json"){L.warning("Usage of declaration \"metadata: 'component.json'\" is deprecated (component "+n+"). Use \"metadata: 'json'\" instead.");}else if(S._src!="json"){throw new Error("Invalid metadata declaration for component "+n+": \""+S._src+"\"! Use \"metadata: 'json'\" to load metadata from component.json.");}var r=p.replace(/\./g,"/")+"/component.json";L.info("The metadata of the component "+n+" is loaded from file "+r+".");try{var R=f.loadResource(r,{dataType:"json"});e(S,R);}catch(a){L.error("Failed to load component metadata from \""+r+"\" (component "+n+")! Reason: "+a);}}M.prototype.applySettings.call(this,o);this._sComponentName=p;this._bInitialized=false;this._iInstanceCount=0;var m=S["manifest"];if(m){S.__metadataVersion=2;if(typeof m==="string"&&m==="json"){return;}}else{S.__metadataVersion=1;m={};}this._applyManifest(m);};g.prototype._applyManifest=function(m){if(this._oManifest){L.warning("Can't apply manifest to ComponentMetadata as it has already been created.",this.getName(),"sap.ui.core.ComponentMetadata");return;}m["name"]=m["name"]||this.getName();m["sap.app"]=m["sap.app"]||{"id":this.getComponentName()};m["sap.ui5"]=m["sap.ui5"]||{};if(!this.isBaseClass()){m["sap.ui5"]["extends"]=m["sap.ui5"]["extends"]||{};}this._convertLegacyMetadata(this._oStaticInfo,m);this._oManifest=new b(m,{componentName:this.getComponentName(),baseUrl:sap.ui.require.toUrl(this.getComponentName().replace(/\./g,"/"))+"/",process:this._oStaticInfo.__metadataVersion===2});};g.prototype.init=function(){if(this._iInstanceCount===0){var p=this.getParent();if(p instanceof g){p.init();}this.getManifestObject().init();this._bInitialized=true;}this._iInstanceCount++;};g.prototype.exit=function(){var i=Math.max(this._iInstanceCount-1,0);if(i===0){this.getManifestObject().exit();var p=this.getParent();if(p instanceof g){p.exit();}this._bInitialized=false;}this._iInstanceCount=i;};g.prototype.onInitComponent=function(i){L.error("The function ComponentMetadata#onInitComponent will be removed soon!");};g.prototype.onExitComponent=function(i){L.error("The function ComponentMetadata#onExitComponent will be removed soon!");};g.prototype.isBaseClass=function(){return/^sap\.ui\.core\.(UI)?Component$/.test(this.getName());};g.prototype.getMetadataVersion=function(){return this._oStaticInfo.__metadataVersion;};g.prototype.getManifestObject=function(){if(!this._oManifest){var m=this._oStaticInfo["manifest"];if(typeof m==="string"&&m==="json"){var n=this.getName();var p=this.getComponentName();var r=p.replace(/\./g,"/")+"/manifest.json";var i=!!sap.ui.loader._.getModuleState(r);if(!i&&s===2){L.error("[nosync] Loading manifest of the component "+n+" ignored.",r,"sap.ui.core.ComponentMetadata");m={};}else{if(!i&&s===1){L.error("[nosync] The manifest of the component "+n+" is loaded with sync XHR.",r,"sap.ui.core.ComponentMetadata");}else{L.info("The manifest of the component "+n+" is loaded from file "+r+".");}try{var R=f.loadResource(r,{dataType:"json"});m=R;}catch(a){L.error("Failed to load component manifest from \""+r+"\" (component "+n+")! Reason: "+a);m={};}}this._applyManifest(m);}}return this._oManifest;};g.prototype.getManifest=function(){return this._getManifest();};g.prototype._getManifest=function(){if(this.getMetadataVersion()===1){return this.getManifestObject().getRawJson();}return this.getManifestObject().getJson();};g.prototype.getRawManifest=function(){return this.getManifestObject().getRawJson();};g.prototype._getRawManifest=function(){L.warning("ComponentMetadata#_getRawManifest: do not use deprecated functions anymore!");return this.getManifestObject().getRawJson();};g.prototype.getManifestEntry=function(k,m){return this._getManifestEntry(k,m);};g.prototype._getManifestEntry=function(k,m){var D=this.getManifestObject().getEntry(k);if(D!==undefined&&!c(D)){return D;}var p,P;if(m&&(p=this.getParent())instanceof g){P=p.getManifestEntry(k,m);}if(P||D){D=d({},P,D);}return D;};g.prototype.getCustomEntry=function(k,m){if(!k||k.indexOf(".")<=0){L.warning("Component Metadata entries with keys without namespace prefix can not be read via getCustomEntry. Key: "+k+", Component: "+this.getName());return null;}var p,D=this._oStaticInfo[k]||{};if(!c(D)){L.warning("Custom Component Metadata entry with key '"+k+"' must be an object. Component: "+this.getName());return null;}if(m&&(p=this.getParent())instanceof g){return d({},p.getCustomEntry(k,m),D);}return d({},D);};g.prototype.getComponentName=function(){return this._sComponentName;};g.prototype.getDependencies=function(){if(!this._oLegacyDependencies){var D=this.getManifestEntry("/sap.ui5/dependencies"),u=D&&D.minUI5Version||null,l=D&&D.libs||{},m=D&&D.components||{};var a={ui5version:u,libs:[],components:[]};for(var h in l){a.libs.push(h);}for(var i in m){a.components.push(i);}this._oLegacyDependencies=a;}return this._oLegacyDependencies;};g.prototype.getIncludes=function(){L.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getIncludes() is deprecated. "+"For CSS files, please use the '/sap.ui5/resources/css' section in your 'manifest.json'. ","Deprecation",null,function(){return{type:"sap.ui.core.ComponentMetadata",name:this.getName()};}.bind(this));if(!this._aLegacyIncludes){var I=[],r=this.getManifestEntry("/sap.ui5/resources")||{},a=r&&r.css||[],j=r&&r.js||[];for(var i=0,l=a.length;i<l;i++){if(a[i]&&a[i].uri){I.push(a[i].uri);}}for(var i=0,l=j.length;i<l;i++){if(j[i]&&j[i].uri){I.push(j[i].uri);}}this._aLegacyIncludes=(I.length>0)?I:null;}return this._aLegacyIncludes;};g.prototype.getUI5Version=function(){return this.getManifestEntry("/sap.ui5/dependencies/minUI5Version");};g.prototype.getComponents=function(){return this.getDependencies().components;};g.prototype.getLibs=function(){return this.getDependencies().libs;};g.prototype.getVersion=function(){return this.getManifestEntry("/sap.app/applicationVersion/version");};g.prototype.getConfig=function(k,D){var m=this.getManifestEntry("/sap.ui5/config",!D);if(!m){return{};}if(!k){return m;}return m.hasOwnProperty(k)?m[k]:{};};g.prototype.getCustomizing=function(D){return this.getManifestEntry("/sap.ui5/extends/extensions",!D);};g.prototype.getModels=function(D){if(!this._oLegacyModels){this._oLegacyModels={};var m=this.getManifestEntry("/sap.ui5/models")||{};for(var a in m){var o=m[a];this._oLegacyModels[a]=o.settings||{};this._oLegacyModels[a].type=o.type;this._oLegacyModels[a].uri=o.uri;}}var p,h=d({},this._oLegacyModels);if(!D&&(p=this.getParent())instanceof g){h=d({},p.getModels(),h);}return h;};g.prototype.handleValidation=function(){return this.getManifestEntry("/sap.ui5/handleValidation");};g.prototype.getServices=function(){L.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getServices is deprecated!");return this._oStaticInfo.services||{};};g.prototype._convertLegacyMetadata=function(S,h){var j=function(a,y){var o={};if(a){for(var i=0,l=a.length;i<l;i++){var v=a[i];if(typeof v==="string"){o[v]=typeof y==="function"&&y(v)||{};}}}return o;};var A=h["sap.app"];var u=h["sap.ui5"];for(var n in S){var v=S[n];if(v!==undefined){switch(n){case"name":h[n]=h[n]||v;A["id"]=A["id"]||v;break;case"description":case"keywords":A[n]=A[n]||v;break;case"version":var k=A.applicationVersion=A.applicationVersion||{};k.version=k.version||v;break;case"config":u[n]=u[n]||v;break;case"customizing":var E=u["extends"]=u["extends"]||{};E.extensions=E.extensions||v;break;case"dependencies":if(!u[n]){u[n]={};u[n].minUI5Version=v.ui5version;u[n].libs=j(v.libs);u[n].components=j(v.components);}break;case"includes":if(!u["resources"]){u["resources"]={};if(v&&v.length>0){for(var i=0,l=v.length;i<l;i++){var r=v[i];var m=r.match(/\.(css|js)$/i);if(m){u["resources"][m[1]]=u["resources"][m[1]]||[];u["resources"][m[1]].push({"uri":r});}}}}break;case"handleValidation":if(u[n]===undefined){u[n]=v;}break;case"models":if(!u["models"]){var p={};for(var q in v){var D=v[q];var t={};for(var w in D){var x=D[w];switch(w){case"type":case"uri":t[w]=x;break;default:t.settings=t.settings||{};t.settings[w]=x;}}p[q]=t;}u["models"]=p;}break;}}}};return g;},true);
