/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/fl/changeHandler/Base","sap/ui/comp/smartform/flexibility/changes/RenameField"],function(B,R){"use strict";var C={};C._evaluateElementForIndex=function(m,g){var M=-1;var s=[];var b=g.some(function(G){s=m.getAggregation(G,"fields");return s.some(function(S){M++;return m.getProperty(S,"mandatory");});});if(b){return M;}return-1;};C._getPreviousLabelPropertyOnControl=function(c,m,p){var l=m.getProperty(c,p);if(l&&(typeof l!=="string")){p="text";c=l;}var P=m.getPropertyBindingOrProperty(c,p);return P?P:"$$Handled_Internally$$";};C.applyChange=function(c,o,p){var a=c.getDefinition();var M=p.modifier;var A=p.appComponent;var v=p.view;var s=M.bySelector(a.content.sourceSelector,A,v);var l=[];var P;var t;var g=a.content.combineFieldSelectors.map(function(d){return M.bySelector(d,A,v);});var r=this._collectRevertDataForElements(M,g,A);var b=this._evaluateElementForIndex(M,g);if(b>0){M.setProperty(s,"elementForLabel",b);}var I=sap.ui.getCore().getConfiguration().getRTL();g.forEach(function(G,i){var d;var S=[];var L="fieldLabel"+i.toString();t=a.texts[L];if(t&&t.value!==P&&t.value.length>0){I?l.unshift(t.value):l.push(t.value);P=t.value;}S=M.getAggregation(g[i],"elements");if(g[i]!==s){for(var k=0,m=S.length;k<m;k++){M.removeAggregation(g[i],"elements",S[k]);M.insertAggregation(s,"elements",S[k],i+k,v);}d=M.getParent(g[i]);M.removeAggregation(d,"groupElements",g[i]);M.insertAggregation(d,"dependents",g[i],0,v);}});R.setLabelPropertyOnControl(s,l.join("/"),M,"label");c.setRevertData(r);};C._collectRevertDataForElements=function(m,g,a){var r={elementStates:[]};var f=0;var l=0;g.forEach(function(e){var s=m.getAggregation(e,"elements");var p=m.getParent(e);l=f+s.length-1;r.elementStates.push({groupElementSelector:m.getSelector(m.getId(e),a),parentSelector:m.getSelector(m.getId(p),a),groupElementIndex:m.getAggregation(p,"groupElements").indexOf(e),firstFieldIndex:f,lastFieldIndex:l,label:this._getPreviousLabelPropertyOnControl(e,m,"label"),elementForLabel:m.getProperty(e,"elementForLabel")});f=l+1;}.bind(this));return r;};C.revertChange=function(c,s,p){var r=c.getRevertData();var m=p.modifier;var a=p.appComponent;var f=[];r.elementStates.forEach(function(e){var P=p.modifier.bySelector(e.parentSelector,a);var g=p.modifier.bySelector(e.groupElementSelector,a);if(m.getAggregation(P,"groupElements").indexOf(g)===-1){m.removeAggregation(P,"dependents",g);m.insertAggregation(P,"groupElements",g,e.groupElementIndex);}else{f=m.getAggregation(g,"elements");m.removeAllAggregation(g,"elements");}});r.elementStates.forEach(function(e){var g=p.modifier.bySelector(e.groupElementSelector,a);for(var i=e.firstFieldIndex;i<=e.lastFieldIndex;i++){m.insertAggregation(g,"elements",f[i],f.length);}var P=e.label;if(P==="$$Handled_Internally$$"){P=undefined;var E=m.getAggregation(g,"fields")[e.elementForLabel];m.setProperty(E,"textLabel",undefined);}m.setProperty(g,"elementForLabel",e.elementForLabel);R.setLabelPropertyOnControl(g,P,m,"label");});c.resetRevertData();};C.completeChangeContent=function(c,s,p){var m=p.modifier;var v=p.view;var a=p.appComponent;var o=c.getDefinition();var b=s.combineElementIds;if(b&&b.length>=2){o.content.combineFieldSelectors=b.map(function(d){return m.getSelector(d,a);});c.addDependentControl(b,"combinedFields",p);}else{throw new Error("oSpecificChangeInfo.combineElementIds attribute required");}if(s.sourceControlId){o.content.sourceSelector=m.getSelector(s.sourceControlId,a);c.addDependentControl(s.sourceControlId,"sourceControl",p);}else{throw new Error("oSpecificChangeInfo.sourceControlId attribute required");}var t;var f;var g;for(var i=0;i<o.content.combineFieldSelectors.length;i++){var S=o.content.combineFieldSelectors[i];g=m.bySelector(S,a,v);t=g.getLabelText();if(t){f="fieldLabel"+i;B.setTextInChange(o,f,t,"XFLD");}}};return C;},true);
