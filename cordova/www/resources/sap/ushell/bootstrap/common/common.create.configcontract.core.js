// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/URI"],function(U){"use strict";function c(m){var g={};function a(M,p){var P=p.split("/");var s=P.slice(0,P.length-1).join("/");var l=P.pop();if(M.hasOwnProperty(s)){return M[s][l];}var d=P.reduce(function(o,f){if(!o||!o.hasOwnProperty(f)){return{};}return o[f];},m);M[s]=d;return d[l];}function b(p,d){var s=a(g,p);return s!==undefined?s:d;}function e(p,o){var E=b("renderers/fiori2/componentData/config/applications/Shell-home/enableEasyAccess",undefined);var P=b("renderers/fiori2/componentData/config/applications/Shell-home/"+p,undefined);var O=b("renderers/fiori2/componentData/config/applications/Shell-home/"+o,undefined);P=(E===false)?false:P;P=(P!==undefined)?P:E;if(E===undefined||E){if(P===false){return false;}return(O!==undefined)?O:P;}return false;}var C={core:{extension:{enableHelp:b("renderers/fiori2/componentData/config/enableHelp",false),EndUserFeedback:b("services/EndUserFeedback/config/enabled",true),SupportTicket:b("services/SupportTicket/config/enabled",false)},navigation:{enableInPlaceForClassicUIs:{GUI:b("services/ClientSideTargetResolution/config/enableInPlaceForClassicUIs/GUI",false),WDA:b("services/ClientSideTargetResolution/config/enableInPlaceForClassicUIs/WDA",false),WCF:b("services/ClientSideTargetResolution/config/enableInPlaceForClassicUIs/WCF",true)},enableWebguiLocalResolution:true,enableWdaLocalResolution:true,flpURLDetectionPattern:b("services/ClientSideTargetResolution/config/flpURLDetectionPattern","[/]FioriLaunchpad.html[^#]+#[^-]+?-[^-]+")},pageComposition:{transport:{support:b("ushell/extension/pageComposition/transport/support",false),module:b("ushell/extension/pageComposition/transport/module",""),serviceUrl:b("ushell/extension/pageComposition/transport/serviceUrl","")}},pages:{enable:b("ushell/pages/enable",false),assignedPages:b("ushell/pages/assignedPages",{})},shellHeader:{application:{},centralAreaElement:null,headEndItems:[],headItems:[],headerVisible:true,showLogo:false,ShellAppTitleState:undefined,rootIntent:b("renderers/fiori2/componentData/config/rootIntent",""),title:""},shell:{cacheConfiguration:b("renderers/fiori2/componentData/config/cacheConfiguration",{}),enableAbout:b("renderers/fiori2/componentData/config/enableAbout",true),enablePersonalization:b("renderers/fiori2/componentData/config/enablePersonalization",b("renderers/fiori2/componentData/config/applications/Shell-home/enablePersonalization",true)),enableRecentActivity:b("renderers/fiori2/componentData/config/enableRecentActivity",true),enableRecentActivityLogging:b("renderers/fiori2/componentData/config/enableRecentActivityLogging",true),enableFiori3:true,model:{enableSAPCopilotWindowDocking:undefined,enableBackGroundShapes:true,personalization:undefined,contentDensity:undefined,setTheme:undefined,userDefaultParameters:undefined,disableHomeAppCache:undefined,enableHelp:undefined,enableTrackingActivity:undefined,searchAvailable:false,searchFiltering:true,showEndUserFeedback:false,searchTerm:"",isPhoneWidth:false,enableNotifications:b("services/Notifications/config/enabled",false),enableNotificationsUI:false,notificationsCount:0,currentViewPortState:"Center",migrationConfig:undefined,allMyAppsMasterLevel:undefined,options:[],userStatus:undefined,userStatusUserEnabled:true,shellAppTitleData:{currentViewInPopover:"navigationMenu",enabled:false,showGroupsApps:false,showCatalogsApps:false,showExternalProvidersApps:false},userPreferences:{dialogTitle:"Settings",isDetailedEntryMode:false,activeEntryPath:null,entries:[],profiling:[]},userImage:{personPlaceHolder:"sap-icon://person-placeholder",account:"sap-icon://account"},currentState:{stateName:"blank",showCurtain:false,showCatalog:false,showPane:false,showRightFloatingContainer:false,showRecentActivity:true,search:"",paneContent:[],actions:[],floatingActions:[],subHeader:[],toolAreaItems:[],RightFloatingContainerItems:[],toolAreaVisible:false,floatingContainerContent:[]}}},home:{animationRendered:false,disableSortedLockedGroups:b("renderers/fiori2/componentData/config/applications/Shell-home/disableSortedLockedGroups",false),draggedTileLinkPersonalizationSupported:true,editTitle:false,enableHomePageSettings:b("renderers/fiori2/componentData/config/applications/Shell-home/enableHomePageSettings",true),enableRenameLockedGroup:b("renderers/fiori2/componentData/config/applications/Shell-home/enableRenameLockedGroup",false),enableTileActionsIcon:b("renderers/fiori2/componentData/config/enableTileActionsIcon",b("renderers/fiori2/componentData/config/applications/Shell-home/enableTileActionsIcon",false)),enableTilesOpacity:b("services/ClientSideTargetResolution/config/enableTilesOpacity",b("renderers/fiori2/componentData/config/applications/Shell-home/enableTilesOpacity",true)),enableTransientMode:b("ushell/home/enableTransientMode",false),featuredGroup:{enable:b("ushell/home/featuredGroup/enable",false),frequentCard:b("ushell/home/featuredGroup/frequentCard",true)&&b("ushell/home/featuredGroup/enable",false),recentCard:b("ushell/home/featuredGroup/recentCard",true)&&b("ushell/home/featuredGroup/enable",false)},gridContainer:b("ushell/home/gridContainer",false),homePageGroupDisplay:b("renderers/fiori2/componentData/config/applications/Shell-home/homePageGroupDisplay","scroll"),isInDrag:false,optimizeTileLoadingThreshold:b("renderers/fiori2/componentData/config/applications/Shell-home/optimizeTileLoadingThreshold",100),sizeBehavior:b("renderers/fiori2/componentData/config/sizeBehavior","Responsive"),sizeBehaviorConfigurable:b("renderers/fiori2/componentData/config/sizeBehaviorConfigurable",false),wrappingType:b("ushell/home/tilesWrappingType","Normal"),segments:b("renderers/fiori2/componentData/config/applications/Shell-home/segments",undefined),tileActionModeActive:false},catalog:{appFinderDisplayMode:b("renderers/fiori2/componentData/config/applications/Shell-home/appFinderDisplayMode",undefined),easyAccessNumbersOfLevels:b("renderers/fiori2/componentData/config/applications/Shell-home/easyAccessNumbersOfLevels",undefined),enableCatalogSearch:b("renderers/fiori2/componentData/config/enableSearchFiltering",b("renderers/fiori2/componentData/config/applications/Shell-home/enableSearchFiltering",b("renderers/fiori2/componentData/config/applications/Shell-home/enableCatalogSearch",true))),enableCatalogSelection:b("renderers/fiori2/componentData/config/enableCatalogSelection",b("renderers/fiori2/componentData/config/applications/Shell-home/enableCatalogSelection",true)),enableCatalogTagFilter:b("renderers/fiori2/componentData/config/applications/Shell-home/enableTagFiltering",b("renderers/fiori2/componentData/config/applications/Shell-home/enableCatalogTagFilter",true)),enableEasyAccess:b("renderers/fiori2/componentData/config/applications/Shell-home/enableEasyAccess",undefined),enableEasyAccessSAPMenu:(b("renderers/fiori2/componentData/config/applications/Shell-home/enableEasyAccess",undefined)===false)?false:b("renderers/fiori2/componentData/config/applications/Shell-home/enableEasyAccessSAPMenu",b("renderers/fiori2/componentData/config/applications/Shell-home/enableEasyAccess",undefined)),enableEasyAccessSAPMenuSearch:e("enableEasyAccessSAPMenu","enableEasyAccessSAPMenuSearch"),enableEasyAccessUserMenu:(b("renderers/fiori2/componentData/config/applications/Shell-home/enableEasyAccess",undefined)===false)?false:b("renderers/fiori2/componentData/config/applications/Shell-home/enableEasyAccessUserMenu",b("renderers/fiori2/componentData/config/applications/Shell-home/enableEasyAccess",undefined)),enableEasyAccessUserMenuSearch:e("enableEasyAccessUserMenu","enableEasyAccessUserMenuSearch"),enableHideGroups:b("renderers/fiori2/componentData/config/enableHideGroups",b("renderers/fiori2/componentData/config/applications/Shell-home/enableHideGroups",true)),sapMenuServiceUrl:undefined,userMenuServiceUrl:b("renderers/fiori2/componentData/config/applications/Shell-home/userMenuServiceUrl",undefined)}}};return C;}return c;},false);
