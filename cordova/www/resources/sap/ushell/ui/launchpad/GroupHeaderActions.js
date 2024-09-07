// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/Control","sap/m/Button","sap/m/library","sap/ushell/library","./GroupHeaderActionsRenderer"],function(C,B,m){"use strict";var P=m.PlacementType;var G=C.extend("sap.ushell.ui.launchpad.GroupHeaderActions",{metadata:{library:"sap.ushell",properties:{isOverflow:{type:"boolean",group:"Misc",defaultValue:false},tileActionModeActive:{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"},overflowCtrl:{type:"sap.ui.core.Control",multiple:true,singularName:"overflowCtrl"}},events:{afterRendering:{}}}});G.prototype.onAfterRendering=function(){this.fireAfterRendering();};G.prototype._getActionOverflowControll=function(){var t=this;return[new B({icon:"sap-icon://overflow",type:"Transparent",enabled:{parts:["/editTitle"],formatter:function(i){return!i;}},press:function(e){var s=e.getSource();sap.ui.require(["sap/m/ActionSheet"],function(A){var a=new A({placement:P.Auto});t.getContent().forEach(function(b){var c=b.clone();c.setModel(b.getModel());c.setBindingContext(b.getBindingContext());a.addButton(c);});a.openBy(s);});}}).addStyleClass("sapUshellHeaderActionButton")];};return G;});
