/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery",'./Button','./Dialog','./List','./SearchField','./library',"sap/ui/core/library",'./SelectDialogBase','sap/ui/core/InvisibleText',"sap/ui/core/InvisibleMessage",'sap/ui/Device','sap/m/Toolbar','sap/m/Text','sap/m/BusyIndicator','sap/m/Bar','sap/m/Title',"sap/base/Log"],function(q,B,D,L,S,l,C,a,I,b,c,T,d,e,f,g,h){"use strict";var i=l.ListMode;var j=l.ButtonType;var k=l.TitleAlignment;var m=C.InvisibleMessageMode;var n=a.extend("sap.m.SelectDialog",{metadata:{library:"sap.m",properties:{title:{type:"string",group:"Appearance",defaultValue:null},noDataText:{type:"string",group:"Appearance",defaultValue:null},multiSelect:{type:"boolean",group:"Dimension",defaultValue:false},growingThreshold:{type:"int",group:"Misc",defaultValue:null},growing:{type:"boolean",group:"Behavior",defaultValue:true},contentWidth:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},rememberSelections:{type:"boolean",group:"Behavior",defaultValue:false},contentHeight:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},showClearButton:{type:"boolean",group:"Behavior",defaultValue:false},confirmButtonText:{type:"string",group:"Appearance"},draggable:{type:"boolean",group:"Behavior",defaultValue:false},resizable:{type:"boolean",group:"Behavior",defaultValue:false},titleAlignment:{type:"sap.m.TitleAlignment",group:"Misc",defaultValue:k.Auto}},defaultAggregation:"items",aggregations:{items:{type:"sap.m.ListItemBase",multiple:true,singularName:"item",forwarding:{idSuffix:"-list",aggregation:"items",forwardBinding:true}},_dialog:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}},events:{confirm:{parameters:{selectedItem:{type:"sap.m.StandardListItem"},selectedItems:{type:"sap.m.StandardListItem[]"},selectedContexts:{type:"object[]"}}},search:{parameters:{value:{type:"string"},itemsBinding:{type:"any"},clearButtonPressed:{type:"boolean"}}},liveChange:{parameters:{value:{type:"string"},itemsBinding:{type:"any"}}},cancel:{}}},renderer:{apiVersion:2,render:function(){}}});n.prototype.init=function(){var t=this,o=0;this._bAppendedToUIArea=false;this._bInitBusy=false;this._bFirstRender=true;this._bAfterCloseAttached=false;this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.m");this._oList=new L(this.getId()+"-list",{growing:t.getGrowing(),growingScrollToLoad:t.getGrowing(),mode:i.SingleSelectMaster,sticky:[l.Sticky.InfoToolbar],infoToolbar:new T({visible:false,active:false,content:[new d({text:this._oRb.getText("TABLESELECTDIALOG_SELECTEDITEMS",[0])})]}),selectionChange:this._selectionChange.bind(this),updateStarted:this._updateStarted.bind(this),updateFinished:this._updateFinished.bind(this)});this._list=this._oList;this._oBusyIndicator=new e(this.getId()+"-busyIndicator").addStyleClass("sapMSelectDialogBusyIndicator",true);this._oSearchField=new S(this.getId()+"-searchField",{width:"100%",ariaLabelledBy:I.getStaticId("sap.m","SELECTDIALOG_SEARCH"),liveChange:function(E){var v=E.getSource().getValue(),r=(v?300:0);clearTimeout(o);if(r){o=setTimeout(function(){t._executeSearch(v,false,"liveChange");},r);}else{t._executeSearch(v,false,"liveChange");}},search:function(E){var v=E.getSource().getValue(),r=E.getParameters().clearButtonPressed;t._executeSearch(v,r,"search");}});this._searchField=this._oSearchField;this._oSubHeader=new f(this.getId()+"-subHeader",{contentMiddle:[this._oSearchField]});var p=new f(this.getId()+"-dialog-header",{titleAlignment:this.getTitleAlignment(),contentMiddle:[new g(this.getId()+"-dialog-title",{level:"H2"})]});this._oDialog=new D(this.getId()+"-dialog",{customHeader:p,titleAlignment:this.getTitleAlignment(),stretch:c.system.phone,contentHeight:"2000px",subHeader:this._oSubHeader,content:[this._oBusyIndicator,this._oList],leftButton:this._getCancelButton(),draggable:this.getDraggable()&&c.system.desktop,resizable:this.getResizable()&&c.system.desktop,escapeHandler:function(P){t._onCancel();P.resolve();}}).addStyleClass("sapMSelectDialog");this._dialog=this._oDialog;this.setAggregation("_dialog",this._oDialog);this._sSearchFieldValue="";this._iListUpdateRequested=0;};n.prototype.setGrowing=function(v){this._oList.setGrowing(v);this._oList.setGrowingScrollToLoad(v);this.setProperty("growing",v,true);return this;};n.prototype.setDraggable=function(v){this._setInteractionProperty(v,"draggable",this._oDialog.setDraggable);return this;};n.prototype.setResizable=function(v){this._setInteractionProperty(v,"resizable",this._oDialog.setResizable);return this;};n.prototype._setInteractionProperty=function(v,p,o){this.setProperty(p,v,true);if(!c.system.desktop&&v){h.warning(p+" property works only on desktop devices!");return;}if(c.system.desktop&&this._oDialog){o.call(this._oDialog,v);}};n.prototype.setBusy=function(){this._oDialog.setBusy.apply(this._oDialog,arguments);return this;};n.prototype.getBusy=function(){return this._oDialog.getBusy.apply(this._oDialog,arguments);};n.prototype.setBusyIndicatorDelay=function(v){this._oList.setBusyIndicatorDelay(v);this._oDialog.setBusyIndicatorDelay(v);this.setProperty("busyIndicatorDelay",v,true);return this;};n.prototype.exit=function(){this._oList=null;this._oSearchField=null;this._oSubHeader=null;this._oClearButton=null;this._oBusyIndicator=null;this._sSearchFieldValue=null;this._iListUpdateRequested=0;this._bInitBusy=false;this._bFirstRender=false;if(this._bAppendedToUIArea){var s=sap.ui.getCore().getStaticAreaRef();s=sap.ui.getCore().getUIArea(s);s.removeContent(this,true);}if(this._oDialog){this._oDialog.destroy();this._oDialog=null;}if(this._oOkButton){this._oOkButton.destroy();this._oOkButton=null;}this._oSelectedItem=null;this._aSelectedItems=null;this._list=null;this._searchField=null;this._dialog=null;};n.prototype.onAfterRendering=function(){if(this._bInitBusy&&this._bFirstRender){this._setBusy(true);this._bInitBusy=false;}return this;};n.prototype.invalidate=function(){if(this._oDialog&&(!arguments[0]||arguments[0]&&arguments[0].getId()!==this.getId()+"-dialog")){this._oDialog.invalidate(arguments);}else{a.prototype.invalidate.apply(this,arguments);}return this;};n.prototype.open=function(s){if((!this.getParent()||!this.getUIArea())&&!this._bAppendedToUIArea){var o=sap.ui.getCore().getStaticAreaRef();o=sap.ui.getCore().getUIArea(o);o.addContent(this,true);this._bAppendedToUIArea=true;}this._oSearchField.setValue(s);this._sSearchFieldValue=s||"";this._setInitialFocus();this._oDialog.open();if(this._bInitBusy){this._setBusy(true);}this._updateSelectionIndicator();this._aInitiallySelectedContextPaths=this._oList.getSelectedContextPaths();return this;};n.prototype.setGrowingThreshold=function(v){this._oList.setGrowingThreshold(v);this.setProperty("growingThreshold",v,true);return this;};n.prototype.setMultiSelect=function(M){this.setProperty("multiSelect",M,true);if(M){this._oList.setMode(i.MultiSelect);this._oList.setIncludeItemInSelection(true);this._oDialog.setEndButton(this._getCancelButton());this._oDialog.setBeginButton(this._getOkButton());}else{this._oList.setMode(i.SingleSelectMaster);this._oDialog.setEndButton(this._getCancelButton());this._oDialog.destroyBeginButton();delete this._oOkButton;}return this;};n.prototype.setTitle=function(t){this.setProperty("title",t,true);this._oDialog.getCustomHeader().getAggregation("contentMiddle")[0].setText(t);return this;};n.prototype.setTitleAlignment=function(A){this.setProperty("titleAlignment",A,true);if(this._oDialog){this._oDialog.setTitleAlignment(A);}return this;};n.prototype.setConfirmButtonText=function(t){this.setProperty("confirmButtonText",t,true);this._oOkButton&&this._oOkButton.setText(t||this._oRb.getText("SELECT_CONFIRM_BUTTON"));return this;};n.prototype.setNoDataText=function(N){this._oList.setNoDataText(N);return this;};n.prototype.getNoDataText=function(){return this._oList.getNoDataText();};n.prototype.getContentWidth=function(){return this._oDialog.getContentWidth();};n.prototype.setContentWidth=function(w){this._oDialog.setContentWidth(w);return this;};n.prototype.getContentHeight=function(){return this._oDialog.getContentHeight();};n.prototype.setShowClearButton=function(v){this.setProperty("showClearButton",v,true);if(v){var o=this._oDialog.getCustomHeader();o.addContentRight(this._getClearButton());}if(this._oClearButton){this._oClearButton.setVisible(v);}return this;};n.prototype.setContentHeight=function(H){this._oDialog.setContentHeight(H);return this;};n.prototype.addStyleClass=function(){this._oDialog.addStyleClass.apply(this._oDialog,arguments);return this;};n.prototype.removeStyleClass=function(){this._oDialog.removeStyleClass.apply(this._oDialog,arguments);return this;};n.prototype.toggleStyleClass=function(){this._oDialog.toggleStyleClass.apply(this._oDialog,arguments);return this;};n.prototype.hasStyleClass=function(){return this._oDialog.hasStyleClass.apply(this._oDialog,arguments);};n.prototype.getDomRef=function(){if(this._oDialog){return this._oDialog.getDomRef.apply(this._oDialog,arguments);}else{return null;}};n.prototype.clearSelection=function(){this._removeSelection();this._updateSelectionIndicator();this._oDialog.focus();return this;};n.prototype.setModel=function(M,s){this._setBusy(false);this._bInitBusy=false;this._iListUpdateRequested+=1;this._oList.setModel(M,s);a.prototype.setModel.apply(this,arguments);this._updateSelectionIndicator();return this;};n.prototype.setBindingContext=function(o,M){this._oList.setBindingContext(o,M);a.prototype.setBindingContext.apply(this,arguments);return this;};n.prototype._executeSearch=function(v,o,E){var p=this._oList,r=(p?p.getBinding("items"):undefined),s=(this._sSearchFieldValue!==v);if(this._oDialog.isOpen()&&((s&&E==="liveChange")||E==="search")){this._sSearchFieldValue=v;if(r){this._iListUpdateRequested+=1;if(E==="search"){this.fireSearch({value:v,itemsBinding:r,clearButtonPressed:o});}else if(E==="liveChange"){this.fireLiveChange({value:v,itemsBinding:r});}}else{if(E==="search"){this.fireSearch({value:v,clearButtonPressed:o});}else if(E==="liveChange"){this.fireLiveChange({value:v});}}}return this;};n.prototype._setBusy=function(o){if(this._iListUpdateRequested){if(o){this._oList.addStyleClass('sapMSelectDialogListHide');this._oBusyIndicator.$().css('display','inline-block');}else{this._oList.removeStyleClass('sapMSelectDialogListHide');this._oBusyIndicator.$().css('display','none');}}};n.prototype._updateStarted=function(E){this.fireUpdateStarted(E.getParameters());if(this.getModel()&&this.getModel().isA("sap.ui.model.odata.ODataModel")){if(this._oDialog.isOpen()&&this._iListUpdateRequested){this._setBusy(true);}else{this._bInitBusy=true;}}};n.prototype._updateFinished=function(E){this.fireUpdateFinished(E.getParameters());this._updateSelectionIndicator();if(this.getModel()&&this.getModel().isA("sap.ui.model.odata.ODataModel")){this._setBusy(false);this._bInitBusy=false;}this._iListUpdateRequested=0;this._oList.getItems().forEach(function(o){o.addEventDelegate(this._getListItemsEventDelegates());},this);};n.prototype._getOkButton=function(){var t=this,o=null;o=function(){t._sSearchFieldValue=null;var p=t._oList.getBinding("items");if(p&&p.aFilters&&p.aFilters.length){t._oList.setGrowing(false);p.filter([]);t._oList.setGrowing(t.getGrowing());}t._oSelectedItem=t._oList.getSelectedItem();t._aSelectedItems=t._oList.getSelectedItems();t._oDialog.detachAfterClose(o);t._fireConfirmAndUpdateSelection();};if(!this._oOkButton){this._oOkButton=new B(this.getId()+"-ok",{type:j.Emphasized,text:this.getConfirmButtonText()||this._oRb.getText("SELECT_CONFIRM_BUTTON"),press:function(){t._oDialog.attachAfterClose(o);t._oDialog.close();}});}return this._oOkButton;};n.prototype._getCancelButton=function(){var t=this;if(!this._oCancelButton){this._oCancelButton=new B(this.getId()+"-cancel",{text:this._oRb.getText("MSGBOX_CANCEL"),press:function(E){t._onCancel();}});}return this._oCancelButton;};n.prototype._getClearButton=function(){if(!this._oClearButton){this._oClearButton=new B(this.getId()+"-clear",{text:this._oRb.getText("SELECTDIALOG_CLEARBUTTON"),press:this.clearSelection.bind(this)});}return this._oClearButton;};n.prototype._onCancel=function(E){var t=this,A=null;A=function(){t._oSelectedItem=null;t._aSelectedItems=[];t._sSearchFieldValue=null;t._oDialog.detachAfterClose(A);t._resetSelection();t.fireCancel();};this._oDialog.attachAfterClose(A);this._oDialog.close();};n.prototype._updateSelectionIndicator=function(){var s=this._oList.getSelectedContextPaths(true).length,o=this._oList.getInfoToolbar(),v=!!s&&this.getMultiSelect();if(this.getShowClearButton()&&this._oClearButton){this._oClearButton.setEnabled(s>0);}if(o.getVisible()!==v){o.setVisible(v);}o.getContent()[0].setText(this._oRb.getText("TABLESELECTDIALOG_SELECTEDITEMS",[s]));if(this._oDialog.isOpen()){b.getInstance().announce(s>0?this._oRb.getText("TABLESELECTDIALOG_SELECTEDITEMS_SR",[s]):"",m.Polite);}};n.prototype._fireConfirmAndUpdateSelection=function(){var p={selectedItem:this._oSelectedItem,selectedItems:this._aSelectedItems};Object.defineProperty(p,"selectedContexts",{get:this._oList.getSelectedContexts.bind(this._oList,true)});this.fireConfirm(p);this._updateSelection();};n.prototype._selectionChange=function(E){if(E.getParameters){this.fireSelectionChange(E.getParameters());}if(!this._oDialog){return;}if(this.getMultiSelect()){this._updateSelectionIndicator();return;}if(!this._bAfterCloseAttached){this._oDialog.attachEventOnce("afterClose",this._resetAfterClose,this);this._bAfterCloseAttached=true;}this._oDialog.close();};n.prototype._resetAfterClose=function(){this._oSelectedItem=this._oList.getSelectedItem();this._aSelectedItems=this._oList.getSelectedItems();this._bAfterCloseAttached=false;this._fireConfirmAndUpdateSelection();};n.prototype._updateSelection=function(){if(!this.getRememberSelections()&&!this.bIsDestroyed){this._removeSelection();}};n.prototype._removeSelection=function(){this._oList.removeSelections(true);delete this._oSelectedItem;delete this._aSelectedItems;};n.prototype._resetSelection=function(){if(!this.bIsDestroyed){this._oList.removeSelections(true);this._oList.setSelectedContextPaths(this._aInitiallySelectedContextPaths);this._oList.getItems().forEach(function(o){var p=o.getBindingContextPath();if(p&&this._aInitiallySelectedContextPaths.indexOf(p)>-1){o.setSelected(true);}},this);}};n.prototype._getListItemsEventDelegates=function(){var E=function(o){var p=q(o.target).closest(".sapMLIB").control()[0];if(p._eventHandledByControl){return;}if(o&&o.isDefaultPrevented&&o.isMarked&&(o.isDefaultPrevented()||o.isMarked("preventSelectionChange"))){return;}if(o&&o.srcControl.isA("sap.m.GroupHeaderListItem")){return;}this._selectionChange(o);}.bind(this);return{ontap:E,onsapselect:E};};return n;});
