/*!
 * SAPUI5

(c) Copyright 2009-2019 SAP SE. All rights reserved
 */
sap.ui.define(['sap/viz/library','./core/BaseChart','./BulletRenderer'],function(l,B){"use strict";var a=B.extend("sap.viz.ui5.Bullet",{metadata:{library:"sap.viz",aggregations:{general:{type:"sap.viz.ui5.types.RootContainer",multiple:false},interaction:{type:"sap.viz.ui5.types.controller.Interaction",multiple:false},title:{type:"sap.viz.ui5.types.Title",multiple:false},toolTip:{type:"sap.viz.ui5.types.Tooltip",multiple:false},xyContainer:{type:"sap.viz.ui5.types.XYContainer",multiple:false},yAxis:{type:"sap.viz.ui5.types.Axis",multiple:false},background:{type:"sap.viz.ui5.types.Background",multiple:false},plotArea:{type:"sap.viz.ui5.types.Bullet",multiple:false},xAxis2:{type:"sap.viz.ui5.types.Axis",multiple:false},yAxis2:{type:"sap.viz.ui5.types.Axis",multiple:false}},events:{selectData:{},deselectData:{},showTooltip:{deprecated:true},hideTooltip:{deprecated:true},initialized:{}},vizChartType:"viz/bullet"}});return a;});
