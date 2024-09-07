/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/fl/changeHandler/JsControlTreeModifier',"sap/base/Log"],function(J,L){"use strict";var H={};var I=function(c,m){var C=m.getControlType(c);return(C==="sap.ui.core.Title")||(C==="sap.m.Title")||(C==="sap.m.Toolbar")||(C==="sap.m.OverflowToolbar");};var g=function(c,m){var i;for(i=0;i<c.length;++i){if(I(c[i],m)){return c[i];}}};H.applyChange=function(c,C,p){try{var m=p.modifier;var v=p.view;var a=p.appComponent;var o=c.getDefinition();var r=m.bySelector(o.content.elementSelector||o.content.sHideId,a,v);var b=m.getAggregation(C,"content");var s=-1;var S=this._getState(C,m,a);c.setRevertData(S);m.removeAllAggregation(C,"content");for(var i=0;i<b.length;++i){m.insertAggregation(C,"content",b[i],i,v);}if(o.changeType==="hideSimpleFormField"){b.some(function(F,d){if(F===r){s=d;m.setVisible(F,false);}if(s>=0&&d>s){if((m.getControlType(F)==="sap.m.Label")||(m.getControlType(F)==="sap.ui.comp.smartfield.SmartLabel")||I(F,m)){return true;}else{m.setVisible(F,false);}}});}else if(o.changeType==="removeSimpleFormGroup"){var t=g(b,m);var f=t&&!r;b.some(function(F,d){if(!t){m.setVisible(F,false);}else if(f){s=0;m.setVisible(F,false);f=false;}else{if(F===r){s=d;}if(s>=0&&d>s){if(I(F,m)){if(s===0){m.removeAggregation(C,"content",F,v);m.insertAggregation(C,"content",F,0,v);}return true;}else{m.setVisible(F,false);}}}});if(r){m.removeAggregation(C,"content",r,v);m.insertAggregation(C,"dependents",r,0,v);}}return true;}catch(e){c.resetRevertData();L.error(e.message||e.name);}};H._getStableElement=function(e){if(e.getMetadata().getName()==="sap.ui.layout.form.FormContainer"){return e.getTitle()||e.getToolbar();}else if(e.getMetadata().getName()==="sap.ui.layout.form.FormElement"){return e.getLabel();}else{return e;}};H.completeChangeContent=function(c,s,p){var C=c.getDefinition();if(s.removedElement&&s.removedElement.id){var S=this._getStableElement(sap.ui.getCore().byId(s.removedElement.id));C.content.elementSelector=J.getSelector(S,p.appComponent);c.addDependentControl(S,"elementSelector",p);}else{throw new Error("oSpecificChangeInfo.removedElement.id attribute required");}};H._getState=function(c,m,a){var C=m.getAggregation(c,"content");return{content:C.map(function(e){return{elementSelector:m.getSelector(m.getId(e),a),visible:e.getVisible?e.getVisible():undefined,index:C.indexOf(e)};})};};H.revertChange=function(c,C,p){var s=c.getRevertData();var a=p.appComponent;var m=p.modifier;m.removeAllAggregation(C,"content");s.content.forEach(function(e){var E=m.bySelector(e.elementSelector,a,p.view);var d=m.getAggregation(C,"dependents");d.some(function(D){if(m.getProperty(D,"id")===m.getProperty(E,"id")){m.removeAggregation(C,"dependents",D,p.view);return true;}});m.insertAggregation(C,"content",E,e.index,p.view);m.setProperty(E,"visible",e.visible);});c.resetRevertData();return true;};return H;},true);
