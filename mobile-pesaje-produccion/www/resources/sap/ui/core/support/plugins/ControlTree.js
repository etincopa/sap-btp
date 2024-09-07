/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/support/Plugin','sap/ui/core/util/serializer/ViewSerializer','sap/ui/core/util/File','sap/ui/thirdparty/jszip','sap/ui/base/DataType','sap/ui/core/Component','sap/ui/core/Element','sap/ui/core/ElementMetadata','sap/ui/core/UIArea','sap/ui/core/mvc/View','sap/ui/core/mvc/XMLView','sap/ui/core/tmpl/Template','sap/ui/model/Binding','sap/ui/model/CompositeBinding','sap/base/util/each','sap/base/util/isEmptyObject','sap/base/util/ObjectPath',"sap/ui/thirdparty/jquery","sap/ui/events/KeyCodes",'sap/ui/core/mvc/Controller'],function(P,V,F,J,D,C,E,a,U,b,X,T,B,c,e,d,O,$,K){"use strict";var f=P.extend("sap.ui.core.support.plugins.ControlTree",{constructor:function(s){P.apply(this,["sapUiSupportControlTree","Control Tree",s]);this._oStub=s;if(this.runsAsToolPlugin()){this._aEventIds=["sapUiSupportSelectorSelect",this.getId()+"ReceiveControlTree",this.getId()+"ReceiveControlTreeExport",this.getId()+"ReceiveControlTreeExportError",this.getId()+"TriggerRequestProperties",this.getId()+"ReceiveProperties",this.getId()+"ReceiveBindingInfos",this.getId()+"ReceiveMethods",this.getId()+"ReceivePropertiesMethods"];this._breakpointId="sapUiSupportBreakpoint";this._tab={properties:"Properties",bindinginfos:"BindingInfos",breakpoints:"Breakpoints",exports:"Export"};this._currentTab=this._tab.properties;}else{this._aEventIds=[this.getId()+"RequestControlTree",this.getId()+"RequestControlTreeSerialize",this.getId()+"RequestProperties",this.getId()+"RequestBindingInfos",this.getId()+"ChangeProperty",this.getId()+"RefreshBinding"];var t=this;sap.ui.getCore().registerPlugin({startPlugin:function(o){t.oCore=o;},stopPlugin:function(){t.oCore=undefined;}});}}});f.prototype.init=function(s){P.prototype.init.apply(this,arguments);if(this.runsAsToolPlugin()){g.call(this,s);}else{j.call(this,s);}};function g(s){$(document).on("click","li img.sapUiControlTreeIcon",this._onIconClick.bind(this)).on("click","li.sapUiControlTreeElement div",this._onNodeClick.bind(this)).on("click","li.sapUiControlTreeLink div",this._onControlTreeLinkClick.bind(this)).on("click","#sapUiSupportControlTabProperties",this._onPropertiesTab.bind(this)).on("click","#sapUiSupportControlTabBindingInfos",this._onBindingInfosTab.bind(this)).on("click","#sapUiSupportControlTabBreakpoints",this._onMethodsTab.bind(this)).on("click","#sapUiSupportControlTabExport",this._onExportTab.bind(this)).on("change","[data-sap-ui-name]",this._onPropertyChange.bind(this)).on("change","[data-sap-ui-method]",this._onPropertyBreakpointChange.bind(this)).on("keyup",'.sapUiSupportControlMethods input[type="text"]',this._autoComplete.bind(this)).on("blur",'.sapUiSupportControlMethods input[type="text"]',this._updateSelectOptions.bind(this)).on("change",'.sapUiSupportControlMethods select',this._selectOptionsChanged.bind(this)).on("click",'#sapUiSupportControlAddBreakPoint',this._onAddBreakpointClicked.bind(this)).on("click",'#sapUiSupportControlExportToXml',this._onExportToXmlClicked.bind(this)).on("click",'#sapUiSupportControlExportToHtml',this._onExportToHtmlClicked.bind(this)).on("click",'#sapUiSupportControlActiveBreakpoints img.remove-breakpoint',this._onRemoveBreakpointClicked.bind(this)).on("click",'#sapUiSupportControlPropertiesArea a.control-tree',this._onNavToControl.bind(this)).on("click",'#sapUiSupportControlPropertiesArea img.sapUiSupportRefreshBinding',this._onRefreshBinding.bind(this));this.renderContentAreas();}f.prototype.exit=function(s){P.prototype.exit.apply(this,arguments);if(this.runsAsToolPlugin()){$(document).off('click','li img.sapUiControlTreeIcon').off('click','li div').off("click","li.sapUiControlTreeLink").off("click","#sapUiSupportControlTabProperties").off("click","#sapUiSupportControlTabBindings").off("click","#sapUiSupportControlTabBreakpoints").off("click","#sapUiSupportControlTabExport").off('change','[data-sap-ui-name]').off('change','[data-sap-ui-method]').off('keyup','.sapUiSupportControlMethods input[type="text"]').off('blur','.sapUiSupportControlMethods select').off('change','.sapUiSupportControlMethods select').off('click','#sapUiSupportControlAddBreakPoint').off('click','#sapUiSupportControlExportToXml').off('click','#sapUiSupportControlExportToHtml').off('click','#sapUiSupportControlActiveBreakpoints img.remove-breakpoint').off('click','#sapUiSupportControlPropertiesArea a.control-tree').off('click','#sapUiSupportControlPropertiesArea img.sapUiSupportRefreshBinding');}};function h(s){if(s==null){return"";}s=String(s);return s.slice(1+s.lastIndexOf('.'));}f.prototype.renderContentAreas=function(){var r=sap.ui.getCore().createRenderManager();r.openStart("div").class("sapUiSupportControlTreeTitle").openEnd().text("You can find a control in this tree by clicking it in the application UI while pressing the Ctrl+Alt+Shift keys.").close("div");r.openStart("div","sapUiSupportControlTreeArea").openEnd();r.openStart("ul").class("sapUiSupportControlTreeList").openEnd().close("ul");r.close("div");r.openStart("div","sapUiSupportControlTabs").class("sapUiSupportControlTabsHidden").openEnd();r.openStart("button","sapUiSupportControlTabProperties").class("sapUiSupportBtn").class("sapUiSupportTab").class("sapUiSupportTabLeft").openEnd().text("Properties").close("button");r.openStart("button","sapUiSupportControlTabBindingInfos").class("sapUiSupportBtn").class("sapUiSupportTab").openEnd().text("Binding Infos").close("button");r.openStart("button","sapUiSupportControlTabBreakpoints").class("sapUiSupportBtn").class("sapUiSupportTab").openEnd().text("Breakpoints").close("button");r.openStart("button","sapUiSupportControlTabExport").class("sapUiSupportBtn").class("sapUiSupportTab").class("sapUiSupportTabRight").openEnd().text("Export").close("button");r.close("div");r.openStart("div","sapUiSupportControlPropertiesArea").openEnd().close("div");r.flush(this.dom());r.destroy();};f.prototype.renderControlTree=function(i){var r=sap.ui.getCore().createRenderManager();function k(I,m){var H=m.aggregation.length>0||m.association.length>0;r.openStart("li","sap-debug-controltree-"+m.id).class("sapUiControlTreeElement").openEnd();var s=H?"minus":"space";r.voidStart("img").class("sapUiControlTreeIcon").attr("src","../../debug/images/"+s+".gif").voidEnd();if(m.isAssociation){r.voidStart("img").attr("title","Association").class("sapUiControlTreeIcon").attr("src","../../debug/images/link.gif").voidEnd();}var l=h(m.type);r.openStart("div").openEnd();r.openStart("span").class("name").attr("title",m.type).openEnd().text(l+' - '+m.id).close("span");r.openStart("span").class("sapUiSupportControlTreeBreakpointCount").class("sapUiSupportItemHidden").attr("title","Number of active breakpoints / methods").openEnd().close("span");r.close("div");if(m.aggregation.length>0){r.openStart("ul").openEnd();e(m.aggregation,k);r.close("ul");}if(m.association.length>0){r.openStart("ul").openEnd();e(m.association,function(I,v){if(v.isAssociationLink){var t=h(v.type);r.openStart("li").attr("data-sap-ui-controlid",v.id).class("sapUiControlTreeLink").openEnd();r.voidStart("img").class("sapUiControlTreeIcon").attr("align","middle").attr("src","../../debug/images/space.gif").voidEnd();r.voidStart("img").class("sapUiControlTreeIcon").attr("align","middle").attr("src","../../debug/images/link.gif").voidEnd();r.openStart("div").openEnd();r.openStart("span").attr("title","Association '"+v.name+"' to '"+v.id+"' with type '"+v.type).openEnd();r.text(t+" - "+v.id+" ("+v.name+")");r.close("span");r.close("div");r.close("li");}else{k(0,v);}});r.close("ul");}r.close("li");}e(i,k);r.flush(this.dom("#sapUiSupportControlTreeArea > ul.sapUiSupportControlTreeList"));r.destroy();};f.prototype.renderPropertiesTab=function(i,s){var r=sap.ui.getCore().createRenderManager();r.openStart("ul").class("sapUiSupportControlTreeList").attr("data-sap-ui-controlid",s).openEnd();e(i,function(I,v){r.openStart("li").openEnd();r.openStart("span").openEnd().openStart("label").class("sapUiSupportLabel").openEnd().text("BaseType").close("label").text(" ").openStart("code").openEnd().text(v.control).close("code").close("span");if(v.properties.length>0||v.aggregations.length>0){r.openStart("div").class("get").attr("title","Activate debugger for get-method").openEnd().text("G").close("div");r.openStart("div").class("set").attr("title","Activate debugger for set-method").openEnd().text("S").close("div");r.openStart("div").class("sapUiSupportControlProperties").openEnd();r.openStart("table").openEnd();r.openStart("colgroup").openEnd();r.voidStart("col").attr("width","50%").voidEnd();r.voidStart("col").attr("width","50%").voidEnd();r.close("colgroup");e(v.properties,function(I,p){r.openStart("tr").openEnd();r.openStart("td").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text(p.name);if(p.isBound){r.voidStart("img").attr("title","Value is bound (see Binding Infos)").attr("src","../../debug/images/link.gif").voidEnd();}r.close("label");r.close("td");r.openStart("td").openEnd();if(p.type==="boolean"){r.voidStart("input").attr("type","checkbox");r.attr("data-sap-ui-name",p.name);if(p.value==true){r.attr("checked","checked");}r.voidEnd();}else if(p.enumValues){r.openStart("div").openEnd();r.openStart("select");r.attr("data-sap-ui-name",p.name).openEnd();e(p.enumValues,function(k,l){r.openStart("option");if(k===p.value){r.attr("selected","selected");}r.openEnd();r.text(k);r.close("option");});r.close("select");r.close("div");}else{r.openStart("div").openEnd();r.voidStart("input").attr("type","text");r.attr("data-sap-ui-name",p.name);if(p.value){r.attr("value",p.value);}r.voidEnd();r.close("div");}r.close("td");r.openStart("td").openEnd();r.voidStart("input").attr("type","checkbox").attr("data-sap-ui-method",p._sGetter).attr("title","Activate debugger for '"+p._sGetter+"'");if(p.bp_sGetter){r.attr("checked","checked");}r.voidEnd();r.close("td");r.openStart("td").openEnd();r.voidStart("input").attr("type","checkbox").attr("data-sap-ui-method",p._sMutator).attr("title","Activate debugger for '"+p._sMutator+"'");if(p.bp_sMutator){r.attr("checked","checked");}r.voidEnd();r.close("td");r.close("tr");});e(v.aggregations,function(I,A){r.openStart("tr").openEnd();r.openStart("td").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text(A.name).close("label");r.close("td");r.openStart("td").openEnd();r.text(A.value);r.close("td");r.openStart("td").openEnd();r.voidStart("input").attr("type","checkbox").attr("data-sap-ui-method",A._sGetter).attr("title","Activate debugger for '"+A._sGetter+"'");if(A.bp_sGetter){r.attr("checked","checked");}r.voidEnd();r.close("td");r.openStart("td").openEnd();r.voidStart("input").attr("type","checkbox").attr("data-sap-ui-method",A._sMutator).attr("title","Activate debugger for '"+A._sMutator+"'");if(A.bp_sMutator){r.attr("checked","checked");}r.voidEnd();r.close("td");r.close("tr");});r.close("table").close("div");}r.close("li");});r.close("ul");r.flush(this.dom("#sapUiSupportControlPropertiesArea"));r.destroy();this.dom("#sapUiSupportControlTabs").classList.remove("sapUiSupportControlTabsHidden");this.selectTab(this._tab.properties);};f.prototype.renderBindingsTab=function(m,s){var r=sap.ui.getCore().createRenderManager();if(m.contexts.length>0){r.openStart("h2").openEnd().text("Contexts").close("h2");r.openStart("ul").class("sapUiSupportControlTreeList").attr("data-sap-ui-controlid",s).openEnd();e(m.contexts,function(i,o){r.openStart("li").openEnd();r.openStart("span").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Model Name: "+o.modelName).close("label");r.close("span");r.openStart("div").class("sapUiSupportControlProperties").openEnd();r.openStart("table").openEnd().openStart("colgroup").openEnd().voidStart("col").attr("width","15%").voidEnd().voidStart("col").attr("width","35%").voidEnd().voidStart("col").attr("width","50%").voidEnd().close("colgroup");r.openStart("tbody").openEnd();r.openStart("tr").openEnd();r.openStart("td").attr("colspan","2").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Path").close("label");r.close("td");r.openStart("td").openEnd();r.openStart("div").openEnd();r.openStart("span");if(o.invalidPath){r.class("sapUiSupportModelPathInvalid");}else if(o.unverifiedPath){r.class("sapUiSupportModelPathUnverified");}r.openEnd().text(o.path);if(o.invalidPath){r.text(" (invalid)");}else if(o.unverifiedPath){r.text(" (unverified)");}r.close("span");r.close("div");r.close("td");r.close("tr");if(o.location){r.openStart("tr").openEnd();r.openStart("td").attr("colspan","2").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Inherited from").close("label");r.close("td");r.openStart("td").openEnd();r.openStart("div").openEnd();r.openStart("a").class("control-tree").class("sapUiSupportLink").attr("title",o.location.name).attr("data-sap-ui-control-id",o.location.id).attr("href","#").openEnd().text(h(o.location.name)).text(" ("+o.location.id+")").close("a").close("div");r.close("td");r.close("tr");}r.close("tbody").close("table").close("div").close("li");});r.close("ul");}if(m.bindings.length>0){r.openStart("h2").openEnd().text("Bindings").close("h2");r.openStart("ul").class("sapUiSupportControlTreeList").attr("data-sap-ui-controlid",s).openEnd();e(m.bindings,function(i,o){r.openStart("li").attr("data-sap-ui-binding-name",o.name).openEnd();r.openStart("span").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text(o.name).close("label");r.voidStart("img").class("sapUiSupportRefreshBinding").attr("title","Refresh Binding").attr("src","../../debug/images/refresh.gif").voidEnd();r.close("span");e(o.bindings,function(k,l){r.openStart("div").class("sapUiSupportControlProperties").openEnd();r.openStart("table").openEnd().openStart("colgroup").openEnd().voidStart("col").attr("width","15%").voidEnd().voidStart("col").attr("width","35%").voidEnd().voidStart("col").attr("width","50%").voidEnd().close("colgroup");r.openStart("tbody").openEnd();r.openStart("tr").openEnd();r.openStart("td").attr("colspan","2").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Path").close("label");r.close("td");r.openStart("td").openEnd();r.openStart("div").openEnd().openStart("span");if(l.invalidPath){r.class("sapUiSupportModelPathInvalid");}else if(l.unverifiedPath){r.class("sapUiSupportModelPathUnverified");}r.openEnd().text(l.path);if(l.invalidPath){r.text(' (invalid)');}else if(l.unverifiedPath){r.text(' (unverified)');}r.close("span").close("div");r.close("td");r.close("tr");r.openStart("tr").openEnd();r.openStart("td").attr("colspan","2").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Absolute Path").close("label");r.close("td");r.openStart("td").openEnd();if(typeof l.absolutePath!=='undefined'){r.openStart("div").openEnd().text(l.absolutePath).close("div");}else{r.openStart("div").openEnd().text("No binding").close("div");}r.close("td");r.close("tr");r.openStart("tr").openEnd();r.openStart("td").attr("colspan","2").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Relative").close("label");r.close("td");r.openStart("td").openEnd();if(typeof l.isRelative!=='undefined'){r.openStart("div").openEnd().text(l.isRelative).close("div");}else{r.openStart("div").openEnd().text("No binding").close("div");}r.close("td");r.close("tr");r.openStart("tr").openEnd();r.openStart("td").attr("colspan","2").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Binding Type").close("label");r.close("td");r.openStart("td").openEnd();if(!o.type){r.openStart("div").openEnd().text("No binding").close("div");}else{r.openStart("div").attr("title",o.type).openEnd().text(h(o.type)).close("div");}r.close("td");r.close("tr");if(l.mode){r.openStart("tr").openEnd().openStart("td").attr("colspan","2").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Binding Mode").close("label");r.close("td");r.openStart("td").openEnd();r.openStart("div").openEnd().text(o.mode).close("div");r.close("td").close("tr");}r.openStart("tr").openEnd();r.openStart("td").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Model").close("label");r.close("td");r.openStart("td").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Name").close("label");r.close("td");r.openStart("td").openEnd();if(l.model&&l.model.name){r.openStart("div").openEnd().text(l.model.name).close("div");}else{r.openStart("div").openEnd().text("No binding").close("div");}r.close("td");r.close("tr");r.openStart("tr").openEnd();r.openStart("td").openEnd().close("td");r.openStart("td").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Type").close("label");r.close("td");r.openStart("td").openEnd();if(l.model&&l.model.type){r.openStart("div").openEnd().openStart("span").attr("title",l.model.type).openEnd().text(h(l.model.type)).close("span").close("div");}else{r.openStart("div").openEnd().openStart("span").openEnd().text("No binding").close("span").close("div");}r.close("td");r.close("tr");r.openStart("tr").openEnd();r.openStart("td").openEnd().close("td");r.openStart("td").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Default Binding Mode").close("label");r.close("td");r.openStart("td").openEnd();if(l.model&&l.model.bindingMode){r.openStart("div").openEnd().openStart("span").openEnd().text(l.model.bindingMode).close("span").close("div");}else{r.openStart("div").openEnd().openStart("span").openEnd().text("No binding").close("span").close("div");}r.close("td");r.close("tr");r.openStart("tr").openEnd();r.openStart("td").openEnd().close("td");r.openStart("td").openEnd();r.openStart("label").class("sapUiSupportLabel").openEnd().text("Location").close("label");r.close("td");r.openStart("td").openEnd();if(l.model&&l.model.location&&l.model.location.type){if(l.model.location.type==='control'){r.openStart("div").openEnd();r.openStart("a").class("control-tree").class("sapUiSupportLink").attr("title",l.model.location.name).attr("data-sap-ui-control-id",l.model.location.id).attr("href","#").openEnd().text(h(l.model.location.name)).text(" ("+l.model.location.id+")").close("a");r.close("div");}else{r.openStart("div").openEnd().openStart("span").attr("title","sap.ui.getCore()").openEnd().text("Core").close("span").close("div");}}else{r.openStart("div").openEnd().openStart("span").openEnd().text("No binding").close("span").close("div");}r.close("td");r.close("tr");r.close("tbody").close("table").close("div");});r.close("li");});r.close("ul");}r.flush(this.dom("#sapUiSupportControlPropertiesArea"));r.destroy();};f.prototype.renderBreakpointsTab=function(m,s){var r=sap.ui.getCore().createRenderManager();r.openStart("div").class("sapUiSupportControlMethods").attr("data-sap-ui-controlid",s).openEnd();r.openStart("select","sapUiSupportControlMethodsSelect").class("sapUiSupportAutocomplete").class("sapUiSupportSelect").openEnd();r.openStart("option").openEnd().close("option");e(m,function(i,v){if(!v.active){r.openStart("option").openEnd().text("oValue.name").close("option");}});r.close("select");r.voidStart("input").class("sapUiSupportControlBreakpointInput").class("sapUiSupportAutocomplete").attr("type","text").voidEnd();r.openStart("button","sapUiSupportControlAddBreakPoint").class("sapUiSupportRoundedButton").openEnd().text("Add breakpoint").close("button");r.voidStart("hr").class("no-border").voidEnd();r.openStart("ul","sapUiSupportControlActiveBreakpoints").class("sapUiSupportList").class("sapUiSupportBreakpointList").openEnd();e(m,function(i,v){if(!v.active){return;}r.openStart("li").openEnd().openStart("span").openEnd().text(v.name).close("span").voidStart("img").class("remove-breakpoint").attr("src","../../debug/images/delete.gif").voidEnd().close("li");});r.close("ul").close("div");r.flush(this.dom("#sapUiSupportControlPropertiesArea"));r.destroy();this.selectTab(this._tab.breakpoints);this.dom('.sapUiSupportControlBreakpointInput').focus();};f.prototype.renderExportTab=function(){var r=sap.ui.getCore().createRenderManager();r.openStart("button","sapUiSupportControlExportToXml").class("sapUiSupportRoundedButton").class("sapUiSupportExportButton").openEnd().text("Export To XML").close("button");r.voidStart("br").voidEnd();r.voidStart("br").voidEnd();r.openStart("button","sapUiSupportControlExportToHtml").class("sapUiSupportRoundedButton").class("sapUiSupportExportButton").openEnd().text("Export To HTML").close("button");r.flush(this.dom("#sapUiSupportControlPropertiesArea"));r.destroy();this.selectTab(this._tab.exports);};f.prototype.requestProperties=function(s){this._oStub.sendEvent(this._breakpointId+"RequestInstanceMethods",{controlId:s,callback:this.getId()+"ReceivePropertiesMethods"});};f.prototype.updateBreakpointCount=function(s,m){var i=$("#sap-debug-controltree-"+s+" > div span.sapUiSupportControlTreeBreakpointCount");if(m.active>0){i.text(m.active+" / "+m.all).toggleClass("sapUiSupportItemHidden",false);}else{i.text("").toggleClass("sapUiSupportItemHidden",true);}};f.prototype.onsapUiSupportControlTreeTriggerRequestProperties=function(o){this.requestProperties(o.getParameter("controlId"));};f.prototype.onsapUiSupportControlTreeReceivePropertiesMethods=function(o){var s=o.getParameter("controlId");this._oStub.sendEvent(this.getId()+"RequestProperties",{id:s,breakpointMethods:o.getParameter("methods")});this.updateBreakpointCount(s,JSON.parse(o.getParameter("breakpointCount")));};f.prototype.onsapUiSupportControlTreeReceiveControlTree=function(o){this.renderControlTree(JSON.parse(o.getParameter("controlTree")));};f.prototype.onsapUiSupportControlTreeReceiveControlTreeExportError=function(o){var s=o.getParameter("errorMessage");this._drawAlert(s);};f.prototype._drawAlert=function(s){alert("ERROR: The selected element cannot not be exported.\nPlease choose an other one.\n\nReason:\n"+s);};f.prototype.onsapUiSupportControlTreeReceiveControlTreeExport=function(o){var z;var v=JSON.parse(o.getParameter("serializedViews"));var t=o.getParameter("sType");if(!d(v)){z=new J();for(var i in v){var k=v[i];z.file(i.replace(/\./g,'/')+".view."+t.toLowerCase(),k);}}if(z){var l=z.generate({type:"blob"});F.save(l,t.toUpperCase()+"Export","zip","application/zip");}};f.prototype.onsapUiSupportSelectorSelect=function(o){this.selectControl(o.getParameter("id"));};f.prototype.onsapUiSupportControlTreeReceiveProperties=function(o){this.renderPropertiesTab(JSON.parse(o.getParameter("properties")),o.getParameter("id"));};f.prototype.onsapUiSupportControlTreeReceiveBindingInfos=function(o){this.renderBindingsTab(JSON.parse(o.getParameter("bindinginfos")),o.getParameter("id"));};f.prototype.onsapUiSupportControlTreeReceiveMethods=function(o){var s=o.getParameter("controlId");this.renderBreakpointsTab(JSON.parse(o.getParameter("methods")),s);this.updateBreakpointCount(s,JSON.parse(o.getParameter("breakpointCount")));};f.prototype._onNodeClick=function(o){var i=$(o.target);var k=i.closest("li");if(k.hasClass("sapUiControlTreeElement")){$(".sapUiControlTreeElement > div").removeClass("sapUiSupportControlTreeSelected");k.children("div").addClass("sapUiSupportControlTreeSelected");this._oStub.sendEvent("sapUiSupportSelectorHighlight",{id:k.attr("id").substring("sap-debug-controltree-".length)});var I=k.attr("id").substring("sap-debug-controltree-".length);if(i.hasClass("sapUiSupportControlTreeBreakpointCount")){this._currentTab=this._tab.breakpoints;}this.onAfterControlSelected(I);}o.stopPropagation();};f.prototype._onIconClick=function(o){var i=$(o.target);if(i.parent().attr("data-sap-ui-collapsed")){i.attr("src",i.attr("src").replace("plus","minus")).parent().removeAttr("data-sap-ui-collapsed");i.siblings("ul").toggleClass("sapUiSupportItemHidden",false);}else{i.attr("src",i.attr("src").replace("minus","plus")).parent().attr("data-sap-ui-collapsed","true");i.siblings("ul").toggleClass("sapUiSupportItemHidden",true);}if(o.stopPropagation){o.stopPropagation();}};f.prototype._onControlTreeLinkClick=function(o){this.selectControl($(o.target).closest("li").attr("data-sap-ui-controlid"));};f.prototype._onPropertiesTab=function(o){if(this.selectTab(this._tab.properties)){this.requestProperties(this.getSelectedControlId());}};f.prototype._onBindingInfosTab=function(o){if(this.selectTab(this._tab.bindinginfos)){this._oStub.sendEvent(this.getId()+"RequestBindingInfos",{id:this.getSelectedControlId()});}};f.prototype._onMethodsTab=function(o){if(this.selectTab(this._tab.breakpoints)){this._oStub.sendEvent(this._breakpointId+"RequestInstanceMethods",{controlId:this.getSelectedControlId(),callback:this.getId()+"ReceiveMethods"});}};f.prototype._onExportTab=function(o){if(this.selectTab(this._tab.exports)){this.renderExportTab();}};f.prototype._autoComplete=function(o){if(o.keyCode==K.ENTER){this._updateSelectOptions(o);this._onAddBreakpointClicked();}if(o.keyCode>=K.ARROW_LEFT&&o.keyCode<=K.ARROW_DOWN){return;}var k=$(o.target),l=k.prev("select"),I=k.val();if(I==""){return;}var m=l.find("option").map(function(){return $(this).val();}).get();var s;for(var i=0;i<m.length;i++){s=m[i];if(s.toUpperCase().indexOf(I.toUpperCase())==0){var n=k.cursorPos();if(o.keyCode==K.BACKSPACE){n--;}k.val(s);k.selectText(n,s.length);break;}}return;};f.prototype._updateSelectOptions=function(o){var s=o.target;if(s.tagName=="INPUT"){var v=s.value;s=s.previousSibling;var k=s.options;for(var i=0;i<k.length;i++){var t=k[i].value||k[i].text;if(t.toUpperCase()==v.toUpperCase()){s.selectedIndex=i;break;}}}var l=s.selectedIndex;var m=s.options[l].value||s.options[l].text;if(s.nextSibling&&s.nextSibling.tagName=="INPUT"){s.nextSibling.value=m;}};f.prototype._onAddBreakpointClicked=function(o){var s=this.dom("#sapUiSupportControlMethodsSelect");this._oStub.sendEvent(this._breakpointId+"ChangeInstanceBreakpoint",{controlId:s.closest("[data-sap-ui-controlid]").dataset.sapUiControlid,methodName:s.value,active:true,callback:this.getId()+"ReceiveMethods"});};f.prototype._onExportToXmlClicked=function(o){this._startSerializing("XML");};f.prototype._onExportToHtmlClicked=function(o){this._startSerializing("HTML");};f.prototype._startSerializing=function(t){var s=this.getSelectedControlId();if(s){this._oStub.sendEvent(this.getId()+"RequestControlTreeSerialize",{controlID:s,sType:t});}else{this._drawAlert("Nothing to export. Please select an item in the control tree.");}};f.prototype._onRemoveBreakpointClicked=function(o){var i=$(o.target);this._oStub.sendEvent(this._breakpointId+"ChangeInstanceBreakpoint",{controlId:i.closest("[data-sap-ui-controlid]").attr("data-sap-ui-controlid"),methodName:i.siblings('span').text(),active:false,callback:this.getId()+"ReceiveMethods"});};f.prototype._selectOptionsChanged=function(o){var s=o.target;var i=s.nextSibling;i.value=s.options[s.selectedIndex].value;};f.prototype._onPropertyChange=function(o){var s=o.target;var i=$(s);var I=i.closest("[data-sap-ui-controlid]").attr("data-sap-ui-controlid");var v=i.val();if(i.attr("type")==="checkbox"){v=""+i.is(":checked");}this._oStub.sendEvent(this.getId()+"ChangeProperty",{id:I,name:i.attr("data-sap-ui-name"),value:v});};f.prototype._onPropertyBreakpointChange=function(o){var i=$(o.target);this._oStub.sendEvent(this._breakpointId+"ChangeInstanceBreakpoint",{controlId:i.closest("[data-sap-ui-controlid]").attr("data-sap-ui-controlid"),methodName:i.attr("data-sap-ui-method"),active:i.is(":checked"),callback:this.getId()+"TriggerRequestProperties"});};f.prototype._onNavToControl=function(o){var i=$(o.target);var I=i.attr("data-sap-ui-control-id");if(I!==this.getSelectedControlId()){this.selectControl(I);}};f.prototype._onRefreshBinding=function(o){var i=$(o.target);var I=i.closest("[data-sap-ui-controlid]").attr("data-sap-ui-controlid");var n=i.closest("[data-sap-ui-binding-name]").attr("data-sap-ui-binding-name");this._oStub.sendEvent(this.getId()+"RefreshBinding",{id:I,name:n});};f.prototype.selectTab=function(t){var o=this.dom("#sapUiSupportControlTab"+t);if(o.classList.contains("active")){return false;}this.$().find("#sapUiSupportControlTabs button").removeClass("active");o.classList.add("active");this._currentTab=t;return true;};f.prototype.getSelectedControlId=function(){var i=this.$().find(".sapUiSupportControlTreeSelected");if(i.length===0){return undefined;}else{return i.parent().attr("id").substring("sap-debug-controltree-".length);}};f.prototype.selectControl=function(s){if(!s){return;}$(".sapUiControlTreeElement > div").removeClass("sapUiSupportControlTreeSelected");var t=this;$(document.getElementById("sap-debug-controltree-"+s)).parents("[data-sap-ui-collapsed]").each(function(i,v){t._onIconClick({target:$(v).find("img:first").get(0)});});var p=$(document.getElementById("sap-debug-controltree-"+s)).children("div").addClass("sapUiSupportControlTreeSelected").position();var S=this.$().find("#sapUiSupportControlTreeArea").scrollTop();this.$().find("#sapUiSupportControlTreeArea").scrollTop(S+p.top);this.onAfterControlSelected(s);};f.prototype.onAfterControlSelected=function(i){if(this._currentTab==this._tab.properties){this.requestProperties(i);}else if(this._currentTab==this._tab.breakpoints){this._oStub.sendEvent(this._breakpointId+"RequestInstanceMethods",{controlId:i,callback:this.getId()+"ReceiveMethods"});}else if(this._currentTab==this._tab.bindinginfos){this._oStub.sendEvent(this.getId()+"RequestBindingInfos",{id:this.getSelectedControlId()});}};function j(s){this.onsapUiSupportControlTreeRequestControlTree();}f.prototype.onsapUiSupportControlTreeRequestControlTree=function(o){this._oStub.sendEvent(this.getId()+"ReceiveControlTree",{controlTree:JSON.stringify(this.getControlTree())});};f.prototype.onsapUiSupportControlTreeRequestControlTreeSerialize=function(o){var k=this.oCore.byId(o.getParameter("controlID"));var t=o.getParameter("sType");var v;var m;var s=t+"ViewExported";X.create({definition:document}).then(function(l){l.setViewName(s);l._controllerName=t+"ViewController";try{if(k){if(k instanceof b){v=new V(k,window,"sap.m");}else{l.addContent(k.clone());v=new V(l,window,"sap.m");}m=(t&&t!=="XML")?v.serializeToHTML():v.serializeToXML();}else{var u=this.oCore.getUIArea(o.getParameter("controlID"));var n=u.getContent();for(var i=0;i<n.length;i++){l.addContent(n[i]);}v=new V(l,window,"sap.m");m=(t&&t!=="XML")?v.serializeToHTML():v.serializeToXML();for(var i=0;i<n.length;i++){u.addContent(n[i]);}}if(v){this._oStub.sendEvent(this.getId()+"ReceiveControlTreeExport",{serializedViews:JSON.stringify(m),sType:t});}}catch(p){this._oStub.sendEvent(this.getId()+"ReceiveControlTreeExportError",{errorMessage:p.message});}}.bind(this));};f.prototype.onsapUiSupportControlTreeRequestProperties=function(o){var i=JSON.parse(o.getParameter("breakpointMethods"));var k=this.getControlProperties(o.getParameter("id"),i);this._oStub.sendEvent(this.getId()+"ReceiveProperties",{id:o.getParameter("id"),properties:JSON.stringify(k)});};f.prototype.onsapUiSupportControlTreeChangeProperty=function(o){var i=o.getParameter("id");var k=this.oCore.byId(i);if(k){var n=o.getParameter("name");var v=o.getParameter("value");var p=k.getMetadata().getProperty(n);if(p&&p.type){var t=D.getType(p.type);if(t instanceof D){var l=t.parseValue(v);if(t.isValid(l)&&l!=="(null)"){k[p._sMutator](l);}}else if(t){if(t[v]){k[p._sMutator](v);}}}}};f.prototype.onsapUiSupportControlTreeRequestBindingInfos=function(o){var i=o.getParameter("id");this._oStub.sendEvent(this.getId()+"ReceiveBindingInfos",{id:i,bindinginfos:JSON.stringify(this.getControlBindingInfos(i))});};f.prototype.onsapUiSupportControlTreeRefreshBinding=function(o){var i=o.getParameter("id");var s=o.getParameter("name");this.refreshBinding(i,s);this._oStub.sendEvent(this.getId()+"ReceiveBindingInfos",{id:i,bindinginfos:JSON.stringify(this.getControlBindingInfos(i))});};f.prototype.getControlTree=function(){var o=this.oCore,k=[],A={};function s(i){var m={id:i.getId(),type:"",aggregation:[],association:[]};A[m.id]=m.id;if(i instanceof U){m.library="sap.ui.core";m.type="sap.ui.core.UIArea";e(i.getContent(),function(I,i){var x=s(i);m.aggregation.push(x);});}else{m.library=i.getMetadata().getLibraryName();m.type=i.getMetadata().getName();if(i.mAggregations){for(var n in i.mAggregations){var p=i.mAggregations[n];if(p){var q=Array.isArray(p)?p:[p];e(q,function(I,x){if(x instanceof E){var y=s(x);m.aggregation.push(y);}});}}}if(i.mAssociations){var r=i.getMetadata().getAllAssociations();for(var t in i.mAssociations){var u=i.mAssociations[t];var v=(r[t])?r[t].type:null;if(u&&v){var w=Array.isArray(u)?u:[u];e(w,function(I,x){m.association.push({id:x,type:v,name:t,isAssociationLink:true});});}}}}return m;}e(o.mUIAreas,function(i,u){var m=s(u);k.push(m);});function l(I,m){for(var i=0;i<m.association.length;i++){var n=m.association[i];if(!A[n.id]){var t=O.get(n.type||"");if(!(typeof t==="function")){continue;}var S=t.getMetadata().getStereotype(),p=null;switch(S){case"element":case"control":p=o.byId(n.id);break;case"component":p=C.get(n.id);break;case"template":p=T.byId(n.id);break;default:break;}if(!p){continue;}m.association[i]=s(p);m.association[i].isAssociation=true;l(0,m.association[i]);}}e(m.aggregation,l);}e(k,l);return k;};f.prototype.getControlProperties=function(i,m){var p=/^((boolean|string|int|float)(\[\])?)$/;var k=[];var l=this.oCore.byId(i);if(!l&&this.oCore.getUIArea(i)){k.push({control:"sap.ui.core.UIArea",properties:[],aggregations:[]});}else if(l){var M=l.getMetadata();while(M instanceof a){var n={control:M.getName(),properties:[],aggregations:[]};var q=M.getProperties();e(q,function(s,r){var t={};e(r,function(N,v){if(N.substring(0,1)!=="_"||(N=='_sGetter'||N=='_sMutator')){t[N]=v;}if(N=='_sGetter'||N=='_sMutator'){t["bp"+N]=m.filter(function(o){return o.name===v&&o.active;}).length===1;}var u=D.getType(r.type);if(u&&u.isEnumType()){t["enumValues"]=u.getEnumValues();}});t.value=l.getProperty(s);t.isBound=!!l.mBindingInfos[s];n.properties.push(t);});var A=M.getAggregations();e(A,function(s,r){if(r.altTypes&&r.altTypes[0]&&p.test(r.altTypes[0])&&typeof(l.getAggregation(s))!=='object'){var t={};e(r,function(N,v){if(N.substring(0,1)!=="_"||(N=='_sGetter'||N=='_sMutator')){t[N]=v;}if(N=='_sGetter'||N=='_sMutator'){t["bp"+N]=m.filter(function(o){return o.name===v&&o.active;}).length===1;}});t.value=l.getAggregation(s);n.aggregations.push(t);}});k.push(n);M=M.getParent();}}return k;};f.prototype.getControlBindingInfos=function(i){var m={bindings:[],contexts:[]};var o=this.oCore.byId(i);if(!o){return m;}var k=o.mBindingInfos;var t=this;for(var l in k){if(k.hasOwnProperty(l)){var n=k[l];var p=[];var q,r=[];if(Array.isArray(n.parts)){q=n.parts;}else{q=[n];}if(n.binding instanceof c){r=n.binding.getBindings();}else if(n.binding instanceof B){r=[n.binding];}e(q,function(I,y){var z={};z.invalidPath=true;z.path=y.path;z.mode=y.mode;z.model={name:y.model};if(r.length>I&&r[I]){var A=r[I],M=A.getModel(),G=A.getPath(),H;if(M){H=M.resolve(G,A.getContext());if(M.isA("sap.ui.model.odata.v4.ODataModel")){z.unverifiedPath=true;z.invalidPath=false;}else{if(M.getProperty(H)!==undefined&&M.getProperty(H)!==null){z.invalidPath=false;}else if(M.getProperty(G)!==undefined&&M.getProperty(G)!==null){z.invalidPath=false;H=G;}}}z.absolutePath=(typeof(H)==='undefined')?'Unresolvable':H;z.isRelative=A.isRelative();z.model=t.getBindingModelInfo(A,o);}p.push(z);});m.bindings.push({name:l,type:(n.binding)?n.binding.getMetadata().getName():undefined,bindings:p});}}function s(y,M){var z={modelName:(M==='undefined')?'none (default)':M,path:y.getPath()};if(y.getModel().isA("sap.ui.model.odata.v4.ODataModel")){z.unverifiedPath=true;}else{if(!y.getObject()==null){z.invalidPath=true;}}return z;}var u=o.oBindingContexts;for(var v in u){if(u.hasOwnProperty(v)){m.contexts.push(s(u[v],v));}}var u=o.oPropagatedProperties.oBindingContexts;for(var v in u){if(u.hasOwnProperty(v)&&!o.oBindingContexts[v]){var w=s(u[v],v);var x=o;do{if(x.oBindingContexts[v]==u[v]){w.location={id:x.getId(),name:x.getMetadata().getName()};break;}}while((x=x.getParent()));m.contexts.push(w);}}return m;};f.prototype.getBindingModelInfo=function(o,i){var m={};var k=o.getModel();function l(M){for(var s in M){if(M.hasOwnProperty(s)){if(M[s]===k){return s;}}}return null;}m.name=l(i.oModels)||l(i.oPropagatedProperties.oModels);if(m.name){var n=i;do{if(n.oModels[m.name]===k){m.location={type:'control',id:n.getId(),name:n.getMetadata().getName()};break;}}while((n=n.getParent()));if(!m.location){var p=null;if(m.name==='undefined'){p=this.oCore.getModel();}else{p=this.oCore.getModel(m.name);}if(p){m.location={type:'core'};}}}m.type=k.getMetadata().getName();m.bindingMode=k.getDefaultBindingMode();m.name=(m.name==='undefined')?'none (default)':m.name;return m;};f.prototype.refreshBinding=function(I,s){var o=this.oCore.byId(I);var m=o.mBindingInfos[s];if(!o||!m){return;}var k=m.binding;if(!k){return;}if(k instanceof c){var l=k.getBindings();for(var i=0;i<l.length;i++){l[i].refresh();}}else{k.refresh();}};return f;});
