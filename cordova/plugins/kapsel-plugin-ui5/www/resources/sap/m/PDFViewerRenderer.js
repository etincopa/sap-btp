/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/Device',"sap/base/Log"],function(D,L){"use strict";function s(c){return(!!c.getTitle()||c._isDisplayDownloadButton())&&!c._bIsPopupOpen;}var a=Object.freeze(["application/pdf","application/x-google-chrome-pdf"]);var P={};P._isSupportedMimeType=function(m){var f=a.indexOf(m);return f>-1;};P._isPdfPluginEnabled=function(){var i=true;if(D.browser.firefox){return i;}if(D.browser.internet_explorer){try{new ActiveXObject("AcroPDF.PDF");}catch(e){i=false;}return i;}var m=navigator.mimeTypes;if(m.length){i=a.some(function(A){var M=m.namedItem(A);return M!==null;});}else{if(D.browser.chrome){return i;}}return i;};P.render=function(r,c){r.write("<div");r.writeControlData(c);r.addStyle("width",c._getRenderWidth());r.addStyle("height",c._getRenderHeight());r.writeStyles();r.writeClasses();this._writeAccessibilityTags(r,c);r.write(">");if(s(c)){r.renderControl(c._objectsRegister.getOverflowToolbarControl());}if(c._isEmbeddedModeAllowed()){this.renderPdfContent(r,c);}r.write("</div>");};P._writeAccessibilityTags=function(r,c){r.writeAttribute("role","document");r.writeAttribute("aria-label",c._getLibraryResourceBundle().getText("PDF_VIEWER_ACCESSIBILITY_LABEL"));};P.renderPdfContent=function(r,c){if(c._shouldRenderPdfContent()){r.write("<iframe");r.addClass("sapMPDFViewerContent");r.addClass("sapMPDFViewerLoading");if(s(c)){r.addClass("sapMPDFViewerReducedContent");}r.writeClasses();r.write(">");r.write("</iframe>");}else{this.renderErrorContent(r,c);if(!P._isPdfPluginEnabled()){L.warning("The PDF plug-in is not available on this device.");c.fireEvent("error",{},true);}}};P.renderErrorContent=function(r,c){var e=c.getErrorPlaceholder()?c.getErrorPlaceholder():c._objectsRegister.getPlaceholderMessagePageControl();r.write("<div");r.addClass("sapMPDFViewerError");if(!c._bIsPopupOpen){r.addClass("sapMPDFViewerEmbeddedContent");}r.writeClasses();r.write(">");r.renderControl(e);r.write("</div>");};return P;},true);
