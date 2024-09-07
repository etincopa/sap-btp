/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/modeler/ui/utils/constants"],function(m){'use strict';var p=m.propertyTypes;var R=function(r,s,o,v){this.oRepresentationView=r;this.oRepresentation=o.oRepresentation;this.oStepPropertyMetadataHandler=s;this.oRepresentationTypeHandler=o.oRepresentationTypeHandler;this.oRepresentationHandler=o;this.nCounter=0;this.oViewValidator=v;this.propertyTypeHandlerPromises=[];};function _(r,P,f){var v,V={},o={};if(f.length===0){return;}o.oConfigurationEditor=r.oRepresentationView.getViewData().oConfigurationEditor;o.oParentObject=r.oRepresentation;o.oCoreApi=r.oRepresentationView.getViewData().oCoreApi;o.oConfigurationHandler=r.oRepresentationView.getViewData().oConfigurationHandler;o.oRepresentationTypeHandler=r.oRepresentationTypeHandler;o.oRepresentationHandler=r.oRepresentationHandler;o.oStepPropertyMetadataHandler=r.oStepPropertyMetadataHandler;o.sPropertyType=P;o.oBasicDataLayout=r.oRepresentationView.getController().byId("idBasicDataLayout");o.oTextPool=r.oRepresentationView.getViewData().oConfigurationHandler.getTextPool();o.oViewValidator=r.oViewValidator;V.oViewDataForPropertyType=o;V.aPropertiesToBeCreated=f;v=new sap.ui.view({viewName:"sap.apf.modeler.ui.view.propertyTypeHandler",type:sap.ui.core.mvc.ViewType.XML,id:r.oRepresentationView.getController().createId("id"+P),viewData:V});r.oRepresentationView.getController().byId("idBasicDataLayout").insertItem(v,r.nCounter);r.nCounter++;r.oRepresentationView.attachEvent(m.events.REMOVEALLPROPERTIESFROMPARENTOBJECT,v.getController().handleRemoveOfProperty.bind(v.getController()));r.propertyTypeHandlerPromises.push(v.getController().initPromise);}function a(r){_(r,p.DIMENSION,r.oRepresentationHandler.getActualDimensions());}function b(r){_(r,p.LEGEND,r.oRepresentationHandler.getActualLegends());}function c(r){_(r,p.MEASURE,r.oRepresentationHandler.getActualMeasures());}function d(r){_(r,p.PROPERTY,r.oRepresentationHandler.getActualProperties());}function e(r){_(r,p.HIERARCHIALCOLUMN,r.oRepresentationHandler.getHierarchicalProperty());}R.prototype.instantiateBasicDataAsPromise=function(){this.destroyBasicData();if(this.oRepresentation.getRepresentationType()==="TreeTableRepresentation"){e(this);d(this);}else if(this.oRepresentation.getRepresentationType()==="TableRepresentation"){d(this);}else{a(this);b(this);c(this);}return jQuery.when.apply(jQuery,this.propertyTypeHandlerPromises);};R.prototype.destroyBasicData=function(){this.oViewValidator.clearFields();this.nCounter=0;this.oRepresentationView.getController().byId("idBasicDataLayout").destroyItems();};return R;});
