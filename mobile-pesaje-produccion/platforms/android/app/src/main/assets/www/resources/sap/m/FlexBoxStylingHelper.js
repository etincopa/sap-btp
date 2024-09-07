/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/strings/hyphenate"],function(h){"use strict";var F={};F.setFlexItemStyles=function(r,l){r=r||null;var o=''+l.getOrder(),g=''+l.getGrowFactor(),s=''+l.getShrinkFactor(),b=l.getBaseSize().toLowerCase(),m=l.getMinHeight(),M=l.getMaxHeight(),a=l.getMinWidth(),c=l.getMaxWidth();if(typeof o!=='undefined'){F.setStyle(r,l,"order",o);}if(typeof g!=='undefined'){F.setStyle(r,l,"flex-grow",g);}if(typeof s!=='undefined'){F.setStyle(r,l,"flex-shrink",s);}if(typeof b!=='undefined'){F.setStyle(r,l,"flex-basis",b);}if(typeof m!=='undefined'){F.setStyle(r,l,"min-height",m);}if(typeof M!=='undefined'){F.setStyle(r,l,"max-height",M);}if(typeof a!=='undefined'){F.setStyle(r,l,"min-width",a);}if(typeof c!=='undefined'){F.setStyle(r,l,"max-width",c);}};F.setStyle=function(r,l,p,v){if(typeof(v)==="string"){v=h(v);}else if(typeof(v)==="number"){v=v.toString();}F.writeStyle(r,l,p,v);};F.writeStyle=function(r,l,p,v){if(r){if(v==="0"||v){r.style(p,v);}}else{if(l.$().length){if(v!=="0"&&!v){l.$().css(p,null);}else{l.$().css(p,v);}}else{if(l.getParent()){if(v!=="0"&&!v){l.getParent().$().css(p,null);}else{l.getParent().$().css(p,v);}}}}};return F;},true);
