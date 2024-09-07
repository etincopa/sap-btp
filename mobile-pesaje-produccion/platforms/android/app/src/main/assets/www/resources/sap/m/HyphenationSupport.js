/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core","./library","sap/ui/core/hyphenation/Hyphenation","sap/base/Log"],function(C,l,H,L){"use strict";var W=l.WrappingType;function i(o){if(!o.isA("sap.m.IHyphenation")){L.error("[UI5 Hyphenation] The given control does not implement interface sap.m.IHyphenation and can not use HyphenationSupport mixin.");return false;}return true;}function a(o,k){var t=o.getTextsToBeHyphenated();if(typeof t!=="object"){L.error("[UI5 Hyphenation] The result of getTextsToBeHyphenated method is not a map object.",o.getId());return false;}if(Object.keys(t).indexOf(k)<0){L.error("[UI5 Hyphenation] The key "+k+" is not found in the result of getTextsToBeHyphenated method.",o.getId());return false;}return true;}function s(D,n){n=n||"";var f=D.childNodes;if(f.length===1&&f[0].nodeType===window.Node.TEXT_NODE){f[0].nodeValue=n;}else{D.textContent=n;}}function d(t,T){var D=[];Object.keys(t).forEach(function(k){if(!(k in T&&t[k]===T[k])){D.push(k);}});return D;}function b(){var f=C.getConfiguration().getHyphenation(),o=H.getInstance();if(f==="native"||f==="disable"){return false;}if(f==="thirdparty"){return true;}return o.isLanguageSupported()&&!o.canUseNativeHyphenation()&&o.canUseThirdPartyHyphenation();}function c(o){var f=C.getConfiguration().getHyphenation();if(f==='disable'){return false;}return(!o.getWrapping||o.getWrapping())&&o.getWrappingType()===W.Hyphenated;}function h(o){if(!c(o)||!b()){o._mHyphenatedTexts={};o._mUnhyphenatedTexts={};return;}var t=o.getTextsToBeHyphenated(),f=d(t,o._mUnhyphenatedTexts);if(f.length>0){o._mUnhyphenatedTexts=t;f.forEach(function(k){delete o._mHyphenatedTexts[k];});var g=H.getInstance();if(!g.isLanguageInitialized()){g.initialize().then(function(){var D=o.isActive()?o.getDomRefsForHyphenatedTexts():null,n=false;f.forEach(function(k){o._mHyphenatedTexts[k]=g.hyphenate(t[k]);if(D&&k in D){s(D[k],o._mHyphenatedTexts[k]);}else{n=true;}});if(n){o.invalidate();}});}else{f.forEach(function(k){o._mHyphenatedTexts[k]=g.hyphenate(t[k]);});}}}var e={};e.mixInto=function(o){if(!i(o)){return;}var I=o.init;o.init=function(f){var r=I.apply(this,arguments);this._mHyphenatedTexts={};this._mUnhyphenatedTexts={};return r;};var O=o.onBeforeRendering;o.onBeforeRendering=function(){var r=O.apply(this,arguments);h(this);return r;};};e.writeHyphenationClass=function(r,o){if(!i(o)){return;}if(c(o)&&!b()){r.class("sapUiHyphenation");}};e.getTextForRender=function(o,k){if(!i(o)){return null;}if(!a(o,k)){return null;}var t=o.getTextsToBeHyphenated();if(c(o)&&b()){if(t[k]!==o._mUnhyphenatedTexts[k]){h(o);}if(k in o._mHyphenatedTexts){return o._mHyphenatedTexts[k];}}return t[k];};return e;});
