/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./InputBase','./library','sap/ui/core/InvisibleText','sap/ui/core/library','sap/ui/Device','sap/ui/core/LabelEnablement',"./ComboBoxTextFieldRenderer"],function(I,l,a,c,D,L,C){"use strict";var b=I.extend("sap.m.ComboBoxTextField",{metadata:{library:"sap.m",properties:{maxWidth:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"100%"},showButton:{type:"boolean",group:"Appearance",defaultValue:true}}}});var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");b.prototype.init=function(){I.prototype.init.apply(this,arguments);this._oArrowIcon=this.addEndIcon({id:this.getId()+"-arrow",src:"sap-icon://slim-arrow-down",noTabStop:true,alt:r.getText("COMBOBOX_BUTTON"),decorative:false});};b.prototype.getArrowIcon=function(){return this._oArrowIcon;};b.prototype.getIcon=b.prototype.getArrowIcon;b.prototype.toggleIconPressedStyle=function(s){this.toggleStyleClass(I.ICON_PRESSED_CSS_CLASS,s);};b.prototype.onBeforeRendering=function(){I.prototype.onBeforeRendering.apply(this,arguments);var R=L.getReferencingLabels(this)||[],i=this.getArrowIcon();i.setVisible(this.getShowButton());R.forEach(function(s){if(i.getAriaLabelledBy().indexOf(s)===-1){i.addAssociation("ariaLabelledBy",s,true);}},this);};b.prototype.getOpenArea=function(){var d=this.getArrowIcon().getDomRef();return d?d.parentNode:d;};b.prototype.onsapenter=function(e){I.prototype.onsapenter.apply(this,arguments);if(!this.getEnabled()||!this.getEditable()){return;}this._bCheckDomValue&&e.setMarked();var v=this.getValue(),V=v.length;this.setValue(v);this.selectText(V,V);};b.prototype.getValue=function(){var d=this.getFocusDomRef();if(d){return d.value;}return this.getProperty("value");};b.prototype.getDomRefForValueStateMessage=function(){return this.getDomRef();};b.prototype.getAccessibilityInfo=function(){var i=I.prototype.getAccessibilityInfo.apply(this,arguments);i.type=r.getText("ACC_CTR_TYPE_COMBO");return i;};b.prototype.exit=function(){I.prototype.exit.apply(this,arguments);this._oArrowIcon=null;};return b;});
