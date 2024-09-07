/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/Control","sap/ui/Device","sap/m/PDFViewerRenderManager","sap/m/MessageBox","sap/m/PDFViewerRenderer","sap/base/Log","sap/base/assert","sap/ui/thirdparty/jquery"],function(l,C,D,P,M,a,L,b,q){"use strict";var c=l.PDFViewerDisplayType;var d=C.extend("sap.m.PDFViewer",{metadata:{library:"sap.m",properties:{height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"100%"},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"100%"},source:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},errorMessage:{type:"string",group:"Misc",defaultValue:null,deprecated:true},errorPlaceholderMessage:{type:"string",group:"Misc",defaultValue:null},popupHeaderTitle:{type:"string",group:"Misc",defaultValue:null,deprecated:true},title:{type:"string",group:"Misc",defaultValue:null},showDownloadButton:{type:"boolean",group:"Misc",defaultValue:true},displayType:{type:"sap.m.PDFViewerDisplayType",group:"Misc",defaultValue:c.Auto}},aggregations:{errorPlaceholder:{type:"sap.ui.core.Control",multiple:false},popupButtons:{type:"sap.m.Button",multiple:true,singularName:"popupButton"}},events:{loaded:{},error:{parameters:{target:{type:"any",defaultValue:null}}},sourceValidationFailed:{}}}});d.prototype.init=function(){this._objectsRegister={};this._bIsPopupOpen=false;this._initPopupControl();this._initPopupDownloadButtonControl();this._initPlaceholderMessagePageControl();this._initToolbarDownloadButtonControl();this._initOverflowToolbarControl();this._initControlState();};d.prototype._initControlState=function(){this._bRenderPdfContent=true;};d.prototype.setWidth=function(w){this.setProperty("width",w,true);var o=this.$();if(o===null){return this;}o.css("width",this._getRenderWidth());return this;};d.prototype.setHeight=function(h){this.setProperty("height",h,true);var o=this.$();if(o===null){return this;}o.css("height",this._getRenderHeight());return this;};d.prototype.onBeforeRendering=function(){try{var i=this._getIframeDOMElement();i.off();}catch(e){L.info(e);}};d.prototype.onAfterRendering=function(){var i=function(){var I=this._getIframeDOMElement();I.on("load",this._onLoadListener.bind(this));I.on("error",this._onErrorListener.bind(this));}.bind(this);try{this.setBusy(true);i();}catch(e){L.error(e);this.setBusy(false);}};d.prototype._fireErrorEvent=function(e){this._renderErrorState();this.fireError({target:e||null});};d.prototype._renderErrorState=function(){var o=this._objectsRegister.getToolbarDownloadButtonControl();o.setEnabled(false);var o=this._objectsRegister.getPopupDownloadButtonControl();o.setEnabled(false);this.setBusy(false);this._bRenderPdfContent=false;C.prototype.invalidate.call(this);};d.prototype._fireLoadedEvent=function(){this._bRenderPdfContent=true;this.setBusy(false);try{this._getIframeDOMElement().removeClass("sapMPDFViewerLoading");}catch(e){L.fatal("Iframe not founded in loaded event");L.fatal(e);}this.fireEvent("loaded");};d.prototype._onLoadListener=function(e){try{var t=q(e.target),f=true;var s="application/pdf";try{var E=t[0].contentWindow.document.embeds;f=!!E&&E.length===1;if(f){s=E[0].attributes.getNamedItem("type").value;}}catch(g){if(!D.browser.firefox&&this.fireEvent("sourceValidationFailed",{},true)){this._fireLoadedEvent();return;}}if(f&&a._isSupportedMimeType(s)&&a._isPdfPluginEnabled()){this._fireLoadedEvent();}else{this._fireErrorEvent(e.target);}}catch(g){L.fatal(false,"Fatal error during the handling of load event happened.");L.fatal(false,g.message);}};d.prototype._onErrorListener=function(){this._fireErrorEvent();};d.prototype.downloadPDF=function(){var w=window.open(this.getSource());w.opener=null;w.focus();};d.prototype._onSourceValidationErrorMessageBoxCloseListener=function(o){if(o===M.Action.CANCEL){this._renderErrorState();}else{this._fireLoadedEvent();}};d.prototype._onAfterPopupClose=function(e){var p=this._objectsRegister.getPopup();p.removeAllContent();this._bIsPopupOpen=false;};d.prototype._shouldRenderPdfContent=function(){return a._isPdfPluginEnabled()&&this._bRenderPdfContent&&this._isSourceValidToDisplay();};d.prototype._isSourceValidToDisplay=function(){var s=this.getSource();return s!==null&&s!==""&&typeof s!=="undefined";};d.prototype.invalidate=function(o){this._initControlState();C.prototype.invalidate.call(this,o);};d.prototype.open=function(){if(!this._isSourceValidToDisplay()){b(false,"The PDF file cannot be opened with the given source. Given source: "+this.getSource());return;}else if(!a._isPdfPluginEnabled()){L.warning("The PDF plug-in is not available on this device.");}if(this._isEmbeddedModeAllowed()){this._openOnDesktop();}else{this._openOnMobile();}};d.prototype._openOnDesktop=function(){var p=this._objectsRegister.getPopup();if(this._bIsPopupOpen){return;}this._initControlState();this._preparePopup(p);p.addContent(this);this._bIsPopupOpen=true;p.open();};d.prototype._openOnMobile=function(){var w=window.open(this.getSource());w.opener=null;w.focus();};d.prototype._getIframeDOMElement=function(){var i=this.$("iframe");if(i.length===0){throw Error("Underlying iframe was not found in DOM.");}if(i.length>1){L.fatal("Initialization of iframe fails. Reason: the control somehow renders multiple iframes");}return i;};d.prototype._isEmbeddedModeAllowed=function(){return this._isDisplayTypeAuto()?D.system.desktop:this._isDisplayTypeEmbedded();};d.prototype._isDisplayTypeAuto=function(){return this.getDisplayType()===c.Auto;};d.prototype._isDisplayTypeEmbedded=function(){return this.getDisplayType()===c.Embedded;};d.prototype._isDisplayTypeLink=function(){return this.getDisplayType()===c.Link;};d.prototype._isDisplayDownloadButton=function(){return this.getShowDownloadButton()||this._isDisplayTypeLink()||(this._isDisplayTypeAuto()&&!this._isEmbeddedModeAllowed());};d.prototype._getLibraryResourceBundle=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.m");};d.prototype._getMessagePageErrorMessage=function(){return this.getErrorPlaceholderMessage()?this.getErrorPlaceholderMessage():this._getLibraryResourceBundle().getText("PDF_VIEWER_PLACEHOLDER_ERROR_TEXT");};d.prototype._getRenderWidth=function(){return this._bIsPopupOpen?'100%':this.getWidth();};d.prototype._getRenderHeight=function(){if(this._bIsPopupOpen){return'100%';}if(!this._isEmbeddedModeAllowed()){return'auto';}return this.getHeight();};d.prototype._showMessageBox=function(){M.show(this._getLibraryResourceBundle().getText("PDF_VIEWER_SOURCE_VALIDATION_MESSAGE_TEXT"),{icon:M.Icon.WARNING,title:this._getLibraryResourceBundle().getText("PDF_VIEWER_SOURCE_VALIDATION_MESSAGE_HEADER"),actions:[M.Action.OK,M.Action.CANCEL],defaultAction:M.Action.CANCEL,id:this.getId()+"-validationErrorSourceMessageBox",styleClass:"sapUiSizeCompact",contentWidth:'100px',onClose:this._onSourceValidationErrorMessageBoxCloseListener.bind(this)});};d.prototype.exit=function(){q.each(this._objectsRegister,function(I,g){var o=g(true);if(o){o.destroy();}});try{var i=this._getIframeDOMElement();i.off();}catch(e){L.info(e);}};P.extendPdfViewer(d);return d;});
