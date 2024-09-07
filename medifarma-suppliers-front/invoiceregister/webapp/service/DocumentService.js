sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (e, r) {
	"use strict";
	var t = "";
	return {
		setCmisId: function (e) {
			t = e
		},
		findPath: function (e) {
			var r = this;
			return new Promise(function (n, o) {
				function a() {
					var s = e.pop();
					$.ajax({
						url: "/cmis/" + t + "/root/" + s.path + "?cmisselector=object",
						cache: false,
						contentType: false,
						processData: false,
						type: "GET",
						success: function (t) {
							r.parentId = t.properties["cmis:objectId"].value;
							if (e.length) {
								a()
							} else {
								n(s.path)
							}
							jQuery.sap.log.info("success " + r.parentId)
						},
						error: function (t) {
							jQuery.sap.log.error(t.responseJSON);
							if (t.status === 404 && t.responseJSON && t.responseJSON.message && t.responseJSON.message.substr(1) === s.path) {
								r.createFolder(r.parentId, s.name).then(function () {
									e.push(s);
									a()
								}.bind(this)).catch(function (e) {
									o(e);
									jQuery.sap.log.error("catch " + e)
								})
							} else {
								o(t)
							}
						}
					})
				}
				a()
			})
		},
		createFolder: function (e, r) {
			var n = this;
			var o = "";
			if (e) {
				o = e
			} else {
				o = t
			}
			var a = {
				objectId: o,
				cmisaction: "createFolder",
				"propertyId[0]": "cmis:objectTypeId",
				"propertyValue[0]": "cmis:folder",
				"propertyId[1]": "cmis:name",
				"propertyValue[1]": r
			};
			var s = new FormData;
			jQuery.each(a, function (e, r) {
				s.append(e, r)
			});
			return new Promise(function (e, r) {
				$.ajax({
					url: "/cmis/" + t + "/root/",
					data: s,
					cache: false,
					contentType: false,
					processData: false,
					type: "POST",
					success: function (r) {
						n.parentId = JSON.stringify(r.properties["cmis:objectId"].value);
						e(n.parentId)
					},
					error: function (r) {
						e();
						jQuery.sap.log.error(r.responseJSON)
					}
				})
			})
		},
		uploadFile: function (e, r, n, o) {
			var a = {
				cmisaction: "createDocument",
				"propertyId[0]": "cmis:objectTypeId",
				"propertyValue[0]": "cmis:document",
				"propertyId[1]": "cmis:name",
				"propertyValue[1]": o,
				datafile: new Blob([e]),
				objectId: r
			};
			var s = new FormData;
			jQuery.each(a, function (e, r) {
				s.append(e, r)
			});
			return new Promise(function (e, r) {
				$.ajax({
					url: "/cmis/" + t + "/root/",
					data: s,
					cache: false,
					contentType: false,
					processData: false,
					type: "POST",
					success: function (r) {
						var t = {
							fileId: r.properties["cmis:objectId"].value,
							fileName: r.properties["cmis:name"].value
						};
						e(t)
					},
					error: function (r) {
						e(r.responseJSON)
					}
				})
			})
		},
		uploadFiles: function (e, r, n) {
			var o = [];
			var a = this;
			return new Promise(function (s, c) {
				function i() {
					var u = e.pop();
					var p = u.getFileUploader();
					var f = n.byId(p);
					var l = {
						cmisaction: "createDocument",
						"propertyId[0]": "cmis:objectTypeId",
						"propertyValue[0]": "cmis:document",
						"propertyId[1]": "cmis:name",
						"propertyValue[1]": f.FUEl.files[0].name,
						datafile: f.FUEl.files[0]
					};
					var d = new FormData;
					jQuery.each(l, function (e, r) {
						d.append(e, r)
					});
					$.ajax({
						url: "/cmis/" + t + "/root/" + r,
						data: d,
						cache: false,
						contentType: false,
						processData: false,
						type: "POST",
						success: function (r) {
							var t = {
								fileId: r.properties["cmis:objectId"].value,
								fileName: r.properties["cmis:name"].value
							};
							o.push(t);
							if (e.length) {
								i()
							} else {
								s(a.parentId)
							}
						},
						error: function (e) {
							jQuery.sap.log.error("error: " + JSON.stringify(e));
							c(e)
						}
					})
				}
				i()
			})
		},
		sendFiles: function (e, r, t) {
			var n = this;
			var o = "MOC/Plant" + "/" + e;
			var a = [];
			a.push({
				path: o,
				name: e
			});
			a.push({
				path: "MOC/Plant",
				name: "Plant"
			});
			a.push({
				path: "MOC",
				name: "MOC"
			});
			return new Promise(function (e, s) {
				this.findPath(a).then(function (a) {
					var c = r.getItems();
					if (c.length) {
						this.uploadFiles(c, o, t).then(function (r) {
							e(n.parentId)
						}).catch(function (e) {
							s(e)
						})
					} else {
						e(n.parentId)
					}
				}.bind(this)).catch(function (e) {
					jQuery.sap.log.error("catch " + e);
					s(e)
				})
			}.bind(this))
		},
		deleteObject: function (e, r) {
			return new Promise(function (n, o) {
				var a = {
					cmisaction: "delete",
					repositoryId: e,
					objectId: r
				};
				var s = new FormData;
				jQuery.each(a, function (e, r) {
					s.append(e, r)
				});
				$.ajax({
					url: "/cmis/" + t + "/root/",
					data: s,
					cache: false,
					contentType: false,
					processData: false,
					type: "POST",
					success: function (e) {
						n(e)
					},
					error: function (e) {
						jQuery.sap.log.error("error: " + JSON.stringify(e));
						o(e)
					}
				})
			})
		},
		changeObjectName: function (e, r) {
			var n = t;
			return new Promise(function (o, a) {
				var s = {
					cmisaction: "update",
					repositoryId: n,
					objectId: e,
					"propertyId[0]": "cmis:name",
					"propertyValue[0]": r
				};
				var c = new FormData;
				jQuery.each(s, function (e, r) {
					c.append(e, r)
				});
				$.ajax({
					url: "/cmis/" + t + "/root/",
					data: c,
					cache: false,
					contentType: false,
					processData: false,
					type: "POST",
					success: function (e) {
						o(e)
					},
					error: function (e) {
						jQuery.sap.log.error("error: " + JSON.stringify(e));
						a(e)
					}
				})
			})
		},
		deleteFolder: function (e) {
			var r = t;
			return new Promise(function (n, o) {
				var a = {
					cmisaction: "deleteTree",
					repositoryId: r,
					objectId: e
				};
				var s = new FormData;
				jQuery.each(a, function (e, r) {
					s.append(e, r)
				});
				$.ajax({
					url: "/cmis/" + t + "/root/",
					data: s,
					cache: false,
					contentType: false,
					processData: false,
					type: "POST",
					success: function (e) {
						n(e)
					},
					error: function (e) {
						jQuery.sap.log.error("error: " + JSON.stringify(e));
						o(e)
					}
				})
			})
		},
		getFiles: function (e) {
			var r = this;
			return new Promise(function (n, o) {
				var a = {
					cmisselector: "children",
					repositoryId: t,
					objectId: e
				};
				if (!e) {
					o("No FolderId provided!");
					return
				}
				var s = new FormData;
				jQuery.each(a, function (e, r) {
					s.append(e, r)
				});
				$.ajax({
					url: "/cmis/" + t + "/root/",
					data: a,
					type: "GET",
					success: function (e) {
						n(e)
					},
					error: function (e) {
						jQuery.sap.log.error("error: " + JSON.stringify(e));
						o(r.htmlErrorToText(e.responseText))
					}
				})
			})
		},
		getDescendants: function (e) {
			var r = this;
			return new Promise(function (n, o) {
				var a = {
					cmisselector: "descendants",
					repositoryId: t,
					objectId: e,
					filter: "cmis:name&cmis:creationDate&cmis:parentId&cmis:contentStreamId"
				};
				if (!e) {
					o("No FolderId provided!");
					return
				}
				var s = new FormData;
				jQuery.each(a, function (e, r) {
					s.append(e, r)
				});
				$.ajax({
					url: "/cmis/" + t + "/root/",
					data: a,
					type: "GET",
					success: function (e) {
						var r = this.url;
						var t = r.indexOf("?");
						r = r.substr(0, t);
						var o = [r, e];
						n(o)
					},
					error: function (e) {
						jQuery.sap.log.error("error: " + JSON.stringify(e));
						o(r.htmlErrorToText(e.responseText))
					}
				})
			})
		},
		getContent: function (e, r) {
			var n = this;
			return new Promise(function (o, a) {
				var s = {
					cmisselector: "content",
					objectId: e
				};
				var c = new FormData;
				jQuery.each(s, function (e, r) {
					c.append(e, r)
				});
				$.ajax({
					url: "/cmis/" + t + "/root/",
					data: s,
					type: "GET",
					headers: {
						"Content-Disposition": "attachment",
						filename: r
					},
					success: function (e) {
						o(e)
					},
					error: function (e) {
						jQuery.sap.log.error("error: " + JSON.stringify(e));
						a(n.htmlErrorToText(e.responseText))
					}
				})
			})
		},
		getByPath: function (e) {
			var r = this;
			return new Promise(function (n, o) {
				var a = {
					cmisselector: "children",
					repositoryId: t
				};
				var s = new FormData;
				jQuery.each(a, function (e, r) {
					s.append(e, r)
				});
				$.ajax({
					url: "/cmis/" + t + "/root/" + e,
					data: a,
					type: "GET",
					success: function (e) {
						var r = this.url;
						var t = r.indexOf("?");
						r = r.substr(0, t);
						var o = [r, e];
						n(o)
					},
					error: function (e) {
						jQuery.sap.log.error("error: " + JSON.stringify(e));
						o(r.htmlErrorToText(e.responseText))
					}
				})
			})
		},
		getObjectParents: function (e) {
			var r = this;
			return new Promise(function (n, o) {
				var a = {
					cmisselector: "parents",
					repositoryId: t,
					objectId: e,
					includeRelativePathSegment: true,
					filter: "cmis:parentId"
				};
				var s = new FormData;
				jQuery.each(a, function (e, r) {
					s.append(e, r)
				});
				$.ajax({
					url: "/cmis/" + t + "/root/",
					data: a,
					type: "GET",
					success: function (e) {
						n(e)
					},
					error: function (e) {
						jQuery.sap.log.error("error: " + JSON.stringify(e));
						o(r.htmlErrorToText(e.responseText))
					}
				})
			})
		},
		htmlErrorToText: function (e) {
			return $.parseHTML(e)[1].innerHTML
		},
		getQuery: function (e) {
			var r = this;
			return new Promise(function (r, n) {
				var o = {
					cmisselector: "query",
					statement: e
				};
				var a = new FormData;
				jQuery.each(o, function (e, r) {
					a.append(e, r)
				});
				$.ajax({
					url: "/cmis/" + t,
					data: o,
					type: "GET",
					success: function (e) {
						r(e)
					},
					error: function (e) {
						r(e)
					}
				})
			})
		},
		getXmlFile: function (e) {
			var r = this;
			return new Promise(function (n, o) {
				$.ajax({
					url: "/cmis/" + t + "/root/DEV/PreRegistro/" + e,
					type: "GET",
					success: function (e) {
						n(e)
					},
					error: function (e) {
						jQuery.sap.log.error("error: " + JSON.stringify(e));
						o(r.htmlErrorToText(e.responseText))
					}
				})
			})
		}
	}
});