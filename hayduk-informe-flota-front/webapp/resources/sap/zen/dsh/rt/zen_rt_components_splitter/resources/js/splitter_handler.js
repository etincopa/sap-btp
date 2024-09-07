define("zen.rt.components.splitter/resources/js/splitter_handler", ["sap/zen/basehandler"], function(BaseHandler){
	"use strict";

	var SplitterHandler = function() {

		BaseHandler.apply(this, arguments);
		var that = this;

		function init(oControl, oControlProperties, oComponentProperties) {
			if (oControlProperties) {
				var aChildren = oControlProperties.content;
				if (aChildren) {
					if (oComponentProperties) {
						var i;
						// fit content area's size into splitter's size
						var iParentSize = "Horizontal" === oControlProperties.orientation ? parseInt(oComponentProperties.width) : parseInt(oComponentProperties.height);
						var iMinSizeSum = 0;
						var iContentSizeSum = 0;
						for (i in aChildren) {
							var iMinimumSize;
							if ("auto" !== aChildren[i].component.content.control.minimumSize) {
								iMinimumSize = parseInt(aChildren[i].component.content.control.minimumSize);
								if (iMinimumSize > iParentSize) {
									aChildren[i].component.content.control.minimumSize = "auto";
								}
								else {
									iMinSizeSum += iMinimumSize;
								}
							}
							if ("auto" !== aChildren[i].component.content.control.contentSize) {
								var iContentSize = parseInt(aChildren[i].component.content.control.contentSize);
								if (iContentSize > iParentSize || (null != iMinimumSize && iContentSize < iMinimumSize)) {
									aChildren[i].component.content.control.contentSize = "auto";
								}
								else {
									iContentSizeSum += iContentSize;
								}
							}
						}
						// if too large, set to auto
						if (iMinSizeSum > iParentSize) {
							for (i in aChildren) {
								aChildren[i].component.content.control.minimumSize = "auto";
							}
						}
						if (iContentSizeSum > iParentSize) {
							for (i in aChildren) {
								aChildren[i].component.content.control.contentSize = "auto";
							}
						}
					}
					that.updateChildren(aChildren, oControl, function(oContentArea, i) {
						oControl.insertContentArea(oContentArea, i);
					}, function(oContentAreaToDelete){
						oControl.removeContentArea(oContentAreaToDelete);
					});
				}
				oControl.addStyleClass("zenborder");
				oControl.setOrientation(oControlProperties.orientation);
			}
		}

		this.createAndAdd = function (oChainedControl, oControlProperties, oComponentProperties, fAppendToParentFunclet, oArgForFunclet) {
			var id = oControlProperties["id"];
			var oControl = this.createDefaultProxy(id);
			oControl.orgOnAfterRendering = oControl.onAfterRendering;
			fAppendToParentFunclet(oControl, oArgForFunclet, oComponentProperties);
			init(oControl, oControlProperties, oComponentProperties);
			sap.zen.Dispatcher.instance.updateComponentProperties(oControl, oComponentProperties, fAppendToParentFunclet);
			return oControl;
		};

		this.update = function(oControl, oControlProperties) {
			if (oControlProperties) {
				init(oControl, oControlProperties);
			}
			return oControl;
		};

		this.getDefaultProxyClass = function(){
			return ["sap.ui.layout.Splitter"];
		};

		this.provideFunctionMapping = function(){
			return [];
		};

		this.getDecorator = function() {
			return "SplitterDecorator";
		};

		this.getType = function() {
			return "splitter";
		};

		this.applyForChildren = function(oControl, fFunclet) {
			var contentareas = oControl.getContentAreas();
			if (contentareas) {
				for ( var i = 0; i < contentareas.length; i++) {
					var oContentArea = contentareas[i];
					fFunclet(oContentArea);
				}
			}
		};

	};
	return new SplitterHandler();

});

sap.zen.ContentAreaHandler = function() {
	"use strict";
	sap.zen.BaseHandler.apply(this, arguments);
	var dispatcher = sap.zen.Dispatcher.instance;
	var that = this;

	this.createAndAdd = function(oChainedControl, oControlProperties, oComponentProperties, fAppendToParentFunclet, oArgForFunclet) {
		var oControl = this.createAbsoluteLayout();
		fAppendToParentFunclet(oControl, oArgForFunclet);
		init(oControl, oControlProperties);
		return oControl;
	};

	this.updateComponent = function(oControl, oControlProperties) {
		if (oControlProperties) {
			init(oControl, oControlProperties);
		}
		return oControl;
	};

	function init(oControl, oControlProperties) {
		if (oControlProperties) {
			var aChildren = oControlProperties.content;
			if (aChildren) {
				that.updateChildren(aChildren, oControl, function(oNewControl, iIndex) {
					dispatcher.insertIntoAbsoluteLayoutContainer(oControl, oNewControl, iIndex);
				}, function(oControlToDelete){
					oControl.removeContent(oControlToDelete);
				});
			}
			oControl.getLayoutData().setResizable(oControlProperties.resizable);
			var iContentSize = oControlProperties.contentSize;
			// combine size and unit of size
			if ("auto" !== iContentSize) {
				iContentSize += oControlProperties.unitOfSize;
			}
			oControl.getLayoutData().setSize(iContentSize);
			// minimum size does not support "auto"
			var minSize = oControlProperties.minimumSize;
			if ("auto" === minSize) {
				minSize = 50;
			}
			else {
				minSize = parseInt(minSize);
			}
			// minimum size does not have unit
			//minSize += oControlProperties.unitOfMinimumSize;
			oControl.getLayoutData().setMinSize(minSize);
		}
	}

	this.applyForChildren = function(oContentArea, fFunclet) {
		var children = oContentArea.getContent();
		for ( var i = 0; i < children.length; i++) {
			var oControl = children[i];
			if (oControl) {
				fFunclet(oControl);
			}
		}
	};

};

sap.zen.ContentAreaHandler.instance = new sap.zen.ContentAreaHandler();
// AbsLayoutDecorator
sap.zen.Dispatcher.instance.addHandlers("contentarea", sap.zen.ContentAreaHandler.instance, "ContentAreaDecorator");