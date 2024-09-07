/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","./SvgBase","sap/ui/core/ResizeHandler","./GraphMapRenderer"],function(q,S,R,G){"use strict";var N=4;var r=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var a=S.extend("sap.suite.ui.commons.networkgraph.GraphMap",{metadata:{library:"sap.suite.ui.commons",properties:{height:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:""},width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:""},directRenderNodeLimit:{type:"int",group:"Behavior",defaultValue:250},title:{type:"string",group:"Misc",defaultValue:""}},associations:{graph:{type:"sap.suite.ui.commons.networkgraph.Graph",multiple:false,singularName:"graph"}},events:{mapReady:{}}}});a.prototype.init=function(){this._oResizeListener=null;this.setBusyIndicatorDelay(0);};a.prototype.onAfterRendering=function(){var g=this.getGraph();if(g&&g._bIsLayedOut){this._renderMap();}else{this.setBusy(true);}};a.prototype._renderMap=function(){var g=this.getGraph();if(!g){return;}var v,i,b,s,$,c,d,t=this,z=g._fZoomLevel,I=g.getNodes().length===0,u=g._isUseNodeHtml();var f=function(j){var k="";j.forEach(function(o){k+=o._render({mapRender:true,idSufix:t.getId()});});return k;};var C=function(n,w){var o=sap.ui.getCore().createRenderManager();n.forEach(function(j){j._render({mapRender:true,renderManager:o,idSufix:t.getId()});});o.flush(w);o.destroy();};var e=function(){var o=sap.ui.getCore().createRenderManager();g.getGroups().forEach(function(j){j._render({mapRender:true,renderManager:o,idSufix:t.getId()});});o.flush(this.getDomRef("divgroups"));o.destroy();}.bind(this);var h=function(j){s+=this._renderControl("rect",{x:N/2,y:N/2,width:Math.min((g.$scroller.width()-N/2)/z,(g.$svg.width()-N/2)/z),height:Math.min((g.$scroller.height()-N/2)/z,(g.$svg.height()-N/2)/z),"class":j,id:this._getDomId("mapNavigator")});}.bind(this);if(!g._iWidth||!g._iHeight||I){if(g._bIsInvalid||I){this.setBusy(false);this.$().find(".sapSuiteUiCommonsNetworkGraphMapContent").html("");this.fireMapReady();}return;}v=g.$("networkGraphSvg").attr("viewBox");if(!v){v="0 0 "+g._iWidth+" "+g._iHeight;}s="<svg class=\"sapSuiteUiCommonsNetworkGraphMapSvg\" width=\"100%\" height=\"100%\" viewBox=\""+v+"\" "+"id=\""+this._getDomId("svg")+"\"";if(g._bIsRtl){s+=" direction =\"rtl\"";}s+=" >";if(this._useGraphClone()){s+=this._renderControl("use",{"xlink:href":"#"+g._getDomId("svgbody")});}else{s+=f(g.getLines());if(!u){s+=f(g.getNodes());}}s+=this._renderControl("rect",{x:0,y:0,width:g._iWidth,height:g._iHeight,"class":"sapSuiteUiCommonsNetworkGraphMapBoundary","pointer-events":"fill"});if(!u){h("sapSuiteUiCommonsNetworkGraphMapNavigator");}s+="</svg>";s+="<div id=\""+this._getDomId("divgroups")+"\" class=\"sapSuiteUiCommonsNetworkGraphMapDivGroups\"";if(sap.ui.getCore().getConfiguration().getRTL()){s+="style=\"left:0\"";}s+="></div>";if(u){s+="<div id=\""+this._getDomId("divnodes")+"\" class=\"sapSuiteUiCommonsNetworkGraphMapDivNodes\"";if(sap.ui.getCore().getConfiguration().getRTL()){s+="style=\"left:0\"";}s+=">";s+="</div>";s+="<svg class=\"sapSuiteUiCommonsNetworkGraphSvgNavigator\" width=\"100%\" height=\"100%\" viewBox=\""+v+"\">";h("sapSuiteUiCommonsNetworkGraphMapNavigator");s+="</svg>";}this.$().find(".sapSuiteUiCommonsNetworkGraphMapContent").html(s);e();if(u){var D=this.getDomRef("divnodes");C(g.getNodes(),D);}$=this.$("svg");i=g._iWidth;b=g._iHeight;c=Math.max(i/$.width(),b/$.height());this._setHtmlNodesPosition(c);d=Math.ceil(c/5);this._iStrokeWidth=d;this._correctLineWidth();this.$("svg").find("circle").css("stroke-width",d);this._setupEvents();this._correctPosition();this.setBusy(false);this.fireMapReady();};a.prototype._setHtmlNodesPosition=function(i){var g=this.getGraph(),$=this.$("svg"),c=1/i,t,T;t=Math.floor(($.width()/2)-((g._iWidth/2)*c));T=Math.floor(($.height()/2)-((g._iHeight/2)*c));this.$("divgroups").css("transform","matrix("+c+", 0, 0, "+c+", "+t+", "+T+")");if(g._isUseNodeHtml){this.$("divnodes").css("transform","matrix("+c+", 0, 0, "+c+", "+t+", "+T+")");}};a.prototype._useGraphClone=function(){var l=this.getDirectRenderNodeLimit(),g=this.getGraph();if(g){return l>g.getNodes().length&&!g._isUseNodeHtml();}return false;};a.prototype._correctLineWidth=function(g){var g=this.getGraph(),c=this._isMSBrowser()||(!this._useGraphClone()||g._preventZoomToChangeLineWidth());this.$("svg").css("stroke-width",c?this._iStrokeWidth:"1");};a.prototype._correctMapNavigator=function(){var $=this.$("mapNavigator"),w=parseFloat($.attr("width")),h=parseFloat($.attr("height")),x=parseFloat($.attr("x")),y=parseFloat($.attr("y")),g=this.getGraph(),i=g._iWidth,b=g._iHeight;if(w+x>i){$.attr("width",i-x);}if(h+y>b){$.attr("height",b-y);}};a.prototype._resize=function(){var g=this.getGraph(),$=g.$scroller,b=this.$("mapNavigator");b.attr("x",Math.max(N/2,$[0].scrollLeft/g._fZoomLevel));b.attr("y",Math.max(N/2,$[0].scrollTop/g._fZoomLevel));b.attr("width",$.width()/g._fZoomLevel);b.attr("height",$.height()/g._fZoomLevel);this._correctLineWidth();this._correctMapNavigator();};a.prototype._resizeHandler=function(){this._resize();var g=this.getGraph();if(g._isUseNodeHtml()){var $=this.$("svg"),b=this.getGraph().$svg;if(b){var i=Math.max(b.width()/$.width(),b.height()/$.height())*(1/g._fZoomLevel);this._setHtmlNodesPosition(i);}}};a.prototype._correctPosition=function(){var g=this.getGraph(),$=g&&g.$scroller,b=this.$("mapNavigator");if(g&&$[0]){b.attr("x",Math.max(N/2,$[0].scrollLeft/g._fZoomLevel));b.attr("y",Math.max(N/2,$[0].scrollTop/g._fZoomLevel));this._correctMapNavigator();}};a.prototype._setupEvents=function(){var d=false,g=this.getGraph(),$=this.$("svg"),b=g.$scroller;var s=function(o){var c=g.$svg,i=Math.max(c.width()/$.width(),c.height()/$.height()),f=$.find(".sapSuiteUiCommonsNetworkGraphMapBoundary"),h=b[0],j=f.offset().left,k=f.offset().top;h.scrollLeft=(o.pageX-j)*i-(b.width()/2);h.scrollTop=(o.pageY-k)*i-(b.height()/2);};var e=function(){$.removeClass("sapSuiteUiCommonsNetworkGraphPanning");d=false;};b.scroll(function(){this._correctPosition();}.bind(this));$.off();$.mousedown(function(E){d=true;s(E);E.preventDefault();});$.mousemove(function(E){if(d){if(!$.hasClass("sapSuiteUiCommonsNetworkGraphPanning")){$.addClass("sapSuiteUiCommonsNetworkGraphPanning");}s(E);}});$.mouseleave(function(E){e();});$.mouseup(function(E){e();});};a.prototype._onBeforeDataProcess=function(){if(this.getDomRef("svg")){this.$("svg").html("");this.setBusy(true);}};a.prototype._onGraphReady=function(){setTimeout(this._renderMap.bind(this),0);if(this._oResizeListener){R.deregister(this._oResizeListener);}this._oResizeListener=R.register(this.getGraph().$("wrapper")[0],q.proxy(this._resizeHandler,this));};a.prototype._removeListeners=function(){var g=this.getGraph();if(g){g.detachBeforeLayouting(this._onBeforeDataProcess,this);g.detachGraphReady(this._onGraphReady,this);g.detachZoomChanged(this._resize,this);}};a.prototype.destroy=function(){this._removeListeners();S.prototype.destroy.apply(this,arguments);};a.prototype.exit=function(){if(this._oResizeListener){R.deregister(this._oResizeListener);this._oResizeListener=null;}};a.prototype.getTitle=function(){var t=this.getProperty("title");return t?t:r.getText("NETWORK_GRAPH_MAP_TITLE");};a.prototype.getGraph=function(){var i=this.getAssociation("graph");return i?sap.ui.getCore().byId(i):null||null;};a.prototype.setGraph=function(g){this._removeListeners();this.setAssociation("graph",g);var o=this.getGraph();if(o){o.attachBeforeLayouting(this._onBeforeDataProcess,this);o.attachGraphReady(this._onGraphReady,this);o.attachZoomChanged(this._resize,this);if(o._isLayedOut()){this._onGraphReady();}}return this;};return a;});
