/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/registry/ChangeRegistry","sap/ui/fl/registry/ChangeHandlerRegistration","sap/ui/fl/Utils","sap/ui/fl/LayerUtils","sap/ui/fl/FlexCustomData","sap/ui/fl/write/api/FeaturesAPI","sap/ui/fl/Change","sap/ui/fl/Variant","sap/ui/fl/registry/Settings","sap/ui/fl/LrepConnector","sap/ui/fl/ChangePersistenceFactory","sap/ui/fl/context/ContextManager","sap/ui/core/util/reflection/JsControlTreeModifier","sap/ui/core/util/reflection/XmlTreeModifier","sap/ui/core/Component","sap/ui/core/Element","sap/base/Log","sap/base/util/restricted/_uniqWith","sap/ui/fl/apply/_internal/variants/URLHandler"],function(C,a,U,L,F,b,c,V,d,e,f,g,J,X,h,E,l,_,m){"use strict";var o=function(s,A){this._oChangePersistence=undefined;this._sComponentName=s||"";this._sAppVersion=A||U.DEFAULT_APP_VERSION;if(this._sComponentName&&this._sAppVersion){this._createChangePersistence();}};o.PENDING="sap.ui.fl:PendingChange";o.prototype.setComponentName=function(s){this._sComponentName=s;this._createChangePersistence();};o.prototype.getComponentName=function(){return this._sComponentName;};o.prototype.getAppVersion=function(){return this._sAppVersion;};o.prototype.getVariantModelData=function(){var D;if(this._oChangePersistence&&this._oChangePersistence._oVariantController._mVariantManagement&&Object.keys(this._oChangePersistence._oVariantController._mVariantManagement).length>0){D=this._oChangePersistence._oVariantController.fillVariantModel();}return D;};o.prototype.setVariantSwitchPromise=function(p){this._oVariantSwitchPromise=p;};o.prototype.waitForVariantSwitch=function(){if(!this._oVariantSwitchPromise){this._oVariantSwitchPromise=Promise.resolve();}return this._oVariantSwitchPromise;};o.prototype.createBaseChange=function(i,A){var j;var k;var n=g._getContextIdsFromUrl();if(n.length>1){throw new Error("More than one DesignTime Context is currently active.");}if(!A){throw new Error("No application component found. To offer flexibility a valid relation to its owning component must be present.");}i.reference=this.getComponentName();i.packageName="$TMP";i.context=n.length===1?n[0]:"";i.validAppVersions=U.getValidAppVersions({appVersion:this.getAppVersion(),developerMode:i.developerMode,scenario:i.scenario});j=c.createInitialFileContent(i);k=new c(j);if(i.variantReference){k.setVariantReference(i.variantReference);}return k;};o.prototype.createChange=function(i,j){var A;var k;return Promise.resolve().then(function(){if(!j){throw new Error("A flexibility change cannot be created without a targeted control.");}var s=j.id||j.getId();if(!i.selector){i.selector={};}A=j.appComponent||U.getAppComponentForControl(j);if(!A){throw new Error("No application component found. To offer flexibility, the control with the ID '"+s+"' has to have a valid relation to its owning application component.");}Object.assign(i.selector,J.getSelector(s,A));k=this.createBaseChange(i,A);var n=j.controlType||U.getControlType(j);if(!n){throw new Error("No control type found - the change handler can not be retrieved.");}return this._getChangeHandler(k,n,j,J);}.bind(this)).then(function(n){if(n){n.completeChangeContent(k,i,{modifier:J,appComponent:A});}else{throw new Error("Change handler could not be retrieved for change "+JSON.stringify(i)+".");}return k;});};o.prototype.createVariant=function(v,A){var i;var j;if(!A){throw new Error("No Application Component found - to offer flexibility the variant has to have a valid relation to its owning application component.");}if(v.content.variantManagementReference){var k=J.checkControlId(v.content.variantManagementReference,A);if(!k){throw new Error("Generated ID attribute found - to offer flexibility a stable VariantManagement ID is needed to assign the changes to, but for this VariantManagement control the ID was generated by SAPUI5 "+v.content.variantManagementReference);}}v.content.reference=this.getComponentName();v.content.packageName="$TMP";v.content.validAppVersions=U.getValidAppVersions(this.getAppVersion(),v.developerMode,v.scenario);j=V.createInitialFileContent(v);i=new V(j);return i;};o.prototype.addChange=function(i,j){return this.createChange(i,j).then(function(k){var A=U.getAppComponentForControl(j);this.addPreparedChange(k,A);return k;}.bind(this));};o.prototype.addPreparedChange=function(i,A){if(i.getVariantReference()){var M=A.getModel(U.VARIANT_MODEL_NAME);M.addChange(i);}this._oChangePersistence.addChange(i,A);return i;};o.prototype.deleteChange=function(i,A){this._oChangePersistence.deleteChange(i);if(i.getVariantReference()){A.getModel(U.VARIANT_MODEL_NAME).removeChange(i);}};o.prototype.createAndApplyChange=function(i,j){var k;return Promise.resolve().then(function(){return this.addChange(i,j);}.bind(this)).then(function(A){k=A;var p={modifier:J,appComponent:U.getAppComponentForControl(j),view:U.getViewForControl(j)};k.setQueuedForApply();return this.checkTargetAndApplyChange(k,j,p);}.bind(this)).then(function(r){if(!r.success){var n=r.error||new Error("The change could not be applied.");this._oChangePersistence.deleteChange(k,true);throw n;}return k;}.bind(this));};o.prototype._checkDependencies=function(j,D,k,A,r){var R=this._canChangePotentiallyBeApplied(j,A);if(!R){return[];}r.push(j);var s=j.getId();var p=D[s]&&D[s].dependencies||[];for(var i=0,n=p.length;i<n;i++){var q=U.getChangeFromChangesMap(k,p[i]);R=this._checkDependencies(q,D,k,A,r);if(R.length===0){r=[];break;}delete D[s];}return r;};o.prototype._canChangePotentiallyBeApplied=function(i,A){var s=i.getDependentControlSelectorList();s.push(i.getSelector());return!s.some(function(S){return!J.bySelector(S,A);});};o.prototype.waitForChangesToBeApplied=function(i){var j=this._oChangePersistence.getChangesMapForComponent();var p=[];var D=Object.assign({},j.mDependencies);var k=j.mChanges;var n=k[i.getId()]||[];var N=n.filter(function(q){return!q.isCurrentProcessFinished();},this);var A=U.getAppComponentForControl(i);var r=[];N.forEach(function(q){var s=this._checkDependencies(q,D,j.mChanges,A,[]);s.forEach(function(t){if(r.indexOf(t)===-1){r.push(t);}});}.bind(this));r.forEach(function(q){p=p.concat(q.addChangeProcessingPromises());},this);p.push(this.waitForVariantSwitch());return Promise.all(p).then(function(){return undefined;});};o.prototype.saveAll=function(s){return this._oChangePersistence.saveDirtyChanges(s);};o.prototype.processXmlView=function(v,p){var i=h.get(p.componentId);var A=U.getAppComponentForControl(i);var M=A.getManifest();p.appComponent=A;p.appDescriptor=M;p.modifier=X;p.view=v;return this.processViewByModifier(p);};o.prototype.processViewByModifier=function(p){p.siteId=U.getSiteId(p.appComponent);return this._oChangePersistence.getChangesForView(p.viewId,p).then(this._resolveGetChangesForView.bind(this,p),this._handlePromiseChainError.bind(this,p.view));};o.prototype._checkForDependentSelectorControls=function(i,p){var D=i.getDependentControlSelectorList();D.forEach(function(s){var j=p.modifier.bySelector(s,p.appComponent,p.view);if(!j){throw new Error("A dependent selector control of the flexibility change is not available.");}});};o.prototype._resolveGetChangesForView=function(p,i){var P=[];if(!Array.isArray(i)){var s="No list of changes was passed for processing the flexibility on view: "+p.view+".";l.error(s,undefined,"sap.ui.fl.FlexController");return[];}i.forEach(function(j){try{var S=this._getSelectorOfChange(j);if(!S||!S.id){throw new Error("No selector in change found or no selector ID.");}var k=p.modifier.bySelector(S,p.appComponent,p.view);if(!k){throw new Error("A flexibility change tries to change a nonexistent control.");}this._checkForDependentSelectorControls(j,p);j.setQueuedForApply();P.push(function(){var I=this._isChangeCurrentlyApplied(k,j,p.modifier);var q=j.isApplyProcessFinished();if(q&&!I){j.setInitialApplyState();}else if(!q&&I){j.markFinished();return new U.FakePromise();}return this.checkTargetAndApplyChange(j,k,p).then(function(r){if(!r.success){this._logApplyChangeError(r.error||{},j);}}.bind(this));}.bind(this));}catch(n){this._logApplyChangeError(n,j);}}.bind(this));return U.execPromiseQueueSequentially(P).then(function(){return p.view;});};o.prototype._logApplyChangeError=function(i,j){var D=j.getDefinition();var s=D.changeType;var t=D.selector.id;var k=D.namespace+D.fileName+"."+D.fileType;var w="A flexibility change could not be applied.";w+="\nThe displayed UI might not be displayed as intedend.";if(i.message){w+="\n   occurred error message: '"+i.message+"'";}w+="\n   type of change: '"+s+"'";w+="\n   LRep location of the change: "+k;w+="\n   id of targeted control: '"+t+"'.";l.warning(w,undefined,"sap.ui.fl.FlexController");};o.prototype._isXmlModifier=function(p){return p.modifier.targets==="xmlTree";};o.prototype.checkTargetAndApplyChange=function(i,j,p){var x=this._isXmlModifier(p);var M=p.modifier;var s=M.getControlType(j);var k=this._getControlIfTemplateAffected(i,j,s,p);var r;var n=M.getLibraryName(k.control);var w=new U.FakePromise();if(a.isChangeHandlerRegistrationInProgress(n)){w=a.waitForChangeHandlerRegistration(n);}return w.then(function(){return this._getChangeHandler(i,k.controlType,k.control,M);}.bind(this)).then(function(q){if(!q){var t="Change handler implementation for change not found or change type not enabled for current layer - Change ignored";l.warning(t);r={success:false,error:new Error(t)};i.setInitialApplyState();return r;}if(x&&i.getDefinition().jsOnly){r={success:false,error:new Error("Change cannot be applied in XML. Retrying in JS.")};i.setInitialApplyState();return r;}if(i.hasApplyProcessStarted()){return i.addPromiseForApplyProcessing().then(function(r){i.markFinished();return r;});}else if(!i.isApplyProcessFinished()){return new U.FakePromise().then(function(){i.startApplying();return q.applyChange(i,k.control,p);}).then(function(I){if(I instanceof E){k.control=I;}if(k.control){M.updateAggregation(j,i.getContent().boundAggregation);}F.addAppliedCustomData(k.control,i,p,x);r={success:true};i.markFinished(r);return r;}).catch(function(R){this._logErrorAndWriteCustomData(R,i,p,k.control,x);r={success:false,error:R};if(x){i.setInitialApplyState();}else{i.markFinished(r);}return r;}.bind(this));}r={success:true};i.markFinished(r);return r;}.bind(this));};o.prototype._removeFromAppliedChangesAndMaybeRevert=function(i,j,p,r){var R=Promise.resolve(true);if(r){R=this._revertChange(i,j,p);}return R.then(function(v){this._removeChangeFromControl(v||j,i,p.modifier);return!!v;}.bind(this));};o.prototype._revertChange=function(i,j,p){var M=p.modifier;var s;var k;var I;var n;var q={};return new U.FakePromise().then(function(){if(!j){throw Error("A flexibility change tries to revert changes on a nonexistent control");}k=M.getControlType(j);q=this._getControlIfTemplateAffected(i,j,k,p);}.bind(this)).then(this._getChangeHandler.bind(this,i,q.controlType,q.control,M)).then(function(r){n=r;var t;if(!n){t="Change handler implementation for change not found or change type not enabled for current layer - Change ignored";}else if(!(typeof n.revertChange==="function")){t="No revert change function available to handle revert data for control type "+q.controlType;}if(t){l.error(t);i.markRevertFinished(new Error(t));return new U.FakePromise(false);}if(i.getChangeType()==="stashControl"&&k==="sap.ui.core._StashedControl"){s=true;if(!i.getRevertData()){n.setChangeRevertData(i,false);}}I=i.isApplyProcessFinished();if(!I&&i.hasApplyProcessStarted()){return i.addPromiseForApplyProcessing().then(function(R){if(R&&R.error){i.markRevertFinished(R.error);throw Error(R.error);}return true;});}return false;}).then(function(P){if(P||(!P&&I)||s){if(!i.getRevertData()){i.setRevertData(F.getParsedRevertDataFromCustomData(j,i,M));}i.startReverting();return n.revertChange(i,q.control,p);}throw Error("Change was never applied");}).then(function(){q.control=p.modifier.bySelector(i.getSelector(),p.appComponent,p.view);if(q.bTemplateAffected){M.updateAggregation(q.control,i.getContent().boundAggregation);}i.markRevertFinished();return q.control;}).catch(function(r){var t="Change could not be reverted: "+r.message;l.error(t);i.markRevertFinished(t);return false;});};o.prototype._removeChangeFromControl=function(i,j,M){F.destroyAppliedCustomData(i,j,M);};o.prototype._logErrorAndWriteCustomData=function(r,i,p,j,x){var s=i.getId();var k="Change ''{0}'' could not be applied.";var n=r instanceof Error;var q=F.getCustomDataIdentifier(false,n,x);switch(q){case F.notApplicableChangesCustomDataKey:U.formatAndLogMessage("info",[k,r.message],[s]);break;case F.failedChangesCustomDataKeyXml:U.formatAndLogMessage("warning",[k,"Merge error detected while processing the XML tree."],[s],r.stack);break;case F.failedChangesCustomDataKeyJs:U.formatAndLogMessage("error",[k,"Merge error detected while processing the JS control tree."],[s],r.stack);break;}F.addFailedCustomData(j,i,p,q);};o.prototype._isChangeCurrentlyApplied=function(i,j,M){return F.hasChangeApplyFinishedCustomData(i,j,M);};o.prototype._handlePromiseChainError=function(v,i){l.error("Error processing view "+i+".");return v;};o.prototype._getSelectorOfChange=function(i){if(!i||!i.getSelector){return undefined;}return i.getSelector();};o.prototype._getChangeHandler=function(i,s,j,M){var k=i.getChangeType();var n=i.getLayer();return this._getChangeRegistry().getChangeHandler(k,s,j,M,n);};o.prototype._getChangeRegistry=function(){var i=C.getInstance();i.initSettings();return i;};o.prototype._getControlIfTemplateAffected=function(i,j,s,p){var k=i.getDefinition();var n={};if(i.getContent().boundAggregation&&k.dependentSelector.originalSelector){var M=p.modifier;n.control=M.bySelector(k.dependentSelector.originalSelector,p.appComponent,p.view);n.controlType=M.getControlType(n.control);n.bTemplateAffected=true;}else{n.control=j;n.controlType=s;n.bTemplateAffected=false;}return n;};o.prototype.getComponentChanges=function(p,i){return this._oChangePersistence.getChangesForComponent(p,i);};o.prototype.checkForOpenDependenciesForControl=function(s,M,i){return this._oChangePersistence.checkForOpenDependenciesForControl(s,M,i);};o.prototype.hasHigherLayerChanges=function(p){p=p||{};var s=p.upToLayer||L.getCurrentLayer(false);p.includeVariants=true;p.includeCtrlVariants=true;return this.getComponentChanges(p).then(function(v){var H=v===this._oChangePersistence.HIGHER_LAYER_CHANGES_EXIST||v.some(function(i){return L.compareAgainstCurrentLayer(i.getLayer(),s)>0;});return!!H;}.bind(this));};o.prototype._createChangePersistence=function(){this._oChangePersistence=f.getChangePersistenceForComponent(this.getComponentName(),this.getAppVersion());return this._oChangePersistence;};o.prototype.resetChanges=function(s,G,i,S,j){return this._oChangePersistence.resetChanges(s,G,S,j).then(function(k){if(k.length!==0){return this.revertChangesOnControl(k,i);}}.bind(this)).then(function(){if(i){var M=i.getModel(U.VARIANT_MODEL_NAME);if(M){m.update({parameters:[],updateURL:true,updateHashEntry:true,model:M});}}});};o.prototype.discardChanges=function(i,D){var A=L.getCurrentLayer(!!D);var I=0;var j;var k;j=i.length;while(I<i.length){k=i[I];if(k&&k.getLayer&&k.getLayer()===A){this._oChangePersistence.deleteChange(k);}if(j===i.length){I++;}else{j=i.length;}}return this._oChangePersistence.saveDirtyChanges();};o.prototype.discardChangesForId=function(i,D){if(!i){return Promise.resolve();}var j=this._oChangePersistence.getChangesMapForComponent();var k=j.mChanges[i]||[];return this.discardChanges(k,D);};o.prototype._checkIfDependencyIsStillValid=function(A,M,s){var i=U.getChangeFromChangesMap(this._oChangePersistence._mChanges.mChanges,s);var j=M.bySelector(i.getSelector(),A);if(this._isChangeCurrentlyApplied(j,i,M)||i.hasApplyProcessStarted()){return false;}return true;};o.prototype._applyChangesOnControl=function(G,A,i){var p=[];var s=i.getId();var j=G();var k=j.mChanges;var D=j.mDependencies;var n=j.mControlsWithDependencies;var q=k[s]||[];var P={modifier:J,appComponent:A,view:U.getViewForControl(i)};q.forEach(function(r){var t=J.getControlType(i);var u=this._getControlIfTemplateAffected(r,i,t,P);var I=this._isChangeCurrentlyApplied(u.control,r,P.modifier);var v=r.isApplyProcessFinished();if(v&&!I){j=this._oChangePersistence.copyDependenciesFromInitialChangesMap(r,this._checkIfDependencyIsStillValid.bind(this,A,P.modifier),A);D=j.mDependencies;n=j.mControlsWithDependencies;r.setInitialApplyState();}else if(!v&&I){r.markFinished();}r.setQueuedForApply();if(!D[r.getId()]){p.push(function(){return this.checkTargetAndApplyChange(r,i,P).then(function(){this._updateDependencies(j,r.getId());}.bind(this));}.bind(this));}else{D[r.getId()][o.PENDING]=this.checkTargetAndApplyChange.bind(this,r,i,P);}}.bind(this));if(q.length||n[s]){delete n[s];return U.execPromiseQueueSequentially(p).then(function(){return this._processDependentQueue(j,A);}.bind(this));}return new U.FakePromise();};o.prototype.getBoundApplyChangesOnControl=function(G,i){var B=this._applyChangesOnControl.bind(this,G,i);B._bIsSapUiFlFlexControllerApplyChangesOnControl=true;return B;};o.prototype.revertChangesOnControl=function(i,A){var p=[];i.forEach(function(j){j.setQueuedForRevert();p.push(function(){var s=this._getSelectorOfChange(j);var k=J.bySelector(s,A);if(!k){l.warning("A flexibility change tries to revert changes on a nonexistent control with id "+s.id);return Promise.resolve();}var P={modifier:J,appComponent:A,view:U.getViewForControl(k)};return this._removeFromAppliedChangesAndMaybeRevert(j,k,P,true).then(function(S){if(S){this._oChangePersistence._deleteChangeInMap(j);}}.bind(this));}.bind(this));}.bind(this));return U.execPromiseQueueSequentially(p);};o.prototype.applyVariantChanges=function(i,A){var p=[];var M=J;var j=i.map(function(k){this._oChangePersistence._addChangeAndUpdateDependencies(A,k);return this._getSelectorOfChange(k);}.bind(this));var s=function(S,t){return S.id===t.id;};j=_(j,s);j.forEach(function(S){p.push(function(){var k=M.bySelector(S,A);if(!k){l.error("A flexibility change tries to change a nonexistent control.");return new U.FakePromise();}return this._applyChangesOnControl(this._oChangePersistence.getChangesMapForComponent.bind(this._oChangePersistence),A,k);}.bind(this));}.bind(this));return U.execPromiseQueueSequentially(p);};o.prototype.removeFromAppliedChangesOnControl=function(i,A,j){var p={modifier:J,appComponent:A,view:U.getViewForControl(j)};return this._removeFromAppliedChangesAndMaybeRevert(i,j,p,false);};o.prototype._updateControlsDependencies=function(i,A){var j;Object.keys(i.mDependencies).forEach(function(s){var D=i.mDependencies[s];if(D.controlsDependencies&&D.controlsDependencies.length>0){var k=D.controlsDependencies.length;while(k--){var S=D.controlsDependencies[k];j=J.bySelector(S,A);if(j){D.controlsDependencies.splice(k,1);delete i.mControlsWithDependencies[j.getId()];}}}});};o.prototype._updateDependencies=function(i,s){if(i.mDependentChangesOnMe[s]){i.mDependentChangesOnMe[s].forEach(function(k){var D=i.mDependencies[k];var I=D?D.dependencies.indexOf(s):-1;if(I>-1){D.dependencies.splice(I,1);}});delete i.mDependentChangesOnMe[s];}};o.prototype._iterateDependentQueue=function(i,A){var n=[];var D=[];var p=[];this._updateControlsDependencies(i,A);Object.keys(i.mDependencies).forEach(function(s){var j=i.mDependencies[s];if(j[o.PENDING]&&j.dependencies.length===0&&!(j.controlsDependencies&&j.controlsDependencies.length>0)){p.push(function(){return j[o.PENDING]().then(function(){D.push(s);n.push(j.changeObject.getId());});});}});return U.execPromiseQueueSequentially(p).then(function(){for(var j=0;j<D.length;j++){delete i.mDependencies[D[j]];}for(var k=0;k<n.length;k++){this._updateDependencies(i,n[k]);}return n;}.bind(this));};o.prototype._processDependentQueue=function(i,A){return this._iterateDependentQueue(i,A).then(function(j){if(j.length>0){return this._processDependentQueue(i,A);}}.bind(this));};o.prototype.saveSequenceOfDirtyChanges=function(D){return this._oChangePersistence.saveSequenceOfDirtyChanges(D);};o.prototype.getResetAndPublishInfo=function(p){p.reference=this._sComponentName;p.appVersion=this._sAppVersion;return e.createConnector().getFlexInfo(p);};return o;},true);
