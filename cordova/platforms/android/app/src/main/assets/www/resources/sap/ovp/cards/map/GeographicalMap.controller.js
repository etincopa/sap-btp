sap.ui.define(["sap/ovp/cards/generic/Card.controller","sap/ui/thirdparty/jquery","sap/ui/core/ResizeHandler"],function(C,q,R){"use strict";return C.extend("sap.ovp.cards.map.GeographicalMap",{onInit:function(e){C.prototype.onInit.apply(this,arguments);var s=this.getView().mPreprocessors.xml[0].ovpCardProperties.oData.state;if(s!=="Loading"&&s!=="Error"){var h=this.getView().byId("popoverHeader");h.attachBrowserEvent("click",this.onPopoverHeaderPress.bind(this,h));h.addEventDelegate({onkeydown:function(E){if(!E.shiftKey&&(E.keyCode==13||E.keyCode==32)){E.preventDefault();this.onPopoverHeaderPress(h);}}.bind(this)});}},resizeCard:function(n){var v=this.getView().byId("oVBI");var c=this.getCardPropertiesModel();c.setProperty("/cardLayout/rowSpan",n.rowSpan);c.setProperty("/cardLayout/colSpan",n.colSpan);var g=this.getView().getController();var h=this.getItemHeight(g,'ovpCardHeader');var m=n.rowSpan*n.iRowHeightPx-(h+2*n.iCardBorderPx);v.setHeight(m+"px");v.setWidth("100%");var o=this.getView().byId('ovpCardContentContainer').getDomRef();if(o){if(!n.showOnlyHeader){o.classList.remove('sapOvpContentHidden');}else{o.classList.add('sapOvpContentHidden');}}},onPopoverHeaderPress:function(h){var n=this.getEntityNavigationEntries(h.getBindingContext(),this.getCardPropertiesModel().getProperty("/annotationPath"));this.doNavigation(h.getBindingContext(),n[0]);},getAllSpotsCoordinates:function(m){var s={lonValues:[],latValues:[]};m.getAggregation("vos")[0].getItems().forEach(function(i){var c=i.getPosition().split(";");s.lonValues.push(parseFloat(c[0]));s.latValues.push(parseFloat(c[1]));});return s;},onClickSpot:function(e){var s=e.getSource();var c={};c[e.getParameter("data").Action.Params.Param[0].name]=e.getParameter("data").Action.Params.Param[0]["#"];c[e.getParameter("data").Action.Params.Param[1].name]=e.getParameter("data").Action.Params.Param[1]["#"];var v=this.getView().byId("oVBI");if(!this.oQuickViewPopover){this.oQuickViewPopover=this.getView().byId("quickViewPopover");}else if(this.oQuickViewPopover.isOpen()){this.oQuickViewPopover.close();}if(!this.oPopoverAnchor){this.oPopoverAnchor=document.createElement("div");this.oPopoverAnchor.style.position="absolute";this.oPopoverAnchor.style.display="inline-block";this.oPopoverAnchor.style.width="0px";this.oPopoverAnchor.style.height="0px";}this.oPopoverAnchor.style.top=Math.floor(parseFloat(c.y))+"px";this.oPopoverAnchor.style.left=Math.floor(parseFloat(c.x))+"px";v.getParent().getDomRef().appendChild(this.oPopoverAnchor);this.oQuickViewPopover.openBy(this.oPopoverAnchor);this.oQuickViewPopover.setBindingContext(s.getBindingContext());},onAfterOpen:function(){var f=['.quickViewResponsivePopover','.mapPopoverHeader','.sapMQuickViewPage','.sapOvpActionFooter'];var p=this.getView().byId("quickViewPopover");var a=p.$();a[0].focus();var b=0;var A=a.find('.sapOvpActionFooter').children();for(var i=0;i<A.length;i++){if(q(A[i]).hasClass('sapMTBSpacer')){continue;}var c="#"+A[i].id;f.push(c);}p.attachBrowserEvent("keydown",function(e){var E=e.target.closest('.quickViewResponsivePopover');if(e.keyCode==9){if(e.shiftKey){b--;b=b==-1?f.length-1:b;}else{b++;b=b>=f.length?0:b;}var j=E.querySelector(f[b]);if(b===0){j=E;}j.setAttribute("tabindex",0);j.focus();e.preventDefault();}});},onBeforeRendering:function(){var m=this.getView().byId("oVBI");m.getAggregation("vos")[0].getBinding("items").attachChange(function(i){var s,a=this.getAllSpotsCoordinates(m),b=a.lonValues.length;if(this&&this.getView()&&this.getView().getDomRef()&&this.getView().getDomRef().getElementsByClassName("noDataSubtitle")){s=this.getView().getDomRef().getElementsByClassName("noDataSubtitle");}if(b>0){m.zoomToGeoPosition(a.lonValues,a.latValues,b===1?5:undefined);if(s&&s.length>0){s[0].style.display="none";}}else{if(s&&s.length>0){s[0].style.display="flex";}}}.bind(this));var M=this.getOwnerComponent().getComponentData().settings.oMapConfig;m.setMapConfiguration(M);},onGeoCardResize:function(e){var a=this.getAllSpotsCoordinates(e.control),s=a.lonValues.length;if(s>0){e.control.zoomToGeoPosition(a.lonValues,a.latValues,s===1?5:undefined);}},onAfterRendering:function(){C.prototype.onAfterRendering.apply(this,arguments);this._resizeListenerId=R.register(this.getView().byId("oVBI"),this.onGeoCardResize.bind(this));},exit:function(){if(this._resizeListenerId){R.deregister(this.resizeHandlerId);}}});});
