/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./ODataBinding","./lib/_Cache","./lib/_Helper","sap/base/Log","sap/ui/base/SyncPromise","sap/ui/model/BindingMode","sap/ui/model/ChangeReason","sap/ui/model/odata/v4/Context","sap/ui/model/PropertyBinding"],function(a,_,b,L,S,B,C,c,P){"use strict";var s="sap.ui.model.odata.v4.ODataPropertyBinding",i=Object.freeze([]),m={AggregatedDataStateChange:true,change:true,dataReceived:true,dataRequested:true,DataStateChange:true};var O=P.extend("sap.ui.model.odata.v4.ODataPropertyBinding",{constructor:function(M,p,o,d){P.call(this,M,p);a.call(this);if(p.slice(-1)==="/"){throw new Error("Invalid path: "+p);}if(d){this.checkBindingParameters(d,["$$groupId"]);this.sGroupId=d.$$groupId;}else{this.sGroupId=undefined;}this.oCheckUpdateCallToken=undefined;this.mQueryOptions=this.oModel.buildQueryOptions(d,false);this.fetchCache(o);this.oContext=o;this.bHasDeclaredType=undefined;this.bInitial=true;this.sPathWithFetchTypeError=undefined;this.vValue=undefined;M.bindingCreated(this);},metadata:{publicMethods:[]}});a(O.prototype);O.prototype.adjustPredicate=function(){};O.prototype.attachEvent=function(e){if(!(e in m)){throw new Error("Unsupported event '"+e+"': v4.ODataPropertyBinding#attachEvent");}return P.prototype.attachEvent.apply(this,arguments);};O.prototype.checkUpdateInternal=function(f,d,g,v){var D=false,h=this.sPath.indexOf("##"),I=h>=0,M=this.oModel.getMetaModel(),p={data:{}},r=this.oModel.resolve(this.sPath,this.oContext),o={forceUpdate:r&&(f||this.oCheckUpdateCallToken&&this.oCheckUpdateCallToken.forceUpdate)},t=this.oType,e=this;this.oCheckUpdateCallToken=o;if(this.bHasDeclaredType===undefined){this.bHasDeclaredType=!!t;}if(arguments.length<4){v=this.oCachePromise.then(function(j){var k,l;if(j){return j.fetchValue(e.lockGroup(g||e.getGroupId()),undefined,function(){D=true;e.fireDataRequested();},e);}if(!e.sReducedPath||e.bRelative&&!e.oContext){return undefined;}if(e.bRelative&&e.oContext.iIndex===c.VIRTUAL){o.forceUpdate=false;}if(!I){return e.oContext.fetchValue(e.sReducedPath,e);}k=e.sPath.slice(0,h);l=e.sPath.slice(h+2);if(l[0]==="/"){l="."+l;}return M.fetchObject(l,M.getMetaContext(e.oModel.resolve(k,e.oContext)));}).then(function(v){if(!v||typeof v!=="object"){return v;}if(e.sInternalType==="any"&&(e.getBindingMode()===B.OneTime||(e.sPath[e.sPath.lastIndexOf("/")+1]==="#"&&!I))){if(I){return v;}else if(e.bRelative){return b.publicClone(v);}}L.error("Accessed value is not primitive",r,s);},function(E){e.oModel.reportError("Failed to read path "+r,s,E);if(E.canceled){o.forceUpdate=false;return e.vValue;}p={error:E};});if(r&&!this.bHasDeclaredType&&this.sInternalType!=="any"&&!I){t=M.fetchUI5Type(r);}if(o.forceUpdate&&v.isFulfilled()){if(t&&t.isFulfilled&&t.isFulfilled()){this.setType(t.getResult(),this.sInternalType);}this.vValue=v.getResult();}v=Promise.resolve(v);}return S.all([v,t]).then(function(R){var T=R[1],v=R[0];if(o===e.oCheckUpdateCallToken){e.oCheckUpdateCallToken=undefined;e.setType(T,e.sInternalType);if(o.forceUpdate||e.vValue!==v){e.bInitial=false;e.vValue=v;e._fireChange({reason:d||C.Change});}e.checkDataState();}if(D){e.fireDataReceived(p);}});};O.prototype.deregisterChange=function(){var t=this;this.withCache(function(o,p){o.deregisterChange(p,t);}).catch(function(e){t.oModel.reportError("Error in deregisterChange",s,e);});};O.prototype.destroy=function(){this.deregisterChange();this.oModel.bindingDestroyed(this);this.oCheckUpdateCallToken=undefined;this.mQueryOptions=undefined;this.vValue=undefined;a.prototype.destroy.apply(this);P.prototype.destroy.apply(this,arguments);};O.prototype.doCreateCache=function(r,q){return _.createProperty(this.oModel.oRequestor,r,q);};O.prototype.doFetchQueryOptions=function(){return this.isRoot()?S.resolve(this.mQueryOptions):S.resolve({});};O.prototype.getDependentBindings=function(){return i;};O.prototype.getResumePromise=function(){};O.prototype.getValue=function(){return this.vValue;};O.prototype.requestValue=function(){var t=this;return Promise.resolve(this.checkUpdateInternal().then(function(){return t.getValue();}));};O.prototype.getValueListType=function(){var r=this.getModel().resolve(this.sPath,this.oContext);if(!r){throw new Error(this+" is not resolved yet");}return this.getModel().getMetaModel().getValueListType(r);};O.prototype.hasPendingChangesInDependents=function(){return false;};O.prototype.isMeta=function(){return this.sPath.includes("##");};O.prototype.onChange=function(v){this.checkUpdateInternal(undefined,undefined,undefined,v);};O.prototype.refreshInternal=function(r,g,d){if(this.isRootBindingSuspended()){this.sResumeChangeReason=C.Refresh;return S.resolve();}this.fetchCache(this.oContext);return d?this.checkUpdateInternal(false,C.Refresh,g):S.resolve();};O.prototype.requestValueListInfo=function(A){var r=this.getModel().resolve(this.sPath,this.oContext);if(!r){throw new Error(this+" is not resolved yet");}return this.getModel().getMetaModel().requestValueListInfo(r,A);};O.prototype.requestValueListType=function(){var r=this.getModel().resolve(this.sPath,this.oContext);if(!r){throw new Error(this+" is not resolved yet");}return this.getModel().getMetaModel().requestValueListType(r);};O.prototype.resetChangesInDependents=function(){};O.prototype.resetInvalidDataState=function(){if(this.getDataState().isControlDirty()){this._fireChange({reason:C.Change});}};O.prototype.resume=function(){throw new Error("Unsupported operation: resume");};O.prototype.resumeInternal=function(d){this.fetchCache(this.oContext);if(d){this.checkUpdateInternal(false,this.sResumeChangeReason);}this.sResumeChangeReason=C.Change;};O.prototype.setContext=function(o){if(this.oContext!==o){if(this.bRelative){this.deregisterChange();}this.oContext=o;if(this.bRelative){this.fetchCache(this.oContext);this.checkUpdateInternal(false,C.Context);}}};O.prototype.setType=function(t){var o=this.oType;if(t&&t.getName()==="sap.ui.model.odata.type.DateTimeOffset"){t.setV4();}P.prototype.setType.apply(this,arguments);if(!this.bInitial&&o!==t){this._fireChange({reason:C.Change});}};O.prototype.setValue=function(v,g){var G,t=this;function r(e){t.oModel.reportError("Failed to update path "+t.oModel.resolve(t.sPath,t.oContext),s,e);return e;}this.checkSuspended();this.oModel.checkGroupId(g);if(typeof v==="function"||(v&&typeof v==="object")){throw r(new Error("Not a primitive value"));}if(this.vValue===undefined){throw r(new Error("Must not change a property before it has been read"));}if(this.vValue!==v){G=t.lockGroup(g||this.getUpdateGroupId(),true,true);this.oCachePromise.then(function(o){if(o){r(new Error("Cannot set value on this binding as it is not relative"+" to a sap.ui.model.odata.v4.Context"));}else{return t.oContext.doSetProperty(t.sPath,v,G);}}).catch(function(e){G.unlock(true);r(e);});}};O.prototype.suspend=function(){throw new Error("Unsupported operation: suspend");};O.prototype.visitSideEffects=function(){};return O;});
