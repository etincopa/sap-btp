sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (UI5Object, MessageBox, Filter, FilterOperator) {
    "use strict";

    var sResponsivePaddingClasses =
      "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
    return UI5Object.extend("administrador.controller.ErrorHandler", {
      /**
       * Handles application errors by automatically attaching to the model events and displaying errors when needed.
       * @class
       * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
       * @public
       * @alias administrador.controller.ErrorHandler
       */
      constructor: function (oComponent) {
        var oMessageManager = sap.ui.getCore().getMessageManager(),
          oMessageModel = oMessageManager.getMessageModel(),
          oResourceBundle = oComponent.getModel("i18n").getResourceBundle(),
          sErrorText = oResourceBundle.getText("errorText"),
          sMultipleErrors = oResourceBundle.getText("multipleErrorsText");

        this._oComponent = oComponent;
        this._bMessageOpen = false;

        this.oMessageModelBinding = oMessageModel.bindList(
          "/",
          undefined,
          [],
          new Filter("technical", FilterOperator.EQ, true)
        );

        this.oMessageModelBinding.attachChange(function (oEvent) {
          var aContexts = oEvent.getSource().getContexts(),
            aMessages = [],
            aMessagesText = [],
            sErrorTitle;

          if (this._bMessageOpen || !aContexts.length) {
            return;
          }

          // Extract and remove the technical messages
          aContexts.forEach(function (oContext) {
            var oItem = oContext.getObject();
            aMessages.push(oItem);
            aMessagesText.push(oItem.message);
          });
          oMessageManager.removeMessages(aMessages);

          // Due to batching there can be more than one technical message. However the UX
          // guidelines say "display a single message in a message box" assuming that there
          // will be only one at a time.
          sErrorTitle = aMessages.length === 1 ? sErrorText : sMultipleErrors;
          this._showServiceError(sErrorTitle, aMessagesText);
        }, this);
      },

      /**
       * Shows a {@link sap.m.MessageBox} when a service call has failed.
       * Only the first error message will be displayed.
       * @param {string} sErrorTitle A title for the error message
       * @param {string} sDetails A technical error to be displayed on request
       * @private
       */
      _showServiceError: function (sErrorTitle, aDetails) {
        this._bMessageOpen = true;
        var aMessageHtml = [];
        aDetails.forEach(function (sMessage) {
          aMessageHtml.push("<li>" + sMessage + "</li>");
        });

        MessageBox.error(sErrorTitle, {
          title: "Error",
          id: "serviceErrorMessageBox",
          details:
            "<p><strong></strong></p>\n" +
            "<ul>" +
            aMessageHtml.join(" ") +
            "</ul>",
          styleClass: sResponsivePaddingClasses,
          actions: [MessageBox.Action.CLOSE],
          onClose: function () {
            this._bMessageOpen = false;
          }.bind(this),
        });

        /*MessageBox.error(
				sErrorTitle,
				{
					id : "serviceErrorMessageBox",
					details: sDetails,
					styleClass: this._oComponent.getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE],
					onClose: function () {
						this._bMessageOpen = false;
					}.bind(this)
				}
			);*/
      },
    });
  }
);
