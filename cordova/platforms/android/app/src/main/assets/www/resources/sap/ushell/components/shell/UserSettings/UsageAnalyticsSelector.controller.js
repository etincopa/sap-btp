// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ushell/resources"],function(q,r){"use strict";sap.ui.controller("sap.ushell.components.shell.UserSettings.UsageAnalyticsSelector",{onInit:function(){this.oUser=sap.ushell.Container.getUser();this.switchStateValue=this.oUser.getTrackUsageAnalytics();this.getView().oSwitchButton.setState(this.switchStateValue);},getContent:function(){var t=this,d=q.Deferred();d.resolve(t.getView());return d.promise();},getValue:function(){var d=q.Deferred(),i=r.i18n;d.resolve(this.switchStateValue?i.getText("trackingEnabled"):i.getText("trackingDisabled"));return d.promise();},onSave:function(){var c=this.getView().oSwitchButton.getState();this.switchStateValue=c;return sap.ushell.Container.getService("UsageAnalytics").setTrackUsageAnalytics(c);},onCancel:function(){this.getView().oSwitchButton.setState(this.switchStateValue);}});},true);
