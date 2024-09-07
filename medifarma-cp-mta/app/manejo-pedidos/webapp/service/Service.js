sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	var sDestino = "/api/v1/cp";
	// Se tiene que modificar
	var sDestinoConflict = "/saperpC/api/v1/sod";
	return {
		onGetDataGeneral: function (modulo, entity) {
			return new Promise(function (resolve, reject) {
				var sUrl = sDestino + "/" + modulo + "/" + entity;
				//var sUrl = "http://localhost:4004/api/v1/cp/" + modulo + "/" + entity;
				$.ajax({
					url: sUrl,
					type: "GET",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		},
		onGetDataGeneralFiltros: function (modulo, entity, filtros) {
			return new Promise(function (resolve, reject) {
				var sUrl = sDestino + "/" + modulo + "/" + entity;
				//var sUrl = "http://localhost:4004/api/v1/cp/" + modulo + "/" + entity;
				$.ajax({
					url: sUrl,
					type: "GET",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					data: filtros,
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		},
		onPostDataGeneralFiltros: function (modulo, entity, data) {
			return new Promise(function (resolve, reject) {
				var sUrl = sDestino + "/" + modulo + "/" + entity;
				//var sUrl = "http://localhost:4004/api/v1/sod/maintenance/group_trx"
				$.ajax({
					url: sUrl,
					type: "POST",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					data: JSON.stringify(data),
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
        },
        onUpdateDataGeneralFiltros: function (modulo, entity, data) {
			return new Promise(function (resolve, reject) {
				var sUrl = sDestino + "/" + modulo + "/" + entity;
				//var sUrl = "http://localhost:4004/api/v1/sod/maintenance/group_trx"
				$.ajax({
					url: sUrl,
					type: "POST",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					data: JSON.stringify(data),
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		},
		onPostDataGeneralFiltros2: function (modulo, entity, data) {
			return new Promise(function (resolve, reject) {
				var sUrl = sDestino + "/" + modulo + "/" + entity;
				$.ajax({
					url: sUrl,
					type: "POST",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					data: JSON.stringify(data),
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		},
		onPostDataGeneralFiltrosConflict: function (modulo, entity, data) {
			return new Promise(function (resolve, reject) {
				var sUrl = sDestinoConflict + "/" + modulo + "/" + entity;
				//var sUrl = "http://localhost:4004/api/v1/sod/maintenance/group_trx"
				$.ajax({
					url: sUrl,
					type: "POST",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					data: JSON.stringify(data),
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		},
		onPostDataGeneralFiltrosConflict2: function (modulo, entity, data) {
			return new Promise(function (resolve, reject) {
				//var sUrl = sDestinoConflict + "/" + modulo + "/" + entity;
				var sUrl = "http://localhost:4004/api/v1/sod/" + modulo + "/" + entity;
				$.ajax({
					url: sUrl,
					type: "POST",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					data: JSON.stringify(data),
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		},
		onPostDataGeneralFiltros2: function (modulo, entity, data) {
			return new Promise(function (resolve, reject) {
				// var sUrl = sDestino + "/" + modulo + "/" + entity;
				var sUrl = 'http://localhost:4004/api/v1/sod/' + modulo + "/" + entity;
				$.ajax({
					url: sUrl,
					type: "POST",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					data: JSON.stringify(data),
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		},
		onPutDataGeneralFiltros: function (modulo, entity, data) {
			return new Promise(function (resolve, reject) {
				var sUrl = sDestino + "/" + modulo + "/" + entity;
				$.ajax({
					url: sUrl,
					type: "PUT",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					data: JSON.stringify(data),
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		},
		onDeleteDataGeneralFiltros: function (modulo, entity, data) {
			return new Promise(function (resolve, reject) {
				var sUrl = sDestino + "/" + modulo + "/" + entity;
				$.ajax({
					url: sUrl,
					type: "DELETE",
					dataType: "json",
					headers: {
						"Content-Type": "application/json; charset=utf-8"
					},
					data: JSON.stringify(data),
					async: true,
					success: (aResult) => {
						resolve(aResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		}
	};
});