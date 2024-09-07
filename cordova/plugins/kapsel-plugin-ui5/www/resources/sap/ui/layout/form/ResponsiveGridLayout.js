/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/Control','sap/ui/core/ResizeHandler','sap/ui/layout/library','sap/ui/layout/Grid','sap/ui/layout/GridData','./Form','./FormContainer','./FormElement','./FormLayout','./ResponsiveGridLayoutRenderer',"sap/ui/thirdparty/jquery"],function(C,R,l,G,a,F,b,c,d,e,q){"use strict";var f=d.extend("sap.ui.layout.form.ResponsiveGridLayout",{metadata:{library:"sap.ui.layout",properties:{labelSpanXL:{type:"int",group:"Misc",defaultValue:-1},labelSpanL:{type:"int",group:"Misc",defaultValue:4},labelSpanM:{type:"int",group:"Misc",defaultValue:2},labelSpanS:{type:"int",group:"Misc",defaultValue:12},adjustLabelSpan:{type:"boolean",group:"Misc",defaultValue:true},emptySpanXL:{type:"int",group:"Misc",defaultValue:-1},emptySpanL:{type:"int",group:"Misc",defaultValue:0},emptySpanM:{type:"int",group:"Misc",defaultValue:0},emptySpanS:{type:"int",group:"Misc",defaultValue:0},columnsXL:{type:"int",group:"Misc",defaultValue:-1},columnsL:{type:"int",group:"Misc",defaultValue:2},columnsM:{type:"int",group:"Misc",defaultValue:1},singleContainerFullSize:{type:"boolean",group:"Misc",defaultValue:true},breakpointXL:{type:"int",group:"Misc",defaultValue:1440},breakpointL:{type:"int",group:"Misc",defaultValue:1024},breakpointM:{type:"int",group:"Misc",defaultValue:600}}}});var P=C.extend("sap.ui.layout.form.ResponsiveGridLayoutPanel",{metadata:{library:"sap.ui.layout",aggregations:{"content":{type:"sap.ui.layout.Grid",multiple:false}},associations:{"container":{type:"sap.ui.layout.form.FormContainer",multiple:false},"layout":{type:"sap.ui.layout.form.ResponsiveGridLayout",multiple:false}}},getLayoutData:function(){var i=sap.ui.getCore().byId(this.getContainer());var L=sap.ui.getCore().byId(this.getLayout());var j;if(L&&i){j=L.getLayoutDataForElement(i,"sap.ui.layout.GridData");}if(j){return j;}else{return this.getAggregation("layoutData");}},getCustomData:function(){var i=sap.ui.getCore().byId(this.getContainer());if(i){return i.getCustomData();}},refreshExpanded:function(){var i=sap.ui.getCore().byId(this.getContainer());if(i){if(i.getExpanded()){this.$().removeClass("sapUiRGLContainerColl");}else{this.$().addClass("sapUiRGLContainerColl");}}},renderer:function(i,j){var s=sap.ui.getCore().byId(j.getContainer());var L=sap.ui.getCore().byId(j.getLayout());var t=j.getContent();var E=s.getExpandable();var T=s.getTooltip_AsString();var u=s.getToolbar();var v=s.getTitle();i.write("<div");i.writeControlData(j);i.addClass("sapUiRGLContainer");if(E&&!s.getExpanded()){i.addClass("sapUiRGLContainerColl");}if(u){i.addClass("sapUiFormContainerToolbar");}else if(v){i.addClass("sapUiFormContainerTitle");}if(T){i.writeAttributeEscaped('title',T);}i.writeClasses();L.getRenderer().writeAccessibilityStateContainer(i,s);i.write(">");L.getRenderer().renderHeader(i,u,v,s._oExpandButton,E,false,s.getId());if(t){i.write("<div");i.addClass("sapUiRGLContainerCont");i.writeClasses();i.write(">");i.renderControl(t);i.write("</div>");}i.write("</div>");}});f.prototype.init=function(){this.mContainers={};this.oDummyLayoutData=new a(this.getId()+"--Dummy");};f.prototype.exit=function(){for(var s in this.mContainers){p.call(this,s,true);}if(this._mainGrid){this._mainGrid.destroy();delete this._mainGrid;}this.oDummyLayoutData.destroy();this.oDummyLayoutData=undefined;};f.prototype.onBeforeRendering=function(E){var i=this.getParent();if(!i||!(i instanceof F)){return;}i._bNoInvalidate=true;_.call(this,i);r.call(this,i);i._bNoInvalidate=false;};f.prototype.onAfterRendering=function(E){if(this._mainGrid&&this._mainGrid.__bIsUsed){for(var s in this.mContainers){if(this.mContainers[s][1]._sContainerResizeListener){R.deregister(this.mContainers[s][1]._sContainerResizeListener);this.mContainers[s][1]._sContainerResizeListener=null;}}}};f.prototype.toggleContainerExpanded=function(i){var s=i.getId();if(this.mContainers[s]&&this.mContainers[s][0]){var j=this.mContainers[s][0];j.refreshExpanded();}};f.prototype.onLayoutDataChange=function(E){var s=E.srcControl;if(s instanceof b){if(this._mainGrid){this._mainGrid.onLayoutDataChange(E);this.invalidate();}}else if(!(s instanceof c)){var i=s.getParent();if(i instanceof c){var j=i.getParent();var t=j.getId();if(this.mContainers[t]&&this.mContainers[t][1]){this.mContainers[t][1].onLayoutDataChange(E);}}}};f.prototype.onsapup=function(E){this.onsapleft(E);};f.prototype.onsapdown=function(E){this.onsapright(E);};f.prototype.getContainerRenderedDomRef=function(i){if(this.getDomRef()){var s=i.getId();if(this.mContainers[s]){if(this.mContainers[s][0]){var j=this.mContainers[s][0];return j.getDomRef();}else if(this.mContainers[s][1]){var t=this.mContainers[s][1];return t.getDomRef();}}}return null;};f.prototype.getElementRenderedDomRef=function(E){return null;};function _(j){var v=j.getVisibleFormContainers();var V=v.length;var s=0;var t;var u;var w;var x;var i=0;for(i=0;i<V;i++){w=v[i];w._checkProperties();if(w.isVisible()){s++;x=w.getId();t=undefined;u=undefined;var y=v[i+1];if(this.mContainers[x]&&this.mContainers[x][1]){u=this.mContainers[x][1];}else{u=k.call(this,w);}var T=w.getTitle();var z=w.getToolbar();if(z||T||w.getExpandable()){if(this.mContainers[x]&&this.mContainers[x][0]){t=this.mContainers[x][0];}else{t=g.call(this,w,u);n(u,true);}o(t,w,s,y,V);}else{if(this.mContainers[x]&&this.mContainers[x][0]){h(this.mContainers[x][0]);}n(u,false);o(u,w,s,y,V);}this.mContainers[x]=[t,u];}}var O=Object.keys(this.mContainers).length;if(V<O){for(x in this.mContainers){var A=false;for(i=0;i<V;i++){w=v[i];if(x==w.getId()){A=true;break;}}if(!A){p.call(this,x);}}}}function g(i,j){var s=i.getId();var t=new P(s+"---Panel",{container:i,layout:this,content:j});return t;}function h(i,D){i.setLayout(null);i.setContainer(null);if(!D||!i.getParent()){i.setContent(null);i.destroy();}}function k(t){var I=t.getId()+"--Grid";var u=new G(I,{vSpacing:0,hSpacing:0,containerQuery:true});u.__myParentLayout=this;u.__myParentContainerId=t.getId();u.addStyleClass("sapUiFormResGridCont").addStyleClass("sapUiRespGridOverflowHidden");u.getContent=function(){var t=sap.ui.getCore().byId(this.__myParentContainerId);if(t){var s=[];var E=t.getVisibleFormElements();var w;var y;for(var i=0;i<E.length;i++){var z=E[i];y=z.getLabelControl();if(y){s.push(y);}w=z.getFields();for(var j=0;j<w.length;j++){s.push(w[j]);}}return s;}else{return false;}};u.getAriaLabelledBy=function(){var t=sap.ui.getCore().byId(this.__myParentContainerId);if(t&&!t.getToolbar()&&!t.getTitle()&&!t.getExpandable()){return t.getAriaLabelledBy();}return[];};var B={labelSpan:0,span:0,firstField:false,defaultFields:0,row:0,myRow:false,freeFields:0,finished:false};var x={id:"XL",getEffectiveSpan:function(i){var s=i._getEffectiveSpanXLarge();if(!s){s=i._getEffectiveSpanLarge();}return s;},getEmptySpan:function(i){var E=i.getEmptySpanXL();if(E<0){E=i.getEmptySpanL();}return E;},getLabelSpan:function(i){return i.getLabelSpanXL();},setIndent:function(i,j){i.setIndentXL(j);},setLinebreak:function(i,j){i.setLinebreakXL(j);}};q.extend(x,B);var L={id:"L",getEffectiveSpan:function(i){return i._getEffectiveSpanLarge();},getEmptySpan:function(i){return i.getEmptySpanL();},getLabelSpan:function(i){return i.getLabelSpanL();},setIndent:function(i,j){i.setIndentL(j);},setLinebreak:function(i,j){i.setLinebreakL(j);}};q.extend(L,B);var M={id:"M",getEffectiveSpan:function(i){return i._getEffectiveSpanMedium();},getEmptySpan:function(i){return i.getEmptySpanM();},getLabelSpan:function(i){return i.getLabelSpanM();},setIndent:function(i,j){i.setIndentM(j);},setLinebreak:function(i,j){i.setLinebreakM(j);}};q.extend(M,B);var S={id:"S",getEffectiveSpan:function(i){return i._getEffectiveSpanSmall();},getEmptySpan:function(i){return i.getEmptySpanS();},getLabelSpan:function(i){return i.getLabelSpanS();},setIndent:function(i,j){i.setIndentS(j);},setLinebreak:function(i,j){i.setLinebreakS(j);}};q.extend(S,B);var v=[x,L,M,S];u._getLayoutDataForControl=function(j){var w=this.__myParentLayout;var y=w.getLayoutDataForElement(j,"sap.ui.layout.GridData");var E=j.getParent();var z=E.getLabelControl();if(y){if(z==j){y._setStylesInternal("sapUiFormElementLbl");}return y;}else{var t=sap.ui.getCore().byId(this.__myParentContainerId);var A=w.getLayoutDataForElement(t,"sap.ui.layout.GridData");var D=t.getParent();var H;var s=0;for(s=0;s<v.length;s++){H=v[s];q.extend(H,B);H.labelSpan=H.getLabelSpan(w);}if(w.getAdjustLabelSpan()){if(D.getVisibleFormContainers().length>=1&&w.getColumnsM()>1){M.labelSpan=w.getLabelSpanL();}if(A){if(A._getEffectiveSpanLarge()==12){L.labelSpan=w.getLabelSpanM();M.labelSpan=w.getLabelSpanM();}}if(D.getVisibleFormContainers().length==1||w.getColumnsL()==1){L.labelSpan=w.getLabelSpanM();M.labelSpan=w.getLabelSpanM();}}if(x.labelSpan<0){x.labelSpan=L.labelSpan;}if(z==j){w.oDummyLayoutData.setSpan("XL"+x.labelSpan+" L"+L.labelSpan+" M"+M.labelSpan+" S"+S.labelSpan);w.oDummyLayoutData.setLinebreak(true);w.oDummyLayoutData.setIndentXL(0).setIndentL(0).setIndentM(0).setIndentS(0);w.oDummyLayoutData._setStylesInternal("sapUiFormElementLbl");return w.oDummyLayoutData;}else{var J;if(z){J=w.getLayoutDataForElement(z,"sap.ui.layout.GridData");}var K=E.getFields();var N=K.length;var O;var Q;var T=1;var U=false;var V;var i=0;for(s=0;s<v.length;s++){H=v[s];H.span=12-H.getEmptySpan(w);if(z){if(J){V=H.getEffectiveSpan(J);if(V){H.labelSpan=V;}}if(H.labelSpan<12){H.span=H.span-H.labelSpan;}}H.spanFields=H.span;}for(i=0;i<N;i++){O=K[i];if(O!=j){Q=w.getLayoutDataForElement(O,"sap.ui.layout.GridData");if(Q){for(s=0;s<v.length;s++){H=v[s];V=H.getEffectiveSpan(Q);if(V&&V<H.span){H.span=H.span-V;}}}else{T++;}}else{if(T==1){U=true;}}}var W=[];for(s=0;s<v.length;s++){H=v[s];H.firstField=U;H.defaultFields=T;if(H.span<T){H.defaultFields=0;H.row=0;H.myRow=false;H.freeFields=H.spanFields;H.span=H.spanFields;H.finished=false;W.push(H);}}if(W.length>0){for(i=0;i<N;i++){O=K[i];Q=undefined;if(O!=j){Q=w.getLayoutDataForElement(O,"sap.ui.layout.GridData");}for(s=0;s<W.length;s++){H=W[s];if(H.finished){continue;}if(Q){V=H.getEffectiveSpan(Q);H.span=H.span-V;}else{V=1;}if(H.freeFields>=V){H.freeFields=H.freeFields-V;if(!Q){H.defaultFields++;}}else{if(H.myRow){H.finished=true;}else{H.freeFields=H.spanFields-V;H.row++;if(Q){H.defaultFields=0;H.span=H.spanFields-V;}else{H.defaultFields=1;H.span=H.spanFields;}if(O==j){H.firstField=true;}}}if(O==j){H.myRow=true;}}}}var X=0;var Y="";var Z;for(s=0;s<v.length;s++){H=v[s];if(H.id!="S"||H.labelSpan<12){if(H.firstField){X=H.span-Math.floor(H.span/H.defaultFields)*H.defaultFields;Z=Math.floor(H.span/H.defaultFields)+X;}else{Z=Math.floor(H.span/H.defaultFields);}}else{Z=12;}if(Y){Y=Y+" ";}Y=Y+H.id+Z;H.setLinebreak(w.oDummyLayoutData,H.firstField&&(H.row>0));H.setIndent(w.oDummyLayoutData,H.firstField&&(H.row>0)?H.labelSpan:0);}w.oDummyLayoutData.setSpan(Y);w.oDummyLayoutData.setLinebreak(U&&!z);w.oDummyLayoutData._setStylesInternal(undefined);return w.oDummyLayoutData;}return y;}};u._onParentResizeOrig=u._onParentResize;u._onParentResize=function(){if(!this.getDomRef()){this._cleanup();return;}if(!q(this.getDomRef()).is(":visible")){return;}var j=this.__myParentLayout;if(!j._mainGrid||!j._mainGrid.__bIsUsed){var s=j.getParent().getVisibleFormContainers();var w;for(var i=0;i<s.length;i++){w=s[i];break;}if(!w||!j.mContainers[w.getId()]||w.getId()!=this.__myParentContainerId){return;}if(j.mContainers[this.__myParentContainerId][0]){var D=j.mContainers[this.__myParentContainerId][0].getDomRef();var y=D.clientWidth;if(y<=j.getBreakpointM()){this._toggleClass("Phone");}else if((y>j.getBreakpointM())&&(y<=j.getBreakpointL())){this._toggleClass("Tablet");}else if((y>j.getBreakpointL())&&(y<=j.getBreakpointXL())){this._toggleClass("Desktop");}else{this._toggleClass("LargeDesktop");}}else{this._setBreakPointTablet(j.getBreakpointM());this._setBreakPointDesktop(j.getBreakpointL());this._setBreakPointLargeDesktop(j.getBreakpointXL());this._onParentResizeOrig();}}else{var $=j._mainGrid.$();if($.hasClass("sapUiRespGridMedia-Std-Phone")){this._toggleClass("Phone");}else if($.hasClass("sapUiRespGridMedia-Std-Tablet")){this._toggleClass("Tablet");}else if($.hasClass("sapUiRespGridMedia-Std-Desktop")){this._toggleClass("Desktop");}else{this._toggleClass("LargeDesktop");}}};u._getAccessibleRole=function(){var t=sap.ui.getCore().byId(this.__myParentContainerId);var i=this.__myParentLayout;if(i._mainGrid&&i._mainGrid.__bIsUsed&&!t.getToolbar()&&!t.getTitle()&&!t.getExpandable()&&t.getAriaLabelledBy().length>0){return"form";}};u.getUIArea=function(){var i=this.__myParentLayout;if(i){return i.getUIArea();}else{return null;}};return u;}function m(i,D){if(i.__myParentContainerId){i.__myParentContainerId=undefined;}i.__myParentLayout=undefined;if(!D||!i.getParent()){i.destroy();}}function n(i,O){if(O){if(i.__originalGetLayoutData){i.getLayoutData=i.__originalGetLayoutData;delete i.__originalGetLayoutData;}}else if(!i.__originalGetLayoutData){i.__originalGetLayoutData=i.getLayoutData;i.getLayoutData=function(){var L=this.__myParentLayout;var j=sap.ui.getCore().byId(this.__myParentContainerId);var s;if(j){s=L.getLayoutDataForElement(j,"sap.ui.layout.GridData");}if(s){return s;}else{return this.getAggregation("layoutData");}};}}function o(i,j,v,s,V){var L;if(i instanceof P){L=sap.ui.getCore().byId(i.getLayout());}else{L=i.__myParentLayout;}var t=L.getLayoutDataForElement(j,"sap.ui.layout.GridData");if(!t){var u=L.getColumnsM();var w=L.getColumnsL();var x=L.getColumnsXL();var y=(v%w)==1;var z=(v%w)==0;var A=v>(w*(Math.ceil(V/w)-1));var B=v<=w;var D=(v%u)==1;var E=(v%u)==0;var H=v>(u*(Math.ceil(V/u)-1));var I=v<=u;var J=false;var K=z;var M=A;var N=B;if(x>0){J=(v%x)==1;K=(v%x)==0;M=v>(x*(Math.ceil(V/x)-1));N=v<=x;}if(s){var O=L.getLayoutDataForElement(s,"sap.ui.layout.GridData");if(O&&(O.getLinebreak()||O.getLinebreakXL())){K=true;M=false;}if(O&&(O.getLinebreak()||O.getLinebreakL())){z=true;A=false;}if(O&&(O.getLinebreak()||O.getLinebreakM())){E=true;H=false;}}var S="";if(K){S="sapUiFormResGridLastContXL";}if(z){if(S){S=S+" ";}S=S+"sapUiFormResGridLastContL";}if(E){if(S){S=S+" ";}S=S+"sapUiFormResGridLastContM";}if(M){if(S){S=S+" ";}S=S+"sapUiFormResGridLastRowXL";}if(A){if(S){S=S+" ";}S=S+"sapUiFormResGridLastRowL";}if(H){if(S){S=S+" ";}S=S+"sapUiFormResGridLastRowM";}if(N){if(S){S=S+" ";}S=S+"sapUiFormResGridFirstRowXL";}if(B){if(S){S=S+" ";}S=S+"sapUiFormResGridFirstRowL";}if(I){if(S){S=S+" ";}S=S+"sapUiFormResGridFirstRowM";}t=i.getLayoutData();if(!t){t=new a(i.getId()+"--LD",{linebreakL:y,linebreakM:D});i.setLayoutData(t);}else{t.setLinebreakL(y);t.setLinebreakM(D);}if(x>0){t.setLinebreakXL(J);}t._setStylesInternal(S);}}function p(s,D){var i=this.mContainers[s];var j=i[1];if(j){m(j,D);}var t=i[0];if(t){h(t,D);}delete this.mContainers[s];}function r(s){var v=s.getVisibleFormContainers();var t;var u;var L=v.length;var w=0;var i=0;var j=0;if(L>1||!this.getSingleContainerFullSize()){var S=Math.floor(12/this.getColumnsM());var x=Math.floor(12/this.getColumnsL());var y;var D="";var z=this.getColumnsXL();if(z>=0){y=Math.floor(12/z);D=D+"XL"+y+" ";}D=D+"L"+x+" M"+S+" S12";if(!this._mainGrid){this._mainGrid=new G(s.getId()+"--Grid",{defaultSpan:D,hSpacing:0,vSpacing:0,containerQuery:true}).setParent(this);this._mainGrid.addStyleClass("sapUiFormResGridMain").addStyleClass("sapUiRespGridOverflowHidden");this._mainGrid._onParentResizeOrig=this._mainGrid._onParentResize;this._mainGrid._onParentResize=function(){this._onParentResizeOrig();var J=this.getParent();for(var u in J.mContainers){J.mContainers[u][1]._onParentResize();}};}else{this._mainGrid.setDefaultSpan(D);var A=this._mainGrid.getContent();w=A.length;var E=false;for(i=0;i<w;i++){var B=A[i];t=undefined;if(B.getContainer){t=sap.ui.getCore().byId(B.getContainer());}else{t=sap.ui.getCore().byId(B.__myParentContainerId);}if(t&&t.isVisible()){var V=v[j];if(t!=V){E=true;break;}var H=this.mContainers[t.getId()];if(H[0]&&H[0]!=B){E=true;break;}if(!H[0]&&H[1]&&H[1]!=B){E=true;break;}j++;}else{this._mainGrid.removeContent(B);}}if(E){this._mainGrid.removeAllContent();w=0;}}this._mainGrid._setBreakPointTablet(this.getBreakpointM());this._mainGrid._setBreakPointDesktop(this.getBreakpointL());this._mainGrid._setBreakPointLargeDesktop(this.getBreakpointXL());this._mainGrid.__bIsUsed=true;if(w<L){var I=0;if(w>0){I=w--;}for(i=I;i<L;i++){t=v[i];u=t.getId();if(this.mContainers[u]){if(this.mContainers[u][0]){this._mainGrid.addContent(this.mContainers[u][0]);}else if(this.mContainers[u][1]){this._mainGrid.addContent(this.mContainers[u][1]);}}}}}else{if(this._mainGrid){this._mainGrid.__bIsUsed=false;}for(i=0;i<L;i++){t=v[i];u=t.getId();if(this.mContainers[u]){if(this.mContainers[u][0]){if(this.mContainers[u][0].getParent()!==this){this.addDependent(this.mContainers[u][0]);}}else if(this.mContainers[u][1]){if(this.mContainers[u][1].getParent()!==this){this.addDependent(this.mContainers[u][1]);}}}}}}return f;});
