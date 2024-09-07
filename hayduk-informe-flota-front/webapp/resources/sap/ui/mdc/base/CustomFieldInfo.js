/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
sap.ui.define(['./FieldInfoBase','sap/ui/core/Control','sap/ui/core/InvisibleText','sap/ui/base/ManagedObjectObserver'],function(F,C,I,M){"use strict";var a=F.extend("sap.ui.mdc.base.CustomFieldInfo",{metadata:{library:"sap.ui.mdc",properties:{},aggregations:{content:{type:"sap.ui.core.Control",multiple:false}},defaultAggregation:"content"}});a._oBox=undefined;a.prototype.init=function(){F.prototype.init.apply(this,arguments);this._oObserver=new M(_.bind(this));this._oObserver.observe(this,{aggregations:["content"]});};a.prototype.exit=function(){F.prototype.exit.apply(this,arguments);if(this._oMyBox){this._oMyBox.destroy();this._oMyBox=undefined;}};a.prototype.isTriggerable=function(){return!!this.getContent();};a.prototype.getDirectLink=function(){return null;};a.prototype.getPopoverTitle=function(){return"";};a.prototype.getPopoverContent=function(){if(!a._oBox){a._oBox=C.extend("sap.ui.mdc.base.CustomFieldInfoBox",{metadata:{},renderer:function(r,b){var c=b._oInfo.getContent();r.write("<div");r.writeControlData(b);r.write(">");if(c){r.renderControl(c);}r.write("</div>");}});}if(!this._oMyBox||this._oMyBox._bIsBeingDestroyed){this._oMyBox=new a._oBox(this.getId()+"-box");this._oMyBox._oInfo=this;}return Promise.resolve(this._oMyBox);};function _(c){if(c.object==this){if(c.name=="content"){this.fireDataUpdate();}}}return a;},true);
