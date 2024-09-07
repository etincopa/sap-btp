/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Renderer","sap/ui/core/Core","sap/ui/core/InvisibleText","./library","./ListBaseRenderer","./ColumnListItemRenderer","sap/m/table/Util"],function(R,C,I,l,L,a,U){"use strict";var b=l.ListKeyboardMode;var M=l.MultiSelectMode;var T=R.extend(L);T.apiVersion=2;var r=C.getConfiguration().getRTL();T.columnAlign={left:r?"flex-end":"flex-start",center:"center",right:r?"flex-start":"flex-end"};T.renderColumns=function(c,t,d){var i=0,h=0,e=false,f=false,m=t.getMode(),g=L.ModeOrder[m],j="sapMListTbl",k=t.getId("tbl"),n=(d=="Head")?"th":"td",o="t"+d.toLowerCase(),p=t.getColumns(),s=t.shouldRenderDummyColumn(),H,q=function(w,x,A){c.openStart(n,x&&k+x);if(n==="th"){c.class("sapMTableTH");c.attr("role",A?"presentation":"columnheader");c.attr("scope","col");}else if(A){c.attr("role","presentation");}A&&c.attr("aria-hidden","true");c.class(j+w);if(d==="Foot"){if(w==="HighlightCol"){c.class("sapMTableHighlightFooterCell");}else if(w==="NavigatedCol"){c.class("sapMTableNavigatedFooterCell");}}c.openEnd();c.close(n);i++;};if(d=="Head"){var v=p.filter(function(w){return w.getVisible();});var F=p.reduce(function(w,x,O){x.setIndex(-1);x.setInitialOrder(O);x.setForcedColumn(false);return(x.getVisible()&&x.getCalculatedMinScreenWidth()<w.getCalculatedMinScreenWidth())?x:w;},v[0]);var u=p.filter(function(w){return w.getVisible()&&!w.isPopin()&&!w.isHidden();}).length;if(!u&&F){F.setForcedColumn(true);u=1;}H=p.every(function(w){return!w.getHeader()||!w.getHeader().getVisible()||!w.getVisible()||w.isPopin()||w.isHidden();});}c.openStart(o);if(t._hasFooter&&d==="Foot"){c.class("sapMTableTFoot");if(t.hasPopin()){c.class("sapMListTblHasPopin");}}c.openEnd();c.openStart("tr",t.addNavSection(k+d+"er"));c.attr("tabindex",-1);if(H){c.class("sapMListTblHeaderNone");}else{c.class("sapMListTblRow").class("sapMListTbl"+d+"er");c.class("sapMLIBFocusable").class("sapMTableRowCustomFocus");}c.openEnd();q("HighlightCol",d+"Highlight",true);if(g==-1){if(m=="MultiSelect"&&d=="Head"&&!H){c.openStart("th");c.class("sapMTableTH");c.attr("scope","col");c.attr("aria-hidden","true");c.class(j+"SelCol");c.attr("role","presentation");c.openEnd();c.renderControl(t.getMultiSelectMode()==M.Default?t._getSelectAllCheckbox():t._getClearAllButton());c.close("th");i++;}else{q("SelCol","",true);}}t.getColumns(true).forEach(function(w,x){if(!w.getVisible()){return;}if(w.isPopin()){e=true;return;}var y=w.isHidden();if(y){h++;}var z=w["get"+d+"er"](),A=t.getFixedLayout(),B=(u==1&&A!="Strict")?"":w.getWidth(),S=w.getStyleClass(true).split(" "),D=w.getCssAlign();t._bCheckLastColumnWidth=A=="Strict"&&u==1;if(d=="Head"){c.openStart(n,w);c.class("sapMTableTH");c.attr("role","columnheader");c.attr("scope","col");var E=w.getSortIndicator().toLowerCase();E!=="none"&&c.attr("aria-sort",E);}else{c.openStart(n);}S&&S.forEach(function(J){c.class(J);});c.class(j+"Cell");c.class(j+d+"erCell");c.attr("data-sap-ui-column",w.getId());c.attr("data-sap-width",w.getWidth());c.style("width",B);if(D&&d!=="Head"){c.style("text-align",D);}if(y){c.style("display","none");c.attr("aria-hidden","true");}c.openEnd();if(z){if(d==="Head"){c.openStart("div");c.class("sapMColumnHeader");var G=w.getColumnHeaderMenu();if((t.bActiveHeaders||G)&&!z.isA("sap.ui.core.InvisibleText")){c.attr("tabindex",0);c.attr("role","button");c.class("sapMColumnHeaderActive");c.attr("aria-haspopup",G?G.getAriaHasPopupType().toLowerCase():"dialog");}else if(t.bFocusableHeaders){c.attr("tabindex",0);c.class("sapMColumnHeaderFocusable");}if(D){c.style("justify-content",T.columnAlign[D]);c.style("text-align",D);}c.openEnd();c.renderControl(z.addStyleClass("sapMColumnHeaderContent"));c.close("div");}else{c.renderControl(z);}}if(d=="Head"&&!f){f=!!w.getFooter();}c.close(n);w.setIndex(i++);});if(e&&s){q("DummyCell",d+"DummyCell",true);}q("NavCol",d+"Nav",true);if(g==1){q("SelCol","",true);}q("NavigatedCol",d+"Navigated",true);if(!e&&s){q("DummyCell",d+"DummyCell",true);}c.close("tr");c.close(o);if(d==="Head"){t._hasPopin=e;t._colCount=i-h;t._hasFooter=f;t._headerHidden=H;}};T.renderContainerAttributes=function(c,o){c.attr("role","application").attr("data-sap-ui-pasteregion","true");c.attr("aria-roledescription",C.getLibraryResourceBundle("sap.m").getText("TABLE_CONTAINER_ROLE_DESCRIPTION"));c.class("sapMListTblCnt");c.accessibilityState(o,this.getAccessibilityState(o));};T.renderListStartAttributes=function(c,o){c.openStart("table",o.getId("listUl"));c.class("sapMListTbl");c.attr("aria-labelledby",o.getAriaLabelledBy().concat(this.getAriaLabelledBy(o),I.getStaticId("sap.m","TABLE_ARIA_LABEL")).join(" "));if(o.getFixedLayout()===false){c.style("table-layout","auto");}if(o._iItemNeedsColumn){c.class("sapMListTblHasNav");}};T.getAriaRole=function(c){return"";};T.renderListHeadAttributes=function(c,o){this.renderColumns(c,o,"Head");c.openStart("tbody",o.addNavSection(o.getId("tblBody")));c.class("sapMListItems");c.class("sapMTableTBody");if(o.getAlternateRowColors()){c.class(o._getAlternateRowColorsClass());}if(o.hasPopin()){c.class("sapMListTblHasPopin");}c.openEnd();};T.renderListEndAttributes=function(c,o){c.close("tbody");o._hasFooter&&this.renderColumns(c,o,"Foot");c.close("table");};T.renderNoData=function(c,o){c.openStart("tr",o.getId("nodata"));c.attr("tabindex",o.getKeyboardMode()==b.Navigation?-1:0);c.class("sapMLIB").class("sapMListTblRow").class("sapMLIBTypeInactive");a.addFocusableClasses(c,o);if(!o._headerHidden||(!o.getHeaderText()&&!o.getHeaderToolbar())){c.class("sapMLIBShowSeparator");}c.openEnd();var d=!o.hasPopin()&&o.shouldRenderDummyColumn();c.openStart("td",o.getId("nodata-text"));c.attr("colspan",o.getColCount()-d);c.class("sapMListTblCell").class("sapMListTblCellNoData");c.openEnd();if(!o.shouldRenderItems()){var n=o.getNoData();if(n&&typeof n!=="string"&&n.isA("sap.m.IllustratedMessage")){c.renderControl(o.getAggregation("_noColumnsMessage"));}else{c.text(C.getLibraryResourceBundle("sap.m").getText("TABLE_NO_COLUMNS"));}}else{this.renderNoDataArea(c,o);}c.close("td");if(d){a.renderDummyCell(c,o);}c.close("tr");};return T;},true);
