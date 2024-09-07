define("zen.rt.components.filterbar/resources/js/filterbar_handler", ["sap/zen/basehandler", "zen.rt.components.filterpanel/resources/js/filterpanel_m_handler"], 
function(BaseHandler){
	
	var FilterBarHandler = function() {
		"use strict";
	
		BaseHandler.apply(this, arguments);
		
		var dispatcher = BaseHandler.dispatcher;
		
		var me = this;
						
		function init(oControl, oControlProperties, bUpdate) {	
			var aChildren = oControlProperties.content;
			if (aChildren && aChildren[0]) {
				if (aChildren[0].component.content && aChildren[0].component.content.control.newds) {				
					oControl.custProp.allChildrenSubmit = oControlProperties.allChildrenSubmit;
					if (bUpdate) { 
						aChildren.forEach(function(oChild) {
							if (oChild.component.content && oChild.component.content.control.newds) {
								//this flag is not needed for updates in context of the filter bar...
								oChild.component.content.control.newds = false;
							}
						});
					}
				}
				me.updateChildren(aChildren, oControl, function(oNewControl, iIndex, componentData) {					
					if (componentData) {
						var filterBarItem = new sap.ui.comp.filterbar.FilterItem(oControl.getId()+'-'+oNewControl.getId(), {
							name:oControl.getId()+'-'+oNewControl.getId(),
							visibleInFilterBar:false});
						filterBarItem.setControl(oNewControl);
					
						if (componentData.content && componentData.content.control &&
								componentData.content.control.characteristics && componentData.content.control.characteristics.length>0) {
							filterBarItem.setLabel(componentData.content.control.characteristics[0].characteristic.text);
						}						
						oNewControl.addStyleClass('zenFilterBarMFilter');
                        if (oNewControl.ZEN_multiInput && oNewControl.ZEN_multiInput[0]) {
                            oNewControl.ZEN_multiInput[0].attachTokenChange(function(oEvent) {
                                oControl.fireFilterChange(oEvent);
                            });
                        }
						oControl.addFilterItem(filterBarItem);
                        oControl.fireFilterChange();
					}
										
				}, function(){
                    //do nothing					
				});
			}
			
			if (oControlProperties.visibleDimensionNames) {
				var i, oDimFilter, oFilter, sDimName;
                var aFilters = oControl.getFilterGroupItems();
                
                var aVisibleDimensions = oControlProperties.visibleDimensionNames;
                
                for (i=0; i < aFilters.length; i++) {
                	oFilter = aFilters[i];
                	oDimFilter = oControl.determineControlByFilterItem(oFilter);
            		if (oDimFilter) {
            			oFilter.setVisibleInFilterBar(false);
            			sDimName = oDimFilter.getModel().getProperty("/characteristics/0/characteristic/name");
            			for (var j = 0; j < aVisibleDimensions.length; j++) {
							if (sDimName === aVisibleDimensions[j]._n) {
								oFilter.setVisibleInFilterBar(true);
								break;
							}
						}
            		}
            	}
			}			
		}
				
		me.create = function(oChainedControl, oControlProperties) {
			var id = oControlProperties["id"];
			
			jQuery.sap.require('sap.ui.comp.filterbar.FilterBar');			
		    
			var ZenFilterBar = sap.ui.comp.filterbar.FilterBar.extend("sap.zen.ZenFilterBar", {
				renderer : {}
			});
			
			ZenFilterBar.prototype._createVariantManagement = function() {
				/*
				 * Variant Management is only possible for applications
				 * 	see method initializeVariantManagement: window.sapbi_page.appComponent.getId() is required
				 */
				this._smartVm = false;
				var oVariantManagement;
				if (window.sapbi_page.appComponent) {
					oVariantManagement = new sap.ui.comp.smartvariants.SmartVariantManagement(this.getId() + "-variant", {
						showExecuteOnSelection: false,
						showShare: true
					});
					this._smartVm = true;
				}
		        return oVariantManagement;
		    };		    
			
			var filterBar = new ZenFilterBar(id,{		    
				advancedMode:false,
				considerGroupTitle:false,
				showRestoreButton:false,
				filterBarExpanded: oControlProperties.expanded,
				persistencyKey: oControlProperties.VARIANT_KEY
			}).addStyleClass('zenFilterBarM');			

			filterBar._initializeVariantManagementOriginal = sap.ui.comp.filterbar.FilterBar.prototype._initializeVariantManagement; 
			filterBar._initializeVariantManagement = function() {    	
		    	if (this._smartVm) {
			    	if (this._oVariantManagement && this.getPersistencyKey()) {
						this._sOwnerId = window.sapbi_page && window.sapbi_page.appComponent.getId();
			    		var oPersInfo = new sap.ui.comp.smartvariants.PersonalizableInfo({
					       type: "filterBar",
					       keyName: "persistencyKey"		
			            });
					    oPersInfo.setControl(this);
		
					    this._oVariantManagement.addPersonalizableControl(oPersInfo);					        
					    filterBar._initializeVariantManagementOriginal.call(filterBar);
			      	} else {
			      		this.fireInitialise();
				 	}
		    	} else {
		    		filterBar._initializeVariantManagementOriginal.call(filterBar);
		    	}
			};
			
			filterBar.registerFetchData(function() {
				var bookmarkString = window[oControlProperties.PAGE_ID].getWindow().getContext("BookmarkInternal").createBookmark().getBookmark();
				return bookmarkString;
			});				
			
			//overwrite applyVariant to load bookmark, skip anything else
			filterBar.applyVariant = function(oVariant, sContext, bInitial) {
				if (oVariant) {
					var bookmarkString = oVariant.filterBarVariant;
				
					if (bookmarkString) {
						var commandStr = getCommand(filterBar, 'loadSfinBookmark');
						if(commandStr) {
							me.applyForChildren(filterBar, function(oDimFilter) {
								var oDimFilterModel = oDimFilter.getModel(), oAllFilters;
								if (oDimFilterModel) {
									oAllFilters = oDimFilterModel.getProperty("/filters");
								}
								if (oAllFilters) {
									for (var filterKey in oAllFilters) {
										if (oAllFilters.hasOwnProperty(filterKey)) {
											if (oAllFilters[filterKey].dirty) {
												oAllFilters[filterKey].dirty = false;
											}
										}
									}
								}
							});
							if (commandStr.indexOf("__bmId__")>=0) {
								commandStr = me.prepareCommand(commandStr, "__bmId__", "42");
								commandStr = me.prepareCommand(commandStr, "__arg2__", bookmarkString);
								new Function(commandStr).call();
							}
						}
					}
	
					if (bInitial && this._isNewFilterBarDesign()) {
						this._fHandleResize();
					}
				}
			};
			
			//set selection to standard
			if (filterBar._oVariantManagement) {
				filterBar._oVariantManagement._initializeOriginal = filterBar._oVariantManagement._initialize; 			
				filterBar._oVariantManagement._initialize = function(parameter, oCurrentControlWrapper) {
					if (oControlProperties.ignoreDefaultVariant) {			
						this.setInitialSelectionKey(filterBar._oVariantManagement.STANDARDVARIANTKEY);
						var isSaveEnabled = me.allowVariantSave(filterBar, oControlProperties);
						filterBar._oVariantManagement.currentVariantSetModified(isSaveEnabled);
					}
					filterBar._oVariantManagement._initializeOriginal.call(filterBar._oVariantManagement, parameter, oCurrentControlWrapper);
				};
			}
			
			//call _initializeVariantManagement() directly,
			//fireInitialise() doesn't trigger _initializeVariantManagement()
			filterBar._initializeVariantManagement();
			
			if (!sap.zen.designmode && !oControlProperties.fbVisible) {
				filterBar.toggleStyleClass("zenFilterBarMHidden");
			}
            
            filterBar.registerGetFiltersWithValues(function() {
                var i;
                var oControl;
                var aFilters = this.getFilterGroupItems();
                
                var aFiltersWithValue = [];
                
                for (i=0; i < aFilters.length; i++) {
                    oControl = this.determineControlByFilterItem(aFilters[i]);
                    if (oControl && oControl.ZEN_multiInput && oControl.ZEN_multiInput[0] && oControl.ZEN_multiInput[0].getTokens().length) {
                        aFiltersWithValue.push(aFilters[i]);
                    }
                }
                
                return aFiltersWithValue;
            });
			
			filterBar.custProp = {}; // to store local properties
			filterBar.custProp.i18n = {"expand":oControlProperties.EXPAND_ACTION, "collapse":oControlProperties.COLLAPSE_ACTION, "novariant":oControlProperties.NO_VARIANT};
			filterBar.custProp.allChildrenSubmit = oControlProperties.allChildrenSubmit;
			
			me.addCustomExpandButton(filterBar);

			if (typeof (DSH_deployment) !== "undefined") { //only enable this in new runtime
				setCommand(filterBar, 'loadSfinBookmark', oControlProperties.loadsfinbookmarkcmd);
			}
			
			filterBar.zenInitLater = function() {
				init(filterBar, oControlProperties);
				filterBar.zenInitLater=null;
			};
			
			filterBar.attachSearch(function(ev){
				me.handleSearch(ev, filterBar);
			});

			setCommand(filterBar, 'EXPAND', oControlProperties.expandcmd);
			setCommand(filterBar, 'DELAYRERENDER', oControlProperties.delayrerendercmd);
			
			if(!sap.zen.designmode) {
				filterBar.addEventDelegate({
					onAfterRendering:function(ev) {
						ev.srcControl.removeEventDelegate(this);
						me.updateEnablement(ev.srcControl, oControlProperties);
						$(ev.srcControl.getParent().getDomRef()).addClass("zenFilterBarMParentCont");
					}
				})
			}

			/////////////////////////////////////////////////////////////////////
			// temporary solution to hide the header 'Basic' in the Filter dialog
			// (nichts hält länger als ein Provisorium)
			/////////////////////////////////////////////////////////////////////
			me.hideFilterDialogHeader(filterBar);

			///////////////////////////////////////////////////////////////////////
			// initialization for adding custom overflow expand button in filterbar 
			///////////////////////////////////////////////////////////////////////
			me.initOverflowExpand(filterBar, oControlProperties);
            
			return filterBar;
		};
	
		me.update = function(oControl, oControlProperties) {
			if (oControlProperties) {							
				if (oControl.zenInitLater) {
					setTimeout(oControl.zenInitLater);
				} else{						
					init(oControl, oControlProperties, true);
				}
				
				me.updateVisibility(oControl, oControlProperties);
				
				me.updateEnablement(oControl, oControlProperties);

				var isSaveEnabled = me.allowVariantSave(oControl, oControlProperties);
				if (oControl._oVariantManagement) {
					oControl._oVariantManagement.currentVariantSetModified(isSaveEnabled);
				}
			}			
			return oControl;
		};
		
		me.applyForChildren = function(oControl, funclet) {			
			var content = oControl.getAllFilterItems();
			
			for ( var i = 0; i < content.length; i++) {
                var filterControl = oControl.determineControlByFilterItem(content[i]);
				if (filterControl) {
					var result = funclet(filterControl);
					if (result){
						return result;
					}
				}
			}
			
			return null;
		};
		
		me.getType = function() {
			return "filterbar";
		};

		/////////////////////////////////////////
		//
		// Local Utilities
		//
		/////////////////////////////////////////
		
		me.updateVisibility = function(filterBar, oControlProperties) {
			if (oControlProperties.visibilityChanged) {
				filterBar.toggleStyleClass("zenFilterBarMHidden");
			}
		}
		
		me.allowVariantSave = function(filterBar, oControlProperties) {
			if (filterBar._oVariantManagement) {
				var vm = filterBar._oVariantManagement;
				if (vm.getSelectionKey() !== vm.STANDARDVARIANTKEY && oControlProperties.datasourcechanged) {
					return true;
				} else {
					return false;
				}
			}
		}		
		
		me.initOverflowExpand = function(filterBar, oControlProperties) {
			dispatcher.registerResizeHandler(filterBar, {                
                endResize : function(e) {
	                if (e) {
						///////////////////////////////////////////////
						// Dynamically Hide/Show Expand button
						//////////////////////////////////////////////
						
						if (getSampleDFWidth() === -1) {
							me.sampleDimensionFilterWidth(filterBar);
						}
																		
						if (filterBar.getFilterBarExpanded()) {
							me.refreshCollapseVisibleDFCount(filterBar);							
						}
						me.updateCustomExpandVisibility(filterBar);
	                }
                }
            });

			
			filterBar.orig_setFilterBarExpanded = filterBar.setFilterBarExpanded;
			filterBar.setFilterBarExpanded = function(bShowExpanded){
				var bOldExpanded = this.getFilterBarExpanded();				
				filterBar.orig_setFilterBarExpanded.call(filterBar, bShowExpanded);
				
				if (bShowExpanded !== bOldExpanded) {
					var commandStr = getCommand(filterBar, 'EXPAND');
					if(commandStr) {
						eval(commandStr);
					}
	                new Function(oControlProperties.onToggle).call();
				}
			};			
		};
		
		me.addCustomExpandButton = function(filterBar) {
			if (filterBar._oToolbar) {
				var hideShowButtonIndex;
				if (filterBar._oHideShowButton) {
					hideShowButtonIndex = filterBar._oToolbar.indexOfContent(filterBar._oHideShowButton);
				}
				if (hideShowButtonIndex) {					
					jQuery.sap.require('sap.m.Button');
					jQuery.sap.require('sap.m.ButtonType');
					filterBar.customExpandButton = new sap.m.Button({
						text: filterBar.custProp.i18n.expand,
						visible:false,
						type: sap.m.ButtonType.Transparent
					});
					filterBar.customExpandButton.attachPress(function() {
						me.toggleExpandOverlay(filterBar);
					});
					
					filterBar.customExpandButton.addStyleClass('zenCustomExpandButton');
					
					filterBar._oToolbar.insertContent(filterBar.customExpandButton, hideShowButtonIndex);
				}
				
			}			
		};
		
		me.updateCustomExpandVisibility = function(filterBar) {
			var expandButtonVisible = false;
			if (filterBar.getFilterBarExpanded()) {				
				expandButtonVisible = me.checkCustomExpandVisibility(filterBar) && filterBar.getFilterBarExpanded();
			}
			filterBar.customExpandButton.setVisible(expandButtonVisible);			
			
			// this is the case when the overlay is expanded, the user opens filter
			// dialog and hide dimension filters.  If the expand button should not
			// be visible anymore, we'll collapse the overlay
			if (filterBar.custProp.customExpanded && !expandButtonVisible) {
				me.toggleExpandOverlay(filterBar, true);
			}
		}
		
		me.refreshCollapseVisibleDFCount = function(filterBar) {
			if (getSampleDFWidth() === -1) {
				me.sampleDimensionFilterWidth(filterBar);
			}
			
			var count = Math.floor((($(filterBar.getDomRef()).width())/getSampleDFWidth()));
            var aFilters = filterBar.getFilterGroupItems();
            
            var indexVisible = 0;
            for (var i=0; i < aFilters.length; i++) {
                var oFilter = aFilters[i];
                if (oFilter.getVisibleInFilterBar()) {
	                var oDimFilter = filterBar.determineControlByFilterItem(oFilter);
	                if (oDimFilter) {
	                   var oParent = oDimFilter.getParent();
	                   if (oParent && oParent.addStyleClass && oParent.removeStyleClass) {
		                   if (indexVisible++>=count) {
								oParent.addStyleClass('zenFBIhidden');
		                   }
		                   else {
								oParent.removeStyleClass('zenFBIhidden');
		                   }
	                   }
	                }
	            }
            }				
		};
				
		me.checkCustomExpandVisibility = function(filterBar) {
			var retValue = false;

			var visibleDFCount = getVisibleDFCount(filterBar);
			
			if (getSampleDFWidth() !== -1) {				
				if ((visibleDFCount*getSampleDFWidth()) > ($(filterBar.getDomRef()).width())) {			
					retValue = true;
				}
			}
			return retValue;
		};
		
		me.sampleDimensionFilterWidth = function(filterBar) {
			var w = -1;
			var dfs = filterBar.getAllFilterItems();
			if (dfs.length>1) {
				var df = $(filterBar.getDomRef()).find('.sapUiCompFilterBarBasicArea>div:first-of-type');
				if (df) {
					var dfPaddings = parseInt(df.css('padding-left'))+parseInt(df.css('padding-right'));
					if (isNaN(dfPaddings)) {
						dfPaddings = 0;		
					}
					w = df.width()+dfPaddings;
				}
			}
			setSampleDFWidth(w);
		}
		
		me.toggleExpandOverlay = function(filterBar, manualClose) {
			if (filterBar.custProp.customExpanded || manualClose===true) {
				filterBar.removeStyleClass('zenCustomExpand');
				filterBar.custProp.customExpanded = false;							
				filterBar.customExpandButton.setText(filterBar.custProp.i18n.expand);
			}
			else {
				filterBar.addStyleClass('zenCustomExpand');
				filterBar.custProp.customExpanded = true;
				filterBar.customExpandButton.setText(filterBar.custProp.i18n.collapse);
			}
		}
							
		me.hideFilterDialogHeader = function(filterBar) {
			me.originalShowFilterDialog = filterBar._showFilterDialog;
			filterBar._showFilterDialog = function() {
				$(document.body).addClass('zenFilterBarDialogOpened');
				
                me.applyForChildren(filterBar, function(oDimFilter) {
                    oDimFilter.ZENFilterBeforeDialog = JSON.stringify(oDimFilter.getModel().getProperty("/filters"));
                });
				me.originalShowFilterDialog.call(filterBar);
				
				filterBar._oFilterDialog.attachAfterClose(function() {
                    me.applyForChildren(filterBar, function(oDimFilter) {
                        if (oDimFilter.ZENFilterBeforeDialog) {
                            oDimFilter.ZENFilterBeforeDialog = null;
                        }
                    });		
					$(document.body).removeClass('zenFilterBarDialogOpened');					
					
					if (filterBar.getFilterBarExpanded()) {
						me.refreshCollapseVisibleDFCount(filterBar);						
					}
					me.updateCustomExpandVisibility(filterBar);
				});										
			}
            
            me.originalCancelFilterDialog = filterBar._cancelFilterDialog;
			filterBar._cancelFilterDialog = function() {
                me.applyForChildren(filterBar, function(oDimFilter) {
                    if (oDimFilter.ZENFilterBeforeDialog) {
                        oDimFilter.getModel().setProperty("/filters", JSON.parse(oDimFilter.ZENFilterBeforeDialog));
                        oDimFilter.ZENFilterBeforeDialog = null;
                    }
                });
                
				me.originalCancelFilterDialog.call(filterBar);						
			}					
		};
		
		me.handleSearch = function(ev, filterBar) {
			var submitMethod = filterBar.custProp.allChildrenSubmit;
			var iKeyWord = submitMethod.indexOf("__STRING____");
			while(iKeyWord > 0){
				var keyWeNeedToReplace;

				if (typeof (DSH_deployment) === "undefined"){
					keyWeNeedToReplace = submitMethod.substring(iKeyWord, submitMethod.indexOf("'",iKeyWord));
				}else{
					keyWeNeedToReplace = submitMethod.substring(iKeyWord, submitMethod.indexOf("\\x27",iKeyWord));
				}
				var idWeNeed = keyWeNeedToReplace.substring(12)+"_filter1";
				var oDimensionFilter = sap.ui.getCore().byId(idWeNeed);

				var oldSubmitMethod = submitMethod;						
				submitMethod = oDimensionFilter.ZEN_submit(keyWeNeedToReplace, submitMethod);
				if (!submitMethod) {
					submitMethod = oldSubmitMethod.replace(keyWeNeedToReplace,"{}");
				}
				iKeyWord = submitMethod.indexOf("__STRING____");

			}
			
			var delayrerendercmdStart = getCommand(filterBar, 'DELAYRERENDER');
			if(delayrerendercmdStart && delayrerendercmdStart.indexOf("__arg1__")>=0) {
				delayrerendercmdStart = delayrerendercmdStart.replace("__arg1__", "true");
			}
			
			var delayrerendercmdEnd = getCommand(filterBar, 'DELAYRERENDER');
			if(delayrerendercmdEnd && delayrerendercmdEnd.indexOf("__arg1__")>=0) {
				delayrerendercmdEnd = delayrerendercmdEnd.replace("__arg1__", "false");
			}
			
			var sVisibleDimensions = me.getVisibleDimensions(filterBar);
			if(sVisibleDimensions && delayrerendercmdEnd && delayrerendercmdEnd.indexOf("__arg2__")>=0) {
				delayrerendercmdEnd = delayrerendercmdEnd.replace("__arg2__", sVisibleDimensions);
			}
					
			submitMethod = delayrerendercmdStart + delayrerendercmdEnd + submitMethod ;			
			eval(submitMethod);			
		};
		
		me.getVisibleDimensions = function(filterBar) {
            if (typeof (DSH_deployment) !== "undefined") {
            	var i, oControl, oFilter, sDimName;
                var aFilters = filterBar.getFilterGroupItems();
                
                var aVisibleDimensions = [];             
                for (i=0; i < aFilters.length; i++) {
                	oFilter = aFilters[i];
                	if (oFilter.getVisibleInFilterBar()) {
                		oControl = filterBar.determineControlByFilterItem(oFilter);
                		if (oControl) {
                			sDimName = oControl.getModel().getProperty("/characteristics/0/characteristic/name");
                			if (sDimName) {
                				aVisibleDimensions.push(sDimName);
                			}
                		}
                	}
                }
				return JSON.stringify(aVisibleDimensions);
            }
            return null;
		}
		
		me.updateEnablement = function(filterBar) {
			if (filterBar._oVariantManagement) {
				filterBar._oVariantManagement.setEnabled(true);
			}
		};
		
		function getVisibleDFCount(filterBar) {
			var dfs = filterBar.getAllFilterItems(true);
			
			var visibleDFCount = 0;
			for (var i=0; dfs && i<dfs.length; i++) {
				if (dfs[i].getVisibleInFilterBar()) {
					visibleDFCount++;
				}
			}
			return visibleDFCount;
		}

		function setSampleDFWidth(val) {
			me._sampleDFWidth = val;
		}

		function getSampleDFWidth() {
			if (!me._sampleDFWidth) {
				me._sampleDFWidth = -1;
			}
			return me._sampleDFWidth;
		}

		function getCommand(oControl, type) {
			var c;
			if (oControl.custProp && oControl.custProp.commands) {
				c = oControl.custProp.commands[type];
			}
			return c;
		}
		
		function setCommand(oControl, type, command) {
			if (oControl.custProp) {
				if (!oControl.custProp.commands) {
					oControl.custProp.commands = {};
				}
				oControl.custProp.commands[type] = command;
			}			
		}

		this.getDecorator = function() {
			return "DataSourceFixedHeightDecorator";
		};
	};
	
	return new FilterBarHandler();
});