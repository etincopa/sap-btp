/*!
 * SAPUI5

(c) Copyright 2009-2019 SAP SE. All rights reserved
 */
sap.ui.define(['./library','sap/ui/core/Element','sap/ui/core/Control'],function(l,E,C){"use strict";var a=E.extend("sap.suite.ui.microchart.ComparisonMicroChartData",{metadata:{library:"sap.suite.ui.microchart",properties:{value:{type:"float",group:"Misc",defaultValue:"0"},color:{type:"sap.m.ValueCSSColor",group:"Misc",defaultValue:"Neutral"},title:{type:"string",group:"Misc",defaultValue:""},displayValue:{type:"string",group:"Misc",defaultValue:""}},events:{press:{}}}});a.prototype.init=function(){this.setAggregation("tooltip","((AltText))",true);};a.prototype.setValue=function(v,s){this._isValueSet=this._fnIsNumber(v);return this.setProperty("value",this._isValueSet?v:NaN,s);};a.prototype._fnIsNumber=function(n){return typeof n=='number'&&!isNaN(n)&&isFinite(n);};a.prototype.clone=function(i,L,o){var c=C.prototype.clone.apply(this,arguments);c._isValueSet=this._isValueSet;return c;};a.prototype.attachEvent=function(e,d,f,L){C.prototype.attachEvent.call(this,e,d,f,L);if(this.getParent()){this.getParent().setBarPressable(this.getParent().getData().indexOf(this),true);}return this;};a.prototype.detachEvent=function(e,f,L){C.prototype.detachEvent.call(this,e,f,L);if(this.getParent()){this.getParent().setBarPressable(this.getParent().getData().indexOf(this),false);}return this;};return a;});
