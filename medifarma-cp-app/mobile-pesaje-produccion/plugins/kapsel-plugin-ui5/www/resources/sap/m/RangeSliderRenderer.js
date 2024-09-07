/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Renderer","./SliderRenderer","sap/ui/core/InvisibleText"],function(R,S,I){"use strict";var a=R.extend(S);a.renderHandles=function(r,c,s){this.renderHandle(r,c,{id:c.getId()+"-handle1",position:"start",forwardedLabels:s});this.renderHandle(r,c,{id:c.getId()+"-handle2",position:"end",forwardedLabels:s});r.renderControl(c._mHandleTooltip.start.label);r.renderControl(c._mHandleTooltip.end.label);r.renderControl(c.getAggregation("_handlesLabels")[2]);};a.renderHandle=function(r,c,o){var v,b=c.getRange(),e=c.getEnabled(),d=sap.ui.getCore().getConfiguration().getRTL();r.write("<span");if(o&&(o.id!==undefined)){r.writeAttributeEscaped("id",o.id);}if(o&&(o.position!==undefined)){v=b[o.position==="start"?0:1];r.writeAttribute("data-range-val",o.position);r.writeAttribute("aria-labelledby",(o.forwardedLabels+" "+c._mHandleTooltip[o.position].label.getId()).trim());if(c.getInputsAsTooltips()){r.writeAttribute("aria-describedby",I.getStaticId("sap.m","SLIDER_INPUT_TOOLTIP"));}}if(c.getShowHandleTooltip()&&!c.getShowAdvancedTooltip()){this.writeHandleTooltip(r,c);}r.addClass(S.CSS_CLASS+"Handle");if(o&&(o.id!==undefined)&&o.id===(c.getId()+"-handle1")){r.addStyle(d?"right":"left",b[0]);}if(o&&(o.id!==undefined)&&o.id===(c.getId()+"-handle2")){r.addStyle(d?"right":"left",b[1]);}this.writeAccessibilityState(r,c,v);r.writeClasses();r.writeStyles();if(e){r.writeAttribute("tabindex","0");}r.write("></span>");};a.writeAccessibilityState=function(r,s,v){var n=s._isElementsFormatterNotNumerical(v),b=s._formatValueByCustomElement(v),V;if(s._getUsedScale()&&!n){V=b;}else{V=s.toFixed(v);}r.writeAccessibilityState(s,{role:"slider",orientation:"horizontal",valuemin:s.toFixed(s.getMin()),valuemax:s.toFixed(s.getMax()),valuenow:V});if(n){r.writeAccessibilityState(s,{valuetext:b});}};a.renderStartLabel=function(r,c){r.write("<div");r.addClass(S.CSS_CLASS+"RangeLabel");r.writeClasses();r.write(">");r.write(c.getMin());r.write("</div>");};a.renderEndLabel=function(r,c){r.write("<div");r.addClass(S.CSS_CLASS+"RangeLabel");r.addStyle("width",c._getMaxTooltipWidth()+"px");r.writeClasses();r.writeStyles();r.write(">");r.write(c.getMax());r.write("</div>");};a.renderLabels=function(r,c){r.write("<div");r.addClass();r.addClass(S.CSS_CLASS+"Labels");r.writeClasses();r.write(">");this.renderStartLabel(r,c);this.renderEndLabel(r,c);r.write("</div>");};a.renderProgressIndicator=function(r,s,f){var b=s.getRange();b[0]=s.toFixed(b[0],s._iDecimalPrecision);b[1]=s.toFixed(b[1],s._iDecimalPrecision);r.write("<div");r.writeAttribute("id",s.getId()+"-progress");if(s.getEnabled()){r.writeAttribute("tabindex","0");}this.addProgressIndicatorClass(r,s);r.addStyle("width",s._sProgressValue);r.writeClasses();r.writeStyles();r.writeAccessibilityState(s,{role:"slider",orientation:"horizontal",valuemin:s.toFixed(s.getMin()),valuemax:s.toFixed(s.getMax()),valuetext:s._oResourceBundle.getText('RANGE_SLIDER_RANGE_ANNOUNCEMENT',b.map(s._formatValueByCustomElement,s)),labelledby:(f+" "+s.getAggregation("_handlesLabels")[2].getId()).trim()});r.write('></div>');};a.addClass=function(r,s){S.addClass(r,s);r.addClass("sapMRangeSlider");};return a;},true);
