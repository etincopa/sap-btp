/*!
 * © 2021, Everis Peru
 */
sap.ui.define(["sap/base/Log", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function(e, t, r) {
    "use strict";
    $ = $ ? $ : jQuery;
    const n = {};
    let o, i, s, a;
    n.getUUIDV4 = function() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, e => (e ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> e / 4).toString(16))
    };
    n.setValueRoot = function(e) {
        if (e) {
            i = e
        }
    };
    n.setUrl = function(e) {
        o = e
    };
    n.setGetTokenFn = function(e) {
        s = e
    };
    n.downloadFiles = function(t) {
        const r = T(i + "/" + t),
            n = T(o + `/GetFolderByServerRelativeUrl('${r}')/Files`);
        const s = t => {
            if (t.length > 0) {
                const n = t.pop();
                const i = T(o + `/GetFolderByServerRelativeUrl('${r}')/Files('${n.Name}')/$value`);
                l().then(() => {
                    $.ajax({
                        url: i,
                        type: "GET",
                        xhrFields: {
                            responseType: "blob"
                        },
                        headers: {
                            Authorization: "Bearer " + a
                        }
                    }).done((e, r, o) => {
                        const i = window.URL.createObjectURL(e);
                        const a = document.createElement("a");
                        a.style.display = "none";
                        a.href = i;
                        a.download = n.Name;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(i);
                        s(t)
                    }).fail(t => {
                        e.error("[UTILS] Sharepoint - downloadFiles", t.responseText)
                    })
                })
            }
        };
        return new Promise((t, r) => {
            l().then(() => {
                $.ajax({
                    url: n,
                    type: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json;odata=verbose",
                        Authorization: "Bearer " + a
                    }
                }).done((r, n, o) => {
                    const i = r.d.results.length;
                    e.info("[UTILS] Sharepoint - downloadFiles", "Downloading will be done asynchronously");
                    e.info("[UTILS] Sharepoint - downloadFiles - # archivos", i.toString());
                    if (i > 0) {
                        s(r.d.results)
                    }
                    t(i)
                }).fail(t => {
                    e.error("[UTILS] Sharepoint - downloadFiles", t.responseText);
                    r(t)
                })
            })
        })
    };

    function l() {
        return new Promise((e, t) => {
            if (a) {
                e(a)
            } else {
                s().then(t => {
                    a = t;
                    e(t)
                }).catch(() => {
                    t()
                })
            }
        })
    }

    function c(t, r) {
        return new Promise((n, s) => {
            const c = T(o + "/folders");
            const p = T(i + "/" + t + "/" + r);
            const u = {
                ServerRelativeUrl: p
            };
            l().then(() => {
                $.ajax({
                    url: c,
                    data: JSON.stringify(u),
                    type: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json;odata=verbose",
                        Authorization: "Bearer " + a
                    }
                }).done(function(t, r, o) {
                    if (r === "success") {
                        e.info("[UTILS] Sharepoint - _createFolder - created successfully", p);
                        n(true)
                    } else {
                        s()
                    }
                }).fail(function(t) {
                    e.error("[UTILS] Sharepoint - _createFolder", t.responseText);
                    s()
                })
            })
        })
    }
    n.createFolder = function(e, t) {
        return c(e, t)
    };

    function p(t) {
        return new Promise((r, n) => {
            if (t.length > 0) {
                const o = t.length;
                if (o - 2 >= 0) {
                    t[o - 2] = t[o - 1] + "/" + t[o - 2]
                }
                const i = t.pop();
                c(i, "").then(e => {
                    r(p(t))
                }).catch(t => {
                    e.error("[UTILS] Sharepoint - createFolderDeep", t ? t.responseText : "Unknown error");
                    n(t)
                })
            } else {
                r(true)
            }
        })
    }
    n.createFolderDeep = function(e) {
        let t = e.split("/");
        t = t.reverse();
        return p(t)
    };

    function u(t) {
        return new Promise((r, n) => {
            const s = i + "/" + t;
            const c = T(o + `/GetFolderByServerRelativeUrl('${s}')/Files`);
            l().then(() => {
                $.ajax({
                    url: c,
                    type: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json;odata=verbose",
                        Authorization: "Bearer " + a
                    }
                }).done((t, n, o) => {
                    const i = t.d.results.length;
                    e.info(`[UTILS] Sharepoint - _getFiles - # files in "${s}"`, i);
                    if (i > 0) {
                        r(t.d.results)
                    } else {
                        r([])
                    }
                }).fail(function(t) {
                    e.error("[UTILS] Sharepoint - _getFiles", t.responseText);
                    n(t)
                })
            })
        })
    }

    function d(t) {
        return new Promise((r, n) => {
            u(t).then(e => {
                r(h(e, t))
            }).catch(t => {
                e.error("[UTILS] Sharepoint - deleteFilesFromFolder", t.responseText);
                n(t)
            })
        })
    }
    n.deleteFilesFromFolder = function(e) {
        return d(e)
    };

    function h(t, r, n = []) {
        return new Promise((s, c) => {
            if (t.length > 0) {
                const p = t.pop();
                const u = i + "/" + r;
                const d = T(o + `/GetFolderByServerRelativeUrl('${u}')/Files('${p.Name}')`);
                l().then(() => {
                    $.ajax({
                        url: d,
                        type: "POST",
                        headers: {
                            Authorization: "Bearer " + a,
                            "X-HTTP-Method": "DELETE"
                        }
                    }).done((o, i, a) => {
                        e.info("[UTILS] Sharepoint - _deleteFilesRecursive - deleted successfully", `"${p.Name}" from "${u}"`);
                        n.push(`${u}/${p.Name}`);
                        s(h(t, r, n))
                    }).fail(t => {
                        e.error("[UTILS] Sharepoint - _deleteFilesRecursive", t.responseText);
                        c(t)
                    })
                })
            } else {
                s(n)
            }
        })
    }

    function f(t, r) {
        return new Promise((n, s) => {
            const c = T(i + "/" + t + "/" + r.folderName);
            const p = T(o + `/GetFolderByServerRelativeUrl('${c}')/Files/add(overwrite=true, url='${r.fileName}')`);
            l().then(() => {
                $.ajax({
                    url: p,
                    type: "POST",
                    data: r.data,
                    processData: false,
                    headers: {
                        "Content-Type": "application/scim+json",
                        Accept: "application/json;odata=verbose",
                        Authorization: "Bearer " + a,
                        "Content-Length": r.size
                    }
                }).done((t, o, i) => {
                    e.info("[UTILS] Sharepoint - _saveFile - created successfully", r.fileName);
                    n(true)
                }).fail(t => {
                    e.error("[UTILS] Sharepoint - _saveFile", t.responseText);
                    s(t)
                })
            })
        })
    }

    function S(t, r, n) {
        return new Promise((o, i) => {
            if (r.length > 0) {
                const s = r.pop();
                c(t, s.folderName).then(e => {
                    if (n) {
                        return d(t)
                    } else {
                        return Promise.resolve()
                    }
                }).then(() => f(t, s)).then(() => {
                    o(S(t, r, n))
                }).catch(t => {
                    e.error("[UTILS] Sharepoint - _createFolderAndSaveFiles", t.responseText);
                    i(t)
                })
            } else {
                o(true)
            }
        })
    }
    n.saveFiles = function(t, r, n) {
        const o = n ? n.delete_existing_files : false;
        return new Promise((n, i) => {
            r = r.slice();
            c(t, "").then(e => {
                n(S(t, r, o))
            }).catch(t => {
                e.error("[UTILS] Sharepoint - saveFiles", t.responseText);
                i(t)
            })
        })
    };

    function T(e) {
        e = e.replace("https://", "${PROTOCOL}");
        e = e.replace(/\/\//g, "/");
        return e.replace("${PROTOCOL}", "https://")
    }
    return n
});