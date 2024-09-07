/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/changeHandler/BaseAddViaDelegate","sap/base/util/ObjectPath"],function(B,O){"use strict";var C="columns";var a="cells";var I="items";function g(c,i,m,v,o){var e=O.get("oDataInformation.entityType",c);if(e){var b=c.content;return Promise.resolve().then(m.createControl.bind(m,'sap.m.Text',o,v,b.newFieldSelector.id+'--column',{text:"{/#"+e+"/"+b.bindingPath+"/@sap:label}"}));}return Promise.resolve(i.label);}var A=B.createAddViaDelegateChangeHandler({aggregationName:C,parentAlias:"targetTable",fieldSuffix:"--field",skipCreateLabel:function(p){return!!O.get("changeDefinition.oDataInformation.entityType",p);},skipCreateLayout:true,supportsDefault:true,addProperty:function(p){var i=p.innerControls;if(i.valueHelp){return Promise.reject(new Error("Adding properties with value helps is not yet supported by addTableColumn change handler"));}var t=p.control;var m=p.modifier;var v=p.view;var o=p.appComponent;var c=p.change;var r=c.getRevertData();var b=c.getDefinition();var d=b.content;var e=d.newFieldIndex;var f=d.newFieldSelector;return Promise.resolve().then(m.getBindingTemplate.bind(m,t,I,v)).then(function(T){if(T){var s=i.control;return Promise.resolve().then(m.insertAggregation.bind(m,T,a,s,e,v)).then(m.updateAggregation.bind(m,t,I)).then(function(){r.newCellSelector=m.getSelector(s,o);c.setRevertData(r);});}return undefined;}).then(m.createControl.bind(m,'sap.m.Column',o,v,f)).then(function(h){return g(b,i,m,v,o).then(function(l){return Promise.resolve().then(m.insertAggregation.bind(m,h,'header',l,0,v)).then(m.insertAggregation.bind(m,t,C,h,e,v));});});},revertAdditionalControls:function(p){var t=p.control;var c=p.change;var o=c.getRevertData();var m=p.modifier;var b=p.appComponent;var T,n;return Promise.resolve().then(m.getBindingTemplate.bind(m,t,I)).then(function(r){T=r;if(T){return Promise.resolve().then(m.bySelector.bind(m,o.newCellSelector,b)).then(function(d){n=d;return m.removeAggregation(T,a,n);}).then(function(){return m.destroy(n);}).then(m.updateAggregation.bind(m,t,I));}return undefined;});}});return A;},true);
