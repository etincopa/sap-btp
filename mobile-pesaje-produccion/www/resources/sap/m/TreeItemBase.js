/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./ListItemBase','./library','sap/ui/core/IconPool','sap/ui/core/Icon','./TreeItemBaseRenderer','sap/ui/events/KeyCodes'],function(L,l,I,a,T,K){"use strict";var b=l.ListMode;var c=L.extend("sap.m.TreeItemBase",{metadata:{library:"sap.m"}});c.prototype.ExpandedIconURI=I.getIconURI("navigation-down-arrow");c.prototype.CollapsedIconURI=I.getIconURI("navigation-right-arrow");c.prototype.getTree=function(){var p=this.getParent();if(p&&p.isA("sap.m.Tree")){return p;}};c.prototype.getList=c.prototype.getTree;c.prototype.informTree=c.prototype.informList;c.prototype.getItemNodeContext=function(){var t=this.getTree();var n=null;var B=t?t.getBinding("items"):null;if(t&&B){B=t.getBinding("items");n=B.getNodeByIndex(t.indexOfItem(this));}return n;};c.prototype.getParentNode=function(){if(this.isTopLevel()){return;}var t=this.getTree(),n=this.getLevel(),p=null,i=t.indexOfItem(this)-1,d=t.getItems(),e;while(i>=0){e=d[i].getLevel();if(e===n-1){p=d[i];break;}i--;}return p;};c.prototype.getParentNodeContext=function(){return this.getItemNodeContext().parent;};c.prototype.isLeaf=function(){var t=this.getTree(),n=this.getItemNodeContext();return n?!t.getBinding("items").nodeHasChildren(n):false;};c.prototype.isTopLevel=function(){return(this.getLevel()===0);};c.prototype.getLevel=function(){return(this.getItemNodeContext()||{}).level;};c.prototype.getExpanded=function(){var t=this.getTree();if(!t){return false;}var i=t.indexOfItem(this);var B=t.getBinding("items");return(B&&B.isExpanded(i));};c.prototype.setSelected=function(s){L.prototype.setSelected.apply(this,arguments);var t=this.getTree();var B=t?t.getBinding("items"):null;var i=-1;if(t&&B){i=t.indexOfItem(this);if(t.getMode()===b.SingleSelect){B.setSelectedIndex(i);}if(t.getMode()===b.MultiSelect){if(s){B.addSelectionInterval(i,i);}else{B.removeSelectionInterval(i,i);}}}return this;};c.prototype._getExpanderControl=function(){var s=this.CollapsedIconURI,B=sap.ui.getCore().getLibraryResourceBundle("sap.m"),i=B.getText("TREE_ITEM_EXPAND_NODE");if(this.getExpanded()){s=this.ExpandedIconURI;i=B.getText("TREE_ITEM_COLLAPSE_NODE");}if(this._oExpanderControl){this._oExpanderControl.setSrc(s);this._oExpanderControl.setTooltip(i);return this._oExpanderControl;}this._oExpanderControl=new a({id:this.getId()+"-expander",src:s,tooltip:i,noTabStop:true}).setParent(this,null,true).addStyleClass("sapMTreeItemBaseExpander").attachPress(function(e){this.informTree("ExpanderPressed");},this);return this._oExpanderControl;};c.prototype.invalidate=function(){L.prototype.invalidate.apply(this,arguments);this._bInvalidated=true;};c.prototype.onAfterRendering=function(){L.prototype.onAfterRendering.apply(this,arguments);this._bInvalidated=false;};c.prototype.setBindingContext=function(){L.prototype.setBindingContext.apply(this,arguments);this.invalidate();return this;};c.prototype._getPadding=function(){var t=this.getTree(),n=this.getLevel(),i=0,d;if(t){d=t.getDeepestLevel();}if(d<n){t._iDeepestLevel=n;d=t._iDeepestLevel;}if(d<2){i=n*1.5;}else if(d===2){i=n*1;}else if(d<6){i=n*0.5;}else{i=n*0.25;}return i;};c.prototype.onsapplus=function(e){this.informTree("ExpanderPressed",true);};c.prototype.onsapminus=function(e){this.informTree("ExpanderPressed",false);};c.prototype.onsapright=function(e){if(e.srcControl!==this||this.isLeaf()){return;}if(!this.getExpanded()){this.informTree("ExpanderPressed",true);}else{e.keyCode=K.ARROW_DOWN;}};c.prototype.onsapleft=function(e){if(e.srcControl!==this||this.isTopLevel()&&!this.getExpanded()){return;}if(!this.isLeaf()){if(this.getExpanded()){this.informTree("ExpanderPressed",false);}else{this.getParentNode().focus();}}else{this.getParentNode().focus();}};c.prototype.onsapbackspace=function(e){if(e.srcControl!==this){return;}if(!this.isTopLevel()){this.getParentNode().focus();}};c.prototype.getAccessibilityType=function(B){return B.getText("ACC_CTR_TYPE_TREEITEM");};c.prototype.exit=function(){L.prototype.exit.apply(this,arguments);this.destroyControls(["Expander"]);};c.prototype.onlongdragover=function(e){this.informTree("LongDragOver");};return c;});
