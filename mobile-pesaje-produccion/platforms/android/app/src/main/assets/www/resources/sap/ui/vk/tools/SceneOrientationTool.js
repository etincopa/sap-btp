/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Tool","./SceneOrientationToolGizmo"],function(T,S){"use strict";var a=T.extend("sap.ui.vk.tools.SceneOrientationTool",{metadata:{properties:{enablePredefinedViews:{type:"boolean",defaultValue:true},enableInitialView:{type:"boolean",defaultValue:true}}},constructor:function(i,s){if(a._instance){return a._instance;}T.apply(this,arguments);this._viewport=null;this._menu=null;a._instance=this;}});a.prototype.init=function(){if(T.prototype.init){T.prototype.init.call(this);}this.setFootprint(["sap.ui.vk.threejs.Viewport"]);this.setAggregation("gizmo",new S());};a.prototype.setActive=function(v,b,g){if(T.prototype.setActive){T.prototype.setActive.call(this,v,b,g);}this._viewport=b;this.getGizmo()._viewport=b.getImplementation?b.getImplementation():b;return this;};a.prototype.setView=function(v,m){this.getGizmo().setView(v,m);return this;};a.prototype.setEnableInitialView=function(v){this.setProperty("enableInitialView",v);this.getGizmo().setEnableInitialView(v);};a.prototype.queueCommand=function(c){if(this.isViewportType("sap.ui.vk.dvl.Viewport")){if(this._dvlRendererId){this._dvl.Renderer._queueCommand(c,this._dvlRendererId);}}else if(this.isViewportType("sap.ui.vk.threejs.Viewport")){c();}return this;};a.prototype.destroy=function(){T.prototype.destroy.call(this);this._viewport=null;delete a._instance;};return a;});
