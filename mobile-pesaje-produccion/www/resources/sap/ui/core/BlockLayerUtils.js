/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/events/jquery/EventTriggerHook',"sap/base/Log","sap/ui/thirdparty/jquery"],function(E,L,q){"use strict";var B={},p=["focusin","focusout","keydown","keypress","keyup","mousedown","touchstart","touchmove","mouseup","touchend","click"],r=/^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|tr)$/i;B.block=function(c,b,s){var P,t,o,d;if(c){P=c.getDomRef(s);if(!P){P=c.getDomRef();}if(!P){L.warning("BlockLayer could not be rendered. The outer Control instance is not valid anymore or was not rendered yet.");return;}t=P.tagName;if(r.test(t)){L.warning("BusyIndicator cannot be placed in elements with tag '"+t+"'.");return;}d=a(P,b);o={$parent:q(P),$blockLayer:q(d)};if(o.$parent.css('position')=='static'){if(P.style&&P.style.position==="static"){o.originalPosition='static';}o.$parent.css('position','relative');o.positionChanged=true;}h.call(o,true);}else{L.warning("BlockLayer couldn't be created. No Control instance given.");}return o;};B.unblock=function(b){if(b){if(b.originalPosition){b.$parent.css('position',b.originalPosition);}else if(b.positionChanged){b.$parent.css('position',"");}h.call(b,false);b.$blockLayer.remove();}};B.addAriaAttributes=function(d){var R=sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");d.setAttribute("role","progressbar");d.setAttribute("aria-valuemin","0");d.setAttribute("aria-valuemax","100");d.setAttribute("aria-valuetext",R.getText("BUSY_VALUE_TEXT"));d.setAttribute("alt","");d.setAttribute("tabindex","0");d.setAttribute("title",R.getText("BUSY_TEXT"));};B.toggleAnimationStyle=function(b,s){var $=q(b.$blockLayer.get(0));if(s){$.removeClass("sapUiHiddenBusyIndicatorAnimation");$.removeClass("sapUiBlockLayerOnly");}else{$.addClass("sapUiBlockLayerOnly");$.addClass("sapUiHiddenBusyIndicatorAnimation");}};function a(b,s){var c=document.createElement("div");c.id=s;c.className="sapUiBlockLayer ";B.addAriaAttributes(c);b.appendChild(c);return c;}function h(e){if(e){var P=this.$parent.get(0);if(P){this.fnRedirectFocus=b.bind(this);this.oTabbableBefore=c(this.fnRedirectFocus);this.oTabbableAfter=c(this.fnRedirectFocus);P.parentNode.insertBefore(this.oTabbableBefore,P);P.parentNode.insertBefore(this.oTabbableAfter,P.nextSibling);this._fnSuppressDefaultAndStopPropagationHandler=s.bind(this);this._aSuppressHandler=f.call(this,this._fnSuppressDefaultAndStopPropagationHandler);}else{L.warning("fnHandleInteraction called with bEnabled true, but no DOMRef exists!");}}else{if(this.oTabbableBefore){d(this.oTabbableBefore,this.fnRedirectFocus);delete this.oTabbableBefore;}if(this.oTabbableAfter){d(this.oTabbableAfter,this.fnRedirectFocus);delete this.oTabbableAfter;}delete this.fnRedirectFocus;g.call(this,this._fnSuppressDefaultAndStopPropagationHandler);}function s(o){var t=o.target===this.$blockLayer.get(0),T;if(t&&o.type==='keydown'&&o.keyCode===9){L.debug("Local Busy Indicator Event keydown handled: "+o.type);T=o.shiftKey?this.oTabbableBefore:this.oTabbableAfter;T.setAttribute("tabindex",-1);this.bIgnoreFocus=true;T.focus();this.bIgnoreFocus=false;T.setAttribute("tabindex",0);o.stopImmediatePropagation();}else if(t&&(o.type==='mousedown'||o.type==='touchstart')){L.debug("Local Busy Indicator click handled on busy area: "+o.target.id);o.stopImmediatePropagation();}else{L.debug("Local Busy Indicator Event Suppressed: "+o.type);o.preventDefault();o.stopImmediatePropagation();}}function b(){if(!this.bIgnoreFocus){this.$blockLayer.get(0).focus();}}function c(R){var o=document.createElement("span");o.setAttribute("tabindex",0);o.classList.add("sapUiBlockLayerTabbable");o.addEventListener('focusin',R);return o;}function d(o,R){if(o.parentNode){o.parentNode.removeChild(o);}o.removeEventListener('focusin',R);}function f(H){var S=[],P=this.$parent.get(0),o=this.$blockLayer.get(0);for(var i=0;i<p.length;i++){P.addEventListener(p[i],H,{capture:true,passive:false});S.push(E.suppress(p[i],P,o));}this.$blockLayer.on('keydown',H);return S;}function g(H){var i,P=this.$parent.get(0),o=this.$blockLayer.get(0);if(P){for(i=0;i<p.length;i++){P.removeEventListener(p[i],H,{capture:true,passive:false});}}if(this._aSuppressHandler){for(i=0;i<this._aSuppressHandler.length;i++){E.release(this._aSuppressHandler[i]);}}if(o){this.$blockLayer.off('keydown',H);}}}return B;});
