 /* global XLSX:true */
 sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "../plugins/xlsx.min"
], function (JSONModel, Xlsx) {
    "use strict";

    return {
        readXLSX: function (oFile) {
            return new Promise(function (resolve, reject) {
                if (!oFile) {
                    reject("File not found!");
                } else if (!window.FileReader) {
                    reject("FileReader not ready");
                } else {
                    var reader = new FileReader();
                    var result = {},
                        data;

                    reader.onload = function (e) {
                        data = e.target.result;
                        var wb = XLSX.read(data, {
                            type: 'binary',
                            cellDates: true
                        });

                        wb.SheetNames.forEach(function (sheetName) {
                            var roa = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
                            if (roa.length > 0) {
                                result[sheetName] = roa;
                            }
                            resolve(result);
                        });
                    };
                    reader.readAsBinaryString(oFile);
                }
            });
        }
    };
});