// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/components/_HomepageManager/PagingManager","sap/ui/thirdparty/jquery","sap/ushell/resources","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/library","sap/ui/Device","sap/ui/core/library","sap/ui/model/Context","sap/m/MessageToast","sap/ushell/Config","sap/ushell/services/AppType","sap/ushell/utils/WindowUtils"],function(P,q,r,F,a,m,D,c,C,M,b,A,W){"use strict";var V=c.mvc.ViewType;var S=m.SplitAppMode;sap.ui.controller("sap.ushell.components.appfinder.Catalog",{oPopover:null,onInit:function(){this.categoryFilter="";this.preCategoryFilter="";this.oMainModel=this.oView.getModel();this.oSubHeaderModel=this.oView.getModel("subHeaderModel");this.resetPage=false;this.bIsInProcess=false;var t=this;sap.ui.getCore().byId("catalogSelect").addEventDelegate({onBeforeRendering:this.onBeforeSelectRendering},this);var R=this.getView().parentComponent.getRouter();R.attachRouteMatched(function(e){t.onShow(e);});this.timeoutId=0;document.subHeaderModel=this.oSubHeaderModel;document.mainModel=this.oMainModel;var T=this.oSubHeaderModel.bindProperty("/openCloseSplitAppButtonToggled");T.attachChange(t.handleToggleButtonModelChanged.bind(this));this.oView.oCatalogsContainer.setHandleSearchCallback(t.handleSearchModelChanged.bind(this));},onBeforeRendering:function(){sap.ui.getCore().getEventBus().publish("renderCatalog");},onAfterRendering:function(){this.wasRendered=true;if(!this.PagingManager){this._setPagingManager();}if(this.PagingManager.currentPageIndex===0){this.allocateNextPage();}q(window).resize(function(){var w=q(window).width(),d=q(window).height();this.PagingManager.setContainerSize(w,d);}.bind(this));this._handleAppFinderWithDocking();sap.ui.getCore().getEventBus().subscribe("launchpad","appFinderWithDocking",this._handleAppFinderWithDocking,this);sap.ui.getCore().getEventBus().subscribe("sap.ushell","appFinderAfterNavigate",this._handleAppFinderAfterNavigate,this);},_setPagingManager:function(){this.lastCatalogId=0;this.PagingManager=new P("catalogPaging",{supportedElements:{tile:{className:"sapUshellTile"}},containerHeight:window.innerHeight,containerWidth:window.innerWidth});this.getView().getCatalogContainer().setPagingManager(this.PagingManager);},_decodeUrlFilteringParameters:function(u){var U;try{U=JSON.parse(u);}catch(e){U=u;}var h=(U&&U.tagFilter&&U.tagFilter)||[];if(h){try{this.tagFilter=JSON.parse(h);}catch(e){this.tagFilter=[];}}else{this.tagFilter=[];}this.categoryFilter=(U&&U.catalogSelector&&U.catalogSelector)||this.categoryFilter;if(this.categoryFilter){this.categoryFilter=window.decodeURIComponent(this.categoryFilter);}this.searchFilter=(U&&U.tileFilter&&U.tileFilter)||null;if(this.searchFilter){this.searchFilter=window.decodeURIComponent(this.searchFilter);}},_applyFilters:function(w){var s=false;if(this.categoryFilter){this.categoryFilter=r.i18n.getText("all")===this.categoryFilter?"":this.categoryFilter;if(this.categoryFilter!==this.preCategoryFilter){s=true;}this.oView.setCategoryFilterSelection(this.categoryFilter,s);}else{s=true;this.oView.setCategoryFilterSelection("",s);}this.preCategoryFilter=this.categoryFilter;if(this.searchFilter&&this.searchFilter.length){this.searchFilter=this.searchFilter.replace(/\*/g,"");this.searchFilter=this.searchFilter.trim();this.oSubHeaderModel.setProperty("/search",{searchMode:true,searchTerm:this.searchFilter});}else if(w){this.oSubHeaderModel.setProperty("/search",{searchMode:false,searchTerm:""});this.resetPage=true;}if(this.tagFilter&&this.tagFilter.length){this.oSubHeaderModel.setProperty("/tag",{tagMode:true,selectedTags:this.tagFilter});}else if(w){this.oSubHeaderModel.setProperty("/tag",{tagMode:false,selectedTags:[]});this.resetPage=true;}this.handleSearchModelChanged();},_handleAppFinderAfterNavigate:function(){this.clearFilters();},clearFilters:function(){var s=false;if(this.categoryFilter!==this.preCategoryFilter){s=true;}var d=this.oSubHeaderModel.getProperty("/search/searchMode"),t=this.oSubHeaderModel.getProperty("/tag/tagMode");if(d){this.oSubHeaderModel.setProperty("/search",{searchMode:true,searchTerm:""});}if(t){this.oSubHeaderModel.setProperty("/tag",{tagMode:true,selectedTags:[]});}if(this.categoryFilter&&this.categoryFilter!==""){this.selectedCategoryId=undefined;this.categoryFilter=undefined;this.getView().getModel().setProperty("/categoryFilter","");this.oView.setCategoryFilterSelection("",s);}this.preCategoryFilter=this.categoryFilter;this.handleSearchModelChanged();},onShow:function(e){var u=e.getParameter("arguments").filters;q.extend(this.getView().getViewData(),e);this._decodeUrlFilteringParameters(u);if(this.wasRendered&&!u){this.clearFilters();}else{this._applyFilters(this.wasRendered);}},allocateNextPage:function(){var o=this.getView().getCatalogContainer();if(!o.nAllocatedUnits||o.nAllocatedUnits===0){this.PagingManager.moveToNextPage();this.allocateTiles=this.PagingManager._calcElementsPerPage();o.applyPagingCategoryFilters(this.allocateTiles,this.categoryFilter);}},onBeforeSelectRendering:function(){var s=sap.ui.getCore().byId("catalogSelect"),i=q.grep(s.getItems(),q.proxy(function(I){return I.getBindingContext().getObject().title===this.categoryFilter;},this));if(!i.length&&s.getItems()[0]){i.push(s.getItems()[0]);}},setTagsFilter:function(f){var p={catalogSelector:this.categoryFilter?this.categoryFilter:"All",tileFilter:(this.searchFilter&&this.searchFilter.length)?encodeURIComponent(this.searchFilter):"",tagFilter:f.length?JSON.stringify(f):[],targetGroup:encodeURIComponent(this.getGroupContext())};this.getView().parentComponent.getRouter().navTo("catalog",{filters:JSON.stringify(p)});},setCategoryFilter:function(f){var p={catalogSelector:f,tileFilter:this.searchFilter?encodeURIComponent(this.searchFilter):"",tagFilter:this.tagFilter.length?JSON.stringify(this.tagFilter):[],targetGroup:encodeURIComponent(this.getGroupContext())};this.getView().parentComponent.getRouter().navTo("catalog",{filters:JSON.stringify(p)});},setSearchFilter:function(f){var p={catalogSelector:this.categoryFilter?this.categoryFilter:"All",tileFilter:f?encodeURIComponent(f):"",tagFilter:this.tagFilter.length?JSON.stringify(this.tagFilter):[],targetGroup:encodeURIComponent(this.getGroupContext())};this.getView().parentComponent.getRouter().navTo("catalog",{filters:JSON.stringify(p)});},onSearch:function(s){var d=this.oSubHeaderModel.getProperty("/activeMenu");if(this.oView.getId().indexOf(d)!==-1){var e=s.searchTerm?s.searchTerm:"";this.setSearchFilter(e);}else{this._restoreSelectedMasterItem();}},onTag:function(t){var s=this.oSubHeaderModel.getProperty("/activeMenu");if(this.oView.getId().indexOf(s)!==-1){var d=t.selectedTags?t.selectedTags:[];this.setTagsFilter(d);}else{this._restoreSelectedMasterItem();}},getGroupContext:function(){var o=this.getView().getModel(),g=o.getProperty("/groupContext/path");return g||"";},_isTagFilteringChanged:function(s){var d=s.length===this.tagFilter.length,i=d;if(!i){return true;}s.some(function(t){i=this.tagFilter&&Array.prototype.indexOf.call(this.tagFilter,t)!==-1;return!i;}.bind(this));return i;},_setUrlWithTagsAndSearchTerm:function(s,d){var u={tileFilter:s&&s.length?encodeURIComponent(s):"",tagFilter:d.length?JSON.stringify(d):[],targetGroup:encodeURIComponent(this.getGroupContext())};this.getView().parentComponent.getRouter().navTo("catalog",{filters:JSON.stringify(u)});},handleSearchModelChanged:function(){var s=this.oSubHeaderModel.getProperty("/search/searchMode"),t=this.oSubHeaderModel.getProperty("/tag/tagMode"),p,d=this.oSubHeaderModel.getProperty("/search/searchTerm"),e=this.oSubHeaderModel.getProperty("/tag/selectedTags"),o,f,g,h=[],i;if(!this.PagingManager){this._setPagingManager();}this.PagingManager.resetCurrentPageIndex();this.nAllocatedTiles=0;this.PagingManager.moveToNextPage();this.allocateTiles=this.PagingManager._calcElementsPerPage();this.oView.oCatalogsContainer.updateAllocatedUnits(this.allocateTiles);this.oView.oCatalogsContainer.resetCatalogPagination();var j=sap.ui.getCore().byId("catalogTilesDetailedPage");if(j){j.scrollTo(0,0);}if(s||t||this.resetPage){if(e&&e.length>0){o=new F("tags","EQ","v");o.fnTest=function(T){var x,y;if(e.length===0){return true;}for(x=0;x<e.length;x++){y=e[x];if(T.indexOf(y)===-1){return false;}}return true;};f=new F([o],true);}d=d?d.replace(/\*/g,""):d;if(d){var k=d.split(/[\s,]+/);var l=new F(q.map(k,function(x){return(x&&new F("keywords",a.Contains,x));}),true);var n=new F(q.map(k,function(x){return(x&&new F("title",a.Contains,x));}),true);var u=new F(q.map(k,function(x){return(x&&new F("subtitle",a.Contains,x));}),true);h.push(l);h.push(n);h.push(u);g=new F(h,false);}var v=this.oView.oCatalogsContainer.getCatalogs();this.oSearchResultsTotal=[];var w=this;if(f&&f.aFilters.length>0&&g){i=new F([g].concat([f]),true);}else if(f&&f.aFilters.length>0){i=new F([f],true);}else if(g&&g.aFilters.length>0){i=new F([g],true);}v.forEach(function(x){x.getBinding("customTilesContainer").filter(i);x.getBinding("appBoxesContainer").filter(i);});this.oView.oCatalogsContainer.bSearchResults=false;this.oView.oCatalogsContainer.applyPagingCategoryFilters(this.oView.oCatalogsContainer.nAllocatedUnits,this.categoryFilter);this.bSearchResults=this.oView.oCatalogsContainer.bSearchResults;this.oView.splitApp.toDetail(w.getView()._calculateDetailPageId());this.resetPage=false;}else{this.oView.oCatalogsContainer.applyPagingCategoryFilters(this.oView.oCatalogsContainer.nAllocatedUnits,this.categoryFilter);}p=this.getView()._calculateDetailPageId();this.oView.splitApp.toDetail(p);},_handleAppFinderWithDocking:function(){if(q(".sapUshellContainerDocked").length>0){if(q("#mainShell").width()<710){if(window.innerWidth<1024){this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible",false);this.oView.splitApp.setMode(S.ShowHideMode);}else{this.oView.splitApp.setMode(S.HideMode);this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible",true);}}else{this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible",false);this.oView.splitApp.setMode(S.ShowHideMode);}}},_restoreSelectedMasterItem:function(){var o=this.oView.splitApp.getMasterPage("catalogSelect"),O=sap.ui.getCore().byId(this.selectedCategoryId);if(O){this.categoryFilter=O.getTitle();}o.setSelectedItem(O);},handleToggleButtonModelChanged:function(){var B=this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonVisible"),d=this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonToggled");if((d!==this.bCurrentButtonToggled)&&B){if(!D.system.phone){if(d&&!this.oView.splitApp.isMasterShown()){this.oView.splitApp.showMaster();}else if(this.oView.splitApp.isMasterShown()){this.oView.splitApp.hideMaster();}}else if(this.oView.splitApp.isMasterShown()){var o=sap.ui.getCore().byId(this.getView()._calculateDetailPageId());this.oView.splitApp.toDetail(o);}else if(d){var e=sap.ui.getCore().byId("catalogSelect");this.oView.splitApp.toMaster(e,"show");}}this.bCurrentButtonToggled=d;},_handleCatalogListItemPress:function(e){this.onCategoryFilter(e);if(this.oSubHeaderModel.getProperty("/search/searchTerm")!==""){this.oSubHeaderModel.setProperty("/search/searchMode",true);}if(D.system.phone||D.system.tablet){this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled",!this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled"));}},onCategoryFilter:function(e){var o=e.getSource(),s=o.getSelectedItem(),d=s.getBindingContext(),f=d.getModel();if(f.getProperty("static",d)){f.setProperty("/showCatalogHeaders",true);this.setCategoryFilter();this.selectedCategoryId=undefined;this.categoryFilter=undefined;}else{f.setProperty("/showCatalogHeaders",false);this.setCategoryFilter(window.encodeURIComponent(s.getBindingContext().getObject().title));this.categoryFilter=s.getTitle();this.selectedCategoryId=s.getId();}},onTileAfterRendering:function(e){var j=q(e.oSource.getDomRef()),d=j.find(".sapMGT");d.attr("tabindex","-1");},catalogTilePress:function(){sap.ui.getCore().getEventBus().publish("launchpad","catalogTileClick");},onAppBoxPressed:function(e){var o=e.getSource(),t=o.getBindingContext().getObject(),p;if(e.mParameters.srcControl.$().closest(".sapUshellPinButton").length){return;}p=sap.ushell.Container.getService("LaunchPage").getAppBoxPressHandler(t);if(p){p(t);}else{var u=o.getProperty("url");if(u&&u.indexOf("#")===0){hasher.setHash(u);}else{var l=b.last("/core/shell/enableRecentActivity")&&b.last("/core/shell/enableRecentActivityLogging");if(l){var R={title:o.getProperty("title"),appType:A.URL,url:u,appId:u};sap.ushell.Container.getRenderer("fiori2").logRecentActivity(R);}W.openURL(u,"_blank");}}},onTilePinButtonClick:function(e){var l=sap.ushell.Container.getService("LaunchPage");var d=l.getDefaultGroup();d.done(function(o){var f=e.getSource(),s=f.getBindingContext(),g=this.getView().getModel(),G=g.getProperty("/groupContext/path");if(G){this._handleTileFooterClickInGroupContext(s,G);}else{var h=g.getProperty("/groups");var l=sap.ushell.Container.getService("LaunchPage");var i=this.getCatalogTileDataFromModel(s);var t=i.tileData.associatedGroups;var j=[];var k=h.map(function(v){var w,x,T;w=l.getGroupId(v.object);x=!((t&&Array.prototype.indexOf.call(t,w)===-1));T={id:w,title:this._getGroupTitle(o,v.object),selected:x};j.push(T);return{selected:x,initiallySelected:x,oGroup:v};}.bind(this));var p=sap.ui.getCore().byId("sapUshellGroupsPopover");var n;if(!p){n=l.getCatalogTilePreviewTitle(g.getProperty(s.sPath).src);if(!n){n=l.getCatalogTileTitle(g.getProperty(s.sPath).src);}var u=new sap.ui.view("sapUshellGroupsPopover",{type:V.JS,viewName:"sap.ushell.components.appfinder.GroupListPopover",viewData:{groupData:k,title:n,enableHideGroups:g.getProperty("/enableHideGroups"),enableHelp:g.getProperty("/enableHelp"),sourceContext:s,catalogModel:this.getView().getModel(),catalogController:this}});u.getController().setSelectedStart(j);u.open(f).then(this._handlePopoverResponse.bind(this,s,i));}}}.bind(this));},_getGroupTitle:function(d,g){var l=sap.ushell.Container.getService("LaunchPage"),t;if(d&&(l.getGroupId(d)===l.getGroupId(g))){t=r.i18n.getText("my_group");}else{t=l.getGroupTitle(g);}return t;},_handlePopoverResponse:function(s,d,e){if(!e.addToGroups.length&&!e.newGroups.length&&!e.removeFromGroups.length){return;}var o=this.getView().getModel();var g=o.getProperty("/groups");var p=[];e.addToGroups.forEach(function(f){var i=g.indexOf(f);var G=new C(o,"/groups/"+i);var h=this._addTile(s,G);p.push(h);}.bind(this));e.removeFromGroups.forEach(function(f){var t=s.getModel().getProperty(s.getPath()).id;var i=g.indexOf(f);var h=this._removeTile(t,i);p.push(h);}.bind(this));e.newGroups.forEach(function(f){var n=(f.length>0)?f:r.i18n.getText("new_group_name");var h=this._createGroupAndSaveTile(s,n);p.push(h);}.bind(this));q.when.apply(q,p).then(function(){var f=Array.prototype.slice.call(arguments);this._handlePopoverGroupsActionPromises(d,e,f);}.bind(this));},_handlePopoverGroupsActionPromises:function(d,p,e){var f=e.filter(function(k){return!k.status;});if(f.length){var E=this.prepareErrorMessage(f,d.tileData.title);var g=sap.ushell.components.getCatalogsManager();g.resetAssociationOnFailure(E.messageId,E.parameters);return;}var t=[];var l=sap.ushell.Container.getService("LaunchPage");p.allGroups.forEach(function(k){if(k.selected){var u=l.getGroupId(k.oGroup.object);t.push(u);}});var o=this.getView().getModel();if(p.newGroups.length){var h=o.getProperty("/groups");var n=h.slice(h.length-p.newGroups.length);n.forEach(function(k){var u=l.getGroupId(k.object);t.push(u);});}o.setProperty(d.bindingContextPath+"/associatedGroups",t);var i=(p.addToGroups[0])?p.addToGroups[0].title:"";if(!i.length&&p.newGroups.length){i=p.newGroups[0];}var j=(p.removeFromGroups[0])?p.removeFromGroups[0].title:"";var s=this.prepareDetailedMessage(d.tileData.title,p.addToGroups.length+p.newGroups.length,p.removeFromGroups.length,i,j);M.show(s,{duration:3000,width:"15em",my:"center bottom",at:"center bottom",of:window,offset:"0 -50",collision:"fit fit"});},_getCatalogTileIndexInModel:function(s){var t=s.sPath,d=t.split("/"),e=d[d.length-1];return e;},_handleTileFooterClickInGroupContext:function(s,g){var l=sap.ushell.Container.getService("LaunchPage"),o=this.getView().getModel(),d=this.getCatalogTileDataFromModel(s),e=d.tileData.associatedGroups,G=o.getProperty(g),f=l.getGroupId(G.object),i=e?Array.prototype.indexOf.call(e,f):-1,t=d.bindingContextPath,h,j,R,T,k,n=this;if(d.isBeingProcessed){return;}o.setProperty(t+"/isBeingProcessed",true);if(i===-1){h=new C(s.getModel(),g);j=this._addTile(s,h);j.done(function(p){if(p.status==1){n._groupContextOperationSucceeded(s,d,G,true);}else{n._groupContextOperationFailed(d,G,true);}});j.always(function(){o.setProperty(t+"/isBeingProcessed",false);});}else{T=s.getModel().getProperty(s.getPath()).id;k=g.split("/")[2];R=this._removeTile(T,k);R.done(function(p){if(p.status==1){n._groupContextOperationSucceeded(s,d,G,false);}else{n._groupContextOperationFailed(d,G,false);}});R.always(function(){o.setProperty(t+"/isBeingProcessed",false);});}},_groupContextOperationSucceeded:function(s,o,g,t){var l=sap.ushell.Container.getService("LaunchPage"),G=l.getGroupId(g.object),d=o.tileData.associatedGroups,e,i;if(t){d.push(G);s.getModel().setProperty(o.bindingContextPath+"/associatedGroups",d);e=this.prepareDetailedMessage(o.tileData.title,1,0,g.title,"");}else{for(i in d){if(d[i]===G){d.splice(i,1);break;}}s.getModel().setProperty(o.bindingContextPath+"/associatedGroups",d);e=this.prepareDetailedMessage(o.tileData.title,0,1,"",g.title);}M.show(e,{duration:3000,width:"15em",my:"center bottom",at:"center bottom",of:window,offset:"0 -50",collision:"fit fit"});},_groupContextOperationFailed:function(o,g,t){var d=sap.ushell.components.getCatalogsManager(),e;if(t){e=r.i18n.getText({messageId:"fail_tile_operation_add_to_group",parameters:[o.tileData.title,g.title]});}else{e=r.i18n.getText({messageId:"fail_tile_operation_remove_from_group",parameters:[o.tileData.title,g.title]});}d.notifyOnActionFailure(e.messageId,e.parameters);},prepareErrorMessage:function(e,t){var g,s,f,d,n=0,N=0,h=false,i;for(var j in e){g=e[j].group;s=e[j].action;if(s==="add"){n++;if(n===1){f=g.title;}}else if(s==="remove"){N++;if(N===1){d=g.title;}}else if(s==="addTileToNewGroup"){n++;if(n===1){f=g.title;}}else{h=true;}}if(h){if(e.length===1){i=r.i18n.getText({messageId:"fail_tile_operation_create_new_group"});}else{i=r.i18n.getText({messageId:"fail_tile_operation_some_actions"});}}else if(e.length===1){if(n){i=r.i18n.getText({messageId:"fail_tile_operation_add_to_group",parameters:[t,f]});}else{i=r.i18n.getText({messageId:"fail_tile_operation_remove_from_group",parameters:[t,d]});}}else if(N===0){i=r.i18n.getText({messageId:"fail_tile_operation_add_to_several_groups",parameters:[t]});}else if(n===0){i=r.i18n.getText({messageId:"fail_tile_operation_remove_from_several_groups",parameters:[t]});}else{i=r.i18n.getText({messageId:"fail_tile_operation_some_actions"});}return i;},prepareDetailedMessage:function(t,n,d,f,e){var g;if(n===0){if(d===1){g=r.i18n.getText("tileRemovedFromSingleGroup",[t,e]);}else if(d>1){g=r.i18n.getText("tileRemovedFromSeveralGroups",[t,d]);}}else if(n===1){if(d===0){g=r.i18n.getText("tileAddedToSingleGroup",[t,f]);}else if(d===1){g=r.i18n.getText("tileAddedToSingleGroupAndRemovedFromSingleGroup",[t,f,e]);}else if(d>1){g=r.i18n.getText("tileAddedToSingleGroupAndRemovedFromSeveralGroups",[t,f,d]);}}else if(n>1){if(d===0){g=r.i18n.getText("tileAddedToSeveralGroups",[t,n]);}else if(d===1){g=r.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSingleGroup",[t,n,e]);}else if(d>1){g=r.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSeveralGroups",[t,n,d]);}}return g;},getCatalogTileDataFromModel:function(s){var B=s.getPath(),o=s.getModel(),t=o.getProperty(B);return{tileData:t,bindingContextPath:B,isBeingProcessed:t.isBeingProcessed};},_addTile:function(t,g){var o=sap.ushell.components.getCatalogsManager(),d=q.Deferred(),p=o.createTile({catalogTileContext:t,groupContext:g});p.done(function(e){d.resolve(e);});return d;},_removeTile:function(t,i){var o=sap.ushell.components.getCatalogsManager(),d=q.Deferred(),p=o.deleteCatalogTileFromGroup({tileId:t,groupIndex:i});p.done(function(e){d.resolve(e);});return d;},_createGroupAndSaveTile:function(t,n){var o=sap.ushell.components.getCatalogsManager(),d=q.Deferred(),p=o.createGroupAndSaveTile({catalogTileContext:t,newGroupName:n});p.done(function(e){d.resolve(e);});return d;},onExit:function(){sap.ui.getCore().getEventBus().unsubscribe("launchpad","appFinderWithDocking",this._handleAppFinderWithDocking,this);sap.ui.getCore().getEventBus().unsubscribe("launchpad","appFinderAfterNavigate",this._handleAppFinderAfterNavigate,this);}});});
