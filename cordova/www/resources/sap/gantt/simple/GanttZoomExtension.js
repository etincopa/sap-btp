/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global","sap/ui/events/KeyCodes","sap/gantt/config/TimeHorizon","./GanttExtension","./CoordinateUtils","./AggregationUtils"],function(q,K,T,G,C,A){"use strict";var I=["mousedown","mousemove","mouseup","wheel","MozMousePixelScroll"];var B=I.reduce(function(e,d){e[d]=d;return e;},{});B.keydown="keydown";B.periodZoom="periodZoom";var n=".sapGanttZoom";var _=function(e){return e+n;};I=I.map(_);var P=B.periodZoom+n;var a=B.keydown+n;var Z={start:"zoomStart",zooming:"zooming",end:"zoomEnd"};var b={dispatch:function(e,p){var E=this._getZoomExtension(),o=e.originalEvent||e;if(E.isMouseWheelZoom(e)){var s=p&&p.suppressSyncEvent;E.performMouseWheelZooming(o,s);return;}if(p&&p.which){o.which=p.which;}E.performTimePeriodZooming(o);},addEventListeners:function(g){var e=g._getZoomExtension(),d=e.getDomRefs(),o=d.ganttSvg,f=d.gantt,h=d.headerSvg;var i=function(E,D){q(D).bind(E,b.dispatch.bind(g));};b.removeEventListeners(g);I.forEach(function(E){i(E,o);if(E.startsWith(B.wheel)){i(E,h);}});q(f).on(P,b.dispatch.bind(g));q(document).on(a,function(j){if(j.which===K.Z||j.which===K.ESCAPE){q(this).find(".sapGanttChartContentBody").trigger(P,{which:j.which});}});},removeEventListeners:function(g){var e=g._getZoomExtension(),d=e.getDomRefs(),o=d.ganttSvg,f=d.gantt,h=d.headerSvg;q(o).unbind(n);q(h).unbind(n);q(f).unbind(n);q(document).off(n);}};var c=G.extend("sap.gantt.GanttZoomExtension",{_init:function(g,s){this.bTimePeriodZoomMode=false;this.oZoomStartTime=null;this.iMouseWheelZoomDelayedCallId=undefined;this.iLastMouseWheelZoomTimeInMs=0;return"ZoomExtension";},_attachEvents:function(){var g=this.getGantt();b.removeEventListeners(g);b.addEventListeners(g);},_detachEvents:function(){var g=this.getGantt();b.removeEventListeners(g);}});c.prototype.isMouseWheelZoom=function(e){var d=e.shiftKey&&e.ctrlKey&&(e.type===B.wheel||e.type===B.MozMousePixelScroll);if(d){e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();}return d;};G.prototype.performMouseWheelZooming=function(e,s){var S=this._getWheelScrollDelta(e),i=this._getMousePositionX(e);this.decideMouseWheelZoom(e,S,i,s);};c.prototype._getWheelScrollDelta=function(e){var s=e.deltaY||e.deltaX;if(s===0||s===undefined){s=e.detail;}var d=e.deltaMode===1?33:1;return s*d;};c.prototype._getMousePositionX=function(e){return C.xPosOfSvgElement(e,q(this.getDomRefs().ganttSvg));};c.prototype.decideMouseWheelZoom=function(o,s,m,S){var g=this.getGantt(),z=g.getAxisTimeStrategy();if(z.getMouseWheelZoomType()===sap.gantt.MouseWheelZoomType.None){return;}var d=s<0,e=!d;var i=z.getZoomLevel(),M=z.getZoomLevels()-1;if((e&&i>0)||(d&&i<M)){var t=(!this.iMouseWheelZoomDelayedCallId&&(Date.now()-this.iLastMouseWheelZoomTimeInMs>100))?0:100;if(t===0){this.onMouseWheelZooming(o,z,m,s,S);}else{this.iMouseWheelZoomDelayedCallId=this.iMouseWheelZoomDelayedCallId||q.sap.delayedCall(t,this,this.onMouseWheelZooming,[o,z,m,s,S]);}}};c.prototype.onMouseWheelZooming=function(o,z,m,s,S){this.iLastMouseWheelZoomTimeInMs=Date.now();var t=z.getAxisTime().viewToTime(m);z.updateVisibleHorizonOnMouseWheelZoom(t,s,o,S);q.sap.clearDelayedCall(this.iMouseWheelZoomDelayedCallId);delete this.iMouseWheelZoomDelayedCallId;};c.prototype.performTimePeriodZooming=function(e){var p=this.getGantt()._getPointerExtension();var i=p.isPointerInGanttChart();var o=this.getGantt().getAxisTimeStrategy();if(!o.isTimePeriodZoomEnabled()){return;}if(i===false){return;}if(e.type===B.periodZoom){if(e.which===K.Z&&p.isPointerInGanttChart()){this.bTimePeriodZoomMode=!this.bTimePeriodZoomMode;}if(e.which===K.ESCAPE){this.bTimePeriodZoomMode=false;}this.updateCursorStyle(this.bTimePeriodZoomMode);}if(e.type===B.mousedown&&e.button===0){if(this.bTimePeriodZoomMode){this.handleZoomStart(e);this._fireTimePeriodZoomEvent({type:Z.start,zoomStartTime:this.oZoomStartTime,zoomEndTime:null,originalEvent:e});}}if(e.type===B.mousemove&&this.bTimePeriodZoomMode){var E=this.timeFromEvent(e);this.handleZooming(e);this._fireTimePeriodZoomEvent({type:Z.zooming,zoomStartTime:this.oZoomStartTime,zoomEndTime:E,originalEvent:e});}if(e.type===B.mouseup&&this.bTimePeriodZoomMode){this.bTimePeriodZoomMode=false;var E=this.timeFromEvent(e);this.handleZoomEnd(e);this._fireTimePeriodZoomEvent({type:Z.end,zoomStartTime:this.oZoomStartTime,zoomEndTime:E,originalEvent:e});}};c.prototype.timeFromEvent=function(e){var $=q(this.getDomRefs().ganttSvg),p=C.xPosOfSvgElement(e,$);var o=this.getGantt()._getPointerExtension();p+=o._getAutoScrollStep();return this.getGantt().getAxisTime().viewToTime(p);};c.prototype._fireTimePeriodZoomEvent=function(p){this.getGantt().fireEvent("_timePeriodZoomOperation",p);};c.prototype.syncTimePeriodZoomOperation=function(e,t,o){var O=e.getParameter("originalEvent");var s=e.getParameter("type");switch(s){case Z.start:this.handleZoomStart(O);break;case Z.zooming:this.handleZooming(O);break;case Z.end:this.handleZoomEnd(O,true);break;default:q.sap.log.debug("unknown time period zoom type");}};c.prototype.handleZoomStart=function(e){this.oZoomStartTime=this.timeFromEvent(e);var s=this.getGantt().getAxisTime().timeToView(this.oZoomStartTime);this.updateCursorStyle(this.bTimePeriodZoomMode);this.createZoomingRectangle(s);};c.prototype.handleZooming=function(e){this._isZooming=true;var s=this.oZoomStartTime;var E=this.timeFromEvent(e);var o=this.getGantt().getAxisTime(),S=o.timeToView(s),i=o.timeToView(E);this.updateCursorStyle(this.bTimePeriodZoomMode);if(i>S){this.updateZoomingRectangle(S,i);}else{this.updateZoomingRectangle(i,S);}};c.prototype.isZoomingRectangleNotExisted=function(){var s=d3.select(this.getDomRefs().ganttSvg);return s.selectAll(".sapGanttChartTimePeriodZoomRectangle").size()===0;};c.prototype.isTimeZooming=function(){return this._isZooming;};c.prototype._handleAutoScroll=function(e){if(this.isTimeZooming()){if(this.isZoomingRectangleNotExisted()){var s=this.oZoomStartTime;var o=this.getGantt().getAxisTime(),S=o.timeToView(s);this.createZoomingRectangle(S);}this.handleZooming(e);}};c.prototype.handleZoomEnd=function(e,s){this._isZooming=false;var E=this.timeFromEvent(e);this.updateCursorStyle(this.bTimePeriodZoomMode);this.destroyZoomingRectangle();var o=this.getGantt().getAxisTime(),S=o.timeToView(this.oZoomStartTime),i=o.timeToView(E);var O=5;if(Math.abs(i-S)>O){var d=this.oZoomStartTime,f=E;if(E.getTime()<d.getTime()){var t=d;d=E;f=t;}var g=new T({startTime:d,endTime:f});this.getGantt().syncVisibleHorizon(g,undefined,undefined,s?undefined:"timePeriodZooming");}};c.prototype.updateCursorStyle=function(z){var s=z?"crosshair":"auto";this.getDomRefs().ganttSvg.style.cursor=s;this.getDomRefs().headerSvg.style.cursor=s;};c.prototype.createZoomingRectangle=function(x){var s=d3.select(this.getDomRefs().ganttSvg);this.destroyZoomingRectangle();s.append("rect").classed("sapGanttChartTimePeriodZoomRectangle",true).attr("x",x).attr("y",0).attr("height",q(s.node()).height());};c.prototype.updateZoomingRectangle=function(s,e){var S=d3.select(this.getDomRefs().ganttSvg);S.selectAll(".sapGanttChartTimePeriodZoomRectangle").attr("x",s).attr("width",e-s);};c.prototype.destroyZoomingRectangle=function(){var s=d3.select(this.getDomRefs().ganttSvg);s.selectAll(".sapGanttChartTimePeriodZoomRectangle").remove();};c.prototype.doBirdEye=function(r){var g=this.getGantt();var o=this.calculateBirdEyeRange(r);var d=new T(o);g.getAxisTimeStrategy()._setVisibleHorizon(d);};c.prototype.calculateBirdEyeRange=function(r){var g=this.getGantt();var t=g.getTable();var R=t.getRows();var h;var s;var e;if(r!==undefined){h=this._getBirdEyeRangeOnRow(r);s=h.startTime;e=h.endTime;}else{for(var i=0;i<R.length;i++){h=this._getBirdEyeRangeOnRow(i);if(h.startTime&&h.endTime){var o=this._calculateBirdEyeTimeRange(s,e,h.startTime,h.endTime);s=o.startTime;e=o.endTime;}}}var d={startTime:s,endTime:e};return d;};c.prototype._getBirdEyeRangeOnRow=function(r){var g=this.getGantt();var t=g.getTable();var o=t.getBindingInfo("rows"),m=o&&o.model;var R=t.getRows();var d=R[r];var e=d.getBindingContext(m);var s;var E;if(e){var f=d.getAggregation("_settings");var S=[];S=this._getShapeInRow(f,S);var h=this;S.forEach(function(k){if(k.getCountInBirdEye()){var l=k.getTime();var p=k.getEndTime();var u=h._calculateBirdEyeTimeRange(s,E,l,p);s=u.startTime;E=u.endTime;}});}if(s&&E){var i=g.getVisibleWidth();var j=(E.getTime()-s.getTime())/i;s=new Date(s.getTime()-j*5);E=new Date(E.getTime()+j*5);}var H={startTime:s,endTime:E};return H;};c.prototype._getShapeInRow=function(e,s){var m=A.getNonLazyAggregations(e);var t=this;Object.keys(m).forEach(function(N){var d=e.getAggregation(N);if(d){d=q.isArray(d)?d:[d];if(d.length>0){s=s.concat(d);d.forEach(function(o){s=t._getShapeInRow(o,s);});}}}.bind(e));return s;};c.prototype._calculateBirdEyeTimeRange=function(e,l,o,d){if(!e||o.getTime()<e.getTime()){e=o;}if(!l||l.getTime()<d.getTime()){l=d;}return{startTime:e,endTime:l};};return c;});
