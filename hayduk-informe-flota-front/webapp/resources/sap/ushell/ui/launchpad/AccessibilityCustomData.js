/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/CustomData','sap/ushell/library'],function(q,C,l){"use strict";var A=C.extend("sap.ushell.ui.launchpad.AccessibilityCustomData"),o=C.prototype._checkWriteToDom;A.prototype._checkWriteToDom=function(r){var k=this.getKey().toLowerCase(),i=sap.ui.getCore().getConfiguration().getAccessibility();if(!i){return;}if(k.indexOf("aria")===0||k==="role"||k==="tabindex"){if(!this.getWriteToDom()){return null;}var v=this.getValue();if(typeof v!="string"){q.sap.log.error("CustomData with key "+k+" should be written to HTML of "+r+" but the value is not a string.");return null;}if(!(sap.ui.core.ID.isValid(k))||(k.indexOf(":")!=-1)){q.sap.log.error("CustomData with key "+k+" should be written to HTML of "+r+" but the key is not valid (must be a valid sap.ui.core.ID without any colon).");return null;}if(k==q.sap._FASTNAVIGATIONKEY){v=/^\s*(x|true)\s*$/i.test(v)?"true":"false";}else if(k.indexOf("sap-ui")==0){q.sap.log.error("CustomData with key "+k+" should be written to HTML of "+r+" but the key is not valid (may not start with 'sap-ui').");return null;}return{key:k,value:v};}else{return o.apply(this,arguments);}};return A;},true);
