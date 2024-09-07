/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/Control","sap/ui/core/InvisibleText","sap/ui/core/EnabledPropagator","sap/ui/core/LabelEnablement","sap/ui/core/library","sap/ui/Device","./LinkRenderer","sap/ui/events/KeyCodes","sap/base/Log","sap/base/security/URLListValidator"],function(l,C,I,E,L,c,D,a,K,b,U){"use strict";var T=c.TextDirection;var d=c.TextAlign;var A=c.aria.HasPopup;var e=l.EmptyIndicatorMode;var f=C.extend("sap.m.Link",{metadata:{interfaces:["sap.ui.core.IShrinkable","sap.ui.core.IFormContent","sap.ui.core.ITitleContent"],library:"sap.m",designtime:"sap/m/designtime/Link.designtime",properties:{text:{type:"string",group:"Data",defaultValue:''},enabled:{type:"boolean",group:"Behavior",defaultValue:true},target:{type:"string",group:"Behavior",defaultValue:null},rel:{type:"string",group:"Behavior",defaultValue:null},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},href:{type:"sap.ui.core.URI",group:"Data",defaultValue:null},validateUrl:{type:"boolean",group:"Data",defaultValue:false},wrapping:{type:"boolean",group:"Appearance",defaultValue:false},textAlign:{type:"sap.ui.core.TextAlign",group:"Appearance",defaultValue:d.Initial},textDirection:{type:"sap.ui.core.TextDirection",group:"Appearance",defaultValue:T.Inherit},subtle:{type:"boolean",group:"Behavior",defaultValue:false},emphasized:{type:"boolean",group:"Behavior",defaultValue:false},ariaHasPopup:{type:"sap.ui.core.aria.HasPopup",group:"Accessibility",defaultValue:A.None},emptyIndicatorMode:{type:"sap.m.EmptyIndicatorMode",group:"Appearance",defaultValue:e.Off}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{press:{allowPreventDefault:true,parameters:{ctrlKey:{type:"boolean"},metaKey:{type:"boolean"}}}},dnd:{draggable:true,droppable:false}}});E.call(f.prototype);f.prototype.onBeforeRendering=function(){};f.prototype.onkeydown=function(o){if(o.which===K.SPACE||o.which===K.SHIFT||o.which===K.ESCAPE){if(o.which===K.SPACE){if(this.getEnabled()||this.getHref()){o.setMarked();o.preventDefault();this._bPressedSpace=true;}}if(this._bPressedSpace&&(o.which===K.ESCAPE||o.which===K.SHIFT)){this._bPressedEscapeOrShift=true;}}else{if(this._bPressedSpace){o.preventDefault();}}};f.prototype.onkeyup=function(o){if(o.which===K.SPACE){if(!this._bPressedEscapeOrShift){this._handlePress(o);if(this.getHref()&&!o.isDefaultPrevented()){o.preventDefault();o.setMarked();var g=document.createEvent('MouseEvents');g.initEvent('click',false,true);this.getDomRef().dispatchEvent(g);}}else{this._bPressedEscapeOrShift=false;}this._bPressedSpace=false;}};f.prototype._handlePress=function(o){if(this.getEnabled()){o.setMarked();if(!this.firePress({ctrlKey:!!o.ctrlKey,metaKey:!!o.metaKey})||!this.getHref()){o.preventDefault();}}else{o.preventDefault();}};f.prototype.onsapenter=f.prototype._handlePress;if(D.support.touch){f.prototype.ontap=f.prototype._handlePress;}else{f.prototype.onclick=f.prototype._handlePress;}f.prototype.ontouchstart=function(o){if(this.getEnabled()){o.setMarked();}};f.prototype.setSubtle=function(s){this.setProperty("subtle",s);if(s&&!f.prototype._sAriaLinkSubtleId){f.prototype._sAriaLinkSubtleId=I.getStaticId("sap.m","LINK_SUBTLE");}return this;};f.prototype.setEmphasized=function(g){this.setProperty("emphasized",g);if(g&&!f.prototype._sAriaLinkEmphasizedId){f.prototype._sAriaLinkEmphasizedId=I.getStaticId("sap.m","LINK_EMPHASIZED");}return this;};f.prototype._isHrefValid=function(u){return this.getValidateUrl()?U.validate(u):true;};f.prototype.getAccessibilityInfo=function(){var r=sap.ui.getCore().getLibraryResourceBundle("sap.m"),s=this.getEmphasized()?r.getText("LINK_EMPHASIZED"):"",S=this.getSubtle()?r.getText("LINK_SUBTLE"):"",t=this.getText(),g=t;if(t){s&&(g+=" "+s);S&&(g+=" "+S);}return{role:"link",type:t?r.getText("ACC_CTR_TYPE_LINK"):undefined,description:g,focusable:this.getEnabled(),enabled:this.getEnabled()};};f.prototype.getFormDoNotAdjustWidth=function(){return true;};f.prototype._getTabindex=function(){return(this.getText()&&this.getEnabled())?"0":"-1";};f.prototype._determineSelfReferencePresence=function(){var g=this.getAriaLabelledBy(),h=g.indexOf(this.getId())!==-1,H=L.getReferencingLabels(this).length>0,p=this.getParent(),i=!!(p&&p.enhanceAccessibilityState);return!h&&(g.length>0||H||i);};return f;});
