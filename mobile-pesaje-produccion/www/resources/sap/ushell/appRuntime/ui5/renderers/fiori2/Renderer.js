// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/appRuntime/ui5/AppRuntimeService","sap/base/Log"],function(A,L){"use strict";var b=[];function R(){var t=this;sap.ushell=(sap.ushell||{});sap.ushell.renderers=(sap.ushell.renderers||{});sap.ushell.renderers.fiori2=(sap.ushell.renderers.fiori2||{});sap.ushell.renderers.fiori2.Renderer=this;["init","createContent","createExtendedShellState","applyExtendedShellState","showLeftPaneContent","showHeaderItem","showRightFloatingContainerItem","showRightFloatingContainer","showToolAreaItem","showFloatingActionButton","showHeaderEndItem","setHeaderVisibility","showSubHeader","showSignOutItem","showSettingsItem","setFooter","setShellFooter","setFooterControl","hideHeaderItem","removeToolAreaItem","removeRightFloatingContainerItem","hideLeftPaneContent","hideFloatingActionButton","hideSubHeader","removeFooter","getCurrentViewportState","addShellSubHeader","addSubHeader","addUserAction","addActionButton","addFloatingButton","addFloatingActionButton","addSidePaneContent","addLeftPaneContent","addHeaderItem","addRightFloatingContainerItem","addToolAreaItem","getModelConfiguration","addEndUserFeedbackCustomUI","addUserPreferencesEntry","setHeaderTitle","setLeftPaneVisibility","showToolArea","setHeaderHiding","setFloatingContainerContent","setFloatingContainerVisibility","getFloatingContainerVisiblity","getRightFloatingContainerVisibility","setFloatingContainerDragSelector","makeEndUserFeedbackAnonymousByDefault","showEndUserFeedbackLegalAgreement","createTriggers","convertButtonsToActions","createItem","addEntryInShellStates","removeCustomItems","addCustomItems","addRightViewPort","addLeftViewPort","getShellController","getViewPortContainerCurrentState","ViewPortContainerNavTo","switchViewPortStateByControl","setMeAreaSelected","getMeAreaSelected","setNotificationsSelected","getNotificationsSelected","addShellDanglingControl","getShellConfig","getEndUserFeedbackConfiguration","reorderUserPrefEntries","addUserProfilingEntry","logRecentActivity","setCurrentCoreView","getCurrentCoreView"].forEach(function(m){t[m]=function(){L.error("'Renderer' api '"+m+"' is not supported when UI5 application is running inside an iframe (sap.ushell.appRuntime.ui5.renderers.fiori2.Renderer)");};});this.LaunchpadState={App:"app",Home:"home"};this._addButtonHandler=function(i,h){b[i]=h;};this.handleHeaderButtonClick=function(B){if(b[B]!==undefined){b[B]();}};this.addHeaderItem=function(c,C,i,a,s){if(typeof(arguments[0])==="object"&&typeof(arguments[1])==="boolean"){C=arguments[0];i=arguments[1];a=arguments[2];s=arguments[3];}this._addHeaderItem("sap.ushell.services.Renderer.addHeaderItem",C,i,a,s);};this.addHeaderEndItem=function(c,C,i,a,s){if(typeof(arguments[0])==="object"&&typeof(arguments[1])==="boolean"){C=arguments[0];i=arguments[1];a=arguments[2];s=arguments[3];}this._addHeaderItem("sap.ushell.services.Renderer.addHeaderEndItem",C,i,a,s);};this.showHeaderItem=function(i){A.sendMessageToOuterShell("sap.ushell.services.Renderer.showHeaderItem",{"aIds":i,"bCurrentState":true,"aStates":""});};this.showHeaderEndItem=function(i){A.sendMessageToOuterShell("sap.ushell.services.Renderer.showHeaderEndItem",{"aIds":i,"bCurrentState":true,"aStates":""});};this.hideHeaderItem=function(i){A.sendMessageToOuterShell("sap.ushell.services.Renderer.hideHeaderItem",{"aIds":i,"bCurrentState":true,"aStates":""});};this.hideHeaderEndItem=function(i){A.sendMessageToOuterShell("sap.ushell.services.Renderer.hideHeaderEndItem",{"aIds":i,"bCurrentState":true,"aStates":""});};this._addHeaderItem=function(a,c,i){if(c.click!==undefined){b[c.id]=c.click;}if(c.press!==undefined){b[c.id]=c.press;}A.sendMessageToOuterShell(a,{sId:c.id,sTooltip:c.tooltip,sIcon:c.icon,bVisible:i,bCurrentState:true});};this.setHeaderTitle=function(T){A.sendMessageToOuterShell("sap.ushell.services.Renderer.setHeaderTitle",{"sTitle":T});};this.setHeaderVisibility=function(v,c,s){A.sendMessageToOuterShell("sap.ushell.services.Renderer.setHeaderVisibility",{"bVisible":v,"bCurrentState":c,"aStates":s});};this.createShellHeadItem=function(p){if(p.press!==undefined){b[p.id]=p.press;delete p.press;}A.sendMessageToOuterShell("sap.ushell.services.Renderer.createShellHeadItem",{params:p});};this.showActionButton=function(i,c,s){A.sendMessageToOuterShell("sap.ushell.services.Renderer.showActionButton",{"aIds":i,"bCurrentState":c,"aStates":s});};this.hideActionButton=function(i,c,s){A.sendMessageToOuterShell("sap.ushell.services.Renderer.hideActionButton",{"aIds":i,"bCurrentState":c,"aStates":s});};this.addUserAction=function(p){if(p.oControlProperties.press!==undefined){b[p.oControlProperties.id]=p.oControlProperties.press;delete p.oControlProperties["press"];}A.sendMessageToOuterShell("sap.ushell.services.Renderer.addUserAction",{"oParameters":p});};}return new R();});
