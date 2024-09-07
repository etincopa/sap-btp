/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library",'sap/ui/core/Core',"sap/ui/core/Item",'sap/ui/core/Icon','./NavigationList','sap/ui/core/InvisibleText','sap/ui/core/Renderer','sap/ui/core/IconPool',"sap/ui/events/KeyCodes","sap/ui/core/library","sap/ui/dom/jquery/Aria"],function(l,C,I,a,N,b,R,c,K,d){"use strict";var T=d.TextAlign;var e=d.TextDirection;var f=I.extend("sap.tnt.NavigationListItem",{metadata:{library:"sap.tnt",properties:{icon:{type:"sap.ui.core.URI",group:"Misc",defaultValue:''},expanded:{type:"boolean",group:"Misc",defaultValue:true},hasExpander:{type:"boolean",group:"Misc",defaultValue:true},visible:{type:"boolean",group:"Appearance",defaultValue:true}},defaultAggregation:"items",aggregations:{items:{type:"sap.tnt.NavigationListItem",multiple:true,singularName:"item"},_expandIconControl:{type:"sap.ui.core.Icon",multiple:false,visibility:"hidden"}},events:{select:{parameters:{item:{type:"sap.ui.core.Item"}}}},designtime:"sap/tnt/designtime/NavigationListItem.designtime"}});f.expandIcon='sap-icon://navigation-right-arrow';f.collapseIcon='sap-icon://navigation-down-arrow';f._getInvisibleText=function(){return this._invisibleText||(this._invisibleText=new b().toStatic());};f.prototype.init=function(){this._resourceBundle=C.getLibraryResourceBundle("sap.ui.core");this._resourceBundleMLib=C.getLibraryResourceBundle("sap.m");};f.prototype._getUniqueKey=function(){var k=this.getKey();if(k){return k;}return this.getId();};f.prototype._getExpandIconControl=function(){var g=this.getAggregation('_expandIconControl');if(!g){var h=this.getExpanded();g=new a({src:h?f.collapseIcon:f.expandIcon,visible:this.getItems().length>0&&this.getHasExpander(),useIconTooltip:false,tooltip:this._getExpandIconTooltip(!h)}).addStyleClass('sapTntNavLIExpandIcon');this.setAggregation("_expandIconControl",g,true);}return g;};f.prototype._getExpandIconTooltip=function(g){if(!this.getEnabled()){return'';}var t=g?'Icon.expand':'Icon.collapse';return this._resourceBundle.getText(t);};f.prototype.getLevel=function(){var g=0;var p=this.getParent();if(p.getMetadata().getName()=='sap.tnt.NavigationListItem'){return p.getLevel()+1;}return g;};f.prototype.getNavigationList=function(){var p=this.getParent();while(p&&p.getMetadata().getName()!='sap.tnt.NavigationList'){p=p.getParent();}return p;};f.prototype.createPopupList=function(){var n=[],g=this.getNavigationList(),s=g.getSelectedItem(),p,h,j,k=this.getItems();for(var i=0;i<k.length;i++){h=k[i];if(h.getVisible()){j=new f({key:h.getId(),text:h.getText(),textDirection:h.getTextDirection(),enabled:h.getEnabled()});n.push(j);if(s==h){p=j;}}}var m=new f({expanded:true,hasExpander:false,key:this.getId(),text:this.getText(),enabled:this.getEnabled(),textDirection:this.getTextDirection(),items:n});var o=new N({itemSelect:this.onPopupItemSelect.bind(this),items:[m]}).addStyleClass('sapTntNavLIPopup');if(s==this){p=m;o.isGroupSelected=true;}o.setSelectedItem(p);return o;};f.prototype.onPopupItemSelect=function(g){var i=g.getParameter('item');i=sap.ui.getCore().byId(i.getKey());i._selectItem(g);};f.prototype._selectItem=function(g){var p={item:this};this.fireSelect(p);var n=this.getNavigationList();n._selectItem(p);};f.prototype.onkeydown=function(g){if(g.isMarked('subItem')){return;}g.setMarked('subItem');if(this.getLevel()>0){return;}var i=sap.ui.getCore().getConfiguration().getRTL();if((g.shiftKey&&g.which==189)||g.which==K.NUMPAD_MINUS||(g.which==K.ARROW_RIGHT&&i)||(g.which==K.ARROW_LEFT&&!i)){if(this.collapse()){g.preventDefault();g.stopPropagation();}}else if(g.which==K.NUMPAD_PLUS||(g.shiftKey&&g.which==K.PLUS)||g.which==K.ARROW_LEFT&&i||g.which==K.ARROW_RIGHT&&!i){if(this.expand()){g.preventDefault();g.stopPropagation();}}};f.prototype.expand=function(g){if(this.getExpanded()||!this.getHasExpander()||this.getItems().length==0||this.getLevel()>0){return;}this.setProperty('expanded',true,true);this.$().find('.sapTntNavLIGroup').attr('aria-expanded',true).addClass('sapTntNavLIGroupExpandedItems');var h=this._getExpandIconControl();h.setSrc(f.collapseIcon);h.setTooltip(this._getExpandIconTooltip(false));var $=this.$().find('.sapTntNavLIGroupItems');$.stop(true,true).slideDown(g||'fast',function(){$.toggleClass('sapTntNavLIHiddenGroupItems');});this.getNavigationList()._updateNavItems();return true;};f.prototype.collapse=function(g){if(!this.getExpanded()||!this.getHasExpander()||this.getItems().length==0||this.getLevel()>0){return;}this.setProperty('expanded',false,true);this.$().find('.sapTntNavLIGroup').attr('aria-expanded',false).removeClass('sapTntNavLIGroupExpandedItems');var h=this._getExpandIconControl();h.setSrc(f.expandIcon);h.setTooltip(this._getExpandIconTooltip(true));var $=this.$().find('.sapTntNavLIGroupItems');$.stop(true,true).slideUp(g||'fast',function(){$.toggleClass('sapTntNavLIHiddenGroupItems');});this.getNavigationList()._updateNavItems();return true;};f.prototype.ontap=function(g){if(g.isMarked('subItem')||!this.getEnabled()){return;}g.setMarked('subItem');g.preventDefault();var n=this.getNavigationList();var s=sap.ui.getCore().byId(g.target.id);var h=this.getLevel();if(h==1){var p=this.getParent();if(this.getEnabled()&&p.getEnabled()){this._selectItem(g);}return;}if(n.getExpanded()||this.getItems().length==0){if(!s||s.getMetadata().getName()!='sap.ui.core.Icon'||!s.$().hasClass('sapTntNavLIExpandIcon')){this._selectItem(g);return;}if(this.getExpanded()){this.collapse();}else{this.expand();}}else{var i=this.createPopupList();n._openPopover(this,i);}};f.prototype.onsapenter=f.prototype.ontap;f.prototype.onsapspace=f.prototype.ontap;f.prototype.render=function(r,g){if(!this.getVisible()){return;}if(this.getLevel()===0){this.renderFirstLevelNavItem(r,g);}else{this.renderSecondLevelNavItem(r,g);}};f.prototype.renderGroupItem=function(r,g){var i=g.getExpanded(),h=this.getExpanded(),t=this.getText(),j,k={level:'1'};if(i&&this.getItems().length!==0){k.expanded=h;}r.openStart("div");r.class("sapTntNavLIItem");r.class("sapTntNavLIGroup");if(!this.getEnabled()){r.class("sapTntNavLIItemDisabled");}else{r.attr("tabindex","-1");}if(!i||g.hasStyleClass("sapTntNavLIPopup")){j=this.getTooltip_AsString()||t;if(j){r.attr("title",j);}k.role='menuitem';if(!g.hasStyleClass("sapTntNavLIPopup")){k.haspopup=true;}}else{k.role='treeitem';}r.accessibilityState(k);if(g.getExpanded()){j=this.getTooltip_AsString()||t;if(j){r.attr("title",j);}}r.openEnd();this._renderIcon(r);if(g.getExpanded()){var m=this._getExpandIconControl();m.setVisible(this.getItems().length>0&&this.getHasExpander());m.setSrc(this.getExpanded()?f.collapseIcon:f.expandIcon);m.setTooltip(this._getExpandIconTooltip(!this.getExpanded()));this._renderText(r);r.renderControl(m);}r.close("div");};f.prototype.renderFirstLevelNavItem=function(r,g){var h,j=this._getVisibleItems(this),k=j.length,m=this.getExpanded(),n=g.getExpanded();r.openStart("li",this);if(this.getEnabled()&&!n){if(k){r.class("sapTnTNavLINotExpandedTriangle");}r.attr('tabindex','-1');}r.openEnd();this.renderGroupItem(r,g);if(n){r.openStart('ul');r.attr('aria-hidden','true');r.attr('role','group');r.class("sapTntNavLIGroupItems");if(!m){r.class("sapTntNavLIHiddenGroupItems");}r.openEnd();for(var i=0;i<k;i++){h=j[i];h.render(r,g,i,k);}r.close("ul");}r.close("li");};f.prototype.renderSecondLevelNavItem=function(r,g){var h=this.getParent();r.openStart('li',this);r.class("sapTntNavLIItem");r.class("sapTntNavLIGroupItem");if(!this.getEnabled()||!h.getEnabled()){r.class("sapTntNavLIItemDisabled");}else{r.attr('tabindex','-1');}var t=this.getText();var i=this.getTooltip_AsString()||t;if(i){r.attr("title",i);}r.accessibilityState({role:g.hasStyleClass("sapTntNavLIPopup")?'menuitem':'treeitem',level:'2'});r.openEnd();this._renderText(r);r.close('li');};f.prototype._renderIcon=function(r){var i=this.getIcon(),g=c.getIconInfo(i);if(i){r.openStart('span');r.class("sapUiIcon");r.class("sapTntNavLIGroupIcon");r.attr("aria-hidden",true);if(g&&!g.suppressMirroring){r.class("sapUiIconMirrorInRTL");}if(g){r.attr("data-sap-ui-icon-content",g.content);r.style("font-family","'"+g.fontFamily+"'");}r.openEnd();r.close('span');}else{r.openStart('span');r.class('sapUiIcon');r.class('sapTntNavLIGroupIcon');r.attr('aria-hidden',true);r.openEnd();r.close('span');}};f.prototype._renderText=function(r){r.openStart('span');r.class("sapMText");r.class("sapTntNavLIText");r.class("sapMTextNoWrap");var t=this.getTextDirection();if(t!==e.Inherit){r.attr("dir",t.toLowerCase());}var g=R.getTextAlign(T.Begin,t);if(g){r.style("text-align",g);}r.openEnd();r.text(this.getText());r.close('span');};f.prototype._unselect=function(){var $=this.$(),n=this.getNavigationList();if(!n){return;}$.removeClass('sapTntNavLIItemSelected');if(n.getExpanded()){if(this.getLevel()===0){$=$.find('.sapTntNavLIGroup');}$.removeAttr('aria-selected');}else{$.removeAttr('aria-pressed');if(this.getParent().isA("sap.tnt.NavigationListItem")){this.getParent().$().removeClass('sapTntNavLIItemSelected');}}};f.prototype._select=function(){var $=this.$(),n=this.getNavigationList();if(!n){return;}$.addClass('sapTntNavLIItemSelected');if(n.getExpanded()){if(this.getLevel()===0){$=$.find('.sapTntNavLIGroup');}$.attr('aria-selected',true);}else{$.attr('aria-pressed',true);if(this.getParent().isA("sap.tnt.NavigationListItem")){this.getParent().$().addClass('sapTntNavLIItemSelected');}n._closePopover();}};f.prototype._getDomRefs=function(){var g=[];if(!this.getEnabled()){return g;}var $=this.$();g.push($.find('.sapTntNavLIGroup')[0]);if(this.getExpanded()){var s=$.find('.sapTntNavLIGroupItem');for(var i=0;i<s.length;i++){g.push(s[i]);}}return g;};f.prototype._getVisibleItems=function(g){var v=[];var i=g.getItems();var h;for(var j=0;j<i.length;j++){h=i[j];if(h.getVisible()){v.push(h);}}return v;};f.prototype.onfocusin=function(g){if(g.srcControl!==this){return;}this._updateAccessibilityText();};f.prototype._updateAccessibilityText=function(){var i=f._getInvisibleText(),n=this.getNavigationList(),g=this._resourceBundleMLib,h=n.getExpanded()?g.getText("ACC_CTR_TYPE_TREEITEM"):'',$=this._getAccessibilityItem(),p=this._getAccessibilityPosition(),j=g.getText("LIST_ITEM_POSITION",[p.index,p.size]),s=n._selectedItem===this?g.getText("LIST_ITEM_SELECTED"):'',k=n.getExpanded()?this.getText():"",t=h+" "+j+" "+s+" "+k;i.setText(t);$.addAriaLabelledBy(i.getId());};f.prototype._getAccessibilityPosition=function(){var p=this.getParent(),v=this._getVisibleItems(p),s=v.length,i=v.indexOf(this)+1;return{index:i,size:s};};f.prototype._getAccessibilityItem=function(){var $=this.$();if(this.getLevel()===0){$=$.find('.sapTntNavLIGroup');}return $;};return f;});
