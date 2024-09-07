/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/library'],function(c){"use strict";var O=c.Orientation;var H={apiVersion:2};H.render=function(r,C){var t=C.getTooltip_AsString();var o=C.getOrientation();var b="sapMHdrCntrBG"+C.getBackgroundDesign();r.openStart("div",C);if(t){r.attr("title",t);}r.class("sapMHdrCntr");r.class(o);if(C.getShowDividers()){r.class("sapMHrdrCntrDvdrs");}if(C.getHeight()){r.style("height",C.getHeight());}else{r.style("height",(C.getOrientation()===O.Horizontal)?"auto":"100%");}if(C.getWidth()){r.style("width",C.getWidth());}else{r.style("width",(C.getOrientation()===O.Horizontal)?"100%":"auto");}r.openEnd();r.openStart("div",C.getId()+"-scroll-area");r.class("sapMHdrCntrCntr");r.class(o);r.class(b);r.openEnd();r.renderControl(C.getAggregation("_scrollContainer"));r.close("div");var B=C.getAggregation("_prevButton");if(B){r.openStart("div",C.getId()+"-prev-button-container");r.class("sapMHdrCntrBtnCntr");r.class("sapMHdrCntrLeft");r.class(o);r.openEnd();r.renderControl(B);r.close("div");}B=C.getAggregation("_nextButton");if(B){r.openStart("div",C.getId()+"-next-button-container");r.class("sapMHdrCntrBtnCntr");r.class("sapMHdrCntrRight");r.class(o);r.openEnd();r.renderControl(B);r.close("div");}r.openStart("div",C.getId()+"-after");r.attr("tabindex","0");r.openEnd().close("div");r.close("div");};return H;},true);
