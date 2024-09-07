/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./library','sap/ui/core/Control','sap/ui/core/library','sap/m/Text','sap/ui/events/KeyCodes','./ObjectAttributeRenderer','sap/base/Log','sap/ui/base/ManagedObjectObserver','sap/ui/core/Core'],function(l,C,c,T,K,O,L,M,o){"use strict";var a=c.TextDirection;var E=l.EmptyIndicatorMode;var A=c.aria.HasPopup;var b=C.extend("sap.m.ObjectAttribute",{metadata:{library:"sap.m",designtime:"sap/m/designtime/ObjectAttribute.designtime",properties:{title:{type:"string",group:"Misc",defaultValue:null},text:{type:"string",group:"Misc",defaultValue:null},active:{type:"boolean",group:"Misc",defaultValue:null},textDirection:{type:"sap.ui.core.TextDirection",group:"Appearance",defaultValue:a.Inherit},ariaHasPopup:{type:"sap.ui.core.aria.HasPopup",group:"Accessibility",defaultValue:A.None}},aggregations:{customContent:{type:"sap.ui.core.Control",multiple:false},_textControl:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}},events:{press:{parameters:{domRef:{type:"string"}}}},dnd:{draggable:true,droppable:false}}});b.prototype.init=function(){this.setAggregation('_textControl',new T());};b.prototype.exit=function(){if(this._oCustomContentObserver){this._oCustomContentObserver.disconnect();this._oCustomContentObserver=null;}if(this._oCustomContentCloning){this._oCustomContentCloning.destroy();}};b.prototype._getUpdatedTextControl=function(){var d=this._oCustomContentCloning||this.getAggregation('_textControl'),t=this.getTitle(),s=this.getAggregation('customContent')?this.getAggregation('customContent').getText():this.getText(),e=this.getTextDirection(),p=this.getParent(),P=o.getConfiguration().getRTL(),m,w=true,f='',r;this._bEmptyIndicatorMode=this._isEmptyIndicatorMode();if(e===a.LTR&&P){f='\u200e';}if(e===a.RTL&&!P){f='\u200f';}s=f+s+f;if(t){r=t;if(o.getConfiguration().getLocale().getLanguage().toLowerCase()==="fr"){r+=" ";}r+=": "+s;}else{r=s;}if(this._bEmptyIndicatorMode){this.getAggregation('_textControl').setProperty("emptyIndicatorMode",E.On,true);}d.setProperty('text',r,true);d.setProperty('textDirection',e,true);if(p&&p.isA("sap.m.ObjectListItem")){w=false;m=O.MAX_LINES.SINGLE_LINE;}this._setControlWrapping(d,w,m);return d;};b.prototype._isEmptyIndicatorMode=function(){var d=this.getAggregation('customContent');return d&&d.getEmptyIndicatorMode()!==E.Off&&!d.getText();};b.prototype._setControlWrapping=function(d,w,m){if(d.isA("sap.m.Link")){d.setProperty('wrapping',w,true);}if(d.isA("sap.m.Text")){d.setProperty('maxLines',m,true);}};b.prototype.ontap=function(e){var t=e.target;t=t.id?t:t.parentElement;if(this._isSimulatedLink()&&(t.id===this.getId()+"-text")){this.firePress({domRef:this.getDomRef()});}};b.prototype.onsapenter=function(e){if(this._isSimulatedLink()){this.firePress({domRef:this.getDomRef()});e.setMarked();}};b.prototype.onsapspace=function(e){e.preventDefault();};b.prototype.onkeyup=function(e){if(e.which===K.SPACE){this.onsapenter(e);}};b.prototype._isEmpty=function(){if(this.getAggregation('customContent')&&!(this.getAggregation('customContent').isA("sap.m.Link")||this.getAggregation('customContent').isA("sap.m.Text"))){L.warning("Only sap.m.Link or sap.m.Text are allowed in \"sap.m.ObjectAttribute.customContent\" aggregation");return true;}return!(this.getText().trim()||this.getTitle().trim());};b.prototype.ontouchstart=function(e){if(this._isSimulatedLink()){e.originalEvent._sapui_handledByControl=true;}};b.prototype.getPopupAnchorDomRef=function(){return this.getDomRef("text");};b.prototype._isSimulatedLink=function(){return(this.getActive()&&this.getText()!=="")&&!this.getAggregation('customContent');};b.prototype.setCustomContent=function(d){var e=this.getCustomContent();if(this._oCustomContentCloning){this._oCustomContentCloning.destroy();}this._oCustomContentCloning=d&&d.clone();if(!this._oCustomContentObserver){this._oCustomContentObserver=new M(function(){this.invalidate();}.bind(this));}if(e){this._oCustomContentObserver.unobserve(e);}d&&this._oCustomContentObserver.observe(d,{properties:true});return this.setAggregation('customContent',d);};b.prototype._isClickable=function(){return(this.getActive()&&this.getText()!=="")||(this.getAggregation('customContent')&&this.getAggregation('customContent').isA('sap.m.Link'));};return b;});
