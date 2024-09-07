/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/base/util/LoaderExtensions'],function(L){"use strict";var V={};V.load=function(O){O=O||{};O.async=true;return V._load(O);};var v=null;var o;var k;var K;Object.defineProperty(sap.ui,"versioninfo",{configurable:true,enumerable:true,get:function(){return o;},set:function(n){o=n;k=null;K=null;}});V._load=function(O){if(typeof O!=="object"){O={library:O};}O.async=O.async===true;O.failOnError=O.failOnError!==false;if(!sap.ui.versioninfo){if(O.async&&v instanceof Promise){return v.then(function(){return V._load(O);});}var h=function(o){v=null;if(o===null){return undefined;}sap.ui.versioninfo=o;return V._load(O);};var H=function(e){v=null;throw e;};var r=L.loadResource("sap-ui-version.json",{async:O.async,failOnError:O.async||O.failOnError});if(r instanceof Promise){v=r;return r.then(h,H);}else{return h(r);}}else{var R;if(typeof O.library!=="undefined"){var a=sap.ui.versioninfo.libraries;if(a){for(var i=0,l=a.length;i<l;i++){if(a[i].name===O.library){R=a[i];break;}}}}else{R=sap.ui.versioninfo;}return O.async?Promise.resolve(R):R;}};function t(){if(sap.ui.versioninfo&&sap.ui.versioninfo.libraries&&!k){k={};sap.ui.versioninfo.libraries.forEach(function(l,i){k[l.name]={};var d=l.manifestHints&&l.manifestHints.dependencies&&l.manifestHints.dependencies.libs;for(var D in d){if(!d[D].lazy){k[l.name][D]=true;}}});}if(sap.ui.versioninfo&&sap.ui.versioninfo.components&&!K){K={};Object.keys(sap.ui.versioninfo.components).forEach(function(c){var C=sap.ui.versioninfo.components[c];K[c]={library:C.library,dependencies:[]};var d=C.manifestHints&&C.manifestHints.dependencies&&C.manifestHints.dependencies.libs;for(var D in d){if(!d[D].lazy){K[c].dependencies.push(D);}}});}}V._getTransitiveDependencyForLibraries=function(l){t();if(k){var c=l.reduce(function(a,b){a[b]=true;return Object.assign(a,k[b]);},{});l=Object.keys(c);}return l;};V._getTransitiveDependencyForComponent=function(c){t();if(K){return K[c];}};return V;});
