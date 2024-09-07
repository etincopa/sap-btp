sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var DemoPersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "reporte-tblRMD-column1",
					order: 0,
					text: "column1",
					visible: true
				},
				{
					id: "reporte-tblRMD-column2",
					order: 1,
					text: "column2",
					visible: true
				},
				{
					id: "reporte-tblRMD-column3",
					order: 2,
					text: "column3",
					visible: true
				},
				{
					id: "reporte-tblRMD-column4",
					order: 3,
					text: "column4",
					visible: true
				},
				{
					id: "reporte-tblRMD-column5",
					order: 4,
					text: "column5",
					visible: true
				},
                {
					id: "reporte-tblRMD-column6",
					order: 5,
					text: "column6",
					visible: true
				},
                {
					id: "reporte-tblRMD-column7",
					order: 6,
					text: "column7",
					visible: true
				},
                {
					id: "reporte-tblRMD-column8",
					order: 7,
					text: "column8",
					visible: true
				},
                {
					id: "reporte-tblRMD-column9",
					order: 8,
					text: "column9",
					visible: true
				},
                {
					id: "reporte-tblRMD-column10",
					order: 9,
					text: "column10",
					visible: false
				},
                {
					id: "reporte-tblRMD-column11",
					order: 10,
					text: "column11",
					visible: false
				},
                {
					id: "reporte-tblRMD-column12",
					order: 11,
					text: "column12",
					visible: false
				},
                {
                    id: "reporte-tblRMD-column13",
                    order: 12,
                    text: "column13",
                    visible: false
                },
                {
					id: "reporte-tblRMD-column14",
					order: 13,
					text: "column14",
					visible: false
				},
                {
					id: "reporte-tblRMD-column15",
					order: 14,
					text: "column15",
					visible: false
				},
                {
                    id: "reporte-tblRMD-column16",
                    order: 15,
                    text: "column16",
                    visible: false
                },
                {
                    id: "reporte-tblRMD-column17",
                    order: 16,
                    text: "column17",
                    visible: false
                },
				{
					id: "reporte-tblRMD-column18",
					order: 17,
					text: "column18",
					visible: false
				},
				{
					id: "reporte-tblRMD-column19",
					order: 18,
					text: "column19",
					visible: false
				},
				{
					id: "reporte-tblRMD-column20",
					order: 19,
					text: "column20",
					visible: false
				}
			]
		},

		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns : [
                                {
                                    id: "reporte-tblRMD-column1",
                                    order: 0,
                                    text: "column1",
                                    visible: true
                                },
                                {
                                    id: "reporte-tblRMD-column2",
                                    order: 1,
                                    text: "column2",
                                    visible: true
                                },
                                {
                                    id: "reporte-tblRMD-column3",
                                    order: 2,
                                    text: "column3",
                                    visible: true
                                },
                                {
                                    id: "reporte-tblRMD-column4",
                                    order: 3,
                                    text: "column4",
                                    visible: true
                                },
                                {
                                    id: "reporte-tblRMD-column5",
                                    order: 4,
                                    text: "column5",
                                    visible: true
                                },
                                {
                                    id: "reporte-tblRMD-column6",
                                    order: 5,
                                    text: "column6",
                                    visible: true
                                },
                                {
                                    id: "reporte-tblRMD-column7",
                                    order: 6,
                                    text: "column7",
                                    visible: true
                                },
                                {
                                    id: "reporte-tblRMD-column8",
                                    order: 7,
                                    text: "column8",
                                    visible: true
                                },
                                {
                                    id: "reporte-tblRMD-column9",
                                    order: 8,
                                    text: "column9",
                                    visible: true
                                },
                                {
                                    id: "reporte-tblRMD-column10",
                                    order: 9,
                                    text: "column10",
                                    visible: false
                                },
                                {
                                    id: "reporte-tblRMD-column11",
                                    order: 10,
                                    text: "column11",
                                    visible: false
                                },
                                {
                                    id: "reporte-tblRMD-column12",
                                    order: 11,
                                    text: "column12",
                                    visible: false
                                },
                                {
                                    id: "reporte-tblRMD-column13",
                                    order: 12,
                                    text: "column13",
                                    visible: false
                                },
								{
									id: "reporte-tblRMD-column14",
									order: 13,
									text: "column14",
									visible: false
								},
								{
									id: "reporte-tblRMD-column15",
									order: 14,
									text: "column15",
									visible: false
								},
								{
									id: "reporte-tblRMD-column16",
									order: 15,
									text: "column16",
									visible: false
								},
								{
									id: "reporte-tblRMD-column17",
									order: 16,
									text: "column17",
									visible: false
								},
								{
									id: "reporte-tblRMD-column18",
									order: 17,
									text: "column18",
									visible: false
								},
								{
									id: "reporte-tblRMD-column19",
									order: 18,
									text: "column19",
									visible: false
								},
								{
									id: "reporte-tblRMD-column20",
									order: 19,
									text: "column20",
									visible: false
								}
							]
			};

			//set personalization
			this._oBundle = oInitialData;

			//reset personalization, i.e. display table as defined
	//		this._oBundle = null;

			oDeferred.resolve();
			return oDeferred.promise();
		},

		//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
		//to 'Weight (Important!)', but will leave all other column names as they are.
		getCaption : function (oColumn) {
			if (oColumn.getHeader() && oColumn.getHeader().getText) {
				if (oColumn.getHeader().getText() === "Weight") {
					return "Weight (Important!)";
				}
			}
			return null;
		},

		getGroup : function(oColumn) {
			if ( oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
				return "Primary Group";
			}
			return "Secondary Group";
		}
	};

	return DemoPersoService;

});
