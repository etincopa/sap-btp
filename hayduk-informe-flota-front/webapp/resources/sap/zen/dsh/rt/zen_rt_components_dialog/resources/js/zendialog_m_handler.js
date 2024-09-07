//
//

define("zen.rt.components.dialog/resources/js/zendialog_m_handler", ["sap/zen/basehandler"], function(BaseHandler) {
	
sap.zen.ZenDialogHandler = function () {
	"use strict";

	sap.zen.ZenDialogHandler.anchorDivId = "sapbi_snippet_ROOT_DIALOG";

	BaseHandler.apply(this, arguments);
	
	this.dispatcher = BaseHandler.dispatcher;
	this.bDisplayTitle = true;
	this.bCanMove = true;
	this.bCanResize = true;
	this.bIsRuntimeMode = false;
	this.resizeTimer = null;
	this.resizeEndTimer = null;
	this.initialWindowHeight = 0;
	this.initialWindowWidth = 0;
	this.contentTdHeight = 0;
	this.contentHeight = 0;
	this.oDomContentArea = null;
	this.oDomContentDiv = null;
	this.bBrowserResize = false;
	this.oContentComponent = null;
	this.oMsgComponent = null;
	this.oContentControl = null;
	this.oMsgControl = null;
	this.bDialogClosing = false;
	this.iVertPaddingAndBorderContribution = -1;
	this.oMatrixLayout;
	this.oTopLevelControl = null;
	this.loadingIndicatorCssHasBeenSet = false;
	
	var that = this;
	
	this.getMatrixLayoutCell = function(iRow) {
		var oRow = this.oMatrixLayout.getRows()[iRow];
		var oCell = oRow.getCells()[0];
		return oCell;
	};
	
	this.createDialogButtons = function(oControlProperties) {
		var oButtonControl, oButton, x;
		var fPress = function () {
			if (this.zenOkBtn === true) {
				sap.zen.Dispatcher.instance.enableReady(true);
			}
			if (this.zenOkBtn === true || this.zenCancelBtn === true) {
				sap.zen.MessageViewHandler.setVariableScreen(false);
			}
			that.bDialogClosing = true;
			// prevent quick click sequence on button from messing up the runtime
			this.setEnabled(false);
			this.zenOnClick();
		};

		for (x = 0; x < oControlProperties.buttons.length; x++) {
			oButton = oControlProperties.buttons[x].button;
			oButtonControl = null;
			if (oButton.rendered === true) {
				oButtonControl = this.createButton(oButton.name);
				oButtonControl.setText(oButton.text);
				oButtonControl.setEnabled(oButton.enabled);
				oButtonControl.zenOkBtn = oButton.okBtn;
				oButtonControl.zenCancelBtn = oButton.cancelBtn;
				if (oButton.okBtn === true) {
					oButtonControl.addStyleClass("zenDialogOkButton");
				}
				if (oButton.cancelBtn === true) {
					oButtonControl.addStyleClass("zenDialogCancelButton");
				}
				if (oButton.command) {
					oButtonControl.zenOnClick = new Function(oButton.command);
					oButtonControl.attachPress(fPress);
				} else {
					oButtonControl.setEnabled(false);
				}
			}

			if (oButtonControl) {
				sap.zen.Dispatcher.instance.oCurrentVarDlg.addButton(oButtonControl);
			}
			this.buttonStatusToDesigner(oButton);
		}
	};
	
	this.updateDialogContent = function() {
		if (this.oContentComponent) {
			this.dispatcher.dispatchUpdateControl(this.oContentComponent);
			this.dispatcher.updateComponentProperties(null, this.oContentComponent);
		}
	};
	
	this.createDialogContent = function () {
		if (this.oContentComponent) {
			this.oContentControl = this.dispatcher.dispatchCreateControl(this.oContentComponent);
			
			if (this.oContentComponent.id) {
				this.oTopLevelControl.aZenChildren.push(this.oContentComponent.id);
			}
			
			var oContentCell = this.getMatrixLayoutCell(0);
	
			this.oContentControl.setWidth("100%");
			this.oContentControl.setHeight("100%");
					
			oContentCell.addContent(this.oContentControl);
	
			this.dispatcher.updateComponentProperties(undefined, this.oContentComponent);
		}
	};

	this.buttonStatusToDesigner = function (oButton) {
		if (oButton.statustodesigner === true) {
			if (oButton.command) {
				window.eclipse_setOkButtonEnabled(oButton.enabled);
			} else {
				window.eclipse_setOkButtonEnabled(false);
			}
		}
	};

	this.updateDialogButtons = function (oControlProperties) {
		var x, oButtonControl;

		for (x = 0; x < oControlProperties.buttons.length; x++) {
			var oButton = oControlProperties.buttons[x].button;
			var bEnabled = oButton.enabled;
			if (oButton.okBtn) {
				bEnabled = bEnabled && !this.oContentControl.hasClientError;
			}
			if (oButton.rendered === true) {
				oButtonControl = sap.ui.getCore().getControl(oButton.name);
				oButtonControl.setEnabled(bEnabled);
				oButtonControl.setVisible(true);
			} else {
				// button may have been rendered initially, but should not be rendered any more
				// -> set existing button to visible
				oButtonControl = sap.ui.getCore().getControl(oButton.name);
				if (oButtonControl) {
					oButtonControl.setVisible(false);
				}
			}
			this.buttonStatusToDesigner(oButton);
		}
	};
	
	this.addMsgControlAndReorderDialogButtons = function() {
		var oDialog = sap.zen.Dispatcher.instance.oCurrentVarDlg;
		var oDialogToolbar;
		var aContent;
		var i;
		var aNewContent = [];
			
		// This is some hackish stuff here because:
		// 1. We rely on the internal implementation of the m.Dialog using toolbar control as button
		//    container which we can access by the dialog's id + "-footer"
		// 2. We rely on this container not having any aggregation type checks (in contrast to the m.Dialog
		//    itself which won't let us add the m.SegmentedButton oMsgControl into its button aggregation via the addButton() API).
		//    Hence we profit from the addContent() API of that container which lets us add whatever we want.
		//    Discussion with UI5 ongoing in that regard.
		// 3. We assume that the buttons are put into that container with a Spacer object as the first element so that
		//    the spacer and buttons can be reordered to make the segmented msg view button appear to the very left
		if (oDialog && this.oMsgControl) {
			oDialogToolbar = sap.ui.getCore().byId(oDialog.getId() + "-footer");
			if (oDialogToolbar) {
				// put message view to the very left if any
				aContent = oDialogToolbar.getContent();
				if (aContent && aContent.length > 0) {
					aNewContent.push(this.oMsgControl);
					// spacer
					aNewContent.push(aContent[0]);
					for (i = 1; i < aContent.length; i++) {
						if (aContent[i] !== this.oMsgControl) {
							aNewContent.push(aContent[i]);
						}
					}
					oDialogToolbar.removeAllContent();
					for (i = 0; i < aNewContent.length; i++) {
						oDialogToolbar.addContent(aNewContent[i]);
					}
				}
			}
		}
	};

	this.handleMessageControl = function () {
		var bMsgItemisNew;
		if (this.oMsgComponent) {
			bMsgItemisNew = this.dispatcher.getComponentIdForControlId(this.oMsgComponent.content.control.id) == null;
			if (bMsgItemisNew) {
				if(this.oMsgComponent.id) {
					this.oTopLevelControl.aZenChildren.push(this.oMsgComponent.id);
				}
				
				sap.zen.MessageViewHandler.setVariableScreen(true);
				this.oMsgControl = this.dispatcher.dispatchCreateControl(this.oMsgComponent);
				
				if (!this.bIsRuntimeMode) {
					var oButtonCell = this.getMatrixLayoutCell(1);
					oButtonCell.addContent(this.oMsgControl);
				} 
			} else {
				this.oMsgControl = this.dispatcher.dispatchUpdateControl(this.oMsgComponent);
				this.dispatcher.updateComponentProperties(this.oMsgControl, this.oMsgComponent);
			}
		}
	};

	function addLoadingIndicatorCss () {
		var loadingGIF = "loading.gif?1.0.0";
		if (sapbi_isMobile) {
			loadingGIF = "loadingMobile.gif";
		}

		var content = "margin:-20px 0px 0px -100px; background-position:center;background-repeat:no-repeat;height:40px;width:200px;"
				+ 'background-image:url('
				+ sap.zen.createStaticMimeUrl('zen.rt.client.servlet/resources/images/'+loadingGIF) + ');z-index:19994;position:absolute;top:50%;left:50%;';

		$('head').prepend('<style>.customLoadingIndicatorZenClass{' + content + '}</style>');
		that.loadingIndicatorCssHasBeenSet = true;
	}

	this.init = function (oControlProperties) {
		var bContentIsNew = true;

		if (oControlProperties.loadingIndicatorDelay) {
			sap.zen.loadingIndicatorDelay = oControlProperties.loadingIndicatorDelay;
		}

		if (!this.loadingIndicatorCssHasBeenSet) {
			addLoadingIndicatorCss();
		}

		this.handleMessageControl();
		
		if (!this.bIsRuntimeMode) {
			if (this.oContentComponent) {
				bContentIsNew = this.dispatcher.getComponentIdForControlId(this.oContentComponent.content.control.id) == null;
			}
		} else {
			if (sap.zen.Dispatcher.instance.oCurrentVarDlg) {
				bContentIsNew = !sap.zen.Dispatcher.instance.oCurrentVarDlg.isOpen();
			} else {
				bContentIsNew = true;
			}
		}
		
		if (!bContentIsNew) {
			this.updateDialogButtons(oControlProperties);
			this.updateDialogContent();
		} else {
			this.createDialogButtons(oControlProperties);
			this.createDialogContent(oControlProperties);
		}
	};
		
	this.getOrCreateDialogRootArea = function () {
		var oJqMainDiv = $(document.getElementById(sap.zen.ZenDialogHandler.anchorDivId));
		if(!oJqMainDiv.length) {
			oJqMainDiv = $("<div id=\"" + sap.zen.ZenDialogHandler.anchorDivId + "\"></div>");
			$("body").append(oJqMainDiv);
		}
		return oJqMainDiv;
	}
	
	function getHeightByClassSelector(sClass) {
		var oObject = $(sClass);
		var iHeight = 0;
		if (oObject && oObject.length > 0) {
			iHeight = oObject.outerHeight();
		}
		return iHeight;
	}
	
	function calculateHeightOfFixedElements() {
		var iCalculatedHeight = getHeightByClassSelector('.zenDialogTitleRow');
		iCalculatedHeight += getHeightByClassSelector('.zenDialogButtonRow');
		iCalculatedHeight += getHeightByClassSelector('.zenDialogResizeRow');
		return iCalculatedHeight;
	}
	
	this.getVertPaddingAndBorderContribution = function (oJqElement) {
		var iHeight = 0;
		var iValue;
		if (this.iVertPaddingAndBorderContribution === -1) {
			iValue = parseInt(oJqElement.css("padding-top"), 10);
			iHeight += (isNaN(iValue) ? 0 : iValue);
			iValue = parseInt(oJqElement.css("padding-bottom"), 10);
			iHeight += (isNaN(iValue) ? 0 : iValue);
			iValue = parseInt(oJqElement.css("border-top"), 10);
			iHeight += (isNaN(iValue) ? 0 : iValue);
			iValue = parseInt(oJqElement.css("border-bottom"), 10);
			iHeight += (isNaN(iValue) ? 0 : iValue);
			this.iVertPaddingAndBorderContribution = iHeight;
		}
		return this.iVertPaddingAndBorderContribution;
	};
	
	this.calculateAndSetDialogDivSizes = function() {
		that.oDomContentArea = $(".zenDialogContentArea");
		that.oDomContentDiv = that.oDomContentArea.children(0);
		
		if (!this.bIsRuntimeMode) {
			var oJqDiv = this.getOrCreateDialogRootArea();
			var iDlgHeight = parseInt(oJqDiv.css("height"), 10);
						
						
			var iFixedHeight = calculateHeightOfFixedElements();
			var iContentRowHeight = iDlgHeight - iFixedHeight;
			
			var iContentDivHeight = iContentRowHeight - this.getVertPaddingAndBorderContribution(that.oDomContentArea);
			
			that.oDomContentDiv.css("height", iContentDivHeight + "px");
		} else {
			$(document.getElementById(that.oMatrixLayout.getId())).parent().css("padding", "0px").css("height", "100%");
			that.oDomContentDiv.css("height", "100%");			
		}
	}
	
	this.createMatrixLayout = function (id) {
		$.sap.require("sap.zen.commons.layout.MatrixLayout");
		var oMatrixLayout = new sap.zen.commons.layout.MatrixLayout(id, {
			"layoutFixed": false,
			"height": "100%",
			"width": "100%"
		});
		oMatrixLayout.addStyleClass("zenDialogMatrixLayout");
		oMatrixLayout.fOrigOnAfterRendering = oMatrixLayout.onAfterRendering;
		var that = this;
		
		oMatrixLayout.onAfterRendering = function () {
			if (this.fOrigOnAfterRendering) {
				this.fOrigOnAfterRendering();
			}
		
			// size calculation		
			that.calculateAndSetDialogDivSizes();
			that.setInitialSizes();
			if (that.bIsRuntimeMode) {
				that.addMsgControlAndReorderDialogButtons();
			}
		};

		return oMatrixLayout;
	};

	this.createContentArea = function () {
		var oContentRow = new sap.zen.commons.layout.MatrixLayoutRow();
		oContentRow.addStyleClass("zenDialogContentRow");
		var oContentCell = new sap.zen.commons.layout.MatrixLayoutCell();
		oContentCell.addStyleClass("zenDialogContentArea");
		oContentRow.addCell(oContentCell);
		return oContentRow;
	};

	this.createButtonArea = function () {
		var oButtonRow = new sap.zen.commons.layout.MatrixLayoutRow();
		oButtonRow.addStyleClass("zenDialogButtonRow");
		
		var oMsgViewCell = new sap.zen.commons.layout.MatrixLayoutCell({
				"hAlign": sap.zen.commons.layout.HAlign.Begin
		});
		oMsgViewCell.addStyleClass("zenDialogButtonArea");
		oButtonRow.addCell(oMsgViewCell);
						
		return oButtonRow;
	};
	
	this.getContent = function(oControlProperties) {
		var oContent = null;
		
		if (oControlProperties.content && oControlProperties.content.length > 0) {
			oContent = oControlProperties.content;
		}
		return oContent;
	};
	
	this.validateAndExtractDialogContent = function(oControlProperties) {
		// allowed is:
		// either one content and one msg item 
		// or
		// only a msg item
		// or
		// only one content
		
		var oContent;
		
		if (oControlProperties) {
			oContent = this.getContent(oControlProperties);
			if (!oContent || oContent.length > 2) {
				return false;
			}
			this.oMsgComponent = this.getMsgComponent(oContent);
			this.oContentComponent = this.getContentComponent(oContent);
			
			if (!this.oMsgComponent) {
				if (!this.oContentComponent || (this.oContentComponent && oContent.length > 1)) {
					return false;
				}
			} else {
				if (!this.oContentComponent && oContent.length > 1) {
					return false;
				}
			}
		} else {
			return false;
		}
		
		return true;
	}
	
	this.getMsgComponent = function(oContent) {
		var oMsgComponent = null;
		var i, oContentEntry, sComponentType;

		if (oContent) {
			for (i = 0; i < oContent.length && !oMsgComponent; i++) {
				oContentEntry = oContent[i];
				if (oContentEntry && oContentEntry.component) {
					sComponentType = oContentEntry.component.type;
					if (sComponentType === "MESSAGEVIEW_COMPONENT") {
						oMsgComponent = oContentEntry.component;
					}
				}
			}
		}
		return oMsgComponent;
	};
	
	this.getContentComponent = function(oContent) {
		var oContentComponent = null;
		var i, oContentEntry, sComponentType;

		if (oContent) {
			for (i = 0; i < oContent.length && !oContentComponent; i++) {
				oContentEntry = oContent[i];
				if (oContentEntry && oContentEntry.component) {
					sComponentType = oContentEntry.component.type;
					if (sComponentType !== "MESSAGEVIEW_COMPONENT") {
						oContentComponent = oContentEntry.component;
					}
				}
			}
		}
		return oContentComponent;
	};
	
	this.getMsgControlFromComponent = function(oMsgComponent) {
		var oMsgControl = null;
		
		if (oMsgComponent && oMsgComponent.content) {
			oMsgControl = oMsgComponent.content.control;
		}
		
		return oMsgControl;
	};
	
	this.createAndAdd = function (oChainedControl, oControlProperties, oComponentProperties, fAppendToParentFunclet, oArgForFunclet) {
		var id = oControlProperties["id"];
		
		this.dispatcher.enableReady(false);

		this.iVertPaddingAndBorderContribution = -1;
		this.bDisplayTitle = oControlProperties.displaytitle;
		this.sTitleText = oControlProperties.titletext;
		this.bCanMove = oControlProperties.canmove;
		this.bCanResize = oControlProperties.canresize;
		this.bBrowserResize = oControlProperties.hookbrowserresize;
		this.bIsRuntimeMode = oControlProperties.renderruntimeinitvarscreen;
		var oContentRow, oButtonRow, bIsValidContent;
				
		bIsValidContent = this.validateAndExtractDialogContent(oControlProperties);
		if (!bIsValidContent) {
			jQuery.sap.log.error("Invalid Dialog Content");
			return;
		}
		
		if (this.bIsRuntimeMode === true) {
			this.createDialog(id + "_dlg");
			this.oMatrixLayout = this.createMatrixLayout(id + "_ml");
			this.oTopLevelControl = new sap.m.Button(id, {enabled: false});
			
			// for navigating away from page, e. g. in S4 context
			var fOldDestroy = this.oTopLevelControl.destroy;
			this.oTopLevelControl.destroy = function() {
				if (sap.zen.Dispatcher.instance.oCurrentVarDlg) {
					sap.zen.Dispatcher.instance.oCurrentVarDlg.destroy();
					delete sap.zen.Dispatcher.instance.oCurrentVarDlg;
				}
				fOldDestroy.apply(this, arguments);
			}
			
			sap.zen.Dispatcher.instance.oCurrentVarDlg.oDispatcherHook = this.oTopLevelControl;
			this.oTopLevelControl.aZenChildren = [];
			this.oTopLevelControl.aZenChildren.push(sap.zen.Dispatcher.instance.oCurrentVarDlg);
			if (typeof(DSH_deployment) !== "undefined" && DSH_deployment === true) {
				fAppendToParentFunclet(this.oTopLevelControl, oArgForFunclet);
			}
		} else {
			this.oMatrixLayout = this.createMatrixLayout(id);
			this.oTopLevelControl = this.oMatrixLayout;
			this.oTopLevelControl.aZenChildren = [];
		}
		
				
		if (oControlProperties.onepageprompt) {
			this.oMatrixLayout.addStyleClass("zenDialogOnePage");
		}
		
		if (this.oContentComponent) {
			oContentRow = this.createContentArea();
			this.oMatrixLayout.addRow(oContentRow);
		}
		
		if (!this.bIsRuntimeMode) {
			oButtonRow = this.createButtonArea();
			this.oMatrixLayout.addRow(oButtonRow);
			this.getOrCreateDialogRootArea();
			fAppendToParentFunclet(this.oMatrixLayout, oComponentProperties);
		}
				
		this.init(oControlProperties);

		this.hookBrowserResize();
		
		if (oControlProperties.toplevelcssclass.length > 0) {
			this.oMatrixLayout.addStyleClass(oControlProperties.toplevelcssclass);
		}
		
		if (this.bIsRuntimeMode === true) {
			this.openDialog();
		} 
	
		return this.oTopLevelControl;
	};
	
	this.openDialog = function() {
		var oDialog = sap.zen.Dispatcher.instance.oCurrentVarDlg;
		if (oDialog) {
			oDialog.addContent(this.oMatrixLayout);
			oDialog.open();
		}
	};
	
	this.createDialog = function(id) {
		var sContentHeight = "100%";
		var sContentWidth = Math.floor(window.innerWidth / 2) + "px";
		
		var oDialog = new sap.m.Dialog(id, 
				{"showHeader" : this.bDisplayTitle, 
				 "title" : this.sTitleText, 
				 "resizable" : this.bCanResize, 
				 "draggable" : this.bCanMove, 
				 "horizontalScrolling" : false, 
				 "verticalScrolling" : false,
				 "contentHeight" : sContentHeight,
				 "contentWidth" : sContentWidth,
				 "afterOpen" : function() {
					 	 var oJqPayloadDiv;
						 if ($.browser.mozilla) {
							oJqPayloadDiv = $(document.getElementById(that.oContentControl.getId()));
							oJqPayloadDiv.css("display", "inline-table");
						 } else if ($.browser.webkit) {
							 oJqPayloadDiv = $(document.getElementById(that.oContentControl.getId()));
							 var oParentTd  = oJqPayloadDiv.parent();
							 oParentTd.css("height", "100%");
						 }
				 }
		}).addStyleClass("sapContrastPlus");
			
		oDialog.attachBrowserEvent("keydown", function(e) {
			if (e.which === 27) {
				if (e.stopPropagation) {
					e.stopPropagation();
				}
				if (e.cancelBubble) {
					e.cancelBubble = true;
				}
			}
		});
			
		sap.zen.Dispatcher.instance.oCurrentVarDlg = oDialog;
	};

	this.applyForChildren = function (oControl, funclet) {
		if(oControl.aZenChildren) {
			for ( var i = 0; i < oControl.aZenChildren.length; i++) {
				var sChildId = oControl.aZenChildren[i];
				var oChild = this.dispatcher.getRootControlForComponentId(sChildId);
				if (oChild) {
					var result = funclet(oChild);
					if (result) {
						return result;
					}
				}
			}
		}
		return null;
	};
	
	this.setInitialSizes = function () {
		if (this.bBrowserResize === true) {
			this.initialWindowHeight = parseInt($(window).innerHeight(), 10);
			this.initialWindowWidth = parseInt($(window).innerWidth(), 10);
			// subtract one px each since some browsers (Safari) have problems with
			// calculation precision and might show unwanted scrollbars after a resize
			this.contentTdHeight = parseInt(this.oDomContentArea.css("height"), 10) - 1;
			this.contentHeight = parseInt(this.oDomContentDiv.css("height"), 10) - 1;
		}
	};

	this.browserResizeEndEvent = function (deltaX, deltaY) {
		if (this.oContentControl.ZEN_resizeEnd) {
			this.oContentControl.ZEN_resizeEnd(deltaX, deltaY);
		}
	};

	this.browserResizeListener = function () {
		clearTimeout(this.resizeEndTimer);
		var newHeight = parseInt($(window).innerHeight(), 10);
		var deltaY = newHeight - this.initialWindowHeight;
		var newWidth = parseInt($(window).innerWidth(), 10);
		var deltaX = newWidth - this.initialWindowWidth;

		if (deltaY !== 0) {
			this.contentTdHeight += deltaY;
			this.contentHeight += deltaY;
			this.initialWindowHeight = newHeight;
			this.oDomContentArea.css("height", this.contentTdHeight + "px");
			this.oDomContentDiv.css("height", this.contentHeight + "px");
		}

		if (deltaX !== 0) {
			this.initialWindowWidth = newWidth;
		}

		if (this.oContentControl.ZEN_resize) {
			this.oContentControl.ZEN_resize();
		}

		this.resizeEndTimer = setTimeout((function (that, deltaX, deltaY) {
			return function () {
				that.browserResizeEndEvent(deltaX, deltaY);
			};
		})(this, deltaX, deltaY), 100);
	};

	this.hookBrowserResize = function () {
		if (this.bBrowserResize === true) {
			var that = this;
			$(window).resize(function () {
				clearTimeout(that.resizeTimer);
				that.resizeTimer = setTimeout((function (that) {
					return function () {
						that.browserResizeListener();
					};
				})(that), 50);
			});
		}
	};

    this.update = function (oControl, oControlProperties, oComponentProperties) {
        if (oControlProperties) {
              if (oControlProperties.closeDialogCommand && oControlProperties.closeDialogCommand.length > 0) {
                    sap.zen.ZenDialogHandler.closeDialog();
                    setTimeout(function() {
                         var f = new Function(oControlProperties.closeDialogCommand);
                         f();
                    }, 0);
              } else {
                    if (this.validateAndExtractDialogContent(oControlProperties)) {
                         this.init(oControlProperties, oComponentProperties);
                    } else {
                         jQuery.sap.log.error("Invalid Dialog Content");
                    }
              }
        }
  };

	this.getType = function() {
		return "zendialog";
	};
};

sap.zen.ZenDialogHandler.closeDialog = function() {
	var oDlg = sap.zen.Dispatcher.instance.oCurrentVarDlg;
	if (oDlg) {
		var oDispatcherHook = oDlg.oDispatcherHook;
		sap.zen.Dispatcher.instance.dispatchRemove(oDispatcherHook);
	}
};

return new sap.zen.ZenDialogHandler();
});