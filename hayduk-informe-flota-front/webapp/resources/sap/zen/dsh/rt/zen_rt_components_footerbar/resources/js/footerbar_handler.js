define("zen.rt.components.footerbar/resources/js/footerbar_handler", ["sap/zen/basehandler"], function(BaseHandler){

	var FooterBarHandler = function() {
		"use strict";

		BaseHandler.apply(this, arguments);
	 
		var that = this;

		this.update = function(oControl, oControlProperties) {
			if (oControlProperties) {
				init(oControl, oControlProperties);
			}
			return oControl;
		};
		
		this.createAndAdd = function (oChainedControl, oControlProperties, oComponentProperties, fAppendToParentFunclet, iIndex) {
			var id = oControlProperties["id"];
			
			var oControl = new sap.m.OverflowToolbar(id);
			oControl.setDesign(sap.m.ToolbarDesign.Solid);
			oControl.addStyleClass("zenFooterbarFixedPanel");
			oControl.addStyleClass("sapContrast sapContrastPlus sapMBar sapMBar-CTX sapMContent-CTX sapMFooter-CTX sapMIBar sapMIBar-CTX sapMPageFooter");

			oControl.addContent(new sap.m.ToolbarSpacer());

			fAppendToParentFunclet(oControl, iIndex, oComponentProperties);
			init(oControl, oControlProperties);
			
			sap.zen.Dispatcher.instance.updateComponentProperties(oControl, oComponentProperties, fAppendToParentFunclet);
			return oControl;
		};
		
		function init(oFooterBar, oControlProperties) {
			if (oControlProperties) {
				var aChildren = oControlProperties.content;
				if (aChildren) {
					that.updateChildren(aChildren, oFooterBar, function(oButton, i) {
						oFooterBar.insertContent(oButton, i+1);
					}, function(oButtonToDelete){
						oFooterBar.removeContent(oButtonToDelete);
					});
				}
			}
		}

		this.applyForChildren = function(oFooterBar, fFunclet) {
			var aChildren = oFooterBar.getContent();
			for ( var i = 0; i < aChildren.length; i++) {
				var oControl = aChildren[i];
				if (oControl.zenControlType === "footerbarbutton"){
					fFunclet(oControl);
				}
			}
		};

		this.getDecorator = function() {
			return "FixedSizeAndPositionDecorator";
		};
		
		this.getType = function() {
			return "footerbar";
		};
		
	};

	return new FooterBarHandler();
	
});	


	// //////////////////////////////////////////////////////

	sap.zen.FooterBarButtonHandler = function() {
		"use strict";

		sap.zen.BaseHandler.apply(this, arguments);

		this.createAndAdd = function(oChainedControl, oControlProperties, oComponentProperties, fAppendToParentFunclet, oArgForFunclet) {
			var oButton = new sap.m.Button(oControlProperties.id);

			init(oButton, oControlProperties);

			if (oControlProperties.onclick) {
				(function(){
					oButton.attachPress(function () {
						var f= new Function(oControlProperties.onclick);
						f();
					});
				})();
			}

			fAppendToParentFunclet(oButton, oArgForFunclet);

			return oButton;
		};

		this.updateComponent = function(oControl, oControlProperties) {
			if (oControlProperties) {
				init(oControl, oControlProperties);
			}
			
			return oControl;
		};

		function init(oControl, oControlProperties) {
			if (oControlProperties) {
				var oVisible = oControlProperties.visible;
				var oEnabled = oControlProperties.enabled;
				oControl.setText(oControlProperties.text);
				oControl.setIcon(oControlProperties.icon);
				oControl.setTooltip(oControlProperties.tooltip);
				oControl.setEnabled(oEnabled);
				if (sap.zen.designmode) {
					if (!oVisible && oEnabled) {
						oControl.addStyleClass("zenFooterbarInvisibleButton");
					} else {
						oControl.removeStyleClass("zenFooterbarInvisibleButton");
					}
				}
			}
		}

		this.getDecorator = function() {
			return "FixedSizeAndPositionDecorator";
		};
		
		this.getType = function() {
			return "footerbarbutton";
		};

	};

	sap.zen.FooterBarButtonHandler.instance = new sap.zen.FooterBarButtonHandler();

	sap.zen.Dispatcher.instance.addHandlers("footerbarbutton", sap.zen.FooterBarButtonHandler.instance);
