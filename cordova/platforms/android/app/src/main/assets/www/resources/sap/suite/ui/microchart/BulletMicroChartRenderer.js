/*!
 * SAPUI5

(c) Copyright 2009-2019 SAP SE. All rights reserved
 */
sap.ui.define(['./library','sap/m/library','sap/suite/ui/microchart/MicroChartRenderUtils',"sap/base/security/encodeXML"],function(l,M,a,e){"use strict";var B={};B.render=function(r,c){if(!c._bThemeApplied){return;}if(c._hasData()){var C=c._calculateChartData();var f=+C.forecastValuePct;var s;if(c._isResponsive()){s="sapSuiteBMCResponsive";}else{s="sapSuiteBMCSize"+c.getSize();}var S=c.getScale();var d=sap.ui.getCore().getConfiguration().getRTL()?"right":"left";var m="sapSuiteBMCModeType"+c.getMode();var D=c.getMode()===l.BulletMicroChartModeType.Delta?c._calculateDeltaValue():0;var I=c.getActual()&&c.getActual()._isValueSet;var b=c.getShowActualValue()&&c.getSize()!==M.Size.XS&&c.getMode()===l.BulletMicroChartModeType.Actual;var g=c.getShowActualValueInDeltaMode()&&c.getSize()!==M.Size.XS&&c.getMode()===l.BulletMicroChartModeType.Delta;var h=c.getShowDeltaValue()&&c.getSize()!==M.Size.XS&&c.getMode()===l.BulletMicroChartModeType.Delta;var j=c.getShowTargetValue()&&c.getSize()!==M.Size.XS;var k=c.getShowThresholds();var A=c.getActualValueLabel();var n=c.getDeltaValueLabel();var t=c.getTargetValueLabel();var o=c.getThresholds();var p;if(I){p="sapSuiteBMCSemanticColor"+c.getActual().getColor();}r.write("<div");this._writeMainProperties(r,c);r.writeClasses();r.writeStyles();r.writeAttribute("id",c.getId()+"-bc-content");r.write(">");r.write("<div");r.addClass("sapSuiteBMCVerticalAlignmentContainer");r.writeClasses();r.write(">");r.write("<div");r.addClass("sapSuiteBMCChart");r.addClass(e(s));r.writeClasses();r.writeAttribute("id",c.getId()+"-bc-chart");r.write(">");if((I&&(b||g))||(I&&c._isTargetValueSet&&h)){var v="";r.write("<div");r.addClass("sapSuiteBMCTopLabel");r.writeClasses();r.write(">");if(I&&(b||g)){var q=A?A:""+c.getActual().getValue();v=q+S;r.write("<div");r.addClass("sapSuiteBMCItemValue");r.addClass(e(p));r.addClass(e(s));r.writeClasses();r.writeStyles();r.writeAttribute("id",c.getId()+"-bc-item-value");r.write(">");r.writeEscaped(v);r.write("</div>");}else if(I&&c._isTargetValueSet&&h){var u=n?n:""+D;v=u+S;r.write("<div");r.addClass("sapSuiteBMCItemValue");r.addClass(e(p));r.addClass(e(s));r.writeClasses();r.writeStyles();r.writeAttribute("id",c.getId()+"-bc-item-value");r.write(">");r.write("&Delta;");r.writeEscaped(v);r.write("</div>");}r.write("</div>");}r.write("<div");r.addClass("sapSuiteBMCChartCanvas");r.writeClasses();r.write(">");if(k){for(var i=0;i<C.thresholdsPct.length;i++){if(o[i]._isValueSet){this.renderThreshold(r,c,C.thresholdsPct[i],s);}}}r.write("<div");r.writeAttribute("id",c.getId()+"-chart-bar");r.addClass("sapSuiteBMCBar");r.addClass(e(s));r.addClass("sapSuiteBMCScaleColor"+c.getScaleColor());r.writeClasses();r.write(">");r.write("</div>");if(I){if(c._isForecastValueSet&&c.getMode()===l.BulletMicroChartModeType.Actual){r.write("<div");r.addClass("sapSuiteBMCForecastBarValue");r.addClass(e(p));r.addClass(e(s));r.writeClasses();r.addStyle("width",f+"%");r.writeStyles();r.writeAttribute("id",c.getId()+"-forecast-bar-value");r.write("></div>");}r.write("<div");r.addClass("sapSuiteBMCBarValueMarker");r.addClass(m);if(!c.getShowValueMarker()){r.addClass("sapSuiteBMCBarValueMarkerHidden");}r.addClass(e(p));r.addClass(e(s));r.writeClasses();r.addStyle(e(d),e(parseFloat(C.actualValuePct)+parseFloat(1)+"%"));if(c.getMode()===l.BulletMicroChartModeType.Delta&&C.actualValuePct<=C.targetValuePct){r.addStyle("margin","0");}r.writeStyles();r.writeAttribute("id",c.getId()+"-bc-bar-value-marker");r.write("></div>");if(c.getMode()===l.BulletMicroChartModeType.Actual&&C.actualValuePct!==0){r.write("<div");r.addClass("sapSuiteBMCBarValue");r.addClass(e(p));r.addClass(e(s));if(c._isForecastValueSet){r.addClass("sapSuiteBMCForecast");}r.writeClasses();r.addStyle("width",e(C.actualValuePct+"%"));r.writeStyles();r.writeAttribute("id",c.getId()+"-bc-bar-value");r.write("></div>");}else if(c._isTargetValueSet&&c.getMode()===l.BulletMicroChartModeType.Delta){r.write("<div");r.addClass("sapSuiteBMCBarValue");r.addClass(e(p));r.addClass(e(s));r.writeClasses();r.addStyle("width",e(Math.abs(C.actualValuePct-C.targetValuePct)+"%"));r.addStyle(e(d),e(1+Math.min(C.actualValuePct,C.targetValuePct)+"%"));r.writeStyles();r.writeAttribute("id",c.getId()+"-bc-bar-value");r.write("></div>");}}if(c._isTargetValueSet){r.write("<div");r.addClass("sapSuiteBMCTargetBarValue");r.addClass(e(s));r.writeClasses();r.addStyle(e(d),e(parseFloat(C.targetValuePct).toFixed(2)+"%"));r.writeStyles();r.writeAttribute("id",c.getId()+"-bc-target-bar-value");r.write("></div>");r.write("</div>");if(j){r.write("<div");r.addClass("sapSuiteBMCBottomLabel");r.writeClasses();r.write(">");var T=t?t:""+c.getTargetValue();var w=T+S;r.write("<div");r.addClass("sapSuiteBMCTargetValue");r.addClass(e(s));r.writeClasses();r.writeStyles();r.writeAttribute("id",c.getId()+"-bc-target-value");r.write(">");r.writeEscaped(w);r.write("</div>");r.write("</div>");}}else{r.write("</div>");}r.write("</div>");r.write("<div");r.writeAttribute("id",c.getId()+"-info");r.writeAttribute("aria-hidden","true");r.addStyle("display","none");r.writeStyles();r.write(">");r.write("</div>");r.write("</div>");r.write("</div>");}else{r.write("<div");this._writeMainProperties(r,c);r.writeClasses();r.writeStyles();r.write(">");this._renderNoData(r);r.write("</div>");}};B._writeMainProperties=function(r,c){var i=c.hasListeners("press");this._renderActiveProperties(r,c);var A=c.getTooltip_AsString(i);r.writeAttribute("role","img");if(c.getAriaLabelledBy().length){r.writeAccessibilityState(c);}else{r.writeAttributeEscaped("aria-label",A);}r.writeControlData(c);r.addClass("sapSuiteBMC");r.addClass("sapSuiteBMCContent");r.addClass(c._isResponsive()?"sapSuiteBMCResponsive":"sapSuiteBMCSize"+c.getSize());r.addStyle("width",c.getWidth());r.addStyle("height",c.getHeight());};B.renderThreshold=function(r,c,t,s){var d=sap.ui.getCore().getConfiguration().getRTL()?"right":"left",v=0.98*t.valuePct+1,C="sapSuiteBMCSemanticColor"+t.color;if(C==="sapSuiteBMCSemanticColor"+M.ValueColor.Error){r.write("<div");r.addClass("sapSuiteBMCDiamond");r.addClass(e(s));r.addClass(e(C));r.writeClasses();r.addStyle(e(d),e(v+"%"));r.writeStyles();r.write("></div>");}r.write("<div");r.addClass("sapSuiteBMCThreshold");r.addClass(e(s));r.addClass(e(C));r.writeClasses();r.addStyle(e(d),e(v+"%"));r.writeStyles();r.write("></div>");};a.extendMicroChartRenderer(B);return B;},true);
