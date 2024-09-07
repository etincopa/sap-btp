/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/base/Object","sap/ui/dt/Util","sap/ui/core/Element","sap/ui/core/Component","sap/base/util/isPlainObject","sap/ui/core/UIArea"],function(q,B,U,E,C,c,d){"use strict";var e={};e.iterateOverAllPublicAggregations=function(o,f){var a=o.getMetadata().getAllAggregations();var A=Object.keys(a);A.forEach(function(s){var b=a[s];var v=this.getAggregation(o,s);f(b,v);},this);};e.getElementInstance=function(v){if(typeof v==="string"){var o=sap.ui.getCore().byId(v);return o||C.get(v);}return v;};e.hasAncestor=function(o,a){a=this.fixComponentContainerElement(a);var f;while(o&&o!==a){f=this.fixComponentParent(o);if(o===f){o=o.getParent();}else{o=f;}}return!!o;};e.getClosestElementForNode=function(n){var $=q(n).closest("[data-sap-ui]");return $.length?sap.ui.getCore().byId($.attr("data-sap-ui")):undefined;};e.fixComponentParent=function(o){if(B.isA(o,"sap.ui.core.UIComponent")){var a=o.oContainer;if(a){return a.getParent();}}else{return o;}};e.fixComponentContainerElement=function(o){if(B.isA(o,"sap.ui.core.ComponentContainer")){if(!o.getComponentInstance()){return undefined;}return o.getComponentInstance().getRootControl();}return o;};e.getDomRef=function(o){if(o){var D;if(o.getDomRef){D=o.getDomRef();}if(!D&&o.getRenderedDomRef){D=o.getRenderedDomRef();}return D;}};e.findAllSiblingsInContainer=function(o,f){var p=o&&o.getParent();if(!p){return[];}if(p!==f){var P=e.findAllSiblingsInContainer(p,f);return P.map(function(p){return e.getAggregation(p,o.sParentAggregationName);}).reduce(function(a,b){return a.concat(b);},[]);}return e.getAggregation(p,o.sParentAggregationName);};e.getAggregationAccessors=function(o,a){var m=o.getMetadata();m.getJSONKeys();var A=m.getAggregation(a);if(A){var g=A._sGetter;if(A.altTypes&&A.altTypes.length&&o[A._sGetter+"Control"]){g=A._sGetter+"Control";}return{get:g,add:A._sMutator,remove:A._sRemoveMutator,insert:A._sInsertMutator,removeAll:A._sRemoveAllMutator};}return{};};e.getAggregation=function(o,a){var v;var g=this.getAggregationAccessors(o,a).get;if(g){v=o[g]();}else{v=o.getAggregation(a);}v=v&&v.splice?v:(v?[v]:[]);return v;};e.getIndexInAggregation=function(o,p,a){return this.getAggregation(p,a).indexOf(o);};e.addAggregation=function(p,a,o){if(this.hasAncestor(p,o)){throw new Error("Trying to add an element to itself or its successors");}var A=this.getAggregationAccessors(p,a).add;if(A){p[A](o);}else{p.addAggregation(a,o);}};e.removeAggregation=function(p,a,o,s){var A=this.getAggregationAccessors(p,a).remove;if(A){p[A](o,s);}else{p.removeAggregation(a,o,s);}};e.insertAggregation=function(p,a,o,i){if(this.hasAncestor(p,o)){throw new Error("Trying to add an element to itself or its successors");}if(this.getIndexInAggregation(o,p,a)!==-1){o.__bSapUiDtSupressParentChangeEvent=true;try{this.removeAggregation(p,a,o,true);}finally{delete o.__bSapUiDtSupressParentChangeEvent;}}var A=this.getAggregationAccessors(p,a).insert;if(A){p[A](o,i);}else{p.insertAggregation(a,o,i);}};e.isValidForAggregation=function(p,a,o){var A=p.getMetadata().getAggregation(a);if(this.hasAncestor(p,o)){return false;}if(A){var t=A.type;if(A.multiple===false&&this.getAggregation(p,a)&&this.getAggregation(p,a).length>0){return false;}return B.isA(o,t)||this.hasInterface(o,t);}};e.getAssociationAccessors=function(o,a){var m=o.getMetadata();m.getJSONKeys();var A=m.getAssociation(a);if(A){return{get:A._sGetter,add:A._sMutator,remove:A._sRemoveMutator,insert:A._sInsertMutator,removeAll:A._sRemoveAllMutator};}return{};};e.getAssociation=function(o,a){var v;var g=this.getAssociationAccessors(o,a).get;if(g){v=o[g]();}return v;};e.getIndexInAssociation=function(o,p,a){return this.getAssociationInstances(p,a).indexOf(o);};e.getAssociationInstances=function(o,a){var v=U.castArray(this.getAssociation(o,a));return v.map(function(i){return this.getElementInstance(i);},this);};e.hasInterface=function(o,i){var I=o.getMetadata().getInterfaces();return I.indexOf(i)!==-1;};e.isElementInTemplate=function(o){var l=e.getAggregationInformation(o);if(l.templateId){var t=e.extractTemplateId(l);if(!t){return false;}}return true;};e.isElementValid=function(o){var v=((o instanceof E||o instanceof C)&&!o.bIsDestroyed&&e.isElementInTemplate(o));return v;};e.getParent=function(o){return B.isA(o,'sap.ui.core.Component')?o.oContainer:o.getParent();};e.getLabelForElement=function(o,f){if(!e.isElementValid(o)){throw U.createError("ElementUtil#getLabelForElement","A valid managed object instance should be passed as parameter","sap.ui.dt");}if(typeof f==="function"){return f(o);}function a(o){var F=(typeof o.getText==="function"&&o.getText()||typeof o.getLabelText==="function"&&o.getLabelText()||typeof o.getLabel==="function"&&o.getLabel()||typeof o.getTitle==="function"&&o.getTitle()||typeof o.getHeading==="function"&&o.getHeading());if(e.isElementValid(F)){return a(F);}return F;}var v=a(o);return typeof v!=="string"?o.getId():v;};e.extractTemplateId=function(b){if(c(b)&&b.templateId){if(b.stack.length>1){var r;var a=sap.ui.getCore().byId(b.templateId);var A;var I;for(var i=b.stack.length-2;i>=0;i--){A=b.stack[i].aggregation;I=b.stack[i].index;r=e.getAggregation(a,A)[I];if(!r){return undefined;}a=r;}return a.getId();}else if(b.stack.length===1){return b.templateId;}}else{return undefined;}};e.getAggregationInformation=function(o){var s=[];return this._evaluateBinding(o,s);};e._evaluateBinding=function(o,s){var a;var i;var p=o.getParent();if(p){a=o.sParentAggregationName;i=e.getAggregation(p,a).indexOf(o);}else{i=-1;}s.push({element:o.getId(),type:o.getMetadata().getName(),aggregation:a,index:i});if(a&&p.getBinding(a)){var b=p.getBindingInfo(a);var t=b&&b.template;return{elementId:p.getId(),aggregation:a,templateId:t?t.getId():undefined,stack:s};}return!p||p instanceof d?{elementId:undefined,aggregation:undefined,templateId:undefined,stack:s}:(this._evaluateBinding(p,s));};e.adjustIndexForMove=function(s,t,S,T){if(s===t&&S<T&&S>-1){return T-1;}return T;};return e;},true);
