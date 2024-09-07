define("zen.rt.components.filterpanel/resources/js/filterpanel_m_handler",  ["sap/zen/basehandler", "./ValueHelpDialog", "./emptyComponent"], function(BaseHandler, ValueHelpDialog, Empty) {
"use strict";

var dispatcher = BaseHandler.dispatcher;
	
var FilterPanelHandler = function() {
	var that = this;
	
	BaseHandler.apply(this, arguments);
	
	this.getListItemElement = function(oDom) {
		if (oDom.hasClass("sapzenfilterpanelM-ListItem")) {
			return oDom;
		} else {
			return oDom.parents(".sapzenfilterpanelM-ListItem");
		}
	};
	
	this.getContextMenuAction = function(sContextMenuComponentId, oClickedUI5Component, oDomClickedElement) {
		var sCommand = oClickedUI5Component.getModel().getProperty("/command/createcontextmenu");
		if (sCommand && oClickedUI5Component.ZEN_IdToDimensionMap) {
			var oListItem = this.getListItemElement(oDomClickedElement);
			if (oListItem && oListItem[0]) {
				var sDimensionName = oClickedUI5Component.ZEN_IdToDimensionMap[oListItem[0].id];
				var sMemberName;
				if (sDimensionName) {
					var sMethod = that.prepareCommand(sCommand, "__STRING__", sContextMenuComponentId);
					sMethod = that.prepareCommand(sMethod, "__STRING2__", sDimensionName);
					sMethod = that.prepareCommand(sMethod, "__STRING3__", sMemberName);
					sMethod = that.prepareCommand(sMethod, "__STRING4__", oDomClickedElement[0].id);
					return new Function(sMethod);
				}
			}
		}
		return null;
	};

	this.create = function(oChainedControl, oControlProperties) {
		$.sap.require("sap.ui.comp.util.FormatUtil");
        $.sap.require("sap.ui.core.format.DateFormat");
		var oJsonModel, oControl, bIsMemberSelector, sControlId = that.createUI5Identifier(oControlProperties["id"]);

		oJsonModel = new sap.ui.model.json.JSONModel();
		oJsonModel.setData(oControlProperties);
		
		bIsMemberSelector = oJsonModel.getProperty("/property/memberselector") || oJsonModel.getProperty("/property/popupreference");
		if (bIsMemberSelector) {
			oControl = oChainedControl ? oChainedControl : new Empty(sControlId);
			oControl.onAfterRendering = function() {
				new Function(that.prepareCommand(oControl.getModel().getProperty("/command/showfilterdialog"), "__STRING__", oControl.getModel().getProperty("/characteristics/0/characteristic/name")))();
				oControl.onAfterRendering = undefined;
			};
		} else {
			oControl = oChainedControl ? oChainedControl : new sap.m.NavContainer(sControlId, {autoFocus: false}).addStyleClass("sapzenfilterpanelM");
			if (!oJsonModel.getProperty("/property/showembedded")) {
				oControl.addStyleClass("sapzendimensionfilterM");
			}
		}
		if (!oJsonModel.getProperty("/property/variablescreen")) {
			oControl.ZEN_IdToDimensionMap = {};
		}
		
		oControl.setModel(oJsonModel);
		if (oChainedControl) {
			oControl.removeAllPages();
		}
		if (!bIsMemberSelector) {
			addPages(oControl);
		}

		if (!bIsMemberSelector) {
			oControl.ZEN_submit = submitExternal(oJsonModel, true);
			oControl.ZEN_submit_with_apply = submitExternal(oJsonModel, true, true);
			oControl.ZEN_check = submitExternal(oJsonModel, false);
			oControl.ZEN_cancel = function() {
				new Function(oJsonModel.getProperty("/command/cancelonlyfilter"))();
			};	
		}
		
		var super_exit = oControl.exit;
		oControl.exit = function() {
			if (super_exit) {
				super_exit.apply(oControl, arguments);
			}
			//This is a temporary fix for the issue that, when the Dsh control is being destroyed via navigation to external, 1 command is put in the queue per
			//dimension in the filterbar.  This can lead to long flickering of the loading indicator as the queue is processed.  This should be fixed more 
			//cleanly in the future.
			(sapbi_page.appComponent && sapbi_page.appComponent._bIsBeingDestroyed) || new Function(oJsonModel.getProperty("/command/destroyfiltercomponent"))();
		};
		if (!this.isDesignModeD4LIncluded()) {
			if (oControlProperties.visible) {
				oControl.removeStyleClass("zenHideFilterPanel");
			} else {
				oControl.addStyleClass("zenHideFilterPanel");
			}
		}
				
		return oControl;
	};
	
	function submitExternal(oModel, bSubmit, bExecuteOnApply) {
		return function(sToReplace, sLongReplaceTarget) {
			return submitAll(oModel, bSubmit, bExecuteOnApply, sToReplace, sLongReplaceTarget);
		};
	}
	
	function submitAll(oModel, bSubmit, bExecuteOnApply, sToReplace, sLongReplaceTarget) {
		var oAllFilters, aFilters, i, j, len, oRange, oRangeToSend, sCharName, oDialogFilter, sMethod, oSubmitJson, oAxis, aCharacteristics, oChar,
		bIsVariableScreen = oModel.getProperty("/property/variablescreen");

		aFilters = [];
		i = -1;

		oAllFilters = oModel.getProperty("/filters");
		for (sCharName in oAllFilters) {
			oDialogFilter = oAllFilters[sCharName];
			if (oDialogFilter.dirty) {
				oChar = getCharacteristicByName(oModel, sCharName);
				oDialogFilter.dirty = !oModel.getProperty("/property/variablescreen") && !bSubmit;
				aFilters[++i] = {};
				aFilters[i].name = sCharName;
				if (oDialogFilter.input !== undefined && oDialogFilter.input !== null) {
					aFilters[i].input = oDialogFilter.input;
				}
				aFilters[i].ranges = [];
				for (j = 0, len = oDialogFilter.ranges.length; j < len; j++) {
					oRange = oDialogFilter.ranges[j];
					oRangeToSend = {};
					if (oChar.type !== "DATE" && oRange.operation && oRange.operation !== "EQ" && !oRange.exclude && oRange.from.displaykey) {
							oRangeToSend.from = oRange.from.displaykey;
					} else {
					    oRangeToSend.from = oRange.from.key;
          }
					if (oChar.type !== "DATE" && oRange.to && oRange.to.displaykey) {
						oRangeToSend.to = oRange.to.displaykey;
					} else if (oRange.to) {
                        oRangeToSend.to = oRange.to.key;
                    }
					//no operation means "EQ"
					if (oRange.operation && oRange.operation !== "EQ") {
						oRangeToSend.operation = oRange.operation;
					}
					if (oRange.exclude) {
						oRangeToSend.exclude = true;
					}
					aFilters[i].ranges[j] = oRangeToSend;
				}
			}
		}

		aCharacteristics = oModel.getProperty("/characteristics");
		if (aCharacteristics) {
			for (i = 0; i < aCharacteristics.length; i++) {
				if (aCharacteristics[i].characteristic.axisdirty) {
					if (!oAxis) {
						oAxis = oModel.getProperty("/axis");
					}
					aCharacteristics[i].characteristic.axisdirty = !bSubmit;
				}
			}
		
			if (!oAxis && (oModel.getProperty("/axis/rows/dirty") || oModel.getProperty("/axis/columns/dirty"))) {
				oAxis = oModel.getProperty("/axis");
			}
	
			if (bSubmit && oAxis) {
				oModel.setProperty("/axis/rows/dirty", undefined);
				oModel.setProperty("/axis/columns/dirty", undefined);
			}
	
			if (oAxis || aFilters.length > 0 || (bIsVariableScreen && bSubmit)) {
				if (bIsVariableScreen) {
					sap.zen.MessageViewHandler.clearMessages();
				}
				if (!oAxis) {
					oAxis = {};
				}
				oSubmitJson = {
					filters : aFilters,
					axis : oAxis
				};
				if (sToReplace && sLongReplaceTarget) {
					//__STRING____FILTERBAR_13FBDIM
					sMethod = that.prepareCommand(sLongReplaceTarget, sToReplace, JSON.stringify(oSubmitJson));
					return sMethod;
				} else {
					sMethod = that.prepareCommand(oModel.getProperty(bExecuteOnApply ? "/command/submitfilter" : "/command/submitonlyfilter"), "__STRING__", JSON.stringify(oSubmitJson));
					sMethod = that.prepareCommand(sMethod, "__BOOLEAN__", bSubmit ? "X" : " ");
					new Function(sMethod)();
				}
			}
		}
	}
	
	function changeAxis(oModel, sCharPath, sNewAxis) {
		var aRowOrColumn;
		var sOldAxis = oModel.getProperty(sCharPath + "/axis");
		if (sOldAxis === sNewAxis) {
			return;
		}
		var oChar = oModel.getProperty(sCharPath);
		oModel.setProperty(sCharPath + "/axisdirty", true);
		oModel.setProperty(sCharPath + "/axis", sNewAxis);
		
		// We now change the axis array
		if (sOldAxis !== "FREE") {
			aRowOrColumn = oModel.getProperty("/axis/" + sOldAxis.toLowerCase());
			for (var i = 0; i < aRowOrColumn.length; i++) {
				var oneRowOrColumnName = aRowOrColumn[i].entry.name;
				if (oneRowOrColumnName === oChar.name) {
					aRowOrColumn.splice(i, 1);
					break;
				}
			}
			oModel.setProperty("/axis/" + sOldAxis.toLowerCase(), aRowOrColumn);
		}
		if (sNewAxis !== "FREE") {
			// Insert into new Axis
			aRowOrColumn = oModel.getProperty("/axis/" + sNewAxis.toLowerCase());
			aRowOrColumn.push({
				entry : {
					name : oChar.name,
					text: oChar.text
				}
			});
			oModel.setProperty("/axis/" + sNewAxis.toLowerCase(), aRowOrColumn);
		}
		
		if (sOldAxis === "FREE" || sNewAxis === "FREE") {
			refreshFreeAxis(oModel);
		}
		
		if (!oModel.getProperty("/property/pauserefresh")) {
			submitAll(oModel, true, true);
		}
	}

	function addPages(oControl) {
		//if "/property/showembedded" is true, render as filter panel
		//if false as dimension filter
		oControl.addPage(getMainPage(oControl));
	}

	function getMainPage(oControl) {
		var oModel = oControl.getModel(), bShowHeader = oModel.getProperty("/property/showembedded");
		if (bShowHeader) {
			var oHeader = new sap.m.Toolbar({
				content: [,
					new sap.m.ToolbarSpacer(), 
					new sap.m.Title({text: "{/text/title}"}), 
					new sap.m.ToolbarSpacer()
				]
			});
			var bNavigationMode = oModel.getProperty("/property/navigationpanel");
            
            var oSearchField = new sap.m.SearchField({
                liveChange: function(oEvent) {
                    var sValue = oEvent.getParameter("newValue");
                    var oFilter = new sap.ui.model.Filter(bNavigationMode ? "entry/text" : "characteristic/text", sap.ui.model.FilterOperator.Contains, sValue);
                    var aCharLists = oControl.ZENCharLists;
					var aVisiblePrompts = oModel.getProperty("/visibleprompts");
					var aFilters = [ oFilter ];
					if (aVisiblePrompts) {
						aFilters.push(getFilterForVisibleVariables(aVisiblePrompts));
					}
                    oControl.ZEN_multiInput = [];
                    for (var i = 0; i < aCharLists.length; i++) {
                        aCharLists[i].getBinding("items").filter(aFilters);
                    }
            }});
            
            oSearchField.addEventDelegate({
                onAfterRendering:function() {
                    oSearchField.$().find("input").on("keydown", function(e) {
                        if(e.which === 9 && oControl.ZEN_multiInput && oControl.ZEN_multiInput[0]) {
                            oControl.ZEN_multiInput[0].$().find("input").focus();
                            return false;
                        }
                    });
                }
            });
			var oSubHeader = new sap.m.Toolbar({
				content: [,oSearchField]
			});
			
			if (oModel.getProperty("/property/variablescreen") && oModel.getProperty("/visibleprompts")) {
				oSubHeader.addContent(getSettingsButton(oControl, oSearchField));
			}
		}
		var oPage = new sap.m.Page({
			showHeader: bShowHeader,
			content: [getMainContent(oControl)]
		}).addStyleClass("sapzenfilterpanelM-mainpage");
		
		if (oModel.getProperty("/text/title").length > 0) {
			oPage.setCustomHeader(oHeader);
			oPage.setSubHeader(oSubHeader);
		} else {
			oPage.setShowHeader(false);
			oPage.setSubHeader(oSubHeader);
		}
		return oPage;
	}
	
	function getVariableTechnicalName(sVarName) {
		//this technical name recognition works only in S4 mode!!!
		return sVarName.substring(sVarName.indexOf(":")+1, sVarName.length);
	}
	
	function getSettingsButton(oControl, oSearchField) {
		var oModel = oControl.getModel();
		return new sap.m.Button({
			icon: "sap-icon://action-settings",
			press: function () {
				var oDialog = new sap.m.SelectDialog({
					items:{
						path:  "/characteristics",
						template: new sap.m.StandardListItem({
							title: "{characteristic/text}",
							selected: {
								path: "/visibleprompts",
								formatter: function(aVisiblePrompts) {
									var sVarTechName = getVariableTechnicalName(this.getBindingContext().getProperty("characteristic/name"));
									for(var i=0,len=aVisiblePrompts.length; i<len; i++) {
										if (aVisiblePrompts[i] === sVarTechName) {
											return true;
										}
									}
									return false;
								}
							}
						}),
						filters: [getFilterExcludeMandatory()],
						sorter: new sap.ui.model.Sorter({
							path: "characteristic/text"
						})
					},
					//0 === always all of them.
					growingThreshold: 0,
					multiSelect: true,
					liveChange: function(oEvent) {
						var oFilter = new sap.ui.model.Filter("characteristic/text", sap.ui.model.FilterOperator.Contains, oEvent.getParameter("value"));
						oEvent.getParameter("itemsBinding").filter([ getFilterExcludeMandatory(), oFilter ]);
					},
					cancel: function() {
						oDialog.destroy();
					},
					confirm: function(oEvent) {
						var aVisiblePrompts = [];
						var aSelectedContexts = oEvent.getParameter("selectedContexts");
						for (var i = 0; i < aSelectedContexts.length; i++) {
							var sVarName = aSelectedContexts[i].getProperty("characteristic/name");
							var sVarTechName = sVarName.substring(sVarName.indexOf(":")+1, sVarName.length);
							aVisiblePrompts.push(sVarTechName);
						}
						oModel.setProperty("/visibleprompts", aVisiblePrompts);
						oSearchField.setValue("");
						oControl.ZENCharLists[0].getBinding("items").filter([getFilterForVisibleVariables(aVisiblePrompts)]);
						new Function(that.prepareCommand(oModel.getProperty("/command/setvisibleprompts"), "__ARRAY__", JSON.stringify(aVisiblePrompts)))();
					}
				});
				oDialog.setModel(oModel);
				oDialog.open();
			}
		});
	}
	
	function getFilterExcludeMandatory() {
		return new sap.ui.model.Filter({
			path: "characteristic",
			test: function(oVar) {
				return oVar.mandatory ? false : true;
			}
		});
	}
	
	function getFilterForVisibleVariables(aVisiblePrompts) {
		return new sap.ui.model.Filter({
			path: "characteristic",
			test: function(oVar) {
				if (oVar.mandatory) {
					return true;
				}
				var sVarTechName = getVariableTechnicalName(oVar.name);
				for(var i=0,len=aVisiblePrompts.length; i<len; i++) {
					if (aVisiblePrompts[i] === sVarTechName) {
						return true;
					}
				}
				return false;
			}
		});
	}
	
	function getMainContent(oControl) {
		var oModel = oControl.getModel(), oContent;
		if (oModel.getProperty("/property/navigationpanel")) {
			oContent = getNavigationList(oControl);
		} else {
			var aVisiblePrompts = oModel.getProperty("/visibleprompts");
			if (aVisiblePrompts) {
				oContent = getList(oControl, [getFilterForVisibleVariables(aVisiblePrompts)]);
			} else {
				oContent = getList(oControl);
			}
		}
		return oContent;
	}

	function getList(oControl, aFilters, sAxis) {
		var oList = new sap.m.List({
			items: {
				path : "/characteristics",
				factory: getListItemFactory(oControl, sAxis),
				filters: aFilters
			},
			noDataText: "{/text/nodata}"
		});
		oControl.ZENCharLists = [oList];
		return oList;
	}
	
	function getNavigationList(oControl) {
		oControl.ZENCharLists = [];
		var oLayout = new sap.ui.layout.VerticalLayout({width: "100%"}).addStyleClass("sapzenfilterpanelM-NavigationLayout");
		oLayout.addContent(getPanelForAxis(oControl, "columns"));
		oLayout.addContent(getPanelForAxis(oControl, "rows"));
		oLayout.addContent(getPanelForAxis(oControl, "free"));
		return oLayout;
	}
	
	function getPanelForAxis(oControl, sAxis) {
		var oLabel = new sap.m.Label({
			text: "{/text/"+sAxis.toUpperCase()+"}",
			design: sap.m.LabelDesign.Bold
		}).addStyleClass("sapUiSmallMarginBegin");
		var oToolbar = new sap.m.Toolbar({
			content: [oLabel],
			design: sap.m.ToolbarDesign.Solid
		});
		var oPanel = new sap.m.Panel().addStyleClass("sapUiNoContentPadding");
		oPanel.setHeaderToolbar(oToolbar);
		
		if (sAxis === "free") {
			refreshFreeAxis(oControl.getModel());
		}
		var oList = new sap.m.List({
			items: {
				path : "/axis/"+sAxis,
				factory: getListItemFactory(oControl, sAxis)
			},
			noDataText: "{/text/nodata}"
		});
		oList.addEventDelegate({
		    onAfterRendering:function() {
		    	var oModel = oList.getModel();
		    	var bAxisChanged = oModel.getProperty("/axischanged");
		    	var iScrollTopBeforeButtonClick = oModel.getProperty("/axisfilterscrollpos");
		    	if (!bAxisChanged && (iScrollTopBeforeButtonClick === 0 || iScrollTopBeforeButtonClick)) {
		    		var jqMarkedRow = $($(document.getElementById(oControl.getId())).find(".sapzenfilterpanelM-MarkedRow"));
		    		var jqScrollContainer = oList.$().parents(".sapzenfilterpanelM-mainpage").children("section");
					if (jqMarkedRow && jqMarkedRow.position()) {
						var iTopPxOfSelectedElement = jqMarkedRow.position().top + jqMarkedRow.parent().parent().position().top;
						var iBottomPxOfSelectedElement = jqMarkedRow.position().top + jqMarkedRow.height() + jqMarkedRow.parent().parent().position().top;
						var iWhatIsVisibleTillBottom = iScrollTopBeforeButtonClick + jqScrollContainer.height();
						if (iBottomPxOfSelectedElement > iWhatIsVisibleTillBottom) {
							iScrollTopBeforeButtonClick = iScrollTopBeforeButtonClick + (iBottomPxOfSelectedElement - iWhatIsVisibleTillBottom);
						} else if (iScrollTopBeforeButtonClick > iTopPxOfSelectedElement) {
							iScrollTopBeforeButtonClick = iTopPxOfSelectedElement;
						}
						jqMarkedRow.removeClass("sapzenfilterpanelM-MarkedRow");
					}
					jqScrollContainer.scrollTop(iScrollTopBeforeButtonClick);
					oModel.setProperty("/axisfilterscrollpos", null);
		    	}
		    	if (bAxisChanged) {
		    		oModel.setProperty("/axischanged", null);
		    	}
		    }
		});
		oPanel.addContent(oList);
		oControl.ZENCharLists.push(oList);
		return oPanel;
	}
	
	function refreshFreeAxis(oModel) {
		var aFreeAxis = [];
		var aCharacteristics = oModel.getProperty("/characteristics");
		if (aCharacteristics) {
			for (var i = 0; i < aCharacteristics.length; i++) {
				var oChar = aCharacteristics[i].characteristic;
				if (oChar.axis === "FREE") {
					aFreeAxis.push({
						entry : {
							name : oChar.name,
							text: oChar.text
						}
					});
				}
			}
		}
		oModel.setProperty("/axis/free", aFreeAxis);
	}
	
	function getPathForCharName(oModel, sCharName) {
		var aChars = oModel.getProperty("/characteristics");
		for (var i = 0, len = aChars.length; i < len; i++) {
			var oChar = aChars[i].characteristic;
			if (oChar.name === sCharName) {
				return "/characteristics/"+i+"/characteristic";
			}
		}
	}

	function getListItemFactory(oControl, sAxis) {
		return function(sId, oContext) {
			var oListItem, oLayout, oLabel, sListItemId,
			oModel = oContext.getModel(),
			bAxisNotFree = sAxis && sAxis !== "free",
			sCharName = oModel.getProperty(sAxis ? oContext.getPath("entry/name") : oContext.getPath("characteristic/name")),
			sCharPath = sAxis ? getPathForCharName(oModel, sCharName) : oContext.getPath("characteristic"),
			bValueHelp = oModel.getProperty(sCharPath + "/valuehelp"),
			oInput = getInput(sCharName, bValueHelp, oModel, sCharPath, oControl),
			fValueHelp = function() {
				sap.ui.core.BusyIndicator.show(0);
				new Function(that.prepareCommand(oModel.getProperty("/command/showfilterdialog"), "__STRING__", sCharName))();
			};
            
            if (!sCharPath) {
                return new sap.m.CustomListItem({
				    visible: false
			    });
            }
            
            var sPositionPath = oContext.getPath();
            if (!oControl.ZEN_multiInput) {
                oControl.ZEN_multiInput = [];
            }
			oControl.ZEN_multiInput.push(oInput);

			if(oModel.getProperty("/property/label")) { //DimensionName
				oLabel = new sap.m.Title().bindProperty("text", {
					path : sCharPath,
					formatter : function(oCharacteristic) {
						return (oCharacteristic.mandatory ? "* " : "") + oCharacteristic.text;
					}
				});
                oLabel.bindProperty("tooltip", {
					path : sCharPath,
					formatter : function(oCharacteristic) {
						return oCharacteristic.text;
					}
				});
				
				var oToolbar = new sap.m.Toolbar();
				//sAxis exists == navigation mode
				if (sAxis) {
					var oColumnsButton = new sap.m.ToggleButton({
						icon: "sap-icon://menu2",
						pressed: sAxis === "columns",
						press: function() {
							var jqScrollContainer = this.$().parents(".sapzenfilterpanelM-mainpage").children("section");
							oModel.setProperty("/axisfilterscrollpos", jqScrollContainer.scrollTop());
							oModel.setProperty("/axischanged", true);
							changeAxis(oModel, sCharPath, sAxis === "columns" ? "FREE" : "COLUMNS");
							resetFilterOnLists(oControl);
						}
					});
					oColumnsButton.addEventDelegate({
					    onAfterRendering:function() {
					    	oColumnsButton.$().find("span").css("transform", "rotate(90deg)").css("-ms-transform", "rotate(90deg)").css("-webkit-transform", "rotate(90deg)");
					    }
					});
					oToolbar.addContent(oColumnsButton);
					var oRowsButton = new sap.m.ToggleButton({
						icon: "sap-icon://menu2",
						pressed: sAxis === "rows",
						press: function() {
							var jqScrollContainer = this.$().parents(".sapzenfilterpanelM-mainpage").children("section");
							oModel.setProperty("/axisfilterscrollpos", jqScrollContainer.scrollTop());
							oModel.setProperty("/axischanged", true);
							changeAxis(oModel, sCharPath, sAxis === "rows" ? "FREE" : "ROWS");
							resetFilterOnLists(oControl);
						}
					});
					oRowsButton.addEventDelegate({
					    onAfterRendering:function() {
					    	oRowsButton.$().find("span").css("padding-top", "1px");
					    }
					});
					oToolbar.addContent(oRowsButton);
					//add text to the axis element
					var sTextPath = oContext.getPath("entry/text");
					if (!oModel.getProperty(sTextPath)) {
						oModel.setProperty(sTextPath, oModel.getProperty(sCharPath+"/text"));
					}
				}
				oToolbar.addContent(oLabel);
				if (bAxisNotFree) {
					var sAxisPath = "/axis/"+sAxis;
					var aAxis = oModel.getProperty(sAxisPath);
					if (aAxis.length > 1) {
						var oldPos = parseInt(sPositionPath.substring(sPositionPath.lastIndexOf("/")+1));
						oToolbar.addContent(new sap.m.ToolbarSpacer());
						oToolbar.addContent(new sap.m.Button({
							icon: "sap-icon://navigation-up-arrow",
							press: function() {
								var newPos = oldPos === 0 ? aAxis.length - 1 : oldPos - 1;
								oModel.setProperty(sCharPath + "/axisdirty", true);
								moveDimensionAndScroll(oModel, sAxisPath, sCharName, oldPos, newPos, this.$());
							},
							type: sap.m.ButtonType.Transparent
						}));
						oToolbar.addContent(new sap.m.Button({
							icon: "sap-icon://navigation-down-arrow",
							press: function() {
								var newPos = oldPos === aAxis.length - 1 ? 0 : oldPos + 1 ;
								oModel.setProperty(sCharPath + "/axisdirty", true);
								moveDimensionAndScroll(oModel, sAxisPath, sCharName, oldPos, newPos, this.$());
							},
							type: sap.m.ButtonType.Transparent
						}));
					}
				}
				oToolbar.addEventDelegate({
				    onAfterRendering:function() {
				    	oToolbar.$().css("border", "none");
				    }
				});
				
				oLayout = new sap.ui.layout.VerticalLayout({
					width: "100%",
					content: [oToolbar,oInput]
				});
	
			} else {
				oLayout = new sap.ui.layout.VerticalLayout({
					width: "100%",
					content: [oInput]
				});
			}
			oLayout.addEventDelegate({
			    onAfterRendering:function() {
			    	if ($("body").hasClass("sapUiSizeCompact")) {
			    		oLayout.$().css("padding-top", "0.25rem");
			    	}
			    }
			});

			if (oModel.getProperty("/property/variablescreen")) {
				sListItemId = oControl.getId() + "-" +  that.createUI5Identifier(sCharName);
			}
			oListItem = new sap.m.CustomListItem(sListItemId, {
				content: [oLayout.addStyleClass("sapUiContentPadding")]
			});
				
			if (bValueHelp && oInput.attachValueHelpRequest) {
				oInput.attachValueHelpRequest(fValueHelp);
			}
			
			oInput.addEventDelegate({
				onfocusin:function() {
					oControl.$().css("z-index", "1");
				},
				onfocusout:function() {
					oControl.$().css("z-index", "");
				},
				onAfterRendering:function() {
					oInput.$().find("input").on("keydown", function(e) {
							if(e.which === 9 && oControl.ZEN_multiInput && oControl.ZEN_multiInput.length > 1) {
									for (var i = 0; i < oControl.ZEN_multiInput.length; i++) {
											if (oControl.ZEN_multiInput[i].getId() === oInput.getId() && oControl.ZEN_multiInput[i+1]) {
												oControl.ZEN_multiInput[i+1].$().find("input").focus();
												return false;
											}
									}
							}
					});
			}
			});
			
			if (oControl.ZEN_IdToDimensionMap) {
				oControl.ZEN_IdToDimensionMap[oListItem.getId()] = sCharName;
			}
			
			var sSelectedCharName = oModel.getProperty("/axisfilterselected");
			if (sSelectedCharName && sSelectedCharName === sCharName) {
				oListItem.addStyleClass("sapzenfilterpanelM-MarkedRow");
				oModel.setProperty("/axisfilterselected", null);
			}

			return oListItem.addStyleClass("sapzenfilterpanelM-ListItem");
		};
	}
	
	function resetFilterOnLists(oControl) {
		var aCharLists = oControl.ZENCharLists;
		for (var i = 0; i < aCharLists.length; i++) {
			var oBinding = aCharLists[i].getBinding("items");
			var aFilters = oBinding.aFilters;
			if (aFilters && aFilters.length > 0) {
				oBinding.filter([]);
				oBinding.filter(aFilters);
			}
		}
	}
	
	function moveDimensionAndScroll(oModel, sAxisPath, sCharName, oldPos, newPos, jqMoveButton) {
		var aAxis = oModel.getProperty(sAxisPath);
		var jqScrollContainer = jqMoveButton.parents(".sapzenfilterpanelM-mainpage").children("section");
		oModel.setProperty("/axisfilterscrollpos", jqScrollContainer.scrollTop());
		oModel.setProperty("/axisfilterselected", sCharName);
		aAxis.splice(newPos, 0, aAxis.splice((oldPos), 1)[0]);
		oModel.setProperty(sAxisPath, aAxis);
		if (!oModel.getProperty("/property/pauserefresh")) {
			submitAll(oModel, true, true);
		}
	}

	function setOkButtonDisabledIfExists() {
		var element = document.getElementsByClassName("zenDialogOkButton");
		if (element && element.length) {
			var ui5Element = sap.ui.getCore().byId(element[0].id);
			if (ui5Element) {
				ui5Element.setEnabled(false);
			}
		}
	}

	function getInput(sCharName, bValueHelp, oModel, sCharPath, oControl) {
        var oInput, sInputId,
        sType = oModel.getProperty(sCharPath + "/type"),
        bRangesAllowed = oModel.getProperty(sCharPath + "/rangeallowed"),
        bIntervalAllowed = oModel.getProperty(sCharPath + "/intervalallowed"),
		bExclusionAllowed = oModel.getProperty(sCharPath +"/exclusionallowed"),
		bHierarchical = oModel.getProperty(sCharPath +"/hierarchical"),
		bSingleSelection = oModel.getProperty(sCharPath +"/singleonly");

		if (oModel.getProperty("/property/variablescreen")) {
			sInputId = oControl.getId() + "-" +  that.createUI5Identifier(sCharName) + "-input";
		}
        
        if (sType === "DATE" && bSingleSelection && !bExclusionAllowed && !bRangesAllowed && !bHierarchical) {
            if (bIntervalAllowed) {
                oInput = new sap.m.DateRangeSelection(sInputId, {
                    dateValue: {
                        path: "/filters",
                        mode : sap.ui.model.BindingMode.OneWay,
                        formatter: getDateFilterFormatter(sCharName, oModel, "from")
                    },
                    secondDateValue: {
                        path: "/filters",
                        mode : sap.ui.model.BindingMode.OneWay,
                        formatter: getDateFilterFormatter(sCharName, oModel, "to")
                    },
                    change: function (e) {
                        if (e.getParameter("valid")) {
													oInput.setValueState(sap.ui.core.ValueState.None);
													oControl.hasClientError = false;
                          var oFrom = e.getParameter("from") ? e.getParameter("from") : e.getParameter("to"),
                          oTo = e.getParameter("to") ? e.getParameter("to") : e.getParameter("from");
                        	setTokensAsFilter(oInput.getModel(), sCharName, [new sap.m.Token().data("range", { "exclude": false, "operation": "BT", "value1": oFrom, "value2": oTo})]);
                        } else {
													oInput.setValueState(sap.ui.core.ValueState.Error);
													oControl.hasClientError = true;
													setOkButtonDisabledIfExists();
                        }
                    }
                });
            } else {
                oInput = new sap.m.DatePicker(sInputId, {
                    valueFormat: "yyyyMMdd",
                    dateValue: {
                        path: "/filters",
                        mode : sap.ui.model.BindingMode.OneWay,
                        formatter: getDateFilterFormatter(sCharName, oModel, "from")
                    },
                    change: function (e) {
                        if (e.getParameter("valid")) {
													oInput.setValueState(sap.ui.core.ValueState.None);
													oControl.hasClientError = false;
                        	setTokensAsFilter(oInput.getModel(), sCharName, [new sap.m.Token({key: e.getParameter("value")})]);
                        } else {
													oInput.setValueState(sap.ui.core.ValueState.Error);
													oControl.hasClientError = true;
													setOkButtonDisabledIfExists();
                        }
                    }
                });
            }
        } else {
            oInput = new sap.m.MultiInput(sInputId, {
                showValueHelp: bValueHelp,
                enableMultiLineMode: {
                    path: "/filters",
                    mode : sap.ui.model.BindingMode.OneWay,
                    formatter: setFilterTokensArray(sCharName, oModel)
                },
                tokenChange: function(e) {
                    if (e.getParameter("type") === sap.m.MultiInput.TokenChangeType.Removed) {
                        setTokensAsFilter(oInput.getModel(), sCharName, oInput.getTokens());
                    }
                }
            });
            oInput.addValidator(function(e){
                setInputString(e.text, sCharName, oInput.getModel());
                return new sap.m.Token();
            });
        }
		return oInput;
	}
    
    function getDateFilterFormatter(sCharName, oModel, sFromTo) {
        return function(oAllFilters) {
            var oFilters, oRange, oMember;
            if (oAllFilters && sCharName && oAllFilters[sCharName]) {
                oFilters = oAllFilters[sCharName];
                if (oFilters.ranges) {
                    oRange = oFilters.ranges[0];
                    if (oRange) {
                        oMember = oRange[sFromTo];
                        if (oMember) {
                            return getDateFormatter().parse(oMember.key);
                        }
                    }
                }
            }
            return null;
        }
    }
	
	function setInputString(sInputString, sCharName, oModel) {
		var oAllFilters = oModel.getProperty("/filters"), oCharFilters,
		bPauseRefresh = oModel.getProperty("/property/pauserefresh");
		if (oAllFilters) {
			oCharFilters = oAllFilters[sCharName];
		}
		if (oCharFilters) {
			oCharFilters.dirty = true;
			oCharFilters.input=sInputString;
		}
		if (!bPauseRefresh) {
			submitAll(oModel, !oModel.getProperty("/property/variablescreen"), !bPauseRefresh);			
		} else {
			submitAll(oModel, false, !bPauseRefresh);			
		}
	}

	function setFilterTokensArray(sCharName, oModel) {
		return function(oAllFilters) {
			var oToken, aTokens, oFilters, oChar, sMemberDisplay, bDirectInputVariable, oFormatter,
				i, len, oRange,
				oMember, oMemberFrom, oMemberTo, 
				sKey, sKeyFrom, sKeyTo,
				sText, sTextFrom, sTextTo, 
				sOperation, sKeyField, oValueFrom, oValueTo, bExclude

			if (!oAllFilters || !sCharName || !oAllFilters[sCharName]) {
				this.setTokens([]);
				return true;
			} else {
				oFilters = oAllFilters[sCharName];
			}
			aTokens = [];
			if (oFilters && oFilters.ranges) {
				sMemberDisplay = oModel.getProperty("/property/memberdisplay");
				oChar = getCharacteristicByName(oModel, sCharName);
                if (!oChar.valuehelp) {
                    bDirectInputVariable = true;
                } else if (oChar.type === "DATE") {
                    oFormatter = getDateFormatter();
                }
				for (i = 0, len = oFilters.ranges.length; i < len; i++) {
					oRange = oFilters.ranges[i];
					//no operation means "EQ"
					if (!oFormatter && !oRange.exclude && (!oRange.operation || oRange.operation === "EQ")) {
						// value
						oMember = oRange.from;
						sKey = oMember.displaykey ? oMember.displaykey : oMember.text;
						if ((bDirectInputVariable && !oMember.text) || sKey === oMember.text) {
							sText = sap.ui.comp.util.FormatUtil.getFormattedExpressionFromDisplayBehaviour("idOnly", sKey);
						} else {
							sText = sap.ui.comp.util.FormatUtil.getFormattedExpressionFromDisplayBehaviour(getValueHelpDialogMemberDisplay(sMemberDisplay), sKey, oMember.text);
						}
						if (!bDirectInputVariable || sKey || sText) {
							oToken = new sap.m.Token({key: oMember.key, text: sText, tooltip: sText});
							aTokens.push(oToken);
						}
					} else {
						// operation
						sOperation = oRange.operation ? oRange.operation : "EQ";
						
						// low value
						oMemberFrom = oRange.from;
						if (oMemberFrom) {
							sKeyFrom = oMemberFrom.displaykey && oChar.type !== "DATE" ? oMemberFrom.displaykey : oMemberFrom.key;
							if (bDirectInputVariable || sKeyFrom === oMemberFrom.text) {
								sTextFrom = sap.ui.comp.util.FormatUtil.getFormattedExpressionFromDisplayBehaviour("idOnly", sKeyFrom);
							} else {
								sTextFrom = sap.ui.comp.util.FormatUtil.getFormattedExpressionFromDisplayBehaviour(getValueHelpDialogMemberDisplay(sMemberDisplay), sKeyFrom, oMemberFrom.text);
							}
						}
						else {
							sKeyFrom = "";
							sTextFrom = "";
						}
						
						// high value
						oMemberTo = oRange.to;
						if (oMemberTo) {
							sKeyTo = oMemberTo.displaykey && oChar.type !== "DATE" ? oMemberTo.displaykey : oMemberTo.key;
							if (bDirectInputVariable || sKeyTo === oMemberTo.text) {
								sTextTo = sap.ui.comp.util.FormatUtil.getFormattedExpressionFromDisplayBehaviour("idOnly", sKeyTo);
							} else {
								sTextTo = sap.ui.comp.util.FormatUtil.getFormattedExpressionFromDisplayBehaviour(getValueHelpDialogMemberDisplay(sMemberDisplay), sKeyTo, oMemberTo.text);
							}
						} else {
							sKeyTo = "";
							sTextTo = "";
						}
						
						bExclude = oRange.exclude ? true : false;
						sKeyField = "key";
                        if (oFormatter) {
                            if (sKeyFrom) {
                                oValueFrom = oFormatter.parse(sKeyFrom);
								sTextFrom = sap.ui.core.format.DateFormat.getDateInstance().format(oValueFrom);
                            }
                            if (sKeyTo) {
                                oValueTo = oFormatter.parse(sKeyTo);
								sTextTo = sap.ui.core.format.DateFormat.getDateInstance().format(oValueTo);
                            }
                        }
                        
						sText = ValueHelpDialog.prototype._getFormatedRangeTokenText(sOperation, sTextFrom, sTextTo, bExclude, sKeyField);
						oToken = new sap.m.Token({key: "r"+i, text: sText, tooltip: sText})
						oToken.data("range", { "exclude": bExclude, 
												"operation": sOperation, 
												"keyField": sKeyField, 
												"value1": oValueFrom ? oValueFrom : sKeyFrom,
												"textFrom": sTextFrom,
												"value2": oValueTo ? oValueTo : sKeyTo,
												"textTo": sTextTo});
						aTokens.push(oToken);
					}
				}
			}

			this.setTokens(aTokens);
			return true;
		};
	}

	this.update = function(oControl, oControlProperties, oComponentProperties) {
		var i, sView, oModel, oValueHelpDialog, oNewFilters, oNewFilter, bFilterMatch = false, 
		oFilters, oFilter, sCharName, oValidatedFilters, bVariableScreen, oChild, a, iParentLevel, oMember,
		iMaxChildIndex = -1;
		
		if (oControl && oControlProperties) {
			sView = oControlProperties.view;
			if (this.isDesignModeD4LIncluded() || oControlProperties.newds) {
                oControl.ZEN_multiInput = [];
				oControl = this.create(oControl, oControlProperties, oComponentProperties);
				if (sView !== "DIALOG") {
					return oControl;
				}
			}
			if (oControlProperties.changeVisibility) {
				if (oControlProperties.visible) {
					oControl.removeStyleClass("zenHideFilterPanel");
				} else {
					oControl.addStyleClass("zenHideFilterPanel");
				}
				if (sView === "SUBMIT") {
					oControl.ZEN_submit();
				} else if (sView === "SUBMIT_WITH_APPLY") {
					oControl.ZEN_submit_with_apply();
				} else if (sView === "CANCEL") {
					oControl.ZEN_cancel();
				}
				return oControl;
			}
			
			oModel = oControl.getModel();
			bVariableScreen = oModel.getProperty("/property/variablescreen");
			oNewFilters = oControlProperties.filters;
			if (oNewFilters) {
				oFilters = oModel.getProperty("/filters");
				for (sCharName in oNewFilters) {
					oFilter = oFilters[sCharName];
					oNewFilter = oNewFilters[sCharName];
					if (oFilter) {
						bFilterMatch = true;
						if (oControlProperties.filtercanceled || !oFilter.dirty || bVariableScreen) {
							if (bVariableScreen && oFilter.dirty) {
								oNewFilter.dirty = true;
							}
							oFilters[sCharName] = oNewFilter;
							if (oModel.getProperty("/dialog/name") === sCharName) {
								oModel.setProperty("/dialog/filters", oNewFilter);
							}
						}
					}
				}
				oModel.setProperty("/filters", bFilterMatch ? oFilters : oNewFilters);
				forceModelUpdate(oModel, "/filters");
			}
			
			oValidatedFilters = oControlProperties.validatedfilters;
			if (oValidatedFilters) {
				oFilters = oModel.getProperty("/filters");
				for (sCharName in oValidatedFilters) {
					oFilter = oFilters[sCharName];
					oNewFilter = oValidatedFilters[sCharName];
					if (oFilter && oFilter.dirty) {
						oNewFilter.dirty = true;
						oFilters[sCharName] = oNewFilter;
						if (oModel.getProperty("/dialog/name") === sCharName) {
							oModel.setProperty("/dialog/filters", oNewFilter);
						}
					}
				}
				forceModelUpdate(oModel, "/filters");
			}
			
			var oOldAxis = oModel.getProperty("/axis");
			var oOldCharacteristics = oModel.getProperty("/characteristics");
			var bHasDirtyAxis = false;
			if (oOldCharacteristics) {
				for (i = 0; i < oOldCharacteristics.length; i++) {
					if (oOldCharacteristics[i].characteristic.axisdirty) {
						bHasDirtyAxis = true;
						break;
					}
				}
			}

			var bAxisDirty = bHasDirtyAxis || (oOldAxis && (oOldAxis.rows.dirty || oOldAxis.columns.dirty));
			var bCharsChanged = false;
			if (sView === "DEFAULT" && (oControlProperties.filtercanceled || !bAxisDirty) && !isCharListEqual(oControlProperties.characteristics, oOldCharacteristics)) {
				oModel.setProperty("/characteristics", oControlProperties.characteristics);
				bCharsChanged = true;
			}
			
			if (sView === "DIALOG") {
				oModel.setProperty("/dialog", oControlProperties.dialog);
				if (oControlProperties.characteristics && !isCharListEqual(oControlProperties.characteristics, oOldCharacteristics)) {
					oModel.setProperty("/characteristics", oControlProperties.characteristics);
					bCharsChanged = true;
				}
				
				oValueHelpDialog = getValueHelpDialog(oControl);
				oValueHelpDialog.open();
				oValueHelpDialog.update();
				oControl.zenValueHelpDialog = oValueHelpDialog;
				
			} else if (sView === "DIALOG_SEARCH") {
				var oDialogProperties = oControlProperties.dialog;
				var bHierarchical = oModel.getProperty("/dialog/hierarchical");
				oModel.setProperty("/dialog/selection", oDialogProperties.selection);
				if (bHierarchical) {
					var oMembers = oDialogProperties.members;
					if (oMembers) {
						for (i = 0; i === iMaxChildIndex+1; i++) {
							oChild = oMembers[""+i];
							if (oChild) {
								oChild.level = 0;
								iMaxChildIndex = i;
							}
						}
					}
				}
				oModel.setProperty("/dialog/members", oDialogProperties.members);
				if (oControl.zenValueHelpDialog) {
					if (bHierarchical && oControl.zenValueHelpDialog.getTable().collapseAll) {
						oControl.zenValueHelpDialog.getTable().collapseAll();
					}
					oControl.zenValueHelpDialog.update();
					//release searchField from busy mode 
					//(searchField is stored in ValueHelpDialog as FilterBar)
					oControl.zenValueHelpDialog.getFilterBar().setBusy(false);
					if (oDialogProperties.selection.maxelements || (oDialogProperties.members && (bHierarchical || oDialogProperties.members.size > 0))) {
						oControl.zenValueHelpDialog.TableStateSearchData();
					} else {
						oControl.zenValueHelpDialog.TableStateDataFilled();
					}
				}				
			} else if (sView === "EXPAND_NODE") {
				iParentLevel = oModel.getProperty(oControlProperties.path).level;
				oMember = oControlProperties.member;
				oMember.level = iParentLevel;
				for (a = 0; a === iMaxChildIndex+1; a++) {
					oChild = oMember[""+a];
					if (oChild) {
						oChild.level = iParentLevel+1;
						iMaxChildIndex = a;
					}
				}
				oModel.setProperty(oControlProperties.path, oControlProperties.member);
				if (oControl.zenValueHelpDialog) {
					oControl.zenValueHelpDialog.update();
				}
			} else if (sView === "SUBMIT") {
				oControl.ZEN_submit();
			} else if (sView === "SUBMIT_WITH_APPLY") {
				oControl.ZEN_submit_with_apply();
			} else if (sView === "CANCEL") {
				oControl.ZEN_cancel();
			}
			
			var oNewAxis = oControlProperties.axis;
			if (oNewAxis && oOldAxis && (oControlProperties.filtercanceled || !bAxisDirty) && (bCharsChanged || !isAxisListEqual(oNewAxis, oOldAxis))) {
				if (oControlProperties.filtercanceled) {
					oModel.setProperty("/axis", oNewAxis);
					addTextToAxis(oModel);
				} else if (oOldAxis.rows.dirty) {
					oModel.setProperty("/axis/columns", oNewAxis.columns);
					addTextToAxis(oModel, "columns");
				} else if (oOldAxis.columns.dirty) {
					oModel.setProperty("/axis/rows", oNewAxis.rows);
					addTextToAxis(oModel, "rows");
				} else {
					oModel.setProperty("/axis", oNewAxis);
					addTextToAxis(oModel);
				}
				refreshFreeAxis(oModel);
				resetFilterOnLists(oControl);
			}					
		}
		return oControl;
	};
	
	function isAxisListEqual(oNewAxis, oOldAxis) {
		var i, len;
		if (oNewAxis.rows.length !== oOldAxis.rows.length || oNewAxis.columns.length !== oOldAxis.columns.length) {
			return false;
		}
		for (i = 0, len = oNewAxis.rows.length; i < len; i++) {
			if (oNewAxis.rows[i].entry.name !== oOldAxis.rows[i].entry.name) {
				return false;
			}
		}
		for (i = 0, len = oNewAxis.columns.length; i < len; i++) {
			if (oNewAxis.columns[i].entry.name !== oOldAxis.columns[i].entry.name) {
				return false;
			}
		}
		return true;
	}
	
	function isCharListEqual(aChar1, aChar2) {
		if ((!aChar1 && aChar2) || (aChar1 && !aChar2)) {
			return false;
		}
		if (aChar1) {
			if (aChar1.length !== aChar2.length) {
				return false;
			}
			for (var i = 0, len = aChar1.length; i < len; i++) {
				var oChar1 = aChar1[i].characteristic;
				var oChar2 = aChar2[i].characteristic;
				if (oChar1.name !== oChar2.name || oChar1.axis !== oChar2.axis) {
					return false;
				}
			}
		}
		return true;
	}
	
	function addTextToAxis(oModel, sAxis) {
		var aAxisNames = [];
		var aCharacteristics = oModel.getProperty("/characteristics");
		if (sAxis) {
			aAxisNames.push(sAxis);
		} else {
			aAxisNames = ["rows", "columns"];
		}
		for (var i = 0; i < aAxisNames.length; i++) {
			var sAxisName = aAxisNames[i];
			var aAxis = oModel.getProperty("/axis/"+sAxisName);
			if (aAxis && aAxis.length > 0) {
				for (var j = 0; j < aCharacteristics.length; j++) {
					var oCharacteristic = aCharacteristics[j].characteristic;
					if (oCharacteristic.axis === sAxisName.toUpperCase()) {
						for (var k = 0; k < aAxis.length; k++) {
							var oAxisEntry = aAxis[k].entry;
							if (oAxisEntry.name === oCharacteristic.name) {
								oAxisEntry.text = oCharacteristic.text;
								break;
							}
						}
					}
				}
			}
		}
	}
	
	this.isDesignModeD4LIncluded = function(){
		return sap.zen.designmode;
	};

	function forceModelUpdate(oModel, sPath) {
		var aBindings = oModel.aBindings.slice(0);
		jQuery.each(aBindings, function(iIndex, oBinding) {
			if (oBinding.sPath === sPath) {
				oBinding.checkUpdate(true);
			}
		});
	}

	function getValueHelpDialog(oControl) {
		var oValueHelpDialog, oColModel, oSearchField, oMembers, oMember, searchstring, i, len, oChild, oTable,
		iMaxChildIndex = -1,
		oModel = oControl.getModel(),
		sCharName = oModel.getProperty("/dialog/name"),
		bHierarchical = oModel.getProperty("/dialog/hierarchical"),
		sDestroyFilterDialog = oModel.getProperty("/command/destroyfilterdialog"),
		bRangesAllowed = oModel.getProperty("/dialog/range/visible"),
		bExclusionAllowed = oModel.getProperty("/dialog/exclusionallowed"),
		bSingleSelection = oModel.getProperty("/dialog/singleonly"),
    sMemberType = oModel.getProperty("/dialog/membertype");       

		oValueHelpDialog = new ValueHelpDialog({
			//basicSearchText: this.theTokenInput.getValue(),
			title: "{/dialog/title}",
			supportMultiselect: !bSingleSelection,
			supportRanges: bRangesAllowed || bExclusionAllowed,
			supportRangesOnly: sMemberType === "DATE",
			key: "key",
			descriptionKey: "text",

			ok: function(e) {
				setTokensAsFilter(oModel, sCharName, e.getParameter("tokens"));
                oControl.zenValueHelpDialog = null;
				new Function(that.prepareCommand(sDestroyFilterDialog, "__BOOLEAN__", " "))();
				oValueHelpDialog.close();
			},

			cancel: function() {
                oControl.zenValueHelpDialog = null;
				new Function(that.prepareCommand(sDestroyFilterDialog, "__BOOLEAN__", "X"))();
				oValueHelpDialog.close();
			},

			afterClose: function() {
				if (oControl.zenValueHelpDialog) {
                    oControl.zenValueHelpDialog = null;
					new Function(that.prepareCommand(sDestroyFilterDialog, "__BOOLEAN__", "X"))();
				}
				oValueHelpDialog.destroy();
			},

			afterOpen: function () {
				sap.ui.core.BusyIndicator.hide();
			}
		});
		if (bHierarchical) {
			oValueHelpDialog.setTable(new sap.ui.table.TreeTable());
		}
		if (bRangesAllowed) {
			oValueHelpDialog.setIncludeRangeOperations([
				//sap.zen.ValueHelpRangeOperation.EQ, 
				sap.zen.ValueHelpRangeOperation.BT, 
				sap.zen.ValueHelpRangeOperation.LT, 
				sap.zen.ValueHelpRangeOperation.LE, 
				sap.zen.ValueHelpRangeOperation.GT, 
				sap.zen.ValueHelpRangeOperation.GE
			]);
		}
		if (bExclusionAllowed) {
			oValueHelpDialog.setExcludeRangeOperations([
				sap.zen.ValueHelpRangeOperation.EQ, 
				sap.zen.ValueHelpRangeOperation.BT, 
				sap.zen.ValueHelpRangeOperation.LT, 
				sap.zen.ValueHelpRangeOperation.LE, 
				sap.zen.ValueHelpRangeOperation.GT, 
				sap.zen.ValueHelpRangeOperation.GE
			]);
		}
		if (bRangesAllowed && bSingleSelection) {
			oValueHelpDialog.setMaxIncludeRanges("1");
			oValueHelpDialog.setMaxExcludeRanges("1");
			
			oValueHelpDialog.setIncludeRangeOperations([ 
				sap.zen.ValueHelpRangeOperation.BT
			]);
			oValueHelpDialog.setExcludeRangeOperations([
				sap.zen.ValueHelpRangeOperation.BT
			]);
		}
		if (bRangesAllowed && !bExclusionAllowed) {
			oValueHelpDialog.setMaxExcludeRanges("0");
		}
		if (!bRangesAllowed && bExclusionAllowed) {
			//oValueHelpDialog.setIncludeRangeOperations([
			//	sap.zen.ValueHelpRangeOperation.EQ
			//]);
			oValueHelpDialog.setMaxIncludeRanges("0");
			oValueHelpDialog.setExcludeRangeOperations([
				sap.zen.ValueHelpRangeOperation.EQ
			]);
		}

		oTable = oValueHelpDialog.getTable();
		if (bHierarchical && oTable.attachToggleOpenState) {
			var bDialogUpdate;
			oTable.attachToggleOpenState(function(e) {
				var oParams, oBindingContext, oModel, sMethod;
				oParams = e.getParameters();
				oValueHelpDialog._bIgnoreSelectionChange = true;
				if (oParams.expanded) {
					oBindingContext = oParams.rowContext;
					oModel = oBindingContext.oModel;
					if (oModel.getProperty(oBindingContext.sPath + "/0/node")) {
						sMethod = that.prepareCommand(oModel
								.getProperty("/command/expandnode"), "__STRING__", oModel
								.getProperty(oBindingContext.sPath + "/key"));
						sMethod = that.prepareCommand(sMethod, "__STRING2__",
								oBindingContext.sPath);
						new Function(sMethod)();
					} else {
						oValueHelpDialog.update();
					}
				}
			});
			
			var fOnClick = oTable.onclick;
			oTable.onclick = function() {
				if (fOnClick) {
					fOnClick.apply(oTable, arguments);
				}
				oValueHelpDialog._bIgnoreSelectionChange = false;
				if (bDialogUpdate) {
					oControl.zenValueHelpDialog.update();
					bDialogUpdate = false;
				}
			};
			
			oValueHelpDialog.attachTokenRemove(function (e) {
				var aTokenKeys = e.getParameters().tokenKeys;
				if (aTokenKeys && aTokenKeys.length > 0) {
					var aContexts = oTable.getBinding("rows").getContexts(0);
					if (aContexts && aContexts.length > 0) {
						for (var i = 0; i < aTokenKeys.length; i++) {
							var sKey = aTokenKeys[i];
							for (var j = 0; j < aContexts.length; j++) {
								var oContext = aContexts[j];
								if (oContext) {
									var oRow = oContext.getObject();
									if (oRow["key"] === sKey) {
										oTable.removeSelectionInterval(j, j);
										uncheckChildMembers(oRow, oValueHelpDialog);
										oValueHelpDialog.update();
									}
								}
							}
						}
					}
				}
			});
			
			oValueHelpDialog.attachUpdateSelection(function (e) {
				oTable.clearSelection();
				var aTokenKeys = e.getParameters().tokenKeys;
				if (aTokenKeys && aTokenKeys.length > 0) {
					var aContexts = oTable.getBinding("rows").getContexts(0);
					if (aContexts && aContexts.length > 0) {
						for (var i = 0; i < aTokenKeys.length; i++) {
							var sKey = aTokenKeys[i];
							var level = null;
							for (var j = 0; j < aContexts.length; j++) {
								var oContext = aContexts[j];
								if (oContext) {
									var oRow = oContext.getObject();
									if (level !== null) {
										//is child of a selected member
										if (level < oRow.level) {
											oTable.addSelectionInterval(j, j);
										} else {
											level = null;
										}
									} else if (oRow["key"] === sKey) {
										this._oSelectedItems.add(oRow["key"], oRow);
										oTable.addSelectionInterval(j, j);
										level = oRow.level;
									}
								}
							}
						}
					}
				}
			});
			
			oValueHelpDialog.attachSelectionChange(function(e) {
				// collect all the new selected or removed items
				var table = oTable;
				var aIndices = e.getParameter("tableSelectionParams").rowIndices;
				var i, n = aIndices.length;
				var index;
				var oContext;
				var oRow;

				var bUsePath = false;
				var oRowsBinding = table.getBinding("rows");
				var bCheckAllIsClicked = e.getParameter("tableSelectionParams").selectAll && !oValueHelpDialog.getFilterBar().ZEN_searchValue;
				
				if (oRowsBinding.aKeys) {
					bUsePath = true;
				}
				
				if (bCheckAllIsClicked && n) {
					oValueHelpDialog._oSelectedTokens.removeAllTokens();
					
					for ( var sRangeKey in oValueHelpDialog._oSelectedRanges) {
						oValueHelpDialog._removeRangeByKey(sRangeKey, false);
					}
		
					oValueHelpDialog._oSelectedItems.removeAll();
				}

				for (i = 0; i < n; i++) {
					index = aIndices[i];
					oContext = table.getContextByIndex(index);
					oRow = oContext ? oContext.getObject() : null;

					if (oRow) {
						var sKey;
						if (bUsePath) {
							sKey = oContext.sPath.substring(1);
						} else {
							sKey = oRow["key"];
						}

						if (table.isIndexSelected(index) || bCheckAllIsClicked) {
							if (!bCheckAllIsClicked || !oRow.level) {
								uncheckChildMembers(oRow, oValueHelpDialog);
								oValueHelpDialog._oSelectedItems.add(sKey, oRow);
								oValueHelpDialog._addToken2Tokenizer(sKey, oValueHelpDialog._getFormatedTokenText(sKey), oValueHelpDialog._oSelectedTokens);
							}
						} else {
							oValueHelpDialog._oSelectedItems.remove(sKey);
							var bInSelectionState = oValueHelpDialog._removeTokenFromTokenizer(sKey, oValueHelpDialog._oSelectedTokens);
							removeSelectionInTree(oRow, oContext.sPath, bInSelectionState, oValueHelpDialog);
						}
					}
				}
				oValueHelpDialog.update();
			});
		}

		oColModel = new sap.ui.model.json.JSONModel();
		var memberDisplay = oModel.getProperty("/property/memberdisplay");
		oValueHelpDialog.setTokenDisplayBehaviour(getValueHelpDialogMemberDisplay(memberDisplay));
		if (memberDisplay === "KEY") {
			oColModel.setData({
				cols: [
				      	{label: oModel.getProperty("/text/key"), template: "displaykey"}
				      ]
			});
		} else if (memberDisplay === "TEXT") {
			oColModel.setData({
				cols: [
				      	{label: oModel.getProperty("/text/text"), template: "text"}
				      ]
			});
		} else if (memberDisplay === "KEY_TEXT") {
			oColModel.setData({
				cols: [
				      	{label: oModel.getProperty("/text/key"), template: "displaykey"},
				      	{label: oModel.getProperty("/text/text"), template: "text"}
				      ]
			});
		} else if (memberDisplay === "TEXT_KEY") {
			oColModel.setData({
				cols: [
				      	{label: oModel.getProperty("/text/text"), template: "text"},
				        {label: oModel.getProperty("/text/key"), template: "displaykey"}
				      ]
			});
		}
		oTable.setModel(oColModel, "columns");

        var oRangeKeyField = {label: oModel.getProperty("/text/key"), key: "key"};
        if ((bRangesAllowed || bExclusionAllowed) && sMemberType === "DATE") {
            oRangeKeyField.type = "date";
        }
		oValueHelpDialog.setRangeKeyFields([oRangeKeyField]);

		oValueHelpDialog.setModel(oModel);
		oTable.bindRows("/dialog/members");

		if (oControl.$().closest(".sapUiSizeCompact").length > 0) { // check if runs in Compact mode
			oValueHelpDialog.addStyleClass("sapUiSizeCompact");
		}
		setFilterTokensArray(oModel.getProperty("/dialog/name"), oModel).call(oValueHelpDialog, oModel.getProperty("/filters"));
				
		oSearchField = new sap.m.SearchField({
			width: "95%",
			placeholder:"{/text/search}"}
		);
		
		if (bHierarchical) {
			oMembers = oModel.getProperty("/dialog/members");
			if (oMembers) {
				for (i = 0; i === iMaxChildIndex+1; i++) {
					oChild = oMembers[""+i];
					if (oChild) {
						oChild.level = 0;
						iMaxChildIndex = i;
					}
				}
			}
		}
		
		if (!oModel.getProperty("/dialog/nosearch") && (oModel.getProperty("/dialog/selection/maxelements") || bHierarchical)) {
			oSearchField.setBusyIndicatorDelay(0);
			oValueHelpDialog.TableStateSearchData();
			oSearchField.attachSearch(function(e) {
				oSearchField.setBusy(true);
				oValueHelpDialog.TableStateDataSearching();
				var value = e.getParameters().query;
				oSearchField.ZEN_searchValue = value;
				new Function(that.prepareCommand(oModel
						.getProperty("/command/membersearch"),
						"__STRING__", value))();
			});
		} else {
			oMembers = oModel.getProperty("/dialog/members");
			if (oMembers) {
				for (i = 0, len = oMembers.length; i < len; i++) {
					oMember = oMembers[i];
					searchstring = "";
					if (memberDisplay !== "KEY") {
						searchstring += oMember.text;
					}
					if (memberDisplay !== "TEXT") {
						if (searchstring) {
							searchstring += " ";
						}
						searchstring += oMember.displaykey;
					}
					oMember.searchstring = searchstring;
				}
			}
			
			oSearchField.setShowSearchButton(false);
			oSearchField.attachLiveChange(function(e) {
				var oValue1, aCharsToEscape, i, len, sChar, oFilter;

				oValue1 = e.getParameters().newValue ? e.getParameters().newValue
						.toUpperCase() : "";
				aCharsToEscape = [ "\\\\", "\\^", "\\$", "\\+", "\\.", "\\(", "\\)",
						"\\[", "\\]", "\\{", "\\}" ];
				for (i = 0, len = aCharsToEscape.length; i < len; i++) {
					sChar = aCharsToEscape[i];
					oValue1 = oValue1.replace(new RegExp(sChar, "g"), sChar);
				}
				oValue1 = oValue1.replace(/\?/g, ".").replace(/\*/g, ".*?");
				oFilter = new sap.ui.model.Filter("searchstring", "Wildcard", oValue1);
				oFilter.fnTest = function(value) {
					return value.search(new RegExp(oValue1)) !== -1;
				};
				if (!oModel.getProperty("/dialog/selection/maxelements")
						&& !oModel.getProperty("/dialog/hierarchical")) {
					oValueHelpDialog._bIgnoreSelectionChange = true;
					oValueHelpDialog.getTable().getBinding("rows").filter([ oFilter ]);
					oValueHelpDialog._bIgnoreSelectionChange = false;
					oValueHelpDialog.update();
				}
			});
			oValueHelpDialog.TableStateDataFilled();
		}
		oValueHelpDialog.setFilterBar(oSearchField);
		
		return oValueHelpDialog;
	}
	
	 function removeSelectionInTree(oMember, sPath, bInSelectionState, oValueHelpDialog) {
		uncheckChildMembers(oMember, oValueHelpDialog);
		// unmark path, add all marked children to the selection
		if (!bInSelectionState && sPath) {
			//unmark path up to the top
			var aPath = sPath.split("/");
			var sTempPath = sPath;
			var oModel = oValueHelpDialog.getTable().getModel();
			var aRemovedParentMemberKeys = [oMember.key];
			var sStopPath = sTempPath;
			while (aPath.length > 3) {
				aPath.pop();
				sTempPath = aPath.join("/");
				var tempMember = oModel.getProperty(sTempPath);
				oValueHelpDialog._oSelectedItems.remove(tempMember.key);
				if (oValueHelpDialog._removeTokenFromTokenizer(tempMember.key, oValueHelpDialog._oSelectedTokens)) {
					sStopPath = sTempPath;
				}
				aRemovedParentMemberKeys.push(tempMember.key);
				//by single selection also unmark all children
				if (oModel.getProperty("/dialog/singleonly")) {
					uncheckChildMembers(tempMember);
				}
			}
			
			//if not single selection add all siblings to the selection
			if (!oModel.getProperty("/dialog/singleonly")) {
				aPath = sPath.split("/");
				sTempPath = sPath;
				while (aPath.length > 3 && sStopPath !== sTempPath) {
					aPath.pop();
					sTempPath = aPath.join("/");
					var iMaxChildIndex = -1;
					for (var a = 0; a === iMaxChildIndex + 1; a++) {
						var oChild = oModel.getProperty(sTempPath + "/" + a);
						if (oChild) {
							if (!oChild.node && aRemovedParentMemberKeys.indexOf(oChild.key) === -1) {
								oValueHelpDialog._oSelectedItems.add(oChild.key, oChild);
								oValueHelpDialog._addToken2Tokenizer(oChild.key, oValueHelpDialog._getFormatedTokenText(oChild.key), oValueHelpDialog._oSelectedTokens);
							}
							iMaxChildIndex = a;
						}
					}
				}
			}
		}
	}
	
	function uncheckChildMembers(oMember, oValueHelpDialog) {
		var iMaxChildIndex, a, oChild;
		if (oMember) {
			iMaxChildIndex = -1;
			for (a = 0; a === iMaxChildIndex + 1; a++) {
				oChild = oMember["" + a];
				if (oChild) {
					oValueHelpDialog._oSelectedItems.remove(oChild.key);
					oValueHelpDialog._removeTokenFromTokenizer(oChild.key, oValueHelpDialog._oSelectedTokens);
					iMaxChildIndex = a;
					uncheckChildMembers(oChild, oValueHelpDialog);
				}
			}
		}
	}
	
	function getValueHelpDialogMemberDisplay(sMemberDisplay) {
		switch (sMemberDisplay) {
			case "TEXT_KEY":
				return "descriptionAndId";
			case "KEY_TEXT":
				return "idAndDescription";
			case "TEXT":
				return "descriptionOnly";
            default:
			    return "idOnly";
		}
	}

	function setTokensAsFilter(oModel, sCharName, aTokens) {
		var sKey, sText, sLongKey, oToken, oRange, i, oFilterRange, oFormat, oValue1, oValue2,
		len = aTokens.length,
		oAllFilters = oModel.getProperty("/filters"), oCharFilters,
		bPauseRefresh = oModel.getProperty("/property/pauserefresh");
		if (oAllFilters) {
			oCharFilters = oAllFilters[sCharName];
		}
		if (oCharFilters) {
			oCharFilters.dirty = true;
			oCharFilters.ranges=[];

			for (i = 0; i < len; i++) {
				oToken = aTokens[i];
				if (oToken.data("range")) {
					oRange = oToken.data("range");
                    oValue1 = oRange.value1;
                    if (oValue1 && oValue1.getDate) {
                        oFormat = getDateFormatter();
                        oValue1 = oFormat.format(oValue1);
                    }
					oFilterRange = {from: {key: oValue1}, operation: oRange.operation};
					if (oRange.exclude) {
						oFilterRange.exclude = true;
					}
          oValue2 = oRange.value2;
					if (oValue2) {
                         if (oValue2.getDate) {
                            if (!oFormat) {
                                oFormat = getDateFormatter();
                            }
                            oValue2 = oFormat.format(oValue2);
                        }
						oFilterRange.to = {key: oValue2};
					}
					oCharFilters.ranges.push(oFilterRange);
				} else {
					sKey = oToken.getKey();
					sText = oToken.getText();
					sLongKey = oToken.data("longKey");
					if (!sLongKey) {
						sLongKey = sKey;
					}
					//no operation means "EQ"
					oCharFilters.ranges.push({from: {key: sLongKey, text: sText}});
				}
			}
		}
		if (!bPauseRefresh) {			
			submitAll(oModel, !oModel.getProperty("/property/variablescreen"), !bPauseRefresh);
		} else {
			submitAll(oModel, false, !bPauseRefresh);			
		}
	}
    
    function getDateFormatter() {
        return sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd", strictParsing: true});
    }
    
    function getCharacteristicByName(oModel, sCharName) {
        var aChars = oModel.getProperty("/characteristics");
        for (var i = 0, len = aChars.length; i < len; i++) {
            var oChar = aChars[i].characteristic;
            if (oChar.name === sCharName) {
                return oChar;
            }
        }
    }
	
	this.getType = function() {
		return "filterpanel";
	};
	
	this.getDecorator = function() {
		return "DataSourceControlDecorator";
	};
};

var instance = new FilterPanelHandler();
dispatcher.addHandlers("filter", instance, "DataSourceControlDecorator");
return instance;

});