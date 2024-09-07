/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/ui/thirdparty/jquery"],function(L,q){"use strict";var M={};var S="source";var T="target";var a="movedElements";var C="columns";var b="cells";var I="items";function s(o,v,r,i,t){return Promise.resolve().then(o.getAggregation.bind(o,r,b)).then(function(c){if(!c){L.warning("Aggregation cells to move not found");return Promise.reject();}if(i<0||i>=c.length){L.warning("Move cells in table item called with invalid index: "+i);return Promise.reject();}var d=c[i];return Promise.resolve().then(o.removeAggregation.bind(o,r,b,d)).then(o.insertAggregation.bind(o,r,b,d,t,v));});}function m(o,v,t,i,c){return Promise.resolve().then(o.getAggregation.bind(o,t,I)).then(function(d){return d.reduce(function(p,e){return p.then(function(){if(o.getControlType(e)!=="sap.m.GroupHeaderListItem"){return s(o,v,e,i,c);}return undefined;});},Promise.resolve());});}function _(c,r,p,i){var o=p.modifier;var v=p.view;var A=p.appComponent;var d=c.getContent();var t=c.getDependentControl(S,p);var e=c.getDependentControl(T,p);var f;var g;return Promise.resolve().then(function(){return o.getAggregation(e,C);}).then(function(R){f=R;if(t!==e){L.warning("Moving columns between different tables is not yet supported.");return Promise.reject(false);}return d.movedElements.reduce(function(P,h){var j;var k;var l;var n;var u;return P.then(function(){g=o.bySelector(h.selector,A,v);if(!g){u=h.selector&&h.selector.id;L.warning("The table column with id: '"+u+"' stored in the change is not found and the move operation cannot be applied");return Promise.reject();}l=f.indexOf(g);n=h.sourceIndex;k=typeof i==="function"&&i(n);k=q.isNumeric(k)?k:h.targetIndex;if(l!==k){j=l;}else{j=n;}return o.removeAggregation(e,C,g);}).then(function(){return o.insertAggregation(e,C,g,k,v);}).then(function(){return o.getBindingTemplate(e,I);}).then(function(w){if(w){return s(o,v,w,j,k).then(o.updateAggregation.bind(o,e,I));}else{return m(o,v,e,j,k);}});},Promise.resolve());});}M.applyChange=function(c,r,p){var R=[];return Promise.resolve().then(function(){return _(c,r,p,function(i){R.unshift({index:i});});}).then(function(){c.setRevertData(R);});};M.revertChange=function(c,r,p){var R=c.getRevertData();return Promise.resolve().then(function(){return _(c,r,p,function(){var i=R.shift();return i&&i.index;});}).then(function(){c.resetRevertData();});};M.completeChangeContent=function(c,d,p){var o=p.modifier;var A=p.appComponent;var e=c.getDefinition();var f=o.bySelector(d.source.id,A);var t=o.bySelector(d.target.id,A);var g={aggregation:d.source.aggregation,type:o.getControlType(f)};var h={aggregation:d.target.aggregation,type:o.getControlType(t)};e.content={movedElements:[]};d.movedElements.forEach(function(E){var i=E.element||o.bySelector(E.id,A);e.content.movedElements.push({selector:o.getSelector(i,A),sourceIndex:E.sourceIndex,targetIndex:E.targetIndex});});c.addDependentControl(d.source.id,S,p,g);c.addDependentControl(d.target.id,T,p,h);c.addDependentControl(d.movedElements.map(function(i){return i.id;}),a,p);};return M;},true);
