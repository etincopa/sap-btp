// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/utils"],function(u){"use strict";var D={};D.render=function(r,c){r.write("<div");r.writeControlData(c);r.addClass("sapUshellDashboardGroupsContainer");if(c.getProperty("_gridEnabled")){r.addClass("sapUshellDashboardGroupsContainerGrid");}r.writeClasses();if(c.getAccessibilityLabel()){r.writeAccessibilityState(c,{role:"navigation",label:c.getAccessibilityLabel()});}r.write(">");var g=c.getGroups();var G;for(var i=0;i<g.length;i++){G=g[i];r.write("<div");r.addClass("sapUshellDashboardGroupsContainerItem");if(G.getIsGroupLocked()||G.getDefaultGroup()){r.addClass("sapUshellDisableDragAndDrop");}r.writeClasses();r.write(">");r.renderControl(G);r.write("</div>");}u.setPerformanceMark("FLP -- dashboardgroupscontainer renderer");};return D;},true);
