/*
 * ! OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/ChangesController","sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory","sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory","sap/base/Log","sap/ui/core/Component","sap/ui/core/Element","sap/base/util/includes","sap/ui/core/util/reflection/JsControlTreeModifier","sap/base/util/restricted/_omit"],function(C,D,a,L,b,E,i,J,_){"use strict";var c={create:function(p){var f;if(i(D.getDescriptorChangeTypes(),p.changeSpecificData.changeType)){f=C.getDescriptorFlexControllerInstance(p.selector);var r=f.getComponentName();var l;if(p.changeSpecificData.layer){l=p.changeSpecificData.layer;delete p.changeSpecificData.layer;}return D.createDescriptorInlineChange(p.changeSpecificData.changeType,p.changeSpecificData.content,p.changeSpecificData.texts).then(function(A){return new a().createNew(r,A,l,p.selector);}).catch(function(e){L.error("the change could not be created.",e.message);throw e;});}f=C.getFlexControllerInstance(p.selector);if(p.selector instanceof b){return f.createBaseChange(p.changeSpecificData,p.selector);}return f.createChange(p.changeSpecificData,p.selector);},apply:function(p){var f=C.getFlexControllerInstance(p.element);p.appComponent=C.getAppComponentForSelector(p.element);if(!p.modifier){p.modifier=J;}var d=f.checkForOpenDependenciesForControl(p.change.getSelector(),p.modifier,p.appComponent);if(!d&&p.element instanceof E){return f.checkTargetAndApplyChange(p.change,p.element,_(p,["element","change"]));}return Promise.reject(new Error("The following Change cannot be applied because of a dependency: "+p.change.getId()));},revert:function(p){var A;if(p.element instanceof E){A=C.getAppComponentForSelector(p.element);}var r={modifier:J,appComponent:A};return C.getFlexControllerInstance(p.element||{})._revertChange(p.change,p.element,r);}};return c;},true);
