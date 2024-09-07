/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./library','./Button','./SegmentedButtonItem','./Select','sap/ui/core/Control','sap/ui/core/EnabledPropagator','sap/ui/core/delegate/ItemNavigation','sap/ui/core/ResizeHandler','sap/ui/core/ListItem','sap/ui/core/IconPool','./SegmentedButtonRenderer'],function(l,B,S,a,C,E,I,R,L,c,d){"use strict";var e;var f=C.extend("sap.m.SegmentedButton",{metadata:{interfaces:["sap.ui.core.IFormContent","sap.m.IOverflowToolbarContent"],library:"sap.m",designtime:"sap/m/designtime/SegmentedButton.designtime",publicMethods:["createButton"],properties:{width:{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:null},enabled:{type:"boolean",group:"Behavior",defaultValue:true},selectedKey:{type:"string",group:"Data",defaultValue:"",bindable:"bindable"}},defaultAggregation:"buttons",aggregations:{buttons:{type:"sap.m.Button",multiple:true,singularName:"button",deprecated:true},items:{type:"sap.m.SegmentedButtonItem",multiple:true,singularName:"item",bindable:"bindable"},_select:{type:"sap.m.Select",multiple:false,visibility:"hidden"}},associations:{selectedButton:{deprecated:true,type:"sap.m.Button",multiple:false},selectedItem:{type:"sap.m.SegmentedButtonItem",multiple:false},ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{select:{deprecated:true,parameters:{button:{type:"sap.m.Button"},id:{type:"string"},key:{type:"string"}}},selectionChange:{parameters:{item:{type:"sap.m.SegmentedButtonItem"}}}},dnd:{draggable:true,droppable:false}}});E.call(f.prototype);f.prototype.init=function(){this._aWidths=[];this._oItemNavigation=new I();this._oItemNavigation.setCycling(false);this._oItemNavigation.setDisabledModifiers({sapnext:["alt","meta"],sapprevious:["alt","meta"],saphome:["alt","meta"],sapend:["meta"]});this.addDelegate(this._oItemNavigation);this.removeButton=function(b){var r=f.prototype.removeButton.call(this,b);this.setSelectedButton(this.getButtons()[0]);this._fireChangeEvent();return r;};};f.prototype.onBeforeRendering=function(){var b=this._getVisibleButtons();this._bCustomButtonWidth=b.some(function(o){return o.getWidth();});if(this._sResizeListenerId){R.deregister(this._sResizeListenerId);this._sResizeListenerId=null;}this.setSelectedKey(this.getProperty("selectedKey"));if(!this.getSelectedButton()){this._selectDefaultButton();}};f.prototype.onAfterRendering=function(){var b=this._getVisibleButtons(),p;if(!this._sResizeListenerId){p=this.getDomRef().parentNode;if(p){this._sResizeListenerId=R.register(p,this._handleContainerResize.bind(this));}}this._setItemNavigation();this._aWidths=this._getRenderedButtonWidths(b);this._updateWidth();};f.prototype.onThemeChanged=function(){this._handleContainerResize();};f.prototype._handleContainerResize=function(){var b=this._getVisibleButtons();this._clearAutoWidthAppliedToControl();this._aWidths=this._getRenderedButtonWidths(b);this._updateWidth();};f.prototype._clearAutoWidthAppliedToControl=function(){var b=this._getVisibleButtons(),g=b.length,o,i=0;if(!this.getWidth()){this.$().css("width","");}while(i<g){o=b[i];if(!o.getWidth()){o.$().css("width","");}i++;}};f.prototype._getRenderedButtonWidths=function(b){return b.map(function(o){var g=o.getDomRef();return g&&g.getBoundingClientRect?g.getBoundingClientRect().width:o.$().outerWidth();});};f.prototype._getButtonWidth=function(b){var g=b.length,w,n=0,s=0,h=0,p,P,i=0;if(this._bCustomButtonWidth){while(i<g){w=b[i].getWidth();if(w){if(w.indexOf("%")!==-1){s+=parseInt(w.slice(0,-1));}else{h+=parseInt(w.slice(0,-2));}}else{n++;}i++;}if(n===0){return false;}p=(100-s)/n;P=(h/n);if(p<0){p=0;}if(P<0){P=0;}if(P>0){return"calc("+p+"% - "+P+"px)";}else{return p+"%";}}else{return(100/g)+"%";}};f.prototype._updateWidth=function(){if(this.$().length===0||this.hasStyleClass("sapMSegmentedButtonNoAutoWidth")){return;}var s=this.getWidth(),b=this._getVisibleButtons(),g=b.length,m=(this._aWidths.length>0)?Math.max.apply(Math,this._aWidths):0,h=(100/g),p=this.$().parent().innerWidth(),w=this._getButtonWidth(b),j,o,i;if(!s){if((m*g)>p){this.addStyleClass("sapMSegBFit");}else if(m>0){this.$().width((m*g)+1);this.removeStyleClass("sapMSegBFit");}i=0;while(i<g){o=b[i];o.$().css("width",o.getWidth()?o.getWidth():w);i++;}}else if(s&&!this._bCustomButtonWidth){i=0;while(i<g){b[i].$().css("width",h+"%");i++;}}j=Math.floor(this.getDomRef().getBoundingClientRect().width);if(this._previousWidth!==undefined&&j!==this._previousWidth&&!this._bInOverflow){this.fireEvent("_containerWidthChanged");}this._previousWidth=j;};f.prototype.exit=function(){if(this._sResizeListenerId){R.deregister(this._sResizeListenerId);this._sResizeListenerId=null;}if(this._oItemNavigation){this.removeDelegate(this._oItemNavigation);this._oItemNavigation.destroy();delete this._oItemNavigation;}this._bCustomButtonWidth=null;this._aWidths=null;};f.prototype._setItemNavigation=function(){var b,D=this.getDomRef();if(D){this._oItemNavigation.setRootDomRef(D);b=this.$().find(".sapMSegBBtn:not(.sapMSegBBtnDis)");this._oItemNavigation.setItemDomRefs(b);this._focusSelectedButton();}};f.prototype.getOverflowToolbarConfig=function(){return{canOverflow:true,listenForEvents:["select"],autoCloseEvents:["select"],propsUnrelatedToSize:["enabled","selectedKey"],invalidationEvents:["_containerWidthChanged"],onBeforeEnterOverflow:this._onBeforeEnterOverflow,onAfterExitOverflow:this._onAfterExitOverflow};};f.prototype._onBeforeEnterOverflow=function(o){o._toSelectMode();};f.prototype._onAfterExitOverflow=function(o){if(o._bForcedSelectMode){o._toSelectMode();}else{o._toNormalMode();}};f.prototype.getFormDoNotAdjustWidth=function(){return true;};f.prototype.createButton=function(t,u,b,T){var o=new B();if(t!==null){o.setText(t);}if(u!==null){o.setIcon(u);}if(b||b===undefined){o.setEnabled(true);}else{o.setEnabled(false);}if(T){o.setTextDirection(T);}this.addButton(o);return o;};(function(){f.prototype.addButton=function(b){if(b){p(b,this);this.addAggregation('buttons',b);this._syncSelect();this._fireChangeEvent();}return this;};f.prototype.insertButton=function(b,i){if(b){p(b,this);this.insertAggregation('buttons',b,i);this._syncSelect();this._fireChangeEvent();}return this;};function p(b,P){b.attachPress(function(g){P._buttonPressed(g);});b.attachEvent("_change",P._syncSelect,P);b.attachEvent("_change",P._fireChangeEvent,P);var o=B.prototype.setEnabled;b.setEnabled=function(g){b.$().toggleClass("sapMSegBBtnDis",!g).toggleClass("sapMFocusable",g);o.apply(b,arguments);};b.setVisible=function(v){B.prototype.setVisible.apply(this,arguments);P.invalidate();};}})();f.prototype.getSelectedKey=function(){var b=this.getButtons(),g=this.getItems(),s=this.getSelectedButton(),i=0;if(g.length>0){for(;i<b.length;i++){if(b[i]&&b[i].getId()===s){this.setProperty("selectedKey",g[i].getKey(),true);return g[i].getKey();}}}return"";};f.prototype.setSelectedKey=function(k){var b=this.getButtons(),g=this.getItems(),i=0;if(!k){this.setProperty("selectedKey",k,true);return this;}if(g.length>0&&b.length>0){for(;i<g.length;i++){if(g[i]&&g[i].getKey()===k){this.setSelectedItem(g[i]);break;}}}this.setProperty("selectedKey",k,true);return this;};f.prototype.removeButton=function(b){var r=this.removeAggregation("buttons",b);if(r){delete r.setEnabled;r.detachEvent("_change",this._syncSelect,this);r.detachEvent("_change",this._fireChangeEvent,this);this._syncSelect();}return r;};f.prototype.removeAllButtons=function(){var b=this.getButtons();if(b){for(var i=0;i<b.length;i++){var o=b[i];if(o){delete o.setEnabled;this.removeAggregation("buttons",o);o.detachEvent("_change",this._syncSelect,this);o.detachEvent("_change",this._fireChangeEvent,this);}}this._syncSelect();}return b;};f.prototype.addItem=function(i){this.addAggregation("items",i);this.addButton(i.oButton);return this;};f.prototype.removeItem=function(i){var r;if(i!==null&&i!==undefined){r=this.removeAggregation("items",i);this.removeButton(i.oButton);}if(i instanceof S&&this.getSelectedButton()===i.oButton.getId()){this.setSelectedKey("");this.setSelectedButton("");this.setSelectedItem("");}this.setSelectedItem(this.getItems()[0]);return r;};f.prototype.insertItem=function(i,b){this.insertAggregation("items",i,b);this.insertButton(i.oButton,b);return this;};f.prototype.removeAllItems=function(s){var r=this.removeAllAggregation("items",s);this.removeAllButtons();this.setSelectedKey("");this.setSelectedButton("");this.setSelectedItem("");return r;};f.prototype._buttonPressed=function(o){var b=o.getSource(),i;if(this.getSelectedButton()!==b.getId()){this.getButtons().forEach(function(g){g.$().removeClass("sapMSegBBtnSel");g.$().attr("aria-selected",false);});i=this.getItems().filter(function(g){return g.oButton===b;})[0];b.$().addClass("sapMSegBBtnSel");b.$().attr("aria-selected",true);this.setAssociation('selectedButton',b,true);this.setProperty("selectedKey",this.getSelectedKey(),true);this.setAssociation('selectedItem',i,true);this.fireSelectionChange({item:i});this.fireSelect({button:b,id:b.getId(),key:this.getSelectedKey()});}};f.prototype._selectDefaultButton=function(){var b=this._getVisibleButtons();if(b.length>0){this.setAssociation('selectedButton',b[0],true);if(this.getItems().length>0){this.setAssociation('selectedItem',this.getItems()[0],true);}}};f.prototype.setSelectedButton=function(b){var s=this.getSelectedButton(),g=this.getButtons();this.setAssociation("selectedButton",b);if(s!==this.getSelectedButton()){if(!this.getSelectedButton()&&g.length>1){this._selectDefaultButton();}this._focusSelectedButton();}this._syncSelect();return this;};f.prototype.setSelectedItem=function(i){var o=typeof i==="string"&&i!==""?sap.ui.getCore().byId(i):i,b=o instanceof S,v=b?o.oButton:i;this.setAssociation("selectedItem",i,true);this.setSelectedButton(v);return this;};f.prototype._focusSelectedButton=function(){var b=this.getButtons(),s=this.getSelectedButton(),i=0;for(;i<b.length;i++){if(b[i]&&b[i].getId()===s){this._oItemNavigation&&this._oItemNavigation.setFocusedIndex(i);break;}}};f.prototype.onsappagedown=function(o){this._oItemNavigation.onsapend(o);};f.prototype.onsappageup=function(o){this._oItemNavigation.onsaphome(o);};f.prototype.onsapspace=function(o){o.preventDefault();};f.prototype._fnSelectFormFactory=function(){return new a(this.getId()+"-select").attachChange(this._selectChangeHandler,this).addStyleClass("sapMSegBSelectWrapper");};f.prototype._selectChangeHandler=function(o){var s=o.getParameter("selectedItem"),n=parseInt(s.getKey()),b=this.getButtons()[n],g=b.getId();b.firePress();this.setSelectedButton(g);};f.prototype._fireChangeEvent=function(){this.fireEvent("_change");};f.prototype._syncSelect=function(){var k=0,s=0,b,g,o=this.getAggregation("_select");if(!o){return;}o.destroyItems();this._getVisibleButtons().forEach(function(h){b=h.getText();g=h.getIcon();o.addItem(new L({key:k.toString(),icon:g?g:"",text:b?b:h.getTooltip_AsString(),enabled:h.getEnabled()}));if(h.getId()===this.getSelectedButton()){s=k;}k++;},this);o.setSelectedKey(s.toString());};f.prototype.getAccessibilityInfo=function(){var r=sap.ui.getCore().getLibraryResourceBundle("sap.m"),s=this.getItems().find(function(i){return i.getId()===this.getSelectedItem();}.bind(this));return{role:"listbox",type:r.getText("SEGMENTEDBUTTON_NAME"),description:s.oButton.getAccessibilityInfo().description,focusable:this.getEnabled()};};f.prototype._toSelectMode=function(){this._bInOverflow=true;this.addStyleClass("sapMSegBSelectWrapper");if(!this.getAggregation("_select")){this.setAggregation("_select",this._fnSelectFormFactory(),true);}this._syncSelect();this._syncAriaAssociations();};f.prototype._toNormalMode=function(){delete this._bInOverflow;this.removeStyleClass("sapMSegBSelectWrapper");};f.prototype._syncAriaAssociations=function(){var s=this.getAggregation("_select");this.getAriaLabelledBy().forEach(function(o){if(s.getAriaLabelledBy().indexOf(o)===-1){s.addAriaLabelledBy(o);}});this.getAriaDescribedBy().forEach(function(D){if(s.getAriaLabelledBy().indexOf(D)===-1){s.addAriaLabelledBy(D);}});};f.prototype._overwriteImageOnload=function(i){var t=this;e=e||sap.ui.require("sap/m/Image");if(e&&i.onload===e.prototype.onload){i.onload=function(){if(e.prototype.onload){e.prototype.onload.apply(this,arguments);}setTimeout(function(){t._updateWidth();},20);};}};f.prototype._getIconAriaLabel=function(i){var o=c.getIconInfo(i.getSrc()),r="";if(o){r=o.text?o.text:o.name;}return r;};f.prototype._getVisibleButtons=function(){return this.getButtons().filter(function(b){return b.getVisible();});};f.prototype.clone=function(){var s=this.getSelectedButton(),g=this.removeAllAggregation("buttons"),o=C.prototype.clone.apply(this,arguments),h=g.map(function(b){return b.getId();}).indexOf(s),i;if(h>-1){o.setSelectedButton(o.getButtons()[h]);}for(i=0;i<g.length;i++){this.addAggregation("buttons",g[i]);}return o;};return f;});
