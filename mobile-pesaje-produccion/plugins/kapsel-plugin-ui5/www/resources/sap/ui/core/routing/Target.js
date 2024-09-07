/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/Control','sap/ui/base/EventProvider','sap/ui/core/mvc/View','sap/ui/core/routing/async/Target','sap/ui/core/routing/sync/Target',"sap/base/util/UriParameters","sap/base/Log"],function(C,E,V,a,s,U,L){"use strict";var T=E.extend("sap.ui.core.routing.Target",{constructor:function(o,c){var e;function d(){if(U.fromQuery(window.location.search).get("sap-ui-xx-asyncRouting")==="true"){L.warning("Activation of async view loading in routing via url parameter is only temporarily supported and may be removed soon","Target");return true;}return false;}if(o._async===undefined){o._async=d();}if(o.type==="Component"&&!o._async){e="sap.ui.core.routing.Target doesn't support loading component in synchronous mode, please switch routing to async";L.error(e);throw new Error(e);}this._updateOptions(o);this._oCache=c;E.apply(this,arguments);if(this._oOptions.title){this._oTitleProvider=new b({target:this});}var f=this._oOptions._async?a:s;for(var g in f){this[g]=f[g];}this._bIsDisplayed=false;this._bIsLoaded=false;},destroy:function(){this._oParent=null;this._oOptions=null;this._oCache=null;if(this._oTitleProvider){this._oTitleProvider.destroy();}this._oTitleProvider=null;E.prototype.destroy.apply(this,arguments);this.bIsDestroyed=true;return this;},attachDisplay:function(d,f,l){return this.attachEvent(this.M_EVENTS.DISPLAY,d,f,l);},detachDisplay:function(f,l){return this.detachEvent(this.M_EVENTS.DISPLAY,f,l);},fireDisplay:function(p){var t=this._oTitleProvider&&this._oTitleProvider.getTitle();if(t){this.fireTitleChanged({name:this._oOptions._name,title:t});}this._bIsDisplayed=true;return this.fireEvent(this.M_EVENTS.DISPLAY,p);},attachTitleChanged:function(d,f,l){var h=this.hasListeners("titleChanged"),t=this._oTitleProvider&&this._oTitleProvider.getTitle();this.attachEvent(this.M_EVENTS.TITLE_CHANGED,d,f,l);if(!h&&t&&this._bIsDisplayed){this.fireTitleChanged({name:this._oOptions._name,title:t});}return this;},detachTitleChanged:function(f,l){return this.detachEvent(this.M_EVENTS.TITLE_CHANGED,f,l);},fireTitleChanged:function(p){return this.fireEvent(this.M_EVENTS.TITLE_CHANGED,p);},_getEffectiveObjectName:function(n){var p=this._oOptions.path;if(p){n=p+"."+n;}return n;},_updateOptions:function(o){if(o.viewName){if(o.name){o._name=o.name;}o.type="View";o.name=o.viewName;if(o.viewPath){o.path=o.viewPath;}if(o.viewId){o.id=o.viewId;}}this._oOptions=o;},_bindTitleInTitleProvider:function(v){if(this._oTitleProvider&&v instanceof V){this._oTitleProvider.applySettings({title:this._oOptions.title},v.getController());}},_addTitleProviderAsDependent:function(v){if(!this._oTitleProvider){return;}var o=this._oTitleProvider.getParent();if(o){o.removeDependent(this._oTitleProvider);}v.addDependent(this._oTitleProvider);},_beforePlacingViewIntoContainer:function(A){},M_EVENTS:{DISPLAY:"display",TITLE_CHANGED:"titleChanged"}});var b=C.extend("sap.ui.core.routing.Target.TitleProvider",{metadata:{library:"sap.ui.core",properties:{title:{type:"string",group:"Data",defaultValue:null}}},constructor:function(S){this._oTarget=S.target;delete S.target;C.prototype.constructor.call(this,S);},setTitle:function(t){this.setProperty("title",t,true);if(this._oTarget._bIsDisplayed){this._oTarget.fireTitleChanged({name:this._oTarget._oOptions._name,title:t});}}});return T;});
