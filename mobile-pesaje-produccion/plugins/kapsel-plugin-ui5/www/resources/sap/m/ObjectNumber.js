/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./library','sap/ui/core/Control','sap/ui/core/Renderer','sap/ui/core/library','./ObjectNumberRenderer'],function(l,C,R,c,O){"use strict";var T=c.TextAlign;var a=c.TextDirection;var V=c.ValueState;var b=C.extend("sap.m.ObjectNumber",{metadata:{interfaces:["sap.ui.core.IFormContent"],library:"sap.m",designtime:"sap/m/designtime/ObjectNumber.designtime",properties:{number:{type:"string",group:"Misc",defaultValue:null},numberUnit:{type:"string",group:"Misc",defaultValue:null,deprecated:true},emphasized:{type:"boolean",group:"Appearance",defaultValue:true},state:{type:"sap.ui.core.ValueState",group:"Misc",defaultValue:V.None},unit:{type:"string",group:"Misc",defaultValue:null},textDirection:{type:"sap.ui.core.TextDirection",group:"Appearance",defaultValue:a.Inherit},textAlign:{type:"sap.ui.core.TextAlign",group:"Appearance",defaultValue:T.Begin}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"}},dnd:{draggable:true,droppable:false}}});b.prototype._getStateText=function(){var s=this.getState(),r=sap.ui.getCore().getLibraryResourceBundle("sap.m");return r.getText("OBJECTNUMBER_ARIA_VALUE_STATE_"+s.toUpperCase(),[],true);};return b;});
