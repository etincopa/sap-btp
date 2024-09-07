sap.ui.define(["sap/ui/base/Object","sap/ui/Device","sap/ui/model/json/JSONModel","sap/m/MessageToast","sap/m/ActionSheet","sap/m/Dialog","sap/m/Popover","sap/suite/ui/generic/template/lib/deletionHelper","sap/suite/ui/generic/template/lib/routingHelper","sap/suite/ui/generic/template/lib/SaveScenarioHandler","sap/suite/ui/generic/template/lib/ContextBookkeeping","sap/suite/ui/generic/template/lib/CRUDHelper","sap/suite/ui/generic/template/lib/StatePreserver","sap/suite/ui/generic/template/lib/testableHelper","sap/base/Log","sap/ui/core/syncStyleClass"],function(B,D,J,M,A,a,P,d,r,S,C,b,c,t,L,s){"use strict";var e=(t.testableStatic(function(T,o){var i="sapUiSizeCozy",j="sapUiSizeCompact";if(o.hasClass(i)||o.hasClass(j)){return"";}else{return T?i:j;}},"Application_determineContentDensityClass")(D.support.touch,jQuery(document.body)));function g(){return e;}function f(o,p){s(e,p,o);p.addDependent(o);}var f=t.testableStatic(f,"Application_attachControlToParent");function h(T){var o=new C(T.oAppComponent);var E;var n=Object.create(null);function j(i){var s1=T.oNavigationControllerProxy.getActiveComponents();return s1.indexOf(i.getId())>=0;}var I=false;function k(i){T.fnAddSideEffectPromise(i);}function p(i,s1){if(I){return;}var t1=jQuery.grep(T.aRunningSideEffectExecutions,function(u1){return!!u1;});if(t1.length){I=true;Promise.all(t1).then(function(){I=false;p(i,s1);});}else if(!(s1&&T.oBusyHelper.isBusy())){i();}}function m(i){var s1;if(i instanceof a){s1="open";}else if(i instanceof P||i instanceof A){s1="openBy";}if(s1){var t1=i[s1];i[s1]=function(){var u1=arguments;p(function(){if(!T.oBusyHelper.isBusy()){T.oBusyHelper.getUnbusy().then(function(){t1.apply(i,u1);});}});};}}var F={};function l(i,s1,t1,u1,v1){i=i||T.oNavigationHost;var w1=i.getId();var x1=F[w1]||(F[w1]={});var y1=x1[s1];if(!y1){y1=sap.ui.xmlfragment(w1,s1,t1);f(y1,i);var z1;if(u1){z1=new J();y1.setModel(z1,u1);}(v1||jQuery.noop)(y1,z1);x1[s1]=y1;m(y1);}return y1;}function q(){return new Promise(function(i){T.oNavigationObserver.getProcessFinished(true).then(function(){T.oBusyHelper.getUnbusy().then(i);});});}function u(i){T.oShellServicePromise.then(function(s1){s1.setBackNavigation(i);}).catch(function(){L.warning("No ShellService available");});}var v=false;function w(i){if(v&&!i){var s1=T.oAppComponent.getModel();if(s1.hasPendingChanges()){s1.resetChanges();}}v=i;}function R(i,s1,t1){var u1=T.mEntityTree[i];var v1=t1.getPath();var w1=v1.substring(v1.lastIndexOf("("));var x1=T.bCreateRequestsCanonical?("/"+i):s1;u1.createNonDraftInfo={bindingPath:x1+w1,createContext:t1};}function x(i,s1){return b.createNonDraft("/"+i,T.oAppComponent.getModel(),w,R.bind(null,i),s1,r1());}function y(s1){var t1=T.oNavigationControllerProxy.getActiveComponents();for(var i=0;i<t1.length;i++){var u1=T.componentRegistry[t1[i]];u1.utils.onBeforeDraftTransfer(s1);}}function z(i,s1){y(s1);o.activationStarted(i,s1);}function G(i,s1){y(s1);o.cancellationStarted(i,s1);}function H(i,s1){y(s1);o.editingStarted(i,s1);}function K(i,s1){if(!T.oFlexibleColumnLayoutHandler){return true;}var t1=r.determineNavigationPath(i,s1);return T.oFlexibleColumnLayoutHandler.isNewHistoryEntryRequired(t1);}function N(i){T.aStateChangers.push(i);}function O(i,s1){s1.then(function(){o.adaptAfterObjectDeleted(i);});}function Q(i,s1,t1){var u1=T.mEntityTree[i];var v1;if(u1.navigationProperty&&u1.parent){v1=s1?u1.entitySet:u1.navigationProperty;}else{v1=i;}if(t1.indexOf(v1)<0){t1.unshift(v1);if(u1.navigationProperty&&u1.parent){Q(u1.parent,s1,t1);}}}function U(i,s1){var t1=[];Q(i,s1,t1);return t1;}function V(s1){var t1=U(s1);t1.pop();var u1="";var v1="";var w1=[];for(var i=0;i<t1.length;i++){u1=u1+v1+t1[i];w1.push(u1);v1="/";}return w1;}function W(){var i=T.oNavigationControllerProxy.oHashChanger.getHash();var s1=i.split("?")[0];var t1=s1.split("/");if(t1[0]===""||t1[0]==="#"){t1.splice(0,1);}return t1;}function X(){return T.oNavigationControllerProxy.getLinksToUpperLayers();}function Y(){var s1=T.oNavigationControllerProxy.getActiveComponents();var t1=0;var u1;for(var i=0;i<s1.length;i++){var v1=T.componentRegistry[s1[i]];if(v1.viewLevel>0&&(t1===0||v1.viewLevel<t1)){t1=v1.viewLevel;u1=v1.oComponent;}}var w1=u1?Promise.resolve(u1):T.oNavigationControllerProxy.getRootComponentPromise();return w1.then(function(x1){return x1.getModel("i18n").getResourceBundle();});}function Z(){return T.oNavigationControllerProxy.getAppTitle();}function $(i){return T.oNavigationControllerProxy.getCurrentKeys(i);}function _(){for(var i in T.componentRegistry){var s1=T.componentRegistry[i];if(s1.viewLevel===1){if(j(s1.oComponent)){var t1=s1.oComponent.getComponentContainer().getElementBinding();return t1&&t1.getPath();}else{return null;}}}return null;}var a1;function b1(s1,t1){var i=t1||0;if(i>0){return null;}var u1=s1.getEntitySet();var v1=T.mEntityTree[u1];var w1=v1&&v1.communicationObject;for(;i<0&&w1;){v1=T.mEntityTree[v1.parent];if(v1.communicationObject!==w1){i++;w1=v1.communicationObject;}}if(i<0||w1){return w1;}a1=a1||{};return a1;}function c1(i){for(var s1 in T.mEntityTree){if(T.mEntityTree[s1].navigationProperty&&(T.mEntityTree[s1].level===i+1)){return T.mEntityTree[s1].navigationProperty;}}}function d1(){return T.oFlexibleColumnLayoutHandler?T.oFlexibleColumnLayoutHandler.getMaxColumnCountInFCL():false;}function e1(){var s1=T.oNavigationControllerProxy.getActiveComponents();for(var i=0;i<s1.length;i++){var t1=s1[i];var u1=T.componentRegistry[t1];var v1=u1.methods.currentDraftModified&&u1.methods.currentDraftModified();if(v1){o.markDraftAsModified(v1);}}}function f1(){if(E!==undefined){return E;}var i,s1,t1,u1,v1,w1,x1=true;var y1=T.oAppComponent.getModel();var z1=y1.getMetaModel();var A1=y1.mContexts;for(t1 in A1){x1=false;v1=A1[t1].sPath;u1=v1&&v1.substring(1,v1.indexOf('('));w1=u1&&z1.getODataEntitySet(u1);if(w1){i=y1.getProperty(v1);s1=i&&y1.getETag(undefined,undefined,i)||null;if(s1){E=true;return E;}}}if(x1){return true;}E=false;return E;}function g1(s1){var i,t1,u1;var v1=T.oNavigationControllerProxy.getAllComponents();for(i=0;i<v1.length;i++){t1=v1[i];if(!s1||!s1[t1]){u1=T.componentRegistry[t1];u1.utils.refreshBinding(true);}}}function h1(i){if(T.oFlexibleColumnLayoutHandler){T.oFlexibleColumnLayoutHandler.setStoredTargetLayoutToFullscreen(i);}}function i1(){T.oPaginatorInfo={};}function j1(i){return new c(T,i);}function k1(i,s1){return new S(T,i,s1);}function l1(s1,t1){var u1=n[s1];if(!u1){u1=Object.create(null);n[s1]=u1;var v1=T.oAppComponent.getModel();var w1=v1.getMetaModel();var x1=w1.getODataEntitySet(s1);var y1=x1&&w1.getODataEntityType(x1.entityType);var z1=(y1&&y1.navigationProperty)||[];for(var i=0;i<z1.length;i++){var A1=z1[i];u1[A1.name]=A1;}}return u1[t1];}function m1(i){var s1=T.oNavigationControllerProxy.getSwitchToSiblingPromise(i,2);T.oBusyHelper.setBusy(s1.then(function(t1){t1();}));}function n1(i){var s1=T.oNavigationControllerProxy.getSpecialDraftCancelPromise(i);if(s1){return s1;}var t1=o.getDraftSiblingPromise(i);return t1.then(function(u1){var v1=u1&&u1.getObject();var w1=v1&&v1.IsActiveEntity;if(!w1){return Promise.resolve(d.getNavigateAfterDeletionOfCreateDraft(T));}return T.oNavigationControllerProxy.getSwitchToSiblingPromise(u1,1).then(function(x1){return function(){var y1=u1.getModel();y1.invalidateEntry(u1);return x1();};});});}function o1(i){T.oNavigationControllerProxy.navigateAfterActivation(i);}function p1(i,s1,t1,u1){T.oNavigationControllerProxy.navigateToSubContext(i,s1,t1,u1);}function q1(){return!T.bCreateRequestsCanonical;}function r1(){return!T.bCreateRequestsCanonical;}T.oApplicationProxy={getDraftSiblingPromise:o.getDraftSiblingPromise,getSiblingPromise:o.getSiblingPromise,getAlternativeContextPromise:o.getAlternativeContextPromise,getPathOfLastShownDraftRoot:o.getPathOfLastShownDraftRoot,areTwoKnownPathesIdentical:o.areTwoKnownPathesIdentical,getResourceBundleForEditPromise:Y,getHierarchySectionsFromCurrentHash:W,getContentDensityClass:g,setEditableNDC:w,registerNonDraftCreateContext:R,getDialogFragment:l.bind(null,null),destroyView:function(i){delete F[i];},markCurrentDraftAsModified:e1,prepareDeletion:O,performAfterSideEffectExecution:p,mustRequireRequestsCanonical:r1};return{setEditableNDC:w,registerNonDraftCreateContext:R,getEditableNDC:function(){return v;},createNonDraft:x,getContentDensityClass:g,attachControlToParent:f,getDialogFragmentForView:l,getBusyHelper:function(){return T.oBusyHelper;},addSideEffectPromise:k,performAfterSideEffectExecution:p,isComponentActive:j,showMessageToast:function(){var i=arguments;var s1=function(){L.info("Show message toast");M.show.apply(M,i);};Promise.all([q(true),T.oBusyHelper.getUnbusy()]).then(s1);},setBackNavigation:u,isNewHistoryEntryRequired:K,registerStateChanger:N,getDraftSiblingPromise:o.getDraftSiblingPromise,registerContext:o.registerContext,activationStarted:z,cancellationStarted:G,editingStarted:H,getBreadCrumbInfo:V,getSections:U,getHierarchySectionsFromCurrentHash:W,getLinksToUpperLayers:X,getAppTitle:Z,getCurrentKeys:$,getPathForViewLevelOneIfVisible:_,getCommunicationObject:b1,getForwardNavigationProperty:c1,getMaxColumnCountInFCL:d1,markCurrentDraftAsModified:e1,checkEtags:f1,refreshAllComponents:g1,getIsDraftModified:o.getIsDraftModified,prepareDeletion:d.prepareDeletion.bind(null,T),setStoredTargetLayoutToFullscreen:h1,invalidatePaginatorInfo:i1,getStatePreserver:j1,getSaveScenarioHandler:k1,getNavigationProperty:l1,switchToDraft:m1,getNavigateAfterDraftCancelPromise:n1,navigateAfterActivation:o1,navigateToSubContext:p1,needsToSuppressTechnicalStateMessages:q1,mustRequireRequestsCanonical:r1};}return B.extend("sap.suite.ui.generic.template.lib.Application",{constructor:function(T){Object.assign(this,h(T));}});});
