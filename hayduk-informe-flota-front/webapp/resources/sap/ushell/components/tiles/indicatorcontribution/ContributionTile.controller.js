jQuery.sap.require("sap.ushell.components.tiles.generic");(function(){"use strict";sap.ushell.components.tiles.generic.extend("sap.ushell.components.tiles.indicatorcontribution.ContributionTile",{onInit:function(){this.KPI_VALUE_REQUIRED=false;},_processDataForComparisonChart:function(d,m,a,u){var s=this.oConfig.TILE_PROPERTIES.semanticColorContribution;var f=[];var t;var b;for(var i=0;i<d.results.length;i++){var g=d.results[i];var h={};try{h.title=g[a].toString();}catch(e){h.title="";}h.value=Number(g[m]);var j=Number(g[m]);if(this.oConfig.EVALUATION.SCALING==-2){j*=100;}var c=this.isCurrencyMeasure(m);b=g[u];t=sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(j,this.oConfig.EVALUATION.SCALING,this.oConfig.EVALUATION.DECIMAL_PRECISION,c,b);h.displayValue=t.toString();if(typeof s==='undefined'){h.color="Neutral";}else{h.color=s;}if(h&&u){h[u]=b;}f.push(h);}return f;},fetchChartData:function(r,i,s,E){var t=this;try{var u=this.oConfig.EVALUATION.ODATA_URL;var a=this.oConfig.EVALUATION.ODATA_ENTITYSET;t.setThresholdValues();if(this.oConfig.TILE_PROPERTIES.semanticMeasure){var m=this.oConfig.EVALUATION.COLUMN_NAME+","+this.oConfig.TILE_PROPERTIES.semanticMeasure;}else{var m=this.oConfig.EVALUATION.COLUMN_NAME;}var b=null;var d=this.oConfig.TILE_PROPERTIES.dimension;this.oConfig.EVALUATION_VALUES;var c=sap.ushell.components.tiles.indicatorTileUtils.util.getBoolValue(r);var f=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id);if(sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(t.oConfig)){if(f){var g=f.Data&&JSON.parse(f.Data);}}var h=t.oTileApi.configuration.getParameterValueAsString("timeStamp");var j=sap.ushell.components.tiles.indicatorTileUtils.util.isCacheValid(t.oConfig.TILE_PROPERTIES.id,h,t.chipCacheTime,t.chipCacheTimeUnit,t.tilePressed);if((g&&!g.rightData)||!f||(!j&&t.oTileApi.visible.isVisible())||c||(i&&t.oTileApi.visible.isVisible())||t.getView().getViewData().refresh){if(t.kpiValueFetchDeferred){t.kpiValueFetchDeferred=false;var v=sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.oConfig.EVALUATION_FILTERS,this.oConfig.ADDITIONAL_FILTERS);var o={};o["0"]=m+",asc";o["1"]=m+",desc";o["2"]=d+",asc";o["3"]=d+",desc";var k=o[this.oConfig.TILE_PROPERTIES.sortOrder||"0"].split(",");var l=sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(t.oRunTimeODataModel,a,m,d,v,3);if(this.oConfig.TILE_PROPERTIES.semanticMeasure){l.uri+="&$top=3&$orderby="+k[0]+" "+k[2];}else{l.uri+="&$top=3&$orderby="+k[0]+" "+k[1];}this.comparisionChartODataRef=l.model.read(l.uri,null,null,true,function(q){t.kpiValueFetchDeferred=true;var w={};if(q&&q.results&&q.results.length){if(l.unit[0]){t._updateTileModel({unit:q.results[0][l.unit[0].name]});b=l.unit[0].name;w.unit=l.unit[0];w.unit.name=l.unit[0].name;}d=sap.ushell.components.tiles.indicatorTileUtils.util.findTextPropertyForDimension(t.oTileApi.url.addSystemToServiceUrl(u),a,d);w.dimension=d;t.oConfig.TILE_PROPERTIES.FINALVALUE=q;t.oConfig.TILE_PROPERTIES.FINALVALUE=t._processDataForComparisonChart(t.oConfig.TILE_PROPERTIES.FINALVALUE,m.split(",")[0],d,b);w.data=t.oConfig.TILE_PROPERTIES.FINALVALUE;w.isCurM=t.isACurrencyMeasure(t.oConfig.EVALUATION.COLUMN_NAME);var x={};t.cacheTime=sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate();x.ChipId=t.oConfig.TILE_PROPERTIES.id;x.Data=JSON.stringify(w);x.CacheMaxAge=Number(t.chipCacheTime);x.CacheMaxAgeUnit=t.chipCacheTimeUnit;x.CacheType=1;var y=t.getLocalCache(x);t.updateDatajobScheduled=false;var z=t.oConfig.TILE_PROPERTIES.id+"data";var A=sap.ushell.components.tiles.indicatorTileUtils.util.getScheduledJob(z);if(A){clearTimeout(A);A=undefined;}if(!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(t.oConfig)){sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(t.oConfig.TILE_PROPERTIES.id,y);var U=false;if(f){U=true;}if(t.chipCacheTime){sap.ushell.components.tiles.indicatorTileUtils.util.writeFrontendCacheByChipAndUserId(t.oTileApi,t.oConfig.TILE_PROPERTIES.id,x,U,function(q){if(q){t.cacheTime=q&&q.CachedTime;sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(t.oConfig.TILE_PROPERTIES.id,q);}if(t.chipCacheTime&&!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(t.oConfig)){jQuery.proxy(t.setTimeStamp(t.cacheTime),t);}});}}else{var B=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id);if(B){if(!B.CachedTime){B.CachedTime=sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate();}var C=B.Data;if(C){C=JSON.parse(C);if(t.oKpiTileView.getViewName()=="tiles.indicatornumeric.NumericTile"){C.leftData=w;}else{C.rightData=w;}}B.Data=JSON.stringify(C);sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(t.oConfig.TILE_PROPERTIES.id,B);}else{var C={};C.rightData=w;y.Data=JSON.stringify(C);sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(t.oConfig.TILE_PROPERTIES.id,y);}t.cacheWriteData=w;}s.call(t,t.oConfig.TILE_PROPERTIES.FINALVALUE);}else if(q.results.length==0){t.oConfig.TILE_PROPERTIES.FINALVALUE=q;if(sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id)){w=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id);w.data=q;}else{w.data=q;}sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(t.oConfig.TILE_PROPERTIES.id,w);s.call(t,t.oConfig.TILE_PROPERTIES.FINALVALUE);t.setNoData();}else{sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(t.oConfig.TILE_PROPERTIES.id,{empty:"empty"});t.setNoData();}},function(q){t.kpiValueFetchDeferred=true;if(q&&q.response){jQuery.sap.log.error(q.message+" : "+q.request.requestUri);E.call(t,q);}});}}else{if(f&&f.Data){var n;var p=t.oConfig&&t.oConfig.TILE_PROPERTIES&&t.oConfig.TILE_PROPERTIES.tileType;if(p.indexOf("DT-")==-1){n=f.Data&&JSON.parse(f.Data);}else{n=f.Data&&JSON.parse(f.Data);n=n.rightData;}t.cacheTime=f.CachedTime;if(t.chipCacheTime&&!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(t.oConfig)){jQuery.proxy(t.setTimeStamp(t.cacheTime),t);}if(n.data&&n.data.length){if(n.unit){t._updateTileModel({unit:n.data[0][n.unit.name]});}d=n.dimension;t.oConfig.TILE_PROPERTIES.FINALVALUE=n.data;s.call(t,t.oConfig.TILE_PROPERTIES.FINALVALUE);}else if(n&&n.data&&n.data instanceof Array&&n.data.length==0){t.oConfig.TILE_PROPERTIES.FINALVALUE=n.data;s.call(t,t.oConfig.TILE_PROPERTIES.FINALVALUE);t.setNoData();}else{t.setNoData();}}else{t.setNoData();}}}catch(e){t.kpiValueFetchDeferred=true;E.call(t,e);}},doProcess:function(r,i){var t=this;this.DEFINITION_DATA=this.oConfig;this._updateTileModel(this.DEFINITION_DATA);this.setTextInTile();this.fetchChartData(r,i,function(k){this.CALCULATED_KPI_VALUE=k;this._updateTileModel({data:this.CALCULATED_KPI_VALUE});if(t.oConfig.TILE_PROPERTIES.frameType==sap.m.FrameType.TwoByOne){t.oKpiTileView.oGenericTile.setFrameType(sap.m.FrameType.TwoByOne);t.oKpiTileView.oGenericTile.removeAllTileContent();t.getView().getViewData().parentController._updateTileModel(this.getTile().getModel().getData());t.getView().getViewData().deferredObj.resolve();}else{t.oKpiTileView.oGenericTile.setFrameType(sap.m.FrameType.OneByOne);t.oKpiTileView.oGenericTile.removeAllTileContent();t.oKpiTileView.oGenericTile.addTileContent(t.oKpiTileView.oNVConfS);this.oKpiTileView.oGenericTile.setState(sap.m.LoadState.Loaded);}this.setToolTip(null,this.CALCULATED_KPI_VALUE,"CONT");if(this.chipCacheTime&&!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(this.oConfig)){sap.ushell.components.tiles.indicatorTileUtils.util.scheduleFetchDataJob.call(this,this.oTileApi.visible.isVisible());}},this.logError);},doDummyProcess:function(){var t=this;t.setTextInTile();t._updateTileModel({value:8888,size:sap.m.Size.Auto,frameType:sap.m.FrameType.OneByOne,state:sap.m.LoadState.Loading,valueColor:sap.m.ValueColor.Error,indicator:sap.m.DeviationIndicator.None,title:"US Profit Margin",footer:"Current Quarter",description:"Maximum deviation",data:[{title:"Americas",value:10,color:"Neutral"},{title:"EMEA",value:50,color:"Neutral"},{title:"APAC",value:-20,color:"Neutral"}]});this.oKpiTileView.oGenericTile.setState(sap.m.LoadState.Loaded);}});}());
