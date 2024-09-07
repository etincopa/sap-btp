/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/ui/core/library","sap/ui/core/Element","sap/ui/core/Icon","sap/ui/core/IconPool","sap/ui/core/HTML","sap/ui/core/util/File","sap/m/library","sap/m/BusyIndicator","sap/m/Button","sap/m/CustomListItem","sap/m/Image","sap/m/Input","sap/m/Label","sap/m/Link","sap/m/ProgressIndicator","sap/m/VBox","sap/m/HBox"],function(L,C,E,I,a,H,F,M,B,b,c,d,e,f,g,P,V,h){"use strict";var U=E.extend("sap.m.upload.UploadSetItem",{metadata:{library:"sap.m",properties:{enabledRemove:{type:"boolean",defaultValue:true},enabledEdit:{type:"boolean",defaultValue:true},fileName:{type:"string",defaultValue:null},mediaType:{type:"string",defaultValue:null},thumbnailUrl:{type:"string",defaultValue:null},uploadState:{type:"sap.m.UploadState",defaultValue:null},url:{type:"string",defaultValue:null},visibleRemove:{type:"boolean",defaultValue:true},visibleEdit:{type:"boolean",defaultValue:true}},defaultAggregation:"attributes",aggregations:{attributes:{type:"sap.m.ObjectAttribute",multiple:true,singularName:"attribute"},markers:{type:"sap.m.ObjectMarker",multiple:true,singularName:"marker"},statuses:{type:"sap.m.ObjectStatus",multiple:true,singularName:"status"}},events:{openPressed:{item:{type:"sap.m.upload.UploadSetItem"},allowPreventDefault:true},removePressed:{item:{type:"sap.m.upload.UploadSetItem"},allowPreventDefault:true}}}});var j=M.UploadState,k=M.FlexJustifyContent,l=C.ValueState;var D=H.extend("sap.m.upload.DynamicItemContent",{metadata:{library:"sap.m",properties:{item:{type:"sap.m.upload.UploadSetItem"}}},renderer:{render:function(r,o){var i=o.getItem();r.write("<div class=\"sapMUCTextContainer ");if(this._bInEditMode){r.write("sapMUCEditMode ");}r.write("\" >");r.write("<div style=\"display:flex;\">");r.renderControl(i._bInEditMode?i._getFileNameEdit():i._getFileNameLink());i._renderMarkers(r);r.write("</div>");i._renderAttributes(r);i._renderStatuses(r);r.write("</div>");i._renderStateAndProgress(r);i._renderButtons(r);}}});U.DYNAMIC_CONTENT_SEPARATOR="<div class=\"sapMUCSeparator\">&nbsp&#x00B7&#160</div>";U.MEGABYTE=1048576;U.IMAGE_FILE_ICON="sap-icon://card";U.prototype.init=function(){this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.m");this._oListItem=null;this._oIcon=null;this._oFileNameLink=null;this._oFileNameEdit=null;this._oDynamicContent=null;this._oRestartButton=null;this._oEditButton=null;this._oDeleteButton=null;this._oTerminateButton=null;this._oConfirmRenameButton=null;this._oCancelRenameButton=null;this._oProgressBox=null;this._oProgressIndicator=null;this._oStateLabel=null;this._oProgressLabel=null;this._oFileObject=null;this._fFileSize=null;this._bInEditMode=false;this._bContainsError=false;this._bFileTypeRestricted=false;this._bNameLengthRestricted=false;this._bSizeRestricted=false;this._bMediaTypeRestricted=false;};U.prototype.setFileName=function(s){var o;if(this.getFileName()!==s){this.setProperty("fileName",s,true);if(this.getParent()){this._getFileNameLink().setText(s);o=U._splitFileName(s);this._getFileNameEdit().setValue(o.name);this._checkNameLengthRestriction(this.getParent().getMaxFileNameLength());this._checkTypeRestriction(this.getParent().getFileTypes());}}return this;};U.prototype.setUploadState=function(u){var i=this._getProgressIndicator(),s=this._getStateLabel(),m=(u!==j.Complete),n=(u===j.Uploading);this.setProperty("uploadState",u,true);i.setVisible(m);s.setVisible(m);this._getProgressLabel().setVisible(m);switch(u){case j.Complete:i.setState(l.None);s.setText("");break;case j.Error:i.setState(l.Error);s.setText(this._oRb.getText("UPLOAD_SET_ITEM_ERROR_STATE"));break;case j.Ready:i.setState(l.None);s.setText(this._oRb.getText("UPLOAD_SET_ITEM_READY_STATE"));break;case j.Uploading:i.setState(l.Information);s.setText(this._oRb.getText("UPLOAD_SET_ITEM_UPLOADING_STATE"));break;}if(this.getParent()){this._getRestartButton().setVisible(u===j.Error);this._getEditButton().setVisible(!n);this._getDeleteButton().setVisible(!n);this._getTerminateButton().setVisible(this.getParent().getTerminationEnabled()&&n);}return this;};U.prototype.setEnabledRemove=function(i){if(this.getEnabledRemove()!==i){this.setProperty("enabledRemove",i,true);if(this.getParent()){this._getDeleteButton().setEnabled(i);}}return this;};U.prototype.setVisibleRemove=function(v){if(this.getVisibleRemove()!==v){this.setProperty("visibleRemove",v,true);if(this.getParent()){this._getDeleteButton().setVisible(v);}}return this;};U.prototype.setEnabledEdit=function(i){if(this.getEnabledEdit()!==i){this.setProperty("enabledEdit",i,true);if(this.getParent()){this._getEditButton().setEnabled(i);}}return this;};U.prototype.setVisibleEdit=function(v){if(this.getVisibleEdit()!==v){this.setProperty("visibleEdit",v,true);if(this.getParent()){this._getEditButton().setVisible(v);}}return this;};U.prototype.setThumbnailUrl=function(u){if(this.getThumbnailUrl()!=u){this.setProperty("thumbnailUrl",u,true);if(this._oListItem){for(var i=0;i<this._oListItem.getContent().length;i++){if(this._oListItem.getContent()[i]instanceof sap.ui.core.Icon||this._oListItem.getContent()[i]instanceof sap.m.Image){var o=this._oListItem.getContent()[i];this._oListItem.removeContent(o);if(this._oIcon){this._oIcon.destroy();this._oIcon=null;}this._oIcon=a.createControlByURI({id:this.getId()+"-thumbnail",src:u,decorative:false},d);this._oIcon.addStyleClass("sapMUCItemImage sapMUCItemIcon");this._oListItem.insertContent(this._oIcon,0);}}}}return this;};U.prototype.getFileObject=function(){return this._oFileObject;};U.prototype.getListItem=function(){return this._getListItem();};U.prototype.setProgress=function(p){var $;this._getProgressLabel().setText(p+"%");$=this.$("-busyIndicator");if(p===100){$.attr("aria-label",this._oRb.getText("UPLOAD_SET_UPLOAD_COMPLETED"));}else{$.attr("aria-valuenow",p);}this._getProgressIndicator().setPercentValue(p);return this;};U.prototype.download=function(A){var p=this.getParent();if(!p){L.warning("Download cannot proceed without a parent association.");return false;}return p._getActiveUploader().downloadItem(this,[],A);};U.prototype._handleFileNamePressed=function(){if(this.fireOpenPressed({item:this})){M.URLHelper.redirect(this.getUrl(),true);}};U.prototype._getListItem=function(){if(!this._oListItem){this._oListItem=new c(this.getId()+"-listItem",{content:[this._getIcon(),this._getDynamicContent()]});this._oListItem.addStyleClass("sapMUCItem");}return this._oListItem;};U.prototype._setFileObject=function(o){this._oFileObject=o;if(o){this._fFileSize=o.size/U.MEGABYTE;this.setMediaType(o.type);}else{this._fFileSize=null;this.setMediaType(null);}if(this.getParent()){this._checkSizeRestriction(this.getParent().getMaxFileSize());this._checkMediaTypeRestriction(this.getParent().getMediaTypes());}};U.prototype._getIcon=function(){if(!this._oIcon){if(this.getThumbnailUrl()){this._oIcon=a.createControlByURI({id:this.getId()+"-thumbnail",src:this.getThumbnailUrl(),decorative:false},d);this._oIcon.addStyleClass("sapMUCItemImage sapMUCItemIcon");}else{this._oIcon=new I(this.getId()+"-icon",{src:this._getIconByFileType()});this._oIcon.addStyleClass("sapMUCItemIcon");}this.addDependent(this._oIcon);}return this._oIcon;};U.prototype._getIconByFileType=function(){var s=U._splitFileName(this.getFileName()).extension;if(!s){return"";}switch(s.toLowerCase()){case"bmp":case"jpg":case"jpeg":case"png":return U.IMAGE_FILE_ICON;case"csv":case"xls":case"xlsx":return"sap-icon://excel-attachment";case"doc":case"docx":case"odt":return"sap-icon://doc-attachment";case"pdf":return"sap-icon://pdf-attachment";case"ppt":case"pptx":return"sap-icon://ppt-attachment";case"txt":return"sap-icon://document-text";default:return"sap-icon://document";}};U.prototype._getFileNameLink=function(){if(!this._oFileNameLink){this._oFileNameLink=new g({id:this.getId()+"-fileNameLink",text:this.getFileName(),press:[this,this._handleFileNamePressed,this]});this._oFileNameLink.addStyleClass("sapMUCFileName");this._oFileNameLink.addStyleClass("sapMUSFileName");this.addDependent(this._oFileNameLink);}this._oFileNameLink.setEnabled(!!this.getUrl());return this._oFileNameLink;};U.prototype._getDynamicContent=function(){if(!this._oDynamicContent){this._oDynamicContent=new D({item:this});this.addDependent(this._oDynamicContent);}return this._oDynamicContent;};U.prototype._getRestartButton=function(){var p=this.getParent();if(!this._oRestartButton){this._oRestartButton=new b({id:this.getId()+"-restartButton",icon:"sap-icon://refresh",type:M.ButtonType.Standard,visible:this.getUploadState()===j.Error,tooltip:this._oRb.getText("UPLOAD_SET_RESTART_BUTTON_TEXT"),press:[this,p._handleItemRestart,p]});this.addDependent(this._oRestartButton);}return this._oRestartButton;};U.prototype._getEditButton=function(){var p=this.getParent();if(!this._oEditButton){this._oEditButton=new b({id:this.getId()+"-editButton",icon:"sap-icon://request",type:M.ButtonType.Standard,enabled:this.getEnabledEdit(),visible:this.getVisibleEdit(),tooltip:this._oRb.getText("UPLOAD_SET_EDIT_BUTTON_TEXT"),press:[this,p._handleItemEdit,p]});this._oEditButton.addStyleClass("sapMUCEditBtn");this.addDependent(this._oEditButton);}return this._oEditButton;};U.prototype._getFileNameEdit=function(){var s;if(!this._oFileNameEdit){s=U._splitFileName(this.getFileName());this._oFileNameEdit=new e({id:this.getId()+"-fileNameEdit",type:M.InputType.Text});this._oFileNameEdit.addStyleClass("sapMUCEditBox");this._oFileNameEdit.setFieldWidth("75%");this._oFileNameEdit.setDescription(s.extension);this._updateFileNameEdit();this.addDependent(this._oFileNameEdit);}return this._oFileNameEdit;};U.prototype._updateFileNameEdit=function(){var o=this._getFileNameEdit();if(this._bContainsError){o.setValueState(l.Error);o.setValueStateText("");o.setShowValueStateMessage(true);}else{o.setValueState(l.None);if(o.getValue().length===0){o.setValueStateText(this._oRb.getText("UPLOAD_SET_TYPE_FILE_NAME"));}else{o.setValueStateText(this._oRb.getText("UPLOAD_SET_FILE_NAME_EXISTS"));}o.setShowValueStateMessage(false);}};U.prototype._setInEditMode=function(i){if(i&&!this._bInEditMode){var s=U._splitFileName(this.getFileName());this._getFileNameEdit().setValue(s.name);}this._bInEditMode=i;this._setContainsError(false);this.invalidate();};U.prototype._getContainsError=function(){return this._bContainsError;};U.prototype._setContainsError=function(i){this._bContainsError=i;this._updateFileNameEdit();};U._splitFileName=function(s,w){var r={};var R=/(?:\.([^.]+))?$/;var i=R.exec(s);r.name=s.slice(0,s.indexOf(i[0]));if(w){r.extension=i[0];}else{r.extension=i[1];}return r;};U.prototype._getDeleteButton=function(){var p=this.getParent();if(!this._oDeleteButton){this._oDeleteButton=new b({id:this.getId()+"-deleteButton",icon:"sap-icon://sys-cancel",type:M.ButtonType.Standard,enabled:this.getEnabledRemove(),visible:this.getVisibleRemove(),tooltip:this._oRb.getText("UPLOAD_SET_DELETE_BUTTON_TEXT"),press:[this,p._handleItemDelete,p]});this._oDeleteButton.addStyleClass("sapMUCDeleteBtn");this.addDependent(this._oDeleteButton);}return this._oDeleteButton;};U.prototype._getTerminateButton=function(){var p=this.getParent();if(!this._oTerminateButton){this._oTerminateButton=new b({id:this.getId()+"-terminateButton",icon:"sap-icon://stop",type:M.ButtonType.Standard,visible:p.getTerminationEnabled()&&this.getUploadState()===j.Uploading,tooltip:this._oRb.getText("UPLOAD_SET_TERMINATE_BUTTON_TEXT"),press:[this,p._handleTerminateRequest,p]});this._oTerminateButton.addStyleClass("sapMUCDeleteBtn");this.addDependent(this._oTerminateButton);}return this._oTerminateButton;};U.prototype._getConfirmRenameButton=function(){var p=this.getParent();if(!this._oConfirmRenameButton){this._oConfirmRenameButton=new b({id:this.getId()+"-okButton",text:this._oRb.getText("UPLOAD_SET_RENAME_BUTTON_TEXT"),type:M.ButtonType.Transparent,press:[this,p._handleItemEditConfirmation,p]});this._oConfirmRenameButton.addStyleClass("sapMUCOkBtn");this.addDependent(this._oConfirmRenameButton);}return this._oConfirmRenameButton;};U.prototype._getCancelRenameButton=function(){var p=this.getParent();if(!this._oCancelRenameButton){this._oCancelRenameButton=new b({id:this.getId()+"-cancelButton",text:this._oRb.getText("UPLOAD_SET_CANCEL_BUTTON_TEXT"),type:M.ButtonType.Transparent,press:[this,p._handleItemEditCancelation,p]});this._oCancelRenameButton.addStyleClass("sapMUCCancelBtn");this.addDependent(this._oCancelRenameButton);}return this._oCancelRenameButton;};U.prototype._getProgressBox=function(){if(!this._oProgressBox){this._oProgressBox=new V({id:this.getId()+"-progressBox",items:[this._getProgressIndicator(),new h({justifyContent:k.SpaceBetween,items:[this._getStateLabel(),this._getProgressLabel()]})],width:"20%"});this._oProgressBox.addStyleClass("sapMUSProgressBox");this.addDependent(this._oProgressBox);}return this._oProgressBox;};U.prototype._getProgressIndicator=function(){if(!this._oProgressIndicator){this._oProgressIndicator=new P({id:this.getId()+"-progressIndicator",percentValue:0,state:l.Information,visible:this.getUploadState()!==j.Complete});this._oProgressIndicator.addStyleClass("sapMUSProgressIndicator");}return this._oProgressIndicator;};U.prototype._getStateLabel=function(){if(!this._oStateLabel){this._oStateLabel=new f({id:this.getId()+"-stateLabel",text:"Pending",visible:this.getUploadState()!==j.Complete});}return this._oStateLabel;};U.prototype._getProgressLabel=function(){if(!this._oProgressLabel){this._oProgressLabel=new f({id:this.getId()+"-progressLabel",visible:this.getUploadState()!==j.Complete});this.setProgress(0);this.addDependent(this._oProgressLabel);}return this._oProgressLabel;};U.prototype._renderAttributes=function(r){var i=this.getAttributes().length-1;if(this.getAttributes().length>0){r.write("<div class=\"sapMUCAttrContainer\">");this.getAttributes().forEach(function(A,m){r.renderControl(A.addStyleClass("sapMUCAttr"));if(m<i){r.write(U.DYNAMIC_CONTENT_SEPARATOR);}});r.write("</div>");}};U.prototype._renderMarkers=function(r){if(this.getMarkers().length>0){r.write("<div class=\"sapMUSObjectMarkerContainer\">");this.getMarkers().forEach(function(m){r.renderControl(m.addStyleClass("sapMUCObjectMarker"));});r.write("</div>");}};U.prototype._renderStatuses=function(r){var i=this.getStatuses().length-1;if(this.getStatuses().length>0){r.write("<div class=\"sapMUCStatusContainer\">");this.getStatuses().forEach(function(s,m){r.renderControl(s);if(m<i){r.write(U.DYNAMIC_CONTENT_SEPARATOR);}});r.write("</div>");}};U.prototype._renderStateAndProgress=function(r){r.renderControl(this._getProgressBox());};U.prototype._renderButtons=function(r){var i;if(this._bInEditMode){i=[this._getConfirmRenameButton(),this._getCancelRenameButton()];}else{i=[this._getRestartButton(),this._getEditButton(),this._getDeleteButton(),this._getTerminateButton()];}if(i.length>0){r.write("<div class=\"sapMUCButtonContainer\">");i.forEach(function(o,m){if(m<(i.length-1)){o.addStyleClass("sapMUCFirstButton");}r.renderControl(o);});r.write("</div>");}};U.prototype._checkTypeRestriction=function(t){var o=U._splitFileName(this.getFileName()),r=(!!this.getFileName()&&!!t&&(t.length>0)&&o.extension&&t.indexOf(o.extension.toLowerCase())===-1);if(r!==this._bFileTypeRestricted){this._bFileTypeRestricted=r;this.invalidate();if(r&&this.getParent()){this.getParent().fireFileTypeMismatch({item:this});}}};U.prototype._checkNameLengthRestriction=function(m){var r=(m&&!!this.getFileName()&&this.getFileName().length>m);if(r!==this._bNameLengthRestricted){this._bNameLengthRestricted=r;this.invalidate();if(r&&this.getParent()){this.getParent().fireFileNameLengthExceeded({item:this});}}};U.prototype._checkSizeRestriction=function(m){var r=(m&&this._fFileSize>m);if(r!==this._bSizeRestricted){this._bSizeRestricted=r;this.invalidate();if(r&&this.getParent()){this.getParent().fireFileSizeExceeded({item:this});}}};U.prototype._checkMediaTypeRestriction=function(t){var r=(!!t&&(t.length>0)&&!!this.getMediaType()&&t.indexOf(this.getMediaType())===-1);if(r!==this._bMediaTypeRestricted){this._bMediaTypeRestricted=r;this.invalidate();if(r&&this.getParent()){this.getParent().fireMediaTypeMismatch({item:this});}}};U.prototype._isRestricted=function(){return this._bFileTypeRestricted||this._bNameLengthRestricted||this._bSizeRestricted||this._bMediaTypeRestricted;};return U;});
