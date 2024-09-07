/*!
 * SAPUI5

(c) Copyright 2009-2019 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Renderer","./VizSliderBasicRenderer","sap/ui/Device"],function(R,S,D){"use strict";var V=R.extend(S);V.renderHandles=function(r,c){this.renderHandle(r,c,{id:c.getId()+"-handle1",position:"start"});this.renderHandle(r,c,{id:c.getId()+"-handle2",position:"end"});this.renderTooltips(r,c);r.renderControl(c._mHandleTooltip.start.label);r.renderControl(c._mHandleTooltip.end.label);r.renderControl(c._oRangeLabel);};V.renderTooltips=function(r,c){r.write("<div");r.writeAttribute("id",c.getId()+"-TooltipsContainer");r.addClass(S.CSS_CLASS+"TooltipContainer");r.addStyle("left","0%");r.addStyle("right","0%");r.addStyle("min-width","0%");r.writeClasses();r.writeStyles();r.write(">");this.renderTooltip(r,c,c.getInputsAsTooltips(),"Left");this.renderTooltip(r,c,c.getInputsAsTooltips(),"Right");r.write("</div>");};V.renderTooltip=function(r,c,i,p){r.write("<span");r.addClass(S.CSS_CLASS+"HandleTooltip");if(!c.getShowStartEndLabel()){r.addStyle("visibility","hidden");}r.addStyle("width",c._iLongestRangeTextWidth+"px");r.writeAttribute("id",c.getId()+"-"+p+"Tooltip");r.writeClasses();r.writeStyles();r.write(">");r.write("</span>");};V.renderHandle=function(r,c,o){var v,a=c.getRange(),e=c.getEnabled(),b=sap.ui.getCore().getConfiguration().getRTL();r.write("<span");if(o&&(o.id!==undefined)){r.writeAttributeEscaped("id",o.id);}if(o&&(o.position!==undefined)){v=a[o.position==="start"?0:1];r.writeAttribute("data-range-val",o.position);r.writeAttribute("aria-labelledby",c._mHandleTooltip[o.position].label.getId());if(c.getInputsAsTooltips()){r.writeAttribute("aria-controls",c._mHandleTooltip[o.position].tooltip.getId());}}if(c.getShowHandleTooltip()){this.writeHandleTooltip(r,c);}r.addClass(S.CSS_CLASS+"Handle");if((!D.system.desktop)&&(D.system.phone||D.system.tablet)){r.addClass('viz-Mobile');}r.addClass('sapUiIcon');r.addClass('ui5-sap-viz-vizSliderHandle');r.writeAttribute("data-sap-ui-icon-content",'&#xe1fa');if(o&&(o.id!==undefined)&&o.id===(c.getId()+"-handle1")){r.addClass('ui5-sap-viz-vizSliderHandle-left');r.addStyle(b?"right":"left",a[0]);}if(o&&(o.id!==undefined)&&o.id===(c.getId()+"-handle2")){r.addClass('ui5-sap-viz-vizSliderHandle-right');r.addStyle(b?"right":"left",a[1]);}this.writeAccessibilityState(r,c,v);r.writeClasses();r.writeStyles();if(e){r.writeAttribute("tabindex","0");}r.write("></span>");};V.writeAccessibilityState=function(r,s,v){r.writeAccessibilityState(s,{role:"slider",orientation:"horizontal",valuemin:s.toFixed(s.getMin()),valuemax:s.toFixed(s.getMax()),valuenow:v});};V.renderStartLabel=function(r,c){r.write("<div");r.addClass(S.CSS_CLASS+"RangeLabel");r.writeClasses();r.write(">");r.write(c.getMin());r.write("</div>");};V.renderEndLabel=function(r,c){r.write("<div");r.addClass(S.CSS_CLASS+"RangeLabel");r.addStyle("width",c._iLongestRangeTextWidth+"px");r.writeClasses();r.writeStyles();r.write(">");r.write(c.getMax());r.write("</div>");};V.renderLabels=function(r,c){r.write("<div");r.addClass();r.addClass(S.CSS_CLASS+"Labels");r.writeClasses();r.write(">");this.renderStartLabel(r,c);this.renderEndLabel(r,c);r.write("</div>");};V.renderProgressIndicator=function(r,s){var a=s.getRange();r.write("<div");r.writeAttribute("id",s.getId()+"-progress");if(s.getEnabled()){r.writeAttribute("tabindex","0");}this.addProgressIndicatorClass(r,s);r.addStyle("width",s._sProgressValue);r.writeClasses();r.writeStyles();r.writeAccessibilityState(s,{role:"slider",orientation:"horizontal",valuemin:s.toFixed(s.getMin()),valuemax:s.toFixed(s.getMax()),valuenow:a.join("-"),valuetext:s._oResourceBundle.getText('RANGE_SLIDER_RANGE_ANNOUNCEMENT',a),labelledby:s._oRangeLabel.getId()});r.write('></div>');};V.render=function(r,s){var e=s.getEnabled(),t=s.getTooltip_AsString(),C=S.CSS_CLASS;r.write("<div");this.addClass(r,s);r.addClass("ui5-sap-viz-vizRangeSlider");if(!e){r.addClass(C+"Disabled");}r.writeClasses();r.addStyle("position","absolute");r.addStyle("width",s.getWidth());r.addStyle("height",s.getHeight());r.addStyle("top",s.getTop());r.addStyle("left",s.getLeft());r.writeStyles();r.writeControlData(s);if(t&&s.getShowHandleTooltip()){r.writeAttributeEscaped("title",t);}r.write(">");this.renderMock(r,s);r.write('<div');r.writeAttribute("id",s.getId()+"-inner");this.addInnerClass(r,s);if(!e){r.addClass(C+"InnerDisabled");}r.writeClasses();r.writeStyles();r.write(">");if(s.getProgress()){this.renderProgressIndicator(r,s);}this.renderHandles(r,s);r.write("</div>");if(s.getEnableTickmarks()){this.renderTickmarks(r,s);}else{this.renderLabels(r,s);}if(s.getName()){this.renderInput(r,s);}r.write("</div>");};V.renderMock=function(r,s){var a=s.getRange();var m=s.getMax();var b=s.getMin();var c=Math.min(a[0],a[1]);var d=Math.max(a[0],a[1]);r.write("<div");r.writeAttribute("id",s.getId()+"-leftMock");r.addClass("ui5-sap-viz-vizSliderMock");r.addClass("ui5-sap-viz-vizSliderMock-left");r.writeClasses();r.addStyle("right",(m-c)*100/(m-b)+"%");r.writeStyles();r.write('></div>');r.write("<div");r.writeAttribute("id",s.getId()+"-rightMock");r.addClass("ui5-sap-viz-vizSliderMock");r.addClass("ui5-sap-viz-vizSliderMock-right");r.writeClasses();r.addStyle("left",(d-b)*100/(m-b)+"%");r.writeStyles();r.write('></div>');r.write("<div");r.writeAttribute("id",s.getId()+"-label");r.addClass('ui5-sap-viz-vizSliderLabel');r.writeClasses();r.addStyle("left",(d+c)*50/(d-c)+"%");if(!s.getShowPercentageLabel()){r.addStyle("visibility","hidden");}r.writeStyles();r.write('>'+(d-c)*100/(m-b)+'%</div>');};return V;},true);
