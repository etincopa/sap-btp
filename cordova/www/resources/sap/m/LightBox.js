/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./library','sap/ui/core/Control','sap/ui/core/Popup','sap/m/Text','sap/m/Button','sap/ui/core/ResizeHandler','sap/ui/Device','sap/ui/core/Icon','sap/ui/layout/VerticalLayout','./InstanceManager','sap/ui/core/InvisibleText','sap/ui/core/library','./LightBoxRenderer','sap/m/BusyIndicator',"sap/ui/thirdparty/jquery",'sap/ui/core/Core'],function(l,C,P,T,B,R,D,I,V,a,b,c,L,d,q,e){'use strict';var O=c.OpenState;var f=c.TextAlign;var g=l.ButtonType;var h=l.LightBoxLoadingStates;var i=C.extend('sap.m.LightBox',{metadata:{interfaces:['sap.ui.core.PopupInterface'],library:'sap.m',aggregations:{imageContent:{type:'sap.m.LightBoxItem',multiple:true,bindable:"bindable"},_closeButton:{type:'sap.m.Button',multiple:false,visibility:'hidden'},_errorIcon:{type:'sap.ui.core.Icon',multiple:false,visibility:'hidden'},_errorTitle:{type:'sap.m.Text',multiple:false,visibility:'hidden'},_errorSubtitle:{type:'sap.m.Text',multiple:false,visibility:'hidden'},_verticalLayout:{type:'sap.ui.layout.VerticalLayout',multiple:false,visibility:'hidden'},_invisiblePopupText:{type:"sap.ui.core.InvisibleText",multiple:false,visibility:"hidden"},_busy:{type:"sap.m.BusyIndicator",multiple:false,visibility:"hidden"}},events:{},defaultAggregation:'imageContent',designtime:"sap/m/designtime/LightBox.designtime"}});i.prototype.init=function(){this._createPopup();this._width=0;this._height=0;this._isRendering=true;this._resizeListenerId=null;this._$lightBox=null;this._rb=sap.ui.getCore().getLibraryResourceBundle("sap.m");this._closeButtonText=this._rb.getText("LIGHTBOX_CLOSE_BUTTON");if(sap.ui.getCore().getConfiguration().getAccessibility()){this.setAggregation("_invisiblePopupText",new b());}};i.prototype.onBeforeRendering=function(){var o=this._getImageContent(),n=o._getNativeImage(),s=o.getImageSrc(),S=o._getImageState(),k=this.getAggregation('_invisiblePopupText'),m=this._rb.getText("LIGHTBOX_ARIA_ENLARGED",[o.getTitle(),o.getSubtitle()]),p=this._rb.getText('LIGHTBOX_IMAGE_ERROR'),r=this._rb.getText('LIGHTBOX_IMAGE_ERROR_DETAILS');this._createErrorControls();if(n.getAttribute('src')!==s){n.src=s;}if(this._resizeListenerId){D.resize.detachHandler(this._onResizeHandler);R.deregister(this._resizeListenerId);this._resizeListenerId=null;}switch(S){case h.Loading:this._timeoutId=setTimeout(function(){o._setImageState(h.TimeOutError);},10000);break;case h.Loaded:clearTimeout(this._timeoutId);this._calculateSizes(n);break;case h.Error:clearTimeout(this._timeoutId);m+=" "+p+" "+r;break;default:break;}if(o&&k){k.setText(m);}this._isRendering=true;};i.prototype.onAfterRendering=function(){this._isRendering=false;this._$lightBox=this.$();if(!this._resizeListenerId){this._onResizeHandler=this._onResize.bind(this);D.resize.attachHandler(this._onResizeHandler);this._resizeListenerId=R.register(this,this._onResizeHandler);}};i.prototype.forceInvalidate=C.prototype.invalidate;i.prototype.invalidate=function(o){var k=this._getImageContent();if(this.isOpen()){if(k&&k.getImageSrc()){this.forceInvalidate(o);}else{this.close();}}return this;};i.prototype.exit=function(){if(this._oPopup){this._oPopup.detachOpened(this._fnOpened,this);this._oPopup.detachClosed(this._fnClosed,this);this._oPopup.destroy();this._oPopup=null;}if(this._resizeListenerId){D.resize.detachHandler(this._onResizeHandler);R.deregister(this._resizeListenerId);this._resizeListenerId=null;}a.removeLightBoxInstance(this);};i.prototype.open=function(){var k=this._getImageContent();this._oPopup.setContent(this);if(k&&k.getImageSrc()){this._oPopup.open(300,'center center','center center',document.body,null);a.addLightBoxInstance(this);}return this;};i.prototype.isOpen=function(){if(this._oPopup&&this._oPopup.isOpen()){return true;}return false;};i.prototype.close=function(){if(this._resizeListenerId){D.resize.detachHandler(this._onResizeHandler);R.deregister(this._resizeListenerId);this._resizeListenerId=null;}this._oPopup.close();a.removeLightBoxInstance(this);return this;};i.prototype._getCloseButton=function(){var k=this.getAggregation('_closeButton');if(!k){k=new B({id:this.getId()+'-closeButton',text:this._closeButtonText,type:g.Transparent,press:function(){this.close();}.bind(this)});this.setAggregation('_closeButton',k,true);}return k;};i.prototype._getBusyIndicator=function(){var k=this.getAggregation("_busy");if(!k){k=new d();this.setAggregation("_busy",k,true);}return k;};i.prototype._imageStateChanged=function(n){var s=n===h.Loaded||n===h.Error;if(s&&!this._isRendering){this.rerender();}};i.prototype._createPopup=function(){this._oPopup=new P(this,true,true);this._oPopup.attachOpened(this._fnOpened,this);this._oPopup.attachClosed(this._fnClosed,this);};i.prototype._fnOpened=function(){var t=this;t._onResize();q('#sap-ui-blocklayer-popup').on("click",function(){t.close();});};i.prototype._fnClosed=function(){q('#sap-ui-blocklayer-popup').off("click");};i.prototype._createErrorControls=function(){var r=this._rb;var k;var m;if(this._getImageContent()._getImageState()===h.TimeOutError){k=r.getText('LIGHTBOX_IMAGE_TIMED_OUT');m=r.getText('LIGHTBOX_IMAGE_TIMED_OUT_DETAILS');}else{k=r.getText('LIGHTBOX_IMAGE_ERROR');m=r.getText('LIGHTBOX_IMAGE_ERROR_DETAILS');}if(!this.getAggregation('_verticalLayout')){var n=new T({text:k,textAlign:f.Center}).addStyleClass("sapMLightBoxErrorTitle"),o=new T({text:m,textAlign:f.Center}).addStyleClass("sapMLightBoxErrorSubtitle"),p=new I({src:"sap-icon://picture"}).addStyleClass("sapMLightBoxErrorIcon");this.setAggregation('_verticalLayout',new V({content:[p,n,o]}).addStyleClass('sapMLightBoxVerticalLayout'));}};i.prototype._onResize=function(){var m=j()/2+'px',t=m,k=m,n='',o='',p=this._getImageContent(),r=this.getDomRef(),s,u,v=j(),w=2;if(p._getImageState()===h.Loaded){this._calculateSizes(p._getNativeImage());s=this._width;u=this._height;this._$lightBox.width(s);this._$lightBox.height(u);}else{s=r.clientWidth;u=r.clientHeight;}if(window.innerWidth>s+v){k='50%';o=Math.round(-s/2);}if(window.innerHeight>u+v){t='50%';n=Math.round(-u/2);}if(sap.ui.getCore().getConfiguration().getTheme()==='sap_hcb'){n-=w;o-=w;}this._$lightBox.css({'top':t,'margin-top':n,'left':k,'margin-left':o});};i.prototype._calculateSizes=function(k){var F=this._calculateFooterHeightInPx(),m=288-F,n=this._getImageContent().getAggregation("_image"),o;this._setImageSize(n,k.naturalWidth,k.naturalHeight);this._calculateAndSetLightBoxSize(n);o=this._pxToNumber(n.getHeight());this.toggleStyleClass('sapMLightBoxMinSize',(o<m));this._isBusy=false;};i.prototype._calculateFooterHeightInPx=function(){var k=this.$().parents().hasClass('sapUiSizeCompact');var s=this._getImageContent().getSubtitle();var m=2.5;if(!k){m+=0.5;}if(s){m+=1.5;}return m*16;};i.prototype._calculateAndSetLightBoxSize=function(k){var m,n,o=(20*16),p=(18*16),F=this._calculateFooterHeightInPx();m=this._pxToNumber(k.getHeight());n=this._pxToNumber(k.getWidth());this._width=Math.max(o,n);this._height=Math.max(p,m+F);this._isLightBoxBiggerThanMinDimensions=(n>=o)&&(m>=(p-F));};i.prototype._setImageSize=function(k,m,n){var o=this._calculateFooterHeightInPx(),p=this._getDimensions(m,n,o),w=p.width+'px',r=p.height+'px',s=k.getDomRef();k.setProperty('width',w,true);k.setProperty('height',r,true);if(s){s.style.width=w;s.style.height=r;}};i.prototype._getDimensions=function(k,m,n){var o=20*16,p=18*16,$=q(window),w=$.height(),r=$.width(),s=j(),t=Math.max(r-s,o),u=Math.max(w-s,p),v;u-=n;if(m<=u){if(k<=t){}else{m*=t/k;k=t;}}else{if(k<=t){k*=u/m;m=u;}else{v=Math.max(k/t,m/u);k/=v;m/=v;}}return{width:Math.round(k),height:Math.round(m)};};i.prototype._pxToNumber=function(s){return(s.substring(0,(s.length-2)))*1;};i.prototype._getImageContent=function(){var r=this.getAggregation('imageContent');return r&&r[0];};function j(){var s=D.system;if(s.desktop){return 4*16;}if(s.tablet){return 2*16;}return 0;}i.prototype.onsapescape=function(E){var k=this._oPopup.getOpenState();if(k!==O.CLOSED&&k!==O.CLOSING){this.close();E.stopPropagation();}};return i;});
