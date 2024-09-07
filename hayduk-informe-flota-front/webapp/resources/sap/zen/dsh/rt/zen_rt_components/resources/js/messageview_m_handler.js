define("zen.rt.components/resources/js/messageview_m_handler", ["sap/zen/basehandler"], function(BaseHandler){
	sap.zen.MessageViewHandler = function() {
		"use strict";
	
		BaseHandler.apply(this, arguments);
	
		var that = this,
				mainMessageviewId = sap.zen.Dispatcher.instance.dshPrefix + "MESSAGE_messageview1",
				footerBarId = sap.zen.Dispatcher.instance.dshPrefix + "FOOTERBAR_footerbar",
				panelBodyId = sap.zen.Dispatcher.instance.dshPrefix + "PANEL_BODY_panel1";
		
		this.customSize;
		
		this.sLogCommand;
		this.oldMessagesAfterVarScreen = [];
		this.oMessageView;
		this.oFooter;
		
		var init = function (oMsgBtn, oControlProperties) {
			var aDataBefore = [], oModel;
			if (oMsgBtn.oMsgPopover) {
				oModel = oMsgBtn.oMsgPopover.getModel();
				if (oModel) {
					var oData = oModel.getData();
					if (oData) {
						aDataBefore = oData;
					}
				}
			}
			
			var aMessages = that.convertMessageFormatToUi5(aDataBefore, oControlProperties);
			
			if (oMsgBtn.oMsgPopover.getModel()) {
				oMsgBtn.oMsgPopover.getModel().setData(aMessages);
			} else {
			oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(aMessages);
			oMsgBtn.oMsgPopover.setModel(oModel);
			}
			
			updateMessageView();
		};

		var updateFooterBar = function (oMessageView) {
			if (mainMessageviewId !== oMessageView.getId()) {
				return;
			}
			var oFooter = sap.ui.getCore().byId(footerBarId);
			var oPanelBody = sap.ui.getCore().byId(panelBodyId);
			if (oFooter && oPanelBody) {
				var visible = oMessageView.getVisible();
				oFooter.setHeight(visible ? "40px" : "0px");
				var pos = oPanelBody.getPositions()[0];
				var bottom = pos.getBottom();
				if (visible && bottom !== "40px") {
					pos.setBottom("40px");
					oPanelBody.invalidate();
				}
				if (!visible && bottom !== "0px") {
					pos.setBottom("0px");
					oPanelBody.invalidate();
				}
		}
	};
		
		var updateMessageView = function () {
			var messageCount = that.oMessageView.oMsgPopover.getModel().getData().length;
			that.oMessageView.setText(messageCount);
			that.oMessageView.setVisible((that.oMessageView.oMsgPopover.getModel().getData() && messageCount > 0));
			updateFooterBar(that.oMessageView);
		}
		
		this.createAndAdd = function (phxObj, controlData, componentData, fInsertIntoParentFunclet, iIndex) {
			var oNewControl = this.create(phxObj, controlData, componentData);
			if (fInsertIntoParentFunclet) {
				fInsertIntoParentFunclet(oNewControl, iIndex, componentData);
			}
			sap.zen.Dispatcher.instance.updateComponentProperties(oNewControl, componentData, fInsertIntoParentFunclet);
			return oNewControl;
		};
	
		this.create = function(oChainedControl, oControlProperties) {
			$.sap.require("sap.ui.core.IconPool");
			var id = oControlProperties["id"];
			
			this.sLogCommand = oControlProperties.log_command;
			
			var oMsgBtn = new sap.m.Button({
				id: id,
				icon: sap.ui.core.IconPool.getIconURI("message-popup"),
				text: "{/count}",
				type: sap.m.ButtonType.Emphasized,
				press: function () {
					this.oMsgPopover.toggle(this);
				}
			});
			
			this.oMessageView = oMsgBtn;
			
			var oMessageTemplate = new sap.m.MessagePopoverItem({
			    type: '{type}',
			    title: '{title}',
			    description: '{description}'
			  });
	
			var headerButton = new sap.m.Button({
				icon: "sap-icon://delete",
				press: function () {
					oMsgBtn.oMsgPopover.getModel().setData([]);
					oMsgBtn.setVisible(false);
					updateFooterBar(oMsgBtn);
				}
			});
	
			oMsgBtn.oMsgPopover = new sap.m.MessagePopover({
			    items: {
			        path: '/',
			        template: oMessageTemplate
				},
				headerButton: headerButton
			    });
			
			updateFooterBar(oMsgBtn);
			
			if (!oMsgBtn.fSaveOnAfterRendering) {
				oMsgBtn.fSaveOnAfterRendering = oMsgBtn.onAfterRendering;
				oMsgBtn.onAfterRendering = function () {
					if (oMsgBtn.fSaveOnAfterRendering) {
						oMsgBtn.fSaveOnAfterRendering();
					}
					if (!instance.varScreenMode) {
						var oJqUi5BlockLayer = $('#sap-ui-blocklayer-popup');
						var jqMsgBtn = oMsgBtn.$();
						
						if (oJqUi5BlockLayer && oJqUi5BlockLayer.length > 0
								&& oJqUi5BlockLayer.css("visibility") === "visible" 
									&& oJqUi5BlockLayer.outerWidth() > 0 && oJqUi5BlockLayer.outerHeight() > 0) {
							
							var sZIndex = oJqUi5BlockLayer.css("z-index");
							if (sZIndex && sZIndex.length > 0) {
								var iZIndex = parseInt(sZIndex, 10);
								jqMsgBtn.css("z-index", "" + (iZIndex + 1));
							}
						} else {
							jqMsgBtn.css("z-index", "auto");
						}
					}
				};
			}
			init(oMsgBtn, oControlProperties);
			return oMsgBtn;
		};
		
		this.update = function(oControl, oControlProperties) {
			if (oControlProperties) {
				this.oMessageView = oControl;
				init(oControl, oControlProperties);
			}
		};
		
		this.convertMessageFormatToUi5 = function (aDataBefore, oControlProperties) {
			var aResult = aDataBefore;
			var aOldMessages = oControlProperties.messages;
			if (aOldMessages && aOldMessages.length > 0) {
				for (var i = 0; i < aOldMessages.length; i++) {
					var oneMessage = aOldMessages[i].message;
					var newMessage = {};
					if (oneMessage.level === "ERROR") {
						newMessage.type = "Error";
					} else if (oneMessage.level === "WARNING") {
						newMessage.type = "Warning";
					} else {
						newMessage.type = "Information";
					}
					newMessage.title = oneMessage.short_text;
					newMessage.description = oneMessage.long_text;
					
					aResult.push(newMessage);
				}
			} else {
				if (this.isHanaRuntime()) {
					// the message view in the "main app" is not removed when opening a var screen in the hana
					// runtime
					// therefore, no need to restore messages when closing the var screen
					if (aResult) {
						return aResult;
					} else {
						return []; // initial rendering
					}
				}
				if (sap.zen.MessageViewHandler.oldMessagesAfterVarScreen && !this.varScreenMode) {
					// restoring old messages is only necessary when not on the variable screen
					// this failed when opening a var screen without any messages on the var screen initially,
					// because it still showed the "main app" messages
					var result = sap.zen.MessageViewHandler.oldMessagesAfterVarScreen.slice();
					delete sap.zen.MessageViewHandler.oldMessagesAfterVarScreen;
					return result;
				}
				return []; //initial rendering
			}
			return aResult;
		};
		
		this.isHanaRuntime = function(){
			if(typeof (DSH_deployment) !== "undefined"){
				return true;
			} else {
				return false;
			}
		};
		
		var super_remove = this.remove;
		this.remove = function(oControl){
			if(oControl.oMsgPopover){
				oControl.oMsgPopover.destroy();
			}
			super_remove.apply(this,arguments);
		}
		
		this.getHighestMessageLevel = function(oModel){
			var aMessages = oModel.getData();
			var bWarningFound = false;
			for(var i = 0; i < aMessages.length; i++){
				var oneMessage = aMessages[i];
				if(oneMessage.type === "Error"){
					return "message-error";
				}else if(oneMessage.type === "Warning"){
					bWarningFound = true;
				}
			}
			
			if(bWarningFound){
				return "message-warning";
			}
			return "message-information";
		};
		
		sap.zen.MessageViewHandler.setVariableScreen = function(bMode){
			if(bMode){
				var normalMsgBtn = sap.ui.getCore().byId("MESSAGE_messageview1")
				if(normalMsgBtn){
					sap.zen.MessageViewHandler.oldMessagesAfterVarScreen = normalMsgBtn.oMsgPopover.getModel().getData();
				}
			}
			instance.varScreenMode = bMode;
		}
		
		sap.zen.MessageViewHandler.info = "INFO";
		sap.zen.MessageViewHandler.warning = "WARNING";
		sap.zen.MessageViewHandler.error = "ERROR";
		sap.zen.MessageViewHandler.createMessage = function (sLevel, sShortText, sLongText, bLogMessage) {
			var oMsgBtn = that.oMessageView;
			
			if (!oMsgBtn) {
				return;
			}
			
			var newMessage = {}, oModel;
			if (sLevel === "ERROR") {
				newMessage.type = "Error";
			} else if (sLevel === "WARNING") {
				newMessage.type = "Warning";
			} else {
				newMessage.type = "Information";
			}
			newMessage.title = sShortText;
			newMessage.description = sLongText;
			
			if (oMsgBtn.oMsgPopover && oMsgBtn.oMsgPopover.getModel()) {
				oModel = oMsgBtn.oMsgPopover.getModel()
				oModel.setData([ newMessage ]);
			} else {
				oModel = new sap.ui.model.json.JSONModel();
				oModel.setData([ newMessage ]);
				oMsgBtn.oMsgPopover.setModel(oModel);
			}
			
			updateMessageView();
			
			if (bLogMessage) {
				sap.zen.MessageViewHandler.logMessage(sLevel, sShortText, sLongText);
			}
		}
		
		sap.zen.MessageViewHandler.logMessage = function (sLevel, sShortText, sLongText) {
			if (that.sLogCommand) {
				var sCommand = that.sLogCommand;
				sCommand = sap.zen.Dispatcher.instance.prepareCommand(sCommand, "__LEVEL__", sLevel);
				sCommand = sap.zen.Dispatcher.instance.prepareCommand(sCommand, "__SHORTTEXT__", sShortText);
				sCommand = sap.zen.Dispatcher.instance.prepareCommand(sCommand, "__LONGTEXT__", sLongText);
	
				var fAction = new Function(sCommand);
				fAction();
			}
		}
		
		sap.zen.MessageViewHandler.clearMessages = function () {
			var oMsgBtn = that.oMessageView;
			if (oMsgBtn && oMsgBtn.oMsgPopover && oMsgBtn.oMsgPopover.getModel()) {
				var oModel = oMsgBtn.oMsgPopover.getModel()
				oModel.setData([]);
			}
		}
	};
	
	var instance = new sap.zen.MessageViewHandler();
	sap.zen.Dispatcher.instance.addHandlers("messageview", instance);
	return instance;
});