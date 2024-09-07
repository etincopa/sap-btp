// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/JSView","sap/ushell/components/tiles/indicatorTileUtils/oData4Analytics","sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil","sap/suite/ui/microchart/AreaMicroChartItem","sap/suite/ui/microchart/AreaMicroChartPoint","sap/suite/ui/microchart/AreaMicroChartLabel","sap/m/library","sap/suite/ui/microchart/AreaMicroChart","sap/m/GenericTile","sap/ui/model/json/JSONModel"],function(J,o,s,A,a,b,M,c,G,d){"use strict";var L=M.LoadState;sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");sap.ui.jsview("sap.ushell.components.tiles.indicatorArea.AreaChartTile",{getControllerName:function(){return"sap.ushell.components.tiles.indicatorArea.AreaChartTile";},createContent:function(){this.setHeight("100%");this.setWidth("100%");var h="Lorem ipsum";var e="Lorem ipsum";var S=M.Size;var t=sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.getViewData().chip);if(t.title&&t.subTitle){h=t.title;e=t.subTitle;}var f=function(n){return new A({color:"Good",points:{path:"/"+n+"/data",template:new a({x:"{day}",y:"{balance}"})}});};var g=function(n){return new b({label:"{/"+n+"/label}",color:"{/"+n+"/color}"});};var i={subheader:e,header:h,footerNum:"",footerComp:"",scale:"",unit:"",value:8888,size:"Auto",frameType:"OneByOne",state:L.Loading};this.oNVConfContS=new c({width:"{/width}",height:"{/height}",size:S.Responsive,target:f("target"),innerMinThreshold:f("innerMinThreshold"),innerMaxThreshold:f("innerMaxThreshold"),minThreshold:f("minThreshold"),maxThreshold:f("maxThreshold"),chart:f("chart"),minXValue:"{/minXValue}",maxXValue:"{/maxXValue}",minYValue:"{/minYValue}",maxYValue:"{/maxYValue}",firstXLabel:g("firstXLabel"),lastXLabel:g("lastXLabel"),firstYLabel:g("firstYLabel"),lastYLabel:g("lastYLabel"),minLabel:g("minLabel"),maxLabel:g("maxLabel")});this.oNVConfS=new sap.ushell.components.tiles.sbtilecontent({unit:"{/unit}",size:"{/size}",footer:"{/footerNum}",content:this.oNVConfContS});this.oGenericTile=new G({subheader:"{/subheader}",frameType:"{/frameType}",size:"{/size}",header:"{/header}",tileContent:[this.oNVConfS]});var j=new d();j.setData(i);this.oGenericTile.setModel(j);return this.oGenericTile;}});},true);
