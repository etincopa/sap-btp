/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/library'],function(c){"use strict";var T=c.TextDirection;var M={apiVersion:2};M.render=function(r,m){this.startOpeningDiv(r,m);this.renderHeader(r,m);this.startInnerDivs(r);this.renderContent(r,m);this.endInnerDivs(r);this.endOpeningDiv(r);};M.startOpeningDiv=function(r,m){r.openStart("div",m);r.attr("aria-roledescription",m._sAriaRoleDescription);r.class("sapMMessagePage");if(m.getTextDirection()!==T.Inherit){r.attr("dir",m.getTextDirection().toLowerCase());}r.openEnd();};M.renderHeader=function(r,m){if(m.getShowHeader()){r.renderControl(m.getAggregation("_internalHeader"));}};M.startInnerDivs=function(r){r.openStart("div");r.class("sapMMessagePageInner");r.openEnd();r.openStart("div");r.class("sapMMessagePageContentWrapper");r.openEnd();};M.renderContent=function(r,m){if(m.getIcon()){r.renderControl(m._getIconControl());}r.renderControl(m._getText().addStyleClass("sapMMessagePageMainText"));r.renderControl(m._getDescription().addStyleClass("sapMMessagePageDescription"));this.renderButtons(r,m);};M.renderButtons=function(r,m){var b=m.getButtons();if(b.length>0){r.openStart("div");r.class("sapMMessagePageButtonsWrapper");r.openEnd();for(var i=0;i<b.length;i++){r.renderControl(b[i]);}r.close("div");}};M.endInnerDivs=function(r){r.close("div");r.close("div");};M.endOpeningDiv=function(r){r.close("div");};return M;},true);
