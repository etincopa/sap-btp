sap.ui.define(["sap/ui/core/mvc/Controller","sap/suite/ui/generic/template/listTemplates/listUtils","sap/base/Log","sap/base/util/merge","sap/ui/Device"],function(C,l,L,m,D){"use strict";var c=C.extend("sap.suite.ui.generic.template.AnalyticalListPage.controller.SmartChartController",{setState:function(s){this.triggeredByTableSort=false;this.tableSortSelection;this._selectFilterByMeasure=false;this.oState=s;s.oSmartChart.attachInitialized(this._onSmartChartInit,this);s.oSmartChart.attachBeforeRebindChart(this._onBeforeRebindChart,this);s.oSmartChart.attachDataReceived(this._onDataReceived,this);},_onBeforeRebindChart:function(E){if(this.triggeredByTableSort&&this.tableSortSelection){var v=this.oState.oSmartChart.fetchVariant();if(this.tableSortSelection.length>0){v.sort={};v.sort.sortItems=[];for(var i=0;i<(this.tableSortSelection.length);i++){E.mParameters.bindingParams.sorter.push(this.tableSortSelection[i]);v.sort.sortItems.push({columnKey:this.tableSortSelection[i].sPath,operation:this.tableSortSelection[i].bDescending?"Descending":"Ascending"});}}else{E.mParameters.bindingParams.sorter=this.tableSortSelection;if(v.sort){delete v.sort;}}this.oState.oSmartChart.applyVariant(v);this.triggeredByTableSort=false;}if(this.oState.oSmartFilterbar&&this.oState.oSmartFilterbar.getAnalyticBindingPath&&this.oState.oSmartFilterbar.getConsiderAnalyticalParameters()){try{var a=this.oState.oSmartFilterbar.getAnalyticBindingPath();if(a){this.oState.oSmartChart.setChartBindingPath(a);}}catch(e){L.warning("Mandatory parameters have no values","","AnalyticalListPage");}}this.oState.oController.onBeforeRebindChartExtension(E);this.oState.oTemplateUtils.oCommonUtils.onBeforeRebindTableOrChart(E,{addExtensionFilters:this.oState.oController.templateBaseExtension.addFilters,isAnalyticalListPage:true},this.oState.oSmartFilterbar);l.handleErrorsOnTableOrChart(this.oState.oTemplateUtils,E);},_onDataReceived:function(e){if(!this.oState.oSmartChart.getToolbar().getEnabled()){this.oState.oContentArea.enableToolbar();}this.oState.oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(e.getSource());},_onSmartChartInit:function(e){var s=this.oState;var E=m({},e);s.oSmartChart.getChartAsync().then(function(o){this.oChart=o;if(D.browser.safari){s.oSmartChart.setHeight("50vH");}else{s.oSmartChart.setHeight("100%");}o.setHeight("100%");this._chartInfo={};this._chartInfo.drillStack=this.oChart.getDrillStack();s.oSmartChart.attachShowOverlay(function(a){s.oSmartChart.getToolbar().setEnabled(!a.getParameter("overlay").show);},this);this.oState.oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(E.getSource());this.oState.oTemplateUtils.oCommonUtils.checkToolbarIntentsSupported(E.getSource());this.oChart.attachSelectData(this._onChartSelectData,this);this.oChart.attachDeselectData(this._onChartDeselectData,this);this.oState.oSmartChart.attachChartDataChanged(this._onPersonalisationDimeasureChange,this);if(this.oState._pendingChartToolbarInit&&this.oState.oSmartTable){if(!this.oState.oSmartFilterableKPI){this.oState.oSmartChart.getToolbar().insertContent(this.oState.alr_viewSwitchButtonOnChart,this.oState.oSmartChart.getToolbar().getContent().length);}}delete this.oState._pendingChartToolbarInit;this._changeValueAxisTitleVisibility();this.oChart.setVizProperties({"legendGroup":{"layout":{"position":"bottom"}},"categoryAxis":{"layout":{"maxHeight":0.5}}});this.oState.oSmartChart.attachSelectionDetailsActionPress(function(a){var b=a.getSource();var d=a.getParameter("itemContexts")&&a.getParameter("itemContexts")[0];s.oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function(){if(!d){L.error("Binding context for the selected chart item is missing");return;}if(b.data("CrossNavigation")){s.oTemplateUtils.oCommonEventHandlers.onEditNavigateIntent(b,d,s.oSmartFilterbar,s.oSmartChart.oChart);return;}s.oTemplateUtils.oCommonUtils.navigateFromListItem(d,s.oSmartChart);},jQuery.noop,s);});L.info("Smart Chart Annotation initialized");}.bind(this));},_onChartSelectData:function(e){this.oState.oController.getOwnerComponent().getModel("_templPriv").setProperty('/alp/_ignoreChartSelections',(e.getId()==="chartDataChanged"));var a=this.oChart;this._chartInfo.drillStack=a.getDrillStack();var v=a._getVizFrame().vizSelection();if(v){this._chartInfo.vizSelection=v;this._chartInfo.chartSelectionBehavior=this.oChart.getSelectionBehavior();this._chartInfo.chartSelection=this.oState.oTemplateUtils.oCommonUtils.getSelectionPoints(a,this._chartInfo.chartSelectionBehavior);var s=this._chartInfo.chartSelection.dataPoints;this._lastSelected=this._getLastSel(s,this._lastSelectedList);this._lastSelectedList=s;}this._updateTable();this.oState.oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(e.getSource(),this._chartInfo.chartSelectionBehavior,this._chartInfo.chartSelection);this.oState.oIappStateHandler.fnStoreCurrentAppStateAndAdjustURL();},_onPersonalisationDimeasureChange:function(e){var o=e.getParameters().changeTypes;if(o.dimeasure&&!o.filter&&!o.sort){this._onChartSelectData(e);}this._changeValueAxisTitleVisibility();},_getLastSel:function(n,o){var b=this.oChart;var d=this.oState.detailController&&this.oState.detailController._getSelParamsFromDPList(n);var e=this.oState.detailController&&this.oState.detailController._getSelParamsFromDPList(o);if(d){for(var i=0;i<d.length;i++){var f=d[i];var g=false;for(var j=0;j<e.length;j++){var h=e[j];g=true;for(var a in h){if(a.indexOf("__")!=-1){continue;}if(f[a]!=h[a]){g=false;break;}}if(g){break;}}if(!g){var k=b.getVisibleDimensions();var p={};for(var j=0;j<k.length;j++){var q=k[j];p[q]=f[q];}return p;}}}return null;},_onChartDeselectData:function(e){var a=this;this._lastSelected=null;var E=jQuery.extend(true,{},e);setTimeout(function(){var d=a.oChart;if(a._chartInfo.chartSelection.count==0){a._updateTable();}else if(d.getSelectionMode()=="MULTIPLE"){a._onChartSelectData(E);}},1);var b=e.getParameter("oSource");if(b&&b instanceof sap.m.Link&&b.getParent()instanceof sap.m.Breadcrumbs){a._onChartDrilledUp(e);}this.oState.oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(e.getSource());this.oState.oTemplateUtils.oCommonUtils.setEnabledFooterButtons(e.getSource());},_onChartDrilledUp:function(e){this._updateTable();},_onChartDrilledDown:function(e){this._updateTable();},_updateTable:function(){var a=this.oChart;if(!a){return;}var d=[];var v=this._chartInfo.vizSelection;v=v||a._getVizFrame().vizSelection();if(v&&v.length){d=this._chartInfo.chartSelection.dataPoints;}if(!d||d.length==0){this._lastSelected=null;}if(this.oState.detailController){this.oState.detailController.applyParamsToTable();}},_changeValueAxisTitleVisibility:function(e){if(this.oChart.getChartType().indexOf("dual_")==0){this.oChart.setVizProperties({"valueAxis":{"title":{"visible":true}}});}else{this.oChart.setVizProperties({"valueAxis":{"title":{"visible":false}}});}}});return c;});
