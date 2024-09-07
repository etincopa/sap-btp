/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery",'sap/ui/core/Control','sap/ui/base/Event','sap/m/SelectionDetails','sap/m/SelectionDetailsItem','sap/m/SelectionDetailsItemLine','sap/suite/ui/commons/ChartContainer','./ChartContainerContentRenderer'],function(q,C,E,S,a,b,c,d){"use strict";var e=C.extend("sap.suite.ui.commons.ChartContainerContent",{metadata:{library:"sap.suite.ui.commons",properties:{icon:{type:"string",group:"Misc",defaultValue:null},title:{type:"string",group:"Misc",defaultValue:null}},aggregations:{content:{type:"sap.ui.core.Control",multiple:false}}}});e.prototype.init=function(){this._oSelectionDetails=new S();this._oSelectionDetails.registerSelectionDetailsItemFactory(e._selectionDetailsItemFactory);};e.prototype.onBeforeRendering=function(){var p=this.getParent(),o;this._oSelectionDetails.detachSelectionHandler("_selectionDetails");o=this.getContent();if(o&&o.getMetadata().getName()==="sap.viz.ui5.controls.VizFrame"){this._oSelectionDetails.attachSelectionHandler("_selectionDetails",o);}if(p instanceof c){this._oSelectionDetails.setWrapLabels(p.getWrapLabels());}};e.prototype.exit=function(){if(this._oSelectionDetails){this._oSelectionDetails.destroy();this._oSelectionDetails=null;}};e.prototype.getSelectionDetails=function(){e._addEventMapping(this._oSelectionDetails);return this._oSelectionDetails.getFacade();};e.prototype._getSelectionDetails=function(){var o=this.getContent();if(o&&o.getMetadata().getName()==="sap.viz.ui5.controls.VizFrame"){return this._oSelectionDetails;}};e._selectionDetailsItemFactory=function(f,g,h,j,s){s=s||"";var l=[],L,I=typeof s==="string";for(var i=0;i<f.length;i++){L=new b({label:f[i].label,value:f[i].value,unit:f[i].unit});if(!I){L.setLineMarker(s[f[i].id]);}else if(i===0){L.setLineMarker(s);}l.push(L);}return new a({lines:l});};e._aProxyEvent=["beforeOpen","beforeClose","navigate","actionPress"];e._addEventMapping=function(s){var A=s.attachEvent;s.attachEvent=function(f,g,h,l){if(e._aProxyEvent.indexOf(f)===-1){A.apply(this,arguments);return;}else if(q.type(g)==="function"){l=h;h=g;g=null;}A.apply(s,[f,g,p,l||s.getFacade()]);function p(i){var o=new E(f,i.oSource,i.mParameters);o.getSource=s.getFacade;if(f==="actionPress"){i.getParameters().items=j(i);}else if(f==="navigate"){i.getParameters().item=i.getParameter("item").getFacade();}h.call(l||s.getFacade(),o,g);}function j(k){var I=k.getParameter("items"),m=[];for(var i=0;i<I.length;i++){m.push(I[i].getFacade());}return m;}};};return e;});
