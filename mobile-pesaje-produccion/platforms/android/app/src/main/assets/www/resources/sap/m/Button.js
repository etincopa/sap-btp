/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/Control","sap/ui/core/ShortcutHintsMixin","sap/ui/core/EnabledPropagator","sap/ui/core/IconPool","sap/ui/Device","sap/ui/core/ContextMenuSupport","sap/ui/core/library","./ButtonRenderer","sap/ui/events/KeyCodes","sap/ui/core/LabelEnablement","sap/m/BadgeEnabler","sap/ui/core/InvisibleText","sap/base/Log"],function(l,C,S,E,I,D,a,c,B,K,L,b,d,e){"use strict";var T=c.TextDirection;var f=l.ButtonType;var g=l.ButtonAccessibilityType;var h=l.BadgeState;var A=c.aria.HasPopup;var i=1,j=9999;var k=C.extend("sap.m.Button",{metadata:{interfaces:["sap.ui.core.IFormContent"],library:"sap.m",properties:{text:{type:"string",group:"Misc",defaultValue:""},type:{type:"sap.m.ButtonType",group:"Appearance",defaultValue:f.Default},width:{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:null},enabled:{type:"boolean",group:"Behavior",defaultValue:true},icon:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:""},iconFirst:{type:"boolean",group:"Appearance",defaultValue:true},activeIcon:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},iconDensityAware:{type:"boolean",group:"Misc",defaultValue:true},textDirection:{type:"sap.ui.core.TextDirection",group:"Appearance",defaultValue:T.Inherit},ariaHasPopup:{type:"sap.ui.core.aria.HasPopup",group:"Accessibility",defaultValue:A.None}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{tap:{deprecated:true},press:{}},designtime:"sap/m/designtime/Button.designtime",dnd:{draggable:true,droppable:false}}});E.call(k.prototype);a.apply(k.prototype);b.call(k.prototype);k.prototype.init=function(){this._onmouseenter=this._onmouseenter.bind(this);this._buttonPressed=false;S.addConfig(this,{event:"press",position:"0 0",addAccessibilityLabel:true},this);this.initBadgeEnablement({position:"topRight",selector:{suffix:"inner"}});this._oBadgeData={value:"",state:""};this._badgeMinValue=i;this._badgeMaxValue=j;};k.prototype.badgeValueFormatter=function(v){var V=parseInt(v),o=this.getBadgeCustomData(),m=o.getVisible();if(isNaN(V)){return false;}if(V<this._badgeMinValue){m&&o.setVisible(false);}else{!m&&o.setVisible(true);if(V>this._badgeMaxValue&&v.indexOf("+")===-1){v=this._badgeMaxValue<1000?this._badgeMaxValue+"+":"999+";}}return v;};k.prototype.setBadgeMinValue=function(m){var v=this.getBadgeCustomData().getValue();if(m&&!isNaN(m)&&m>=i&&m!=this._badgeMinValue&&m<=this._badgeMaxValue){this._badgeMinValue=m;this.badgeValueFormatter(v);this.invalidate();}else{e.warning("minValue is not valid (it is is less than minimum allowed badge value ["+i+"] or greater than maximum badge value ["+this._badgeMaxValue+"])",this);}return this;};k.prototype.setBadgeMaxValue=function(m){if(m&&!isNaN(m)&&m<=j&&m!=this._badgeMaxValue&&m>=this._badgeMinValue){this._badgeMaxValue=m;this.invalidate();}else{e.warning("maxValue is not valid (it is is greater than than maximum allowed badge value ["+j+"] or less than minimum badge value ["+this._badgeMinValue+"])",this);}return this;};k.prototype.onBadgeUpdate=function(v,s){if(this._oBadgeData.value!==v||this._oBadgeData.state!==s){if(s===h.Disappear){v="";}this._updateBadgeInvisibleText(v);this._oBadgeData={value:v,state:s};}};k.prototype._updateBadgeInvisibleText=function(v){var r=sap.ui.getCore().getLibraryResourceBundle("sap.m"),s,p;v=v.toString().trim();p=v.indexOf("+");if(p!==-1){s=r.getText("BUTTON_BADGE_MORE_THAN_ITEMS",v.substr(0,p));}else{switch(v){case"":s="";break;case"1":s=r.getText("BUTTON_BADGE_ONE_ITEM",v);break;default:s=r.getText("BUTTON_BADGE_MANY_ITEMS",v);}}this._getBadgeInvisibleText().setText(s);};k.prototype._getBadgeInvisibleText=function(){if(!this._oBadgeInvisibleText){this._oBadgeInvisibleText=new d(this.getId()+"-badge").toStatic();}return this._oBadgeInvisibleText;};k.prototype.exit=function(){if(this._image){this._image.destroy();}if(this._iconBtn){this._iconBtn.destroy();}if(this._oBadgeInvisibleText){this._oBadgeInvisibleText.destroy();this._oBadgeData=null;}this._bFocused=null;this.$().off("mouseenter",this._onmouseenter);};k.prototype.setType=function(s){this.setProperty("type",s,false);switch(s){case f.Critical:this._sTypeIconURI="sap-icon://alert";break;case f.Negative:this._sTypeIconURI="sap-icon://error";break;case f.Success:this._sTypeIconURI="sap-icon://sys-enter-2";break;case f.Neutral:this._sTypeIconURI="sap-icon://information";break;case f.Back:case f.Up:this._sTypeIconURI="sap-icon://nav-back";break;default:this._sTypeIconURI=null;}return this;};k.prototype.onBeforeRendering=function(){this._bRenderActive=this._bActive;this.$().off("mouseenter",this._onmouseenter);};k.prototype.onAfterRendering=function(){if(this._bRenderActive){this._activeButton();this._bRenderActive=this._bActive;}if(this._bFocused){this._toggleLiveChangeAnnouncement("polite");}this.$().on("mouseenter",this._onmouseenter);};k.prototype.ontouchstart=function(o){o.setMarked();if(this._bRenderActive){delete this._bRenderActive;}if(o.targetTouches.length===1){this._buttonPressed=true;this._activeButton();}if(this.getEnabled()&&this.getVisible()){if((D.browser.safari||D.browser.firefox)&&(o.originalEvent&&o.originalEvent.type==="mousedown")){this._setButtonFocus();}this._sTouchStartTargetId=o.target.id.replace(this.getId(),'');}else{this._sTouchStartTargetId='';}};k.prototype.ontouchend=function(o){var s;this._buttonPressed=o.originalEvent&&o.originalEvent.buttons&1;this._inactiveButton();if(this._bRenderActive){delete this._bRenderActive;this.ontap(o,true);}s=o.target.id.replace(this.getId(),'');if(this._buttonPressed===0&&((this._sTouchStartTargetId==="-BDI-content"&&(s==='-content'||s==='-inner'||s==='-img'))||(this._sTouchStartTargetId==="-content"&&(s==='-inner'||s==='-img'))||(this._sTouchStartTargetId==='-img'&&s!=='-img'))){this.ontap(o,true);}this._sTouchStartTargetId='';};k.prototype.ontouchcancel=function(){this._buttonPressed=false;this._sTouchStartTargetId='';this._inactiveButton();};k.prototype.ontap=function(o,F){o.setMarked();delete this._bRenderActive;if(this.bFromTouchEnd){return;}if(this.getEnabled()&&this.getVisible()){if((o.originalEvent&&o.originalEvent.type==="touchend")){this.focus();}this.fireTap({});this.firePress({});}this.bFromTouchEnd=F;if(this.bFromTouchEnd){setTimeout(function(){delete this.bFromTouchEnd;}.bind(this),0);}};k.prototype.onkeydown=function(o){if(o.which===K.SPACE||o.which===K.ENTER||o.which===K.ESCAPE||o.which===K.SHIFT){if(o.which===K.SPACE||o.which===K.ENTER){o.setMarked();this._activeButton();}if(o.which===K.ENTER){this.firePress({});}if(o.which===K.SPACE){this._bPressedSpace=true;}if(this._bPressedSpace){if(o.which===K.SHIFT||o.which===K.ESCAPE){this._bPressedEscapeOrShift=true;this._inactiveButton();}}}else{if(this._bPressedSpace){o.preventDefault();}}};k.prototype.onkeyup=function(o){if(o.which===K.ENTER){o.setMarked();this._inactiveButton();}if(o.which===K.SPACE){if(!this._bPressedEscapeOrShift){o.setMarked();this._inactiveButton();this.firePress({});}else{this._bPressedEscapeOrShift=false;}this._bPressedSpace=false;}if(o.which===K.ESCAPE){this._bPressedSpace=false;}};k.prototype._onmouseenter=function(o){if(this._buttonPressed&&o.originalEvent&&o.originalEvent.buttons&1){this._activeButton();}};k.prototype.onfocusin=function(){this._bFocused=true;this._toggleLiveChangeAnnouncement("polite");};k.prototype.onfocusout=function(){this._buttonPressed=false;this._bFocused=false;this._sTouchStartTargetId='';this._inactiveButton();this._toggleLiveChangeAnnouncement("off");};k.prototype._toggleLiveChangeAnnouncement=function(v){if(this._getText()){this.$("BDI-content").attr("aria-live",v);}else if(this._getAppliedIcon()){this.$("tooltip").attr("aria-live",v);}};k.prototype._activeButton=function(){if(!this._isUnstyled()){this.$("inner").addClass("sapMBtnActive");}this._bActive=this.getEnabled();if(this._bActive){if(this._getAppliedIcon()&&this.getActiveIcon()&&this._image){this._image.setSrc(this.getActiveIcon());}}};k.prototype._inactiveButton=function(){if(!this._isUnstyled()){this.$("inner").removeClass("sapMBtnActive");}this._bActive=false;if(this.getEnabled()){if(this._getAppliedIcon()&&this.getActiveIcon()&&this._image){this._image.setSrc(this._getAppliedIcon());}}};k.prototype._isHoverable=function(){return this.getEnabled()&&D.system.desktop;};k.prototype._getImage=function(s,m,n,o){var p=I.isIconURI(m),q;if(this._image instanceof sap.m.Image&&p||this._image instanceof sap.ui.core.Icon&&!p){this._image.destroy();this._image=undefined;}q=this.getIconFirst();if(this._image){this._image.setSrc(m);if(this._image instanceof sap.m.Image){this._image.setActiveSrc(n);this._image.setDensityAware(o);}}else{this._image=I.createControlByURI({id:s,src:m,activeSrc:n,densityAware:o,useIconTooltip:false},sap.m.Image).addStyleClass("sapMBtnCustomIcon").setParent(this,null,true);}this._image.addStyleClass("sapMBtnIcon");this._image.toggleStyleClass("sapMBtnIconLeft",q);this._image.toggleStyleClass("sapMBtnIconRight",!q);return this._image;};k.prototype._getInternalIconBtn=function(s,m){var o=this._iconBtn;if(o){o.setSrc(m);}else{o=I.createControlByURI({id:s,src:m,useIconTooltip:false},sap.m.Image).setParent(this,null,true);}o.addStyleClass("sapMBtnIcon");o.addStyleClass("sapMBtnIconLeft");this._iconBtn=o;return this._iconBtn;};k.prototype._isUnstyled=function(){var u=false;if(this.getType()===f.Unstyled){u=true;}return u;};k.prototype.getPopupAnchorDomRef=function(){return this.getDomRef("inner");};k.prototype._getText=function(){return this.getText();};k.prototype._getTooltip=function(){var t,o;t=this.getTooltip_AsString();if(!t&&!this._getText()){o=I.getIconInfo(this._getAppliedIcon());if(o){t=o.text?o.text:o.name;}}return t;};k.prototype._getAppliedIcon=function(){return this.getIcon()||this._sTypeIconURI;};k.prototype.getAccessibilityInfo=function(){var s=this._getText()||this.getTooltip_AsString();if(!s&&this._getAppliedIcon()){var o=I.getIconInfo(this._getAppliedIcon());if(o){s=o.text||o.name;}}return{role:"button",type:sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_BUTTON"),description:s,focusable:this.getEnabled(),enabled:this.getEnabled()};};k.prototype._setButtonFocus=function(){setTimeout(function(){this.focus();}.bind(this),0);};k.prototype._determineSelfReferencePresence=function(){var m=this.getAriaLabelledBy(),n=m.indexOf(this.getId())!==-1,H=L.getReferencingLabels(this).length>0,p=this.getParent(),o=!!(p&&p.enhanceAccessibilityState);return!n&&this._getText()&&(m.length>0||H||o);};k.prototype._determineAccessibilityType=function(){var H=this.getAriaLabelledBy().length>0,m=this.getAriaDescribedBy().length>0,n=L.getReferencingLabels(this).length>0,o=this.getType()!==f.Default,p=H||n,q=m||o||(this._oBadgeData&&this._oBadgeData.value!==""&&this._oBadgeData.State!==h.Disappear),s;if(!p&&!q){s=g.Default;}else if(p&&!q){s=g.Labelled;}else if(!p&&q){s=g.Described;}else if(p&&q){s=g.Combined;}return s;};k.prototype._getTitleAttribute=function(s){return this.getTooltip();};return k;});
