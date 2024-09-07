sap.ui.define(
  ["sap/ui/model/Filter", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "sap/base/Log"],
  function (Filter, JSONModel, MessageBox, Log) {
    "use strict";
    return {
      btnAgregarDocument: function (oEvent) {
        if (!this.uplGasto) {
          this.uplGasto = sap.ui.xmlfragment("everis.apps.fragments.FragmentCargarDocumento", this);
          this.getView().addDependent(this.uplGasto);
        }

        this.uplGasto.open();
      },
      onSelectFile: function (oEvent) {
        let oUploader = oEvent.getSource();
        this.oFile = oEvent.getParameter("files")[0];

        if (this.oFile) {
          oUploader.setValueState("None");
        } else {
          oUploader.setValueState("Error");
        }
      },
      onUploadConfirm: function (oEvent) {
        let that = this;
        let oUpload = this._byId("uplAnexo");

        function getErrorState(oControl) {
          if (!oControl.getValue()) {
            oControl.setValueState("Error");
          }
          return oControl.getValueState() === "Error" || !oControl.getValue();
        }

        if (getErrorState(oUpload)) {
          return false;
        }

        let reader = new FileReader();

        reader.onload = function (evt) {
          // let base64 = evt.target.result;
        };

        reader.onerror = function (evt) {
          reader.abort();
        };
        reader.readAsDataURL(that.oFile);

        return null;
      },
      handleUploadClose: function (oEvent) {
        this.oFile = undefined;
        this.uplGasto.close();
      },
    };
  }
);
