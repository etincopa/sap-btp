/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/Device','sap/m/library',"sap/ui/dom/getScrollbarSize","sap/ui/core/IconPool"],function(D,l,g,I){"use strict";var P=l.PlacementType;var a={apiVersion:2};a.render=function(r,c){r.openStart("div",c);var C=this.generateRootClasses(c);C.forEach(function(s){r.class(s);});if(!c.getHorizontalScrolling()){r.class("sapMPopoverHorScrollDisabled");}if(!c.getVerticalScrolling()){r.class("sapMPopoverVerScrollDisabled");}var t=c.getTooltip_AsString();if(t){r.attr("title",t);}r.attr("tabindex","-1").accessibilityState(c,c._getAccessibilityOptions()).openEnd();if(c.getResizable()){r.icon("sap-icon://resize-corner",["sapMPopoverResizeHandle"],{"title":""});}this.renderContent(r,c);r.close("div");};a.isButtonFooter=function(f){if(f instanceof sap.m.Bar){var c=f.getContentLeft(),C=f.getContentRight(),b=f.getContentMiddle(),L=(!c||c.length===0),r=(!C||C.length===0),m=false;if(b&&b.length===2){if((b[0]instanceof sap.m.Button)&&(b[1]instanceof sap.m.Button)){m=true;}}return L&&r&&m;}else{return false;}};a.renderContent=function(r,c){var h=c._getAnyHeader(),s=c.getId(),i=0,b=c._getAllContent(),f=c.getFooter(),S=c.getSubHeader(),C=c.getContentWidth(),d=c.getContentMinWidth(),e=c.getContentHeight();if(D.system.desktop){r.openStart("span",c.getId()+"-firstfe").class("sapMPopoverHiddenFocusable").attr("tabindex","0").openEnd().close("span");}if(h){r.openStart("header").class("sapMPopoverHeader").openEnd();if(h._applyContextClassFor){h._applyContextClassFor("header");}r.renderControl(h);r.close("header");}if(S){r.openStart("header").class("sapMPopoverSubHeader").openEnd();if(S._applyContextClassFor){S._applyContextClassFor("subheader");}r.renderControl(S);r.close("header");}r.openStart("div",s+"-cont");if(C){r.style("width",C);}if(d){r.style("min-width",d);}if(e){r.style("height",e);}r.class("sapMPopoverCont");if(sap.ui.getCore().getConfiguration().getAccessibility()&&c.getProperty("ariaRoleApplication")){r.attr("role","application");}r.openEnd();r.openStart("div",c.getId()+"-scroll").class("sapMPopoverScroll");if(!c.getHorizontalScrolling()){r.style(sap.ui.getCore().getConfiguration().getRTL()?"margin-left":"margin-right",g().width+"px");}r.openEnd();for(i=0;i<b.length;i++){r.renderControl(b[i]);}r.close("div");r.close("div");if(f){r.openStart("footer").class("sapMPopoverFooter");if(this.isButtonFooter(f)){r.class("sapMPopoverSpecialFooter");}r.openEnd();if(f._applyContextClassFor){f._applyContextClassFor("footer");f.addStyleClass("sapMTBNoBorders");}r.renderControl(f);r.close("footer");}if(c.getShowArrow()){r.openStart("span",s+"-arrow").class("sapMPopoverArr").openEnd().close("span");}if(D.system.desktop){r.openStart("span",c.getId()+"-middlefe").class("sapMPopoverHiddenFocusable").attr("tabindex","-1").openEnd().close("span");r.openStart("span",c.getId()+"-lastfe").class("sapMPopoverHiddenFocusable").attr("tabindex","0").openEnd().close("span");}};a.generateRootClasses=function(c){var C=["sapMPopover"],s=c.getSubHeader(),f=c.getFooter(),v=c.getVerticalScrolling()&&!c._forceDisableScrolling,h=c.getHorizontalScrolling()&&!c._forceDisableScrolling,H=c._getAnyHeader();if(H){C.push("sapMPopoverWithBar");}else{C.push("sapMPopoverWithoutBar");}if(s){C.push("sapMPopoverWithSubHeader");}else{C.push("sapMPopoverWithoutSubHeader");}if(c._hasSingleNavContent()){C.push("sapMPopoverNav");}if(c._hasSinglePageContent()){C.push("sapMPopoverPage");}if(f){C.push("sapMPopoverWithFooter");}else{C.push("sapMPopoverWithoutFooter");}if(c.getPlacement()===P.Top){C.push("sapMPopoverPlacedTop");}if(!v){C.push("sapMPopoverVerScrollDisabled");}if(!h){C.push("sapMPopoverHorScrollDisabled");}C.push("sapMPopup-CTX");if(c._bSizeCompact){C.push("sapUiSizeCompact");}return C.concat(c.aCustomStyleClasses);};return a;},true);
