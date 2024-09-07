/*!

 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./BarInPageEnabler','sap/ui/Device',"sap/base/Log",'sap/m/HBox'],function(B,D,L,H){"use strict";var a={apiVersion:2};a.render=B.prototype.render;a.decorateRootElement=function(r,c){r.class("sapMBar");r.class(this.getContext(c));r.accessibilityState(c,{"role":c._getRootAccessibilityRole(),"level":c._getRootAriaLevel()});if(c.getTranslucent()&&D.support.touch){r.class("sapMBarTranslucent");}r.class("sapMBar-CTX");};a.shouldAddIBarContext=function(){return true;};a.renderBarContent=function(r,c){r.openStart("div",c.getId()+"-BarLeft");r.class("sapMBarLeft");r.class("sapMBarContainer");w("left",r,c);r.openEnd();this.renderAllControls(c.getContentLeft(),r,c);r.close("div");r.openStart("div",c.getId()+"-BarMiddle");r.class("sapMBarMiddle");r.openEnd();if(c.getEnableFlexBox()){c._oflexBox=c._oflexBox||new H(c.getId()+"-BarPH",{alignItems:"Center"}).addStyleClass("sapMBarPH").setParent(c,null,true);var C=!!c.getContentLeft().length,b=!!c.getContentMiddle().length,d=!!c.getContentRight().length;if(b&&!C&&!d){c._oflexBox.addStyleClass("sapMBarFlexBoxWidth100");}c.getContentMiddle().forEach(function(m){c._oflexBox.addItem(m);});r.renderControl(c._oflexBox);}else{r.openStart("div",c.getId()+"-BarPH");r.class("sapMBarPH");r.class("sapMBarContainer");w("middle",r,c);r.openEnd();this.renderAllControls(c.getContentMiddle(),r,c);r.close("div");}r.close("div");r.openStart("div",c.getId()+"-BarRight");r.class("sapMBarRight");r.class("sapMBarContainer");if(sap.ui.getCore().getConfiguration().getRTL()){r.class("sapMRTL");}w("right",r,c);r.openEnd();this.renderAllControls(c.getContentRight(),r,c);r.close("div");};a.renderAllControls=function(c,r,b){c.forEach(function(C){B.addChildClassTo(C,b);r.renderControl(C);});};a._mContexts={Header:"sapMHeader-CTX",SubHeader:"sapMSubHeader-CTX",Footer:"sapMFooter-CTX",Default:"sapMContent-CTX"};a.getContext=function(c){var d=c.getDesign(),C=a._mContexts;return C[d]||C.Default;};function w(A,r,c){var C=!!c.getContentLeft().length,b=!!c.getContentMiddle().length,d=!!c.getContentRight().length;switch(A.toLowerCase()){case"left":if(C&&!b&&!d){r.style("width","100%");}break;case"middle":if(b&&!C&&!d){r.style("width","100%");}break;case"right":if(d&&!C&&!b){r.style("width","100%");}break;default:L.error("Cannot determine which of the three content aggregations is alone");}}return a;},true);
