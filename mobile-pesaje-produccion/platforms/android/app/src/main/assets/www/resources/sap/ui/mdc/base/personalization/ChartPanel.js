/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/core/XMLComposite','sap/ui/model/Filter','sap/ui/model/FilterOperator','sap/ui/base/ManagedObjectObserver','sap/base/Log','sap/ui/Device','sap/ui/model/json/JSONModel','sap/ui/core/ResizeHandler'],function(X,F,c,M,L,D,J,R){"use strict";var C=X.extend("sap.ui.mdc.base.personalization.ChartPanel",{metadata:{library:"sap.ui.mdc",properties:{showReset:{type:"boolean",defaultValue:false,invalidate:true},showResetEnabled:{type:"boolean",defaultValue:false,invalidate:true}},associations:{source:{type:"sap.ui.core.Control"}},defaultAggregation:"items",aggregations:{items:{type:"sap.ui.mdc.base.personalization.ChartPanelItem",multiple:true,singularName:"item",invalidate:true}},events:{initialOrderChanged:{keys:{type:"string[]"}},change:{},reset:{}}}});C.prototype.init=function(){var o=new J(D);o.setDefaultBindingMode("OneWay");this.setModel(o,"device");this._sKeyOfMarkedItem=null;this.aFilters=[];this._oObserver=new M(d.bind(this));this._oObserver.observe(this,{properties:["showResetEnabled"]});var s=this.byId("idScrollContainer");this._fnHandleResize=function(){var b=false;if(!this.getParent){return b;}var p=this.getParent();if(!p||!p.$){return b;}var t=this._getCompositeAggregation().getContent()[0];var $=p.$("cont");var i,h;if($.children().length>0&&t.$().length>0){var S=s.$()[0].clientHeight;i=$.children()[0].clientHeight;h=t?t.$()[0].clientHeight:0;var a=i-h;if(S!==a){s.setHeight(a+'px');b=true;}}return b;}.bind(this);this._sContainerResizeListener=R.register(s,this._fnHandleResize);};C.prototype.exit=function(){this._sContainerResizeListener=null;};C.prototype.initialize=function(){this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());this._updateCountOfItems();this.fireInitialOrderChanged({keys:this._getInitialItemOrder()});var t=this._getVisibleTableItems()[0];this._toggleMarkedTableItem(t);this._updateEnableOfMoveButtons(t);};C.prototype.onDrop=function(e){this._moveTableItem(e.getParameter("draggedControl"),e.getParameter("droppedControl"));};C.prototype.onDragStart=function(e){this._toggleMarkedTableItem(e.getParameter("target"));};C.prototype.onChangeOfRole=function(e){var s=e.getParameter("selectedItem");if(s){var t=e.getSource().getParent();this.fireChange();this._toggleMarkedTableItem(t);this._updateEnableOfMoveButtons(t);}};C.prototype.onSelectionChange=function(e){e.getParameter("listItems").forEach(function(t){this._selectTableItem(t);},this);};C.prototype.onItemPressed=function(e){var t=e.getParameter('listItem');this._toggleMarkedTableItem(t);this._updateEnableOfMoveButtons(t);};C.prototype.onSearchFieldLiveChange=function(e){var s=e.getSource();this._defineTableFiltersByText(s?s.getValue():"");this._filterTable(this.aFilters);};C.prototype.onSwitchButtonShowSelected=function(){this._defineTableFiltersByText(this._getSearchText());this._filterTable(this.aFilters);};C.prototype.onPressButtonMoveToTop=function(){this._moveTableItem(this._getMarkedTableItem(),this._getVisibleTableItems()[0]);};C.prototype.onPressButtonMoveUp=function(){var v=this._getVisibleTableItems();this._moveTableItem(this._getMarkedTableItem(),v[v.indexOf(this._getMarkedTableItem())-1]);};C.prototype.onPressButtonMoveDown=function(){var v=this._getVisibleTableItems();this._moveTableItem(this._getMarkedTableItem(),v[v.indexOf(this._getMarkedTableItem())+1]);};C.prototype.onPressButtonMoveToBottom=function(){var v=this._getVisibleTableItems();this._moveTableItem(this._getMarkedTableItem(),v[v.length-1]);};C.prototype.onPressReset=function(){this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());this.fireReset();};C.prototype._selectTableItem=function(t){this._toggleMarkedTableItem(t);this._updateEnableOfMoveButtons(t);this._updateCountOfItems();this.fireChange();};C.prototype._moveTableItem=function(t,T){this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());var r=this.getModel("$sapuimdcPanel").getData().items;var m=_(this._getKeyByTableItem(t),r);r.splice(r.indexOf(m),1);r.splice(this._getItemPositionOfKey(this._getKeyByTableItem(T)),0,m);this.getModel("$sapuimdcPanel").setProperty("/items",r);this.fireChange();this._filterTable(this.aFilters);this._toggleMarkedTableItem(this._getMarkedTableItem());this._updateEnableOfMoveButtons(this._getMarkedTableItem());};C.prototype._getInitialItemOrder=function(){var k=this.getItems().filter(function(i){return i.getVisible();}).map(function(i){return i.getName();});var K=this.getItems().filter(function(i){return!i.getVisible();}).sort(function(a,b){if(a.getLabel()<b.getLabel()){return-1;}else if(a.getLabel()>b.getLabel()){return 1;}else{return 0;}}).map(function(i){return i.getName();});return k.concat(K);};C.prototype._isFilteredByShowSelected=function(){return false;};C.prototype._getSearchText=function(){var s=this.byId("idSearchField")||null;return s?s.getValue():"";};C.prototype._getTable=function(){return this.byId("idList")||null;};C.prototype._getTableBinding=function(){return this._getTable().getBinding("items");};C.prototype._getTableBindingContext=function(){return this._getTableBinding().getContexts();};C.prototype._setMarkedTableItem=function(t){this._sKeyOfMarkedItem=this._getKeyByTableItem(t);};C.prototype._getMarkedTableItem=function(){return this._getTableItemByKey(this._sKeyOfMarkedItem);};C.prototype._getVisibleTableItems=function(){return this._getTable().getItems().filter(function(t){return!!t.getVisible();});};C.prototype._getSelectedTableItems=function(){return this._getTable().getItems().filter(function(t){return!!t.getSelected();});};C.prototype._getTableItemByKey=function(k){var a=this._getTableBindingContext();var t=this._getTable().getItems().filter(function(T,i){return a[i].getObject().getName()===k;});return t[0];};C.prototype._getKeyByTableItem=function(t){var i=this._getTable().indexOfItem(t);return i<0?null:this._getTableBindingContext()[i].getObject().getName();};C.prototype._getItemPositionOfKey=function(k){return this.getItems().indexOf(this._getItemByKey(k));};C.prototype._getItemByKey=function(k){var i=this.getItems().filter(function(I){return I.getName()===k;});return i[0];};C.prototype._defineTableFiltersByText=function(s){this.aFilters=[];if(this._isFilteredByShowSelected()===true){this.aFilters.push(new F("visible","EQ",true));}if(s){this.aFilters.push(new F([new F("label",c.Contains,s)],false));}};C.prototype._filterTable=function(f){this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());this._getTableBinding().filter(f);this._toggleMarkedTableItem(this._getMarkedTableItem());this._updateEnableOfMoveButtons(this._getMarkedTableItem());};C.prototype._toggleMarkedTableItem=function(t){this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());var k=this._getKeyByTableItem(t);if(k){this._setMarkedTableItem(t);this._addMarkedStyleToTableItem(t);}};C.prototype._addMarkedStyleToTableItem=function(t){if(t){t.addStyleClass("sapUiMdcPersonalizationDialogMarked");}};C.prototype._setFocus=function(i){i.getDomRef().focus();};C.prototype._removeMarkedStyleFromTableItem=function(t){if(t){t.removeStyleClass("sapUiMdcPersonalizationDialogMarked");}};C.prototype._updateCountOfItems=function(){this._getManagedObjectModel().setProperty("/@custom/countOfSelectedItems",this._getSelectedTableItems().length);};C.prototype._updateEnableOfMoveButtons=function(t){var v=this._getVisibleTableItems();var e=v.indexOf(t)>0;if(this._getManagedObjectModel().getProperty("/@custom/isMoveUpButtonEnabled")===true&&e===false){this._setFocus(t);}this._getManagedObjectModel().setProperty("/@custom/isMoveUpButtonEnabled",e);e=v.indexOf(t)>-1&&v.indexOf(t)<v.length-1;if(this._getManagedObjectModel().getProperty("/@custom/isMoveDownButtonEnabled")===true&&e===false){this._setFocus(t);}this._getManagedObjectModel().setProperty("/@custom/isMoveDownButtonEnabled",e);};function _(n,a){return a.filter(function(m){return m.name===n;})[0];}function d(o){if(o.object.isA("sap.ui.mdc.base.personalization.ChartPanel")){switch(o.name){case"showResetEnabled":if(o.current===false&&o.old===true){this._setFocus(this._getCompositeAggregation());}break;default:L.error("The property or aggregation '"+o.name+"' has not been registered.");}}}return C;},true);
