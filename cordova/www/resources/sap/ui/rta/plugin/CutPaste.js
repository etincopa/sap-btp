/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/dt/plugin/CutPaste","sap/ui/dt/Util","sap/ui/rta/plugin/Plugin","sap/ui/rta/plugin/RTAElementMover","sap/ui/rta/Utils"],function(C,D,P,R,U){"use strict";var a=C.extend("sap.ui.rta.plugin.CutPaste",{metadata:{library:"sap.ui.rta",properties:{commandFactory:{type:"object",multiple:false}},events:{dragStarted:{},elementModified:{command:{type:"sap.ui.rta.command.BaseCommand"}}}}});U.extendWith(a.prototype,P.prototype,function(d,s,p){return p!=="getMetadata";});a.prototype.init=function(){C.prototype.init.apply(this,arguments);this.setElementMover(new R({commandFactory:this.getCommandFactory()}));};a.prototype._isEditable=function(o,p){return this.getElementMover().isEditable(o,p.onRegistration).then(function(e){if(e){return true;}return this._isPasteEditable(o);}.bind(this));};a.prototype._isPasteEditable=function(o){var e=this.getElementMover();if(!this.hasStableId(o)){return Promise.resolve(false);}return e.isMoveAvailableOnRelevantContainer(o).then(function(m){if(!m){return false;}return U.doIfAllControlsAreAvailable([o],function(){return e.isMoveAvailableForChildren(o);});});};a.prototype.isAvailable=function(e){return e.every(function(E){return E.getMovable();});};a.prototype.registerElementOverlay=function(){C.prototype.registerElementOverlay.apply(this,arguments);P.prototype.registerElementOverlay.apply(this,arguments);};a.prototype.deregisterElementOverlay=function(){C.prototype.deregisterElementOverlay.apply(this,arguments);P.prototype.removeFromPluginsList.apply(this,arguments);};a.prototype.paste=function(t){this._executePaste(t);D.waitForSynced(this.getDesignTime())().then(function(){return this.getElementMover().buildMoveCommand();}.bind(this)).then(function(m){this.fireElementModified({command:m});this.stopCutAndPaste();}.bind(this)).catch(function(m){throw D.createError("CutPaste#paste",m,"sap.ui.rta");});};a.prototype.cut=function(o){return C.prototype.cut.apply(this,arguments).then(function(){o.setSelected(false);});};a.prototype.getMenuItems=function(e){var m=[];var c={id:'CTX_CUT',text:sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_CUT'),handler:function(e){return this.cut(e[0]);}.bind(this),enabled:function(e){return e.length===1;},rank:70,icon:"sap-icon://scissors"};var p={id:'CTX_PASTE',text:sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_PASTE'),handler:function(e){return this.paste(e[0]);}.bind(this),enabled:function(e){return this.isElementPasteable(e[0]);}.bind(this),rank:80,icon:"sap-icon://paste"};if(this.isAvailable(e)){m.push(c,p);return m;}return this._isPasteEditable(e[0]).then(function(b){if(b){m.push(p);}return m;});};return a;},true);
