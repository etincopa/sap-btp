/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils","sap/suite/ui/generic/template/changeHandler/generic/RemoveElement"],function(U,R){"use strict";var a={};var F="com.sap.vocabularies.UI.v1.CollectionFacet";a.applyChange=function(c,C,p){R.applyChange(c,C,p);};a.revertChange=function(c,C,p){};a.completeChangeContent=function(c,s,p){s.custom={};s.custom.annotation=F;s.custom.fnPerformCustomRemove=U.fnRemoveSubSection;R.completeChangeContent(c,s,p);};return a;},true);
