const cds = require('@sap/cds');
const SapCfAxios = require('sap-cf-axios').default;
const spauth = require('node-sp-auth');
const request = require('request-promise');
const destination = SapCfAxios('SPDestination');
const Download = require('sp-download').Download;
const { v4: uuidv4 } = require("uuid");
const crypto = require("./api/services/crypto");
const axios = require('axios');
var browser = require('browser-detect');
const {
    MD,
    MD_ESTRUCTURA,
    ESTRUCTURA,
    RECETA,
    MD_RECETA,
    MD_ES_RE_INSUMO,
    MD_ES_PASO,
    MD_ES_EQUIPO,
    MD_ES_UTENSILIO,
    MD_ES_ETIQUETA,
    MD_ES_ESPECIFICACION,
    RMD_USUARIO,
    EQUIPO,
    RMD_ESTRUCTURA,
    RMD_ES_PASO,
    RMD_ES_EQUIPO,
    RMD_ES_UTENSILIO,
    RMD_ES_ESPECIFICACION,
    RMD_RECETA,
    RMD_ES_RE_INSUMO,
    RECETA_RMD,
    RMD_ES_PASO_USUARIO,
    RMD_ES_ETIQUETA,
    RMD_ES_PASO_INSUMO_PASO,
    MD_ES_PASO_INSUMO_PASO,
    RMD_ES_PASO_HISTORIAL,
    ETIQUETAS_CONTROL,
    RMD_TABLA_CONTROL,
    RMD_VERIFICACION_FIRMAS,
    RMD_MOTIVO_EDIT_CIERRE_LAPSO,
    RMD_OBSERVACION,
    RMD_LAPSO,
    RMD_LAPSO_CATALOGO_FALLA,
    RMD_ES_HISTORIAL,
    MD_ES_FORMULA_PASO,
    PASO,
    RMD,
    AUDITORIA
} = cds.entities('mif.rmd')

// module.exports = cds.service.impl(async function() {

// });
module.exports = cds.service.impl(async function () {
    let URLSHAREPOINT,
        carpetaDocumentos,
        ambiente = "QAS";
    //     const { MaterialSet } = this.entities;
	// const service = await cds.connect.to('Z_PP_NECESIDADESRMD_SRV');
	// this.on('READ', MaterialSet, request => {
	// 	return service.tx(request).run(request.query);
	// });
    
    this.on('sharepointGet', async (req) => {
        try {
            const oData = JSON.parse(req.data.idMd);
            var options = await getToken();
            var url = URLSHAREPOINT;
            var headers = options.headers;
            headers['Accept'] = 'application/json;odata=verbose';
            headers['Content-Type'] = 'application/scim+json';
            var uri;
            if (oData.origen === "Configuracion") {
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/Configuracion/";
            } else if (oData.origen === "DocumentoMD") {
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/DocumentoMD/";
            } else if (oData.origen === "ImagenMD"){
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/ImagenPaso/";
            } else {
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/Solicitud/";
            }
            var response = await request.get({
                url: url + uri + oData.idMd + "')/Files",
                headers: headers
            });
            return response;
        } catch (err) {
            return err;
        }
    });

    this.on('sharepointDownload', async (req) => {
        try {
            const oData = JSON.parse(req.data.data);
            var options = await getToken();
            var url = URLSHAREPOINT;
            var headers = options.headers;
            var uri;
            if (oData.origen === "Configuracion") {
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/Configuracion/";
            } else if (oData.origen === "ImagenMD"){
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/ImagenPaso/";
            } else if (oData.origen === "DocumentoMD"){
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/DocumentoMD/";
            } else {
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/Solicitud/";
            }
            var optionsDownload = {
                method: 'GET',
                uri: url + uri + oData.codigoRM + "')/Files(' " + oData.Name + " ')/$value",
                headers: headers,
                encoding: "binary"
            };

            var result = await request(optionsDownload);
            return result;
        } catch (err) {
            return err;
        }
    });

    this.on('sharepointFunction', async (req) => {
        try {
            const oData = JSON.parse(req.data.spData);
            var options = await getToken();
            var url = URLSHAREPOINT;
            var headers = options.headers;
            headers['Accept'] = 'application/json;odata=verbose';
            headers['Content-Type'] = 'application/json;odata=verbose';
            var urlFolder;
            var urlFile;
            if (oData.origen === "Configuracion") {
                urlFolder = carpetaDocumentos + '/RMD/'+ ambiente + '/Configuracion/';
                urlFile = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/Configuracion/";
            } else {
                urlFolder = carpetaDocumentos + '/RMD/'+ ambiente + '/Solicitud/';
                urlFile = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/Solicitud/";
            }
            var body = {
                'ServerRelativeUrl': urlFolder + oData.mdId,
                '__metadata': { 'type': 'SP.Folder' }
            };

            var optionsPost = {
                method: 'POST',
                uri: url + '/_api/web/folders',
                body: body,
                headers: headers,
                json: true
            };

            var result = await request(optionsPost);

            headers['Accept'] = 'application/json;odata=verbose';
            headers['Content-Type'] = 'application/scim+json';
            headers['Content-Length'] = oData.size;
            var array = Object.values(oData.fileData);
            var byteArray = Uint8Array.from(array);
            var optionsFile = {
                method: 'POST',
                uri: url + urlFile + oData.mdId + "')/Files/add(overwrite=true, url='" + oData.name + "')",
                body: byteArray,
                headers: headers,
                processData: false
            }

            var resultFile = await request(optionsFile);
            return result, resultFile;
        } catch (err) {
            return err;
        }
    });

    this.before("UPDATE", "MD", async (req) => {
        try {
            const oMd = req.data;
            if (oMd.aEstructura && oMd.aEstructura.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ESTRUCTURA).entries(oMd.aEstructura));
                delete oMd.aEstructura;
                delete oMd.mdId;
            }

            if (oMd.aReceta && oMd.aReceta.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_RECETA).entries(oMd.aReceta));
                delete oMd.aReceta;
                delete oMd.mdId;
            }

            if (oMd.destinatariosMD) {
                delete oMd.destinatariosMD;
            }

            if(oMd.archivoMD){
                var oData = JSON.parse(oMd.archivoMD);
                var options = await getToken();
                var url = URLSHAREPOINT;
                var headers = options.headers;
                headers['Accept'] = 'application/json;odata=verbose';
                headers['Content-Type'] = 'application/json;odata=verbose';
                var urlFolder;
                var urlFile;
                if (oData.origen === "Configuracion") {
                    urlFolder = carpetaDocumentos + '/RMD/'+ ambiente + '/Configuracion/';
                    urlFile = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/Configuracion/";
                } else if (oData.origen === "DocumentoMD"){
                    urlFolder = carpetaDocumentos + '/RMD/'+ ambiente + '/DocumentoMD/';
                    urlFile = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/DocumentoMD/";
                } else if (oData.origen === "AutorizadoMD"){
                    urlFolder = carpetaDocumentos + '/RMD/'+ ambiente + '/AutorizadoMD/';
                    urlFile = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/AutorizadoMD/";
                } else if (oData.origen === "ImagenMD"){
                    urlFolder = carpetaDocumentos + '/RMD/'+ ambiente + '/ImagenPaso/';
                    urlFile = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/ImagenPaso/";
                } else {
                    urlFolder = carpetaDocumentos + '/RMD/'+ ambiente + '/Solicitud/';
                    urlFile = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/Solicitud/";
                }

                if (oData.origen === "ImagenMD"){
                    //SE CREA CARPETA MDID
                    let body = {
                        'ServerRelativeUrl': urlFolder + oData.mdId,
                        '__metadata': { 'type': 'SP.Folder' }
                    };
    
                    let optionsPost = {
                        method: 'POST',
                        uri: url + '/_api/web/folders',
                        body: body,
                        headers: headers,
                        json: true
                    };
    
                    await request(optionsPost);

                    urlFolder = urlFolder + oData.mdId + "/";
                    //SE CREA CARPETA ESTRUCTURAID
                    let body1 = {
                        'ServerRelativeUrl': urlFolder + oData.estructuraId,
                        '__metadata': { 'type': 'SP.Folder' }
                    };
    
                    let optionsPost1 = {
                        method: 'POST',
                        uri: url + '/_api/web/folders',
                        body: body1,
                        headers: headers,
                        json: true
                    };
    
                    await request(optionsPost1);

                    urlFolder = urlFolder + oData.estructuraId + "/";
                    //SI EXISTE SE CREA CARPETA  ETIQUETAID
                    if(oData.etiquetaId) {
                        let bodyEtiqueta = {
                            'ServerRelativeUrl': urlFolder + oData.etiquetaId,
                            '__metadata': { 'type': 'SP.Folder' }
                        };
        
                        let optionsPostEtiqueta = {
                            method: 'POST',
                            uri: url + '/_api/web/folders',
                            body: bodyEtiqueta,
                            headers: headers,
                            json: true
                        };
                        await request(optionsPostEtiqueta);

                        urlFolder = urlFolder + oData.etiquetaId + "/";
                    }

                    //SE CREA CARPETA PASOID
                    let body2 = {
                        'ServerRelativeUrl': urlFolder + oData.pasoId,
                        '__metadata': { 'type': 'SP.Folder' }
                    };
    
                    let optionsPost2 = {
                        method: 'POST',
                        uri: url + '/_api/web/folders',
                        body: body2,
                        headers: headers,
                        json: true
                    };
                    await request(optionsPost2);

                    urlFolder = urlFolder + oData.pasoId + "/";
                    //SE SUBE LA IMAGEN
                    let listaCarpeta
                    if (oData.etiquetaId) {
                        listaCarpeta = oData.mdId + "/" + oData.estructuraId + "/" + oData.etiquetaId + "/" + oData.pasoId;
                    } else {
                        listaCarpeta = oData.mdId + "/" + oData.estructuraId + "/" + oData.pasoId;
                    }
                    headers['Accept'] = 'application/json;odata=verbose';
                    headers['Content-Type'] = 'application/scim+json';
                    headers['Content-Length'] = oData.size;
                    let array = Object.values(oData.fileData);
                    let byteArray = Uint8Array.from(array);
                    let optionsFile = {
                        method: 'POST',
                        uri: url + urlFile + listaCarpeta + "')/Files/add(overwrite=true, url='" + oData.name + "')",
                        body: byteArray,
                        headers: headers,
                        processData: false
                    }
                    await request(optionsFile);
                } else {
                    let body = {
                        'ServerRelativeUrl': urlFolder + oData.mdId,
                        '__metadata': { 'type': 'SP.Folder' }
                    };
    
                    let optionsPost = {
                        method: 'POST',
                        uri: url + '/_api/web/folders',
                        body: body,
                        headers: headers,
                        json: true
                    };
    
                    await request(optionsPost);
    
                    headers['Accept'] = 'application/json;odata=verbose';
                    headers['Content-Type'] = 'application/scim+json';
                    headers['Content-Length'] = oData.size;
                    const myBuffer = Buffer.from(oData.fileData, 'base64')
                    const byteArray = Uint8Array.from(myBuffer);
                    let optionsFile = {
                        method: 'POST',
                        uri: url + urlFile + oData.mdId + "')/Files/add(overwrite=true, url='" + oData.name + "')",
                        body: byteArray,
                        headers: headers,
                        processData: false
                    }    
                        
                    await request(optionsFile);
                }
            }
            oMd.archivoMD = null;
            return oMd;
        } catch (err) {
            return err;
        }
    });

    this.on('sharepointDelete', async (req) => {
        try {
            const oData = JSON.parse(req.data.data);
            var options = await getToken();
            var url = URLSHAREPOINT;
            var headers = options.headers;
            headers['X-HTTP-Method'] = 'DELETE';
            var uri;
            if (oData.origen === "Configuracion") {
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/Configuracion/";
            } else if (oData.origen === "ImagenMD"){
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/ImagenPaso/";
            } else if (oData.origen === "DocumentoMD"){
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/DocumentoMD/";
            } else {
                uri = "/_api/web/GetFolderByServerRelativeUrl('" + carpetaDocumentos + "/RMD/"+ ambiente + "/Solicitud/";
            }
            var optionsDelete = {
                method: 'POST',
                uri: url + uri + oData.codigoRM + "')/Files('" + oData.Name + "')",
                processData: false,
                headers: headers,
                json: true
            }

            await request(optionsDelete);
            var result = "Adjunto eliminado";
            return result
        } catch (err) {
            return err;
        }
    });

    async function getToken() {
        let clientId, clientSecret, realm;
        if (ambiente === "DEV") {
            clientId = 'e670068e-bb0b-4a51-a7eb-f69cec152611';
            clientSecret = '7xJu4WChtfpO7cOAFmg1EoguVQeB8suHBW1HM6AIFy0=';
            realm = '3048dc87-43f0-4100-9acb-ae1971c79395';
            URLSHAREPOINT = 'https://everisgroup.sharepoint.com/sites/Everis_CT_RMD_Repository';
            carpetaDocumentos = 'Shared Documents';
        } else if (ambiente === "QAS") {
            clientId = 'f5c90b95-79e4-4832-a440-5b9bd4995760';
            clientSecret = 'q7uH5dCEwoB1aQUM8nouSKsto/Z6AmPC3+YfOSFlT7A=';
            realm = 'c646feee-bdad-4c72-b8a2-bf167f36afaf';
            URLSHAREPOINT = 'https://medifarmape.sharepoint.com/sites/Aplicaciones_SAP_REPO';
            carpetaDocumentos = 'Documentos compartidos';
        } else if (ambiente === "PRD") {
            clientId = 'f5c90b95-79e4-4832-a440-5b9bd4995760';
            clientSecret = 'q7uH5dCEwoB1aQUM8nouSKsto/Z6AmPC3+YfOSFlT7A=';
            realm = 'c646feee-bdad-4c72-b8a2-bf167f36afaf';
            URLSHAREPOINT = 'https://medifarmape.sharepoint.com/sites/Aplicaciones_SAP_REPO';
            carpetaDocumentos = 'Documentos compartidos';
        }
        var options = await spauth.getAuth(URLSHAREPOINT, {
            clientId: clientId,
            clientSecret: clientSecret,
            realm: realm
        });
        return options;
    };

    // this.on("INSERT", "RECETA", async (req) => {
    //     try {
    //         const oReceta = req.data;
    //         const aDataReceta = JSON.parse(oReceta.Mtart);
    //         const tx = cds.transaction(req);
    //         const oDataReceta = await tx.run(INSERT.into(RECETA).entries(aDataReceta));

    //         return oDataReceta;
    //     } catch (err) {
    //         return err;
    //     }
    // });

    this.on("UPDATE", "MD_ES_RE_INSUMO", async (req) => {
        try {
            const oInsumo = req.data;
            const tx = cds.transaction(req);
            if (oInsumo.mdRecetaId_mdRecetaId) {
                const oUpdateInsumo = await tx.run(UPDATE(MD_ES_RE_INSUMO).set({
                    activo: oInsumo.activo,
                    fechaActualiza: oInsumo.fechaActualiza,
                    usuarioActualiza: oInsumo.usuarioActualiza
                }).where({
                    mdRecetaId_mdRecetaId: oInsumo.mdRecetaId_mdRecetaId
                }));
            } else {
                const oUpdateInsumo = await tx.run(UPDATE(MD_ES_RE_INSUMO).set({
                    cantidadRm: oInsumo.cantidadRm,
                    fechaActualiza: oInsumo.fechaActualiza,
                    usuarioActualiza: oInsumo.usuarioActualiza
                }).where({
                    estructuraRecetaInsumoId: oInsumo.estructuraRecetaInsumoId
                }));
            }
        } catch (err) {
            return err;
        }
    });

    this.on('onUpdateFraction', async (req) => {
        try {
            const oData = JSON.parse(req.data.oData);
            const tx = cds.transaction(req);
            let oSet;
            if(oData.sTipo === "ELIMINAR") {
                oSet = {
                    activo: false,
                    fechaActualiza: oData.fechaActualiza,
                    usuarioActualiza: oData.usuarioActualiza
                }
            } else if (oData.sTipo === "ACTUALIZAR") {
                oSet = {
                    fraccion: oData.fraccion - 1
                    // fechaActualiza: oData.fechaActualiza,
                    // usuarioActualiza: oData.usuarioActualiza
                }
            }
            await tx.run(UPDATE(RMD_USUARIO).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_ESTRUCTURA).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_ES_ETIQUETA).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_ES_PASO).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_ES_PASO_INSUMO_PASO).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_RECETA).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_ES_RE_INSUMO).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_ES_ESPECIFICACION).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_ES_UTENSILIO).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_ES_EQUIPO).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_TABLA_CONTROL).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_VERIFICACION_FIRMAS).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_MOTIVO_EDIT_CIERRE_LAPSO).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_OBSERVACION).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_LAPSO).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            await tx.run(UPDATE(RMD_LAPSO_CATALOGO_FALLA).set(oSet).where({
                rmdId_rmdId: oData.rmdId_rmdId,
                fraccion: oData.fraccion,
                activo: true
            }));
            return "OK";
        } catch (err) {
            return err;
        }
    });

    this.before("UPDATE", "ESTRUCTURA", async (req) => {
        try {
            const oEstructura = req.data;
            if (oEstructura.aPaso && oEstructura.aPaso.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_PASO).entries(oEstructura.aPaso));
                delete oEstructura.aPaso;
                delete oEstructura.estructuraId;
            }

            if (oEstructura.aEquipo && oEstructura.aEquipo.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_EQUIPO).entries(oEstructura.aEquipo));
                delete oEstructura.aEquipo;
                delete oEstructura.estructuraId;
            }

            if (oEstructura.aUtensilio && oEstructura.aUtensilio.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_UTENSILIO).entries(oEstructura.aUtensilio));
                delete oEstructura.aUtensilio;
                delete oEstructura.estructuraId;
            }

            if (oEstructura.aEtiqueta && oEstructura.aEtiqueta.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_ETIQUETA).entries(oEstructura.aEtiqueta));
                delete oEstructura.aEtiqueta;
                delete oEstructura.estructuraId;
            }

            if (oEstructura.aPasoInsumoPaso && oEstructura.aPasoInsumoPaso.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_PASO_INSUMO_PASO).entries(oEstructura.aPasoInsumoPaso));
                delete oEstructura.aPasoInsumoPaso;
                delete oEstructura.estructuraId;
            }

            return oEstructura;
        } catch (err) {
            return err;
        }
    });

    this.before("UPDATE", "MD_ESTRUCTURA", async (req) => {
        try {
            const oEstructura = req.data;
            if (oEstructura.aPaso && oEstructura.aPaso.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_PASO).entries(oEstructura.aPaso));
                delete oEstructura.aPaso;
                delete oEstructura.estructuraId;
            }

            if (oEstructura.aEquipo && oEstructura.aEquipo.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_EQUIPO).entries(oEstructura.aEquipo));
                delete oEstructura.aEquipo;
                delete oEstructura.estructuraId;
            }

            if (oEstructura.aUtensilio && oEstructura.aUtensilio.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_UTENSILIO).entries(oEstructura.aUtensilio));
                delete oEstructura.aUtensilio;
                delete oEstructura.estructuraId;
            }

            if (oEstructura.aEtiqueta && oEstructura.aEtiqueta.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_ETIQUETA).entries(oEstructura.aEtiqueta));
                delete oEstructura.aEtiqueta;
                delete oEstructura.estructuraId;
            }

            if (oEstructura.aPasoInsumoPaso && oEstructura.aPasoInsumoPaso.length > 0) {
                const tx = cds.transaction(req);
                await tx.run(INSERT.into(MD_ES_PASO_INSUMO_PASO).entries(oEstructura.aPasoInsumoPaso));
                delete oEstructura.aPasoInsumoPaso;
                delete oEstructura.estructuraId;
            }

            return oEstructura;
        } catch (err) {
            return err;
        }
    });

    this.on('createUsuarioMasivoRmd', async (req) => {
        try {
            const oData = JSON.parse(req.data.spData);
            const tx = cds.transaction(req);
            const oDataUsers = await tx.run(INSERT.into(RMD_USUARIO).entries(oData));

            return JSON.stringify(oDataUsers.results);
        } catch (err) {
            return err;
        }
    });

    // this.on("INSERT", "EQUIPO", async (req) => {
    //     try {
    //         const oEquipo = req.data;
    //         const aDataEquipo = JSON.parse(oEquipo.equnr);
    //         const tx = cds.transaction(req);
    //         const oDataEquipo = await tx.run(INSERT.into(EQUIPO).entries(aDataEquipo));

    //         return oDataEquipo;
    //     } catch (err) {
    //         return err;
    //     }
    // });

    this.on("INSERT", "RMD_ESTRUCTURA_SKIP", async (req) => {
        try {
            const oDataMain = req.data;

            const aDataEstructura = oDataMain.aEstructura;
            const aDataPaso = oDataMain.aPaso;
            const aDataEquipo = oDataMain.aEquipo;
            const aDataUtensilio = oDataMain.aUtensilio;
            const aDataEspecificacion = oDataMain.aEspecificacion;
            const aDataReceta = oDataMain.aReceta;
            const aDataInsumo = oDataMain.aInsumo;
            const aDataEtiqueta = oDataMain.aEtiqueta;
            const aDataPasoInsumoPaso = oDataMain.aPasoInsumoPaso;

            const tx = cds.transaction(req);

            if(aDataEstructura && aDataEstructura.length > 0){
                const oDataEstructura = await tx.run(INSERT.into(RMD_ESTRUCTURA).entries(aDataEstructura));
            }

            if(aDataPaso && aDataPaso.length > 0){
                const oDataPaso = await tx.run(INSERT.into(RMD_ES_PASO).entries(aDataPaso));
            }
            
            if(aDataEquipo && aDataEquipo.length > 0){
                const oDataEquipo = await tx.run(INSERT.into(RMD_ES_EQUIPO).entries(aDataEquipo));
            }
            
            if(aDataUtensilio && aDataUtensilio.length > 0){
                const oDataUtensilio = await tx.run(INSERT.into(RMD_ES_UTENSILIO).entries(aDataUtensilio));
            }

            if(aDataEspecificacion && aDataEspecificacion.length > 0){
                const oDataEspecificacion = await tx.run(INSERT.into(RMD_ES_ESPECIFICACION).entries(aDataEspecificacion));
            }

            if(aDataReceta && aDataReceta.length > 0){
                const oDataReceta = await tx.run(INSERT.into(RMD_RECETA).entries(aDataReceta));
            }

            if(aDataInsumo && aDataInsumo.length > 0){
                const oDataReceta = await tx.run(INSERT.into(RMD_ES_RE_INSUMO).entries(aDataInsumo));
            }

            if(aDataEtiqueta && aDataEtiqueta.length > 0){
                const oDataEtiqueta = await tx.run(INSERT.into(RMD_ES_ETIQUETA).entries(aDataEtiqueta));
            }

            if(aDataPasoInsumoPaso && aDataPasoInsumoPaso.length > 0){
                const oDataPasoInsumoPaso = await tx.run(INSERT.into(RMD_ES_PASO_INSUMO_PASO).entries(aDataPasoInsumoPaso));
            }

            return oDataMain;
        } catch (err) {
            return err;
        }
    });

    this.on('actualizarRmdEsPasoUsuario', async (req) => {
        try {
            const aUsuarios = JSON.parse(req.data.aUsuarios);
            const rmdEstructuraPasoId = JSON.parse(req.data.rmdEstructuraPasoId);
            let sDesPaso = "";
            let sMotivoModif = "";
            if (req.data.sDescriptionPaso && req.data.sDescriptionPaso !== 'null') {
                sDesPaso = JSON.parse(req.data.sDescriptionPaso);
            }
            if (req.data.sMotivoModif && req.data.sMotivoModif !== 'null') {
                sMotivoModif = JSON.parse(req.data.sMotivoModif);
            }
            const tx = cds.transaction(req);

            //colocar activo = 0 a los usuarios anteriores de ese rmdEstructuraPasoId
            const oUpdateUsuarios = await tx.run(UPDATE(RMD_ES_PASO_USUARIO).set({
                activo: false,
                fechaActualiza: new Date()
            }).where({
                rmdEstructuraPasoId_rmdEstructuraPasoId: rmdEstructuraPasoId
            }));
            

            const oPasoUsuarios = await tx.run(
            SELECT.from(RMD_ES_PASO_USUARIO)
            .where({
                rmdEstructuraPasoId_rmdEstructuraPasoId: rmdEstructuraPasoId,
            })
            );
           
            if (rmdEstructuraPasoId != 0) {
                var oPasoHistorialUsuarios = []
                aUsuarios.forEach(item => {
                    var oEsPasoHistorial = {};
                    oEsPasoHistorial.rmdHistorialPasoId  = uuidv4();
                    oEsPasoHistorial.rmdEstructuraPasoId_rmdEstructuraPasoId = rmdEstructuraPasoId;
                    oEsPasoHistorial.descripcion         = sDesPaso;
                    oEsPasoHistorial.terminal            = '';
                    oEsPasoHistorial.valor               = item.activo ? "ACTIVADO" : "DESACTIVADO";
                    oEsPasoHistorial.usuarioRegistro     = item.usuarioRegistro;
                    oEsPasoHistorial.fechaRegistro       = new Date();
                    oEsPasoHistorial.activo              = true;
                    oEsPasoHistorial.motivoModif         = sMotivoModif;
                    oPasoHistorialUsuarios.push(oEsPasoHistorial) 
                });
            
                const oDataHistorial = await tx.run(INSERT.into(RMD_ES_PASO_HISTORIAL).entries(oPasoHistorialUsuarios));
            }

            aUsuarios.forEach(function(i, d){
                i.terminal = req.headers["x-forwarded-for"].split(",")[0];
            });
            
            const oDataUsers = await tx.run(INSERT.into(RMD_ES_PASO_USUARIO).entries(aUsuarios));

            return true;
        } catch (err) {
            return false;
        }
    });

    this.on("INSERT", "TABLAS_ARRAY_MD_SKIP", async (req) => {
        try {
            const oDataMain = req.data;

            const aDataEquipo = oDataMain.aEquipo;
            const aDataReceta = oDataMain.aReceta;
            const aDataPasoMd = oDataMain.aPasoMd;
            const aDataEspecificacionMd = oDataMain.aEspecificacionMd;
            const aDataEtiquetaMd = oDataMain.aEtiquetaMd;
            const aDataEtiquetasControl = oDataMain.aEtiquetasControl;
            // const aDataEtiquetaMd = oDataMain.aEtiquetaMd;
            const aDataMdReceta = oDataMain.aMdReceta;
            const aDataFormula = oDataMain.aFormula;
            const tx = cds.transaction(req);

            
            if(aDataEquipo && aDataEquipo.length > 0){
                await tx.run(INSERT.into(EQUIPO).entries(aDataEquipo));
            }
            
            if(aDataReceta && aDataReceta.length > 0){
                await tx.run(INSERT.into(RECETA).entries(aDataReceta));
            }

            if(aDataPasoMd && aDataPasoMd.length > 0){
                await tx.run(INSERT.into(MD_ES_PASO).entries(aDataPasoMd));
            }

            if(aDataEspecificacionMd && aDataEspecificacionMd.length > 0){
                await tx.run(INSERT.into(MD_ES_ESPECIFICACION).entries(aDataEspecificacionMd));
            }

            if(aDataEtiquetaMd && aDataEtiquetaMd.length > 0){
                await tx.run(INSERT.into(MD_ES_ETIQUETA).entries(aDataEtiquetaMd));
            }

            if(aDataEtiquetasControl && aDataEtiquetasControl.length > 0){
                await tx.run(INSERT.into(ETIQUETAS_CONTROL).entries(aDataEtiquetasControl));
            }

            if(aDataMdReceta && aDataMdReceta.length > 0){
                await tx.run(INSERT.into(MD_RECETA).entries(aDataMdReceta));
            }

            if(aDataFormula && aDataFormula.length > 0){
                await tx.run(INSERT.into(MD_ES_FORMULA_PASO).entries(aDataFormula));
            }

            return oDataMain;
        } catch (err) {
            return err;
        }
    });

    this.on('crypto', async (req) => {
        try {
            let clave = "";
            let booleanClave = false;
            // if (req.data.clave !== ""){
                clave = crypto.decrypt2(req.data.clave); 
                if(clave == req.data.input){
                    booleanClave = true;
                }
            // }         
            return booleanClave;
        } catch (err) {
            return err;
        }
    });

    this.on('obtenerCodigoCorrelativo', async (req) => {
        try {
            const tx = cds.transaction(req);
            const oData = req.data.sTipo;
            let sequence = await tx.run(`SELECT ${oData}.NEXTVAL FROM DUMMY`);
            let iSequence = (sequence[0][(`${oData}.NEXTVAL`)]).toString();
            return iSequence;
        } catch (err) {
            return err;
        }
    });

    this.on("INSERT", "RMD_ES_HISTORIAL", async (req) => {
        try {
            const tx = cds.transaction(req);
            let oObj = req.data;
            let oItemUsuarios;
            if (oObj.descripcion === 'Verificación Check' || oObj.descripcion === 'Visto bueno') {
                if (oObj.rmdEstructuraPasoId_rmdEstructuraPasoId && oObj.rmdEstructuraPasoInsumoPasoId_rmdEstructuraPasoInsumoPasoId) {
                    oItemUsuarios = await tx.run(SELECT.from(RMD_ES_HISTORIAL).where({
                        rmdEstructuraPasoInsumoPasoId_rmdEstructuraPasoInsumoPasoId: oObj.rmdEstructuraPasoInsumoPasoId_rmdEstructuraPasoInsumoPasoId,
                        }).orderBy({ref:['fechaRegistro'],sort:'desc'}).limit(1)
                    )
                } else if (oObj.rmdEstructuraPasoId_rmdEstructuraPasoId) {
                    oItemUsuarios = await tx.run(SELECT.from(RMD_ES_HISTORIAL).where({
                        rmdEstructuraPasoId_rmdEstructuraPasoId: oObj.rmdEstructuraPasoId_rmdEstructuraPasoId,
                        }).orderBy({ref:['fechaRegistro'],sort:'desc'}).limit(1)
                    )
                } else if (oObj.rmdEstructuraEquipoId_rmdEstructuraEquipoId) {
                    oItemUsuarios = await tx.run(SELECT.from(RMD_ES_HISTORIAL).where({
                        rmdEstructuraEquipoId_rmdEstructuraEquipoId: oObj.rmdEstructuraEquipoId_rmdEstructuraEquipoId,
                        }).orderBy({ref:['fechaRegistro'],sort:'desc'}).limit(1)
                    )
                } else if (oObj.rmdEstructuraUtensilioId_rmdEstructuraUtensilioId) {
                    oItemUsuarios = await tx.run(SELECT.from(RMD_ES_HISTORIAL).where({
                        rmdEstructuraUtensilioId_rmdEstructuraUtensilioId: oObj.rmdEstructuraUtensilioId_rmdEstructuraUtensilioId,
                        }).orderBy({ref:['fechaRegistro'],sort:'desc'}).limit(1)
                    )
                }
                // oItemUsuarios.sort(function (a, b) {
                //     return new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
                // });
                if (oItemUsuarios.length === 0 || oItemUsuarios[0].valor !== oObj.valor) {
                    await tx.run(INSERT.into(RMD_ES_HISTORIAL).entries(oObj));
                    if (oObj.rmdEstructuraPasoId_rmdEstructuraPasoId && oObj.rmdEstructuraPasoInsumoPasoId_rmdEstructuraPasoInsumoPasoId) {
                        await tx.run(UPDATE(RMD_ES_PASO_INSUMO_PASO).set({
                            usuarioActualiza: oObj.usuarioRegistro,
                            fechaActualiza: new Date(),
                            styleUser: oObj.rol
                        }).where({
                            rmdEstructuraPasoInsumoPasoId: oObj.rmdEstructuraPasoInsumoPasoId_rmdEstructuraPasoInsumoPasoId
                        }));
                    } else if (oObj.rmdEstructuraPasoId_rmdEstructuraPasoId) {
                        await tx.run(UPDATE(RMD_ES_PASO).set({
                            usuarioActualiza: oObj.usuarioRegistro,
                            fechaActualiza: new Date(),
                            styleUser: oObj.rol
                        }).where({
                            rmdEstructuraPasoId: oObj.rmdEstructuraPasoId_rmdEstructuraPasoId
                        }));
                    } else if (oObj.rmdEstructuraEquipoId_rmdEstructuraEquipoId) {
                        await tx.run(UPDATE(RMD_ES_EQUIPO).set({
                            usuarioActualiza: oObj.usuarioRegistro,
                            fechaActualiza: new Date(),
                            styleUser: oObj.rol
                        }).where({
                            rmdEstructuraEquipoId: oObj.rmdEstructuraEquipoId_rmdEstructuraEquipoId
                        }));
                    } else if (oObj.rmdEstructuraUtensilioId_rmdEstructuraUtensilioId) {
                        await tx.run(UPDATE(RMD_ES_UTENSILIO).set({
                            usuarioActualiza: oObj.usuarioRegistro,
                            fechaActualiza: new Date(),
                            styleUser: oObj.rol
                        }).where({
                            rmdEstructuraUtensilioId: oObj.rmdEstructuraUtensilioId_rmdEstructuraUtensilioId
                        }));
                    }
                } else {
                    await tx.run(INSERT.into(RMD_ES_HISTORIAL).entries(oObj));
                    if (oObj.rmdEstructuraPasoId_rmdEstructuraPasoId && oObj.rmdEstructuraPasoInsumoPasoId_rmdEstructuraPasoInsumoPasoId) {
                        await tx.run(UPDATE(RMD_ES_PASO_INSUMO_PASO).set({
                            usuarioActualiza: oObj.usuarioRegistro,
                            fechaActualiza: new Date(),
                            styleUser: oObj.rol
                        }).where({
                            rmdEstructuraPasoInsumoPasoId: oObj.rmdEstructuraPasoInsumoPasoId_rmdEstructuraPasoInsumoPasoId
                        }));
                    } else if (oObj.rmdEstructuraPasoId_rmdEstructuraPasoId) {
                        await tx.run(UPDATE(RMD_ES_PASO).set({
                            usuarioActualiza: oObj.usuarioRegistro,
                            fechaActualiza: new Date(),
                            styleUser: oObj.rol
                        }).where({
                            rmdEstructuraPasoId: oObj.rmdEstructuraPasoId_rmdEstructuraPasoId
                        }));
                    } else if (oObj.rmdEstructuraEquipoId_rmdEstructuraEquipoId) {
                        await tx.run(UPDATE(RMD_ES_EQUIPO).set({
                            usuarioActualiza: oObj.usuarioRegistro,
                            fechaActualiza: new Date(),
                            styleUser: oObj.rol
                        }).where({
                            rmdEstructuraEquipoId: oObj.rmdEstructuraEquipoId_rmdEstructuraEquipoId
                        }));
                    } else if (oObj.rmdEstructuraUtensilioId_rmdEstructuraUtensilioId) {
                        await tx.run(UPDATE(RMD_ES_UTENSILIO).set({
                            usuarioActualiza: oObj.usuarioRegistro,
                            fechaActualiza: new Date(),
                            styleUser: oObj.rol
                        }).where({
                            rmdEstructuraUtensilioId: oObj.rmdEstructuraUtensilioId_rmdEstructuraUtensilioId
                        }));
                    }
                    // oObj.usuarioRegistro = "ERROR";
                }
            } else {
                await tx.run(INSERT.into(RMD_ES_HISTORIAL).entries(oObj));
            }
            return oObj;
        } catch (err) {
            return err;
        } 
    });

    this.on('getUserApi', async (req) => {
        try{
            const getUSERAPI = async (sAuth) => {
                let sPathService = `https://ao1k9k5jk.accounts.ondemand.com/service/users/password/`;
                let headers = {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*",
                    "Authorization" : "Basic "+sAuth
                }
                const { data } = await axios.post(sPathService, {}, { headers });
                //const { data } = await axios.post(sPathService, { "sIdFile": sIdFile });
                return data
            }
            const stUser =  await getUSERAPI (req.data.sCode);
            console.log(req);
            return stUser;
        }catch(err){
            return err;
        }
    });
    this.on('encriptCrypto', async (req) => {
        try{
            const sPassword = req.data.sPassword;
            var decodedData = Buffer.from(sPassword, 'base64').toString()
            var sPassEncrypt = crypto.encrypt2(decodedData);
            console.log(req);
            return sPassEncrypt;
        }catch(err){
            return err;
        }
    });

    this.on('createPasosMasivoRmd', async (req) => {
        try {
            
            const oData = JSON.parse(req.data.spData);
            // if(oData.length>0){

                const tx = cds.transaction(req);
                const oDataUsers = await tx.run(INSERT.into(PASO).entries(oData));
                return JSON.stringify(oDataUsers.results);
            // }else{

            // }
        } catch (err) {
            return err;
        }
    });

    this.on("CREATE", "RMD", async (req) => {
        try {
            let oObj = req.data;
            const tx = cds.transaction(req);
            let aRmdObtener = await tx.run(SELECT.from(RMD).where({
                    ordenSAP: oObj.ordenSAP,
                    activo: true
                })
            );

            if (aRmdObtener.length > 0) {
                // await tx.run(DELETE.from(RMD).where({
                //     rmdId: oObj.rmdId
                // }));

                let aRmd = aRmdObtener.find(itm=>itm.rmdId !== oObj.rmdId);

                if (aRmd) {
                    let aUsuariosRmd = await tx.run(SELECT.from(RMD_USUARIO).where({
                        rmdId_rmdId: aRmd.rmdId,
                        activo: true
                    }));

                    let aUsers = [];

                    for await (const oUser of oObj.aUsuarioRmd) {
                        let bFlag = true;
                        for await (const oUserReg of aUsuariosRmd) {
                            if (oUser.usuarioId_usuarioId === oUserReg.usuarioId_usuarioId) {
                                bFlag = false;
                                break;
                            }
                        }

                        if (bFlag) {
                            oUser.rmdId_rmdId = aRmd.rmdId;
                            aUsers.push(oUser);
                        }
                    }

                    await tx.run(INSERT.into(RMD_USUARIO).entries(aUsers));
                }
            } else {
                await tx.run(INSERT.into(RMD).entries(oObj));
            }

            return oObj;
        } catch (err) {
            return err;
        }
    });

    this.before(["CREATE", "UPDATE", "DELETE"], async (req) => {
        try {
            console.log("hello world! before");
            //console.log(req);
            //console.log(result);
            const oData = req.data ? JSON.stringify(req.data) : null;
            const aAudit = [];
            const oAudit = {};
            var oBrowser = browser(req.headers['user-agent']);
            oAudit.applicationName = 'ADMIN';
            oAudit.timestamp = new Date();
            oAudit.host = req.getUrlObject().host;
            oAudit.port = null;            
            oAudit.serviceName = req.path;
            //oAudit.connectionId = null;          
            oAudit.clientHost = req.headers["x-forwarded-host"];
            console.log("req.headers",req.headers);
            oAudit.clientIp = _xForwardedFor(req.headers["x-forwarded-for"]);
            //oAudit.clientPid = null;//req.headers["x-correlation-id"];
            //oAudit.clientPort = null;
            console.log(req.user);
            oAudit.userName = req.user.id;
            oAudit.eventStatus = 'Process';  
            oAudit.eventLevel = null;  
            oAudit.eventAction = req.event;  
            oAudit.action = req.event;  
            //oAudit.schemaName = null;  
            //oAudit.sKey = null;  
            oAudit.value = oData ;
            oAudit.statementString = req.target.query ? JSON.stringify(req.target.query) : null;
            //oAudit.sKey = sKey;
            //oAudit.sValue = oData[sKey].toString();
            //oAudit.originDatabaseName = null;
            oAudit.lang = req.locale;
            oAudit.device = oBrowser.mobile ? 'mobile' : 'desktop';
            //console.log("device",req.device);
            //console.log("browser",browser());
            //console.log("user-agent",req.headers['user-agent']);

            oAudit.so = oBrowser.os ? oBrowser.os : null;
            oAudit.soVersion = oBrowser.os ? oBrowser.os : null;

            oAudit.browser = oBrowser.name ? oBrowser.name : null;
            oAudit.browserVersion = oBrowser.version ? oBrowser.version : null;
            oAudit.stackError = null;
            aAudit.push(oAudit);
            console.log("Antes de insertar")
            const tx = cds.transaction(req);
            const oRow = await tx.run(INSERT.into(AUDITORIA).entries(aAudit));
            //console.log("despues de insertar")
            //console.log("oRow",oRow)
            return oRow;
        } catch (error) {
            console.log("error",error)
            return error;
        }
    });

    this.after(["CREATE", "UPDATE", "DELETE"], async (result, req) => {
        try {
            console.log("hello world!");
            //console.log(req);
            //console.log(result);
            const oData = req.data ? JSON.stringify(req.data) : null;
            const aAudit = [];
            const oAudit = {};
            var oBrowser = browser(req.headers['user-agent']);
            oAudit.applicationName = 'ADMIN';
            oAudit.timestamp = new Date();
            oAudit.host = req.getUrlObject().host;
            oAudit.port = null;            
            oAudit.serviceName = req.path;
            // oAudit.connectionId = null;       
            oAudit.clientHost = req.headers["x-forwarded-host"];
            console.log("req.headers",req.headers);
            oAudit.clientIp = _xForwardedFor(req.headers["x-forwarded-for"]);
            // oAudit.clientPid = null;
            // oAudit.clientPort = null;
            console.log(req.user);
            oAudit.userName = req.user.id;
            oAudit.eventStatus = 'Success';  
            oAudit.eventLevel = null;  
            oAudit.eventAction = req.event;  
            oAudit.action = req.event;  
            // oAudit.schemaName = null;  
            // oAudit.sKey = null;  
            oAudit.value = oData;
            oAudit.statementString = req.target.query ? JSON.stringify(req.target.query) : null;
            // oAudit.originDatabaseName = null;
            oAudit.lang = req.locale;
            oAudit.device = oBrowser.mobile ? 'mobile' : 'desktop';
            //console.log("device",req.device);
            //console.log("browser",browser());
            //console.log("user-agent",req.headers['user-agent']);
            oAudit.so = oBrowser.os ? oBrowser.os : null;
            oAudit.soVersion = oBrowser.os ? oBrowser.os : null;
            oAudit.browser = oBrowser.name ? oBrowser.name : null;
            oAudit.browserVersion = oBrowser.version ? oBrowser.version : null;
            oAudit.stackError = null;
            aAudit.push(oAudit);
            console.log("Antes de insertar")
            const tx = cds.transaction(req);
            const oRow = await tx.run(INSERT.into(AUDITORIA).entries(aAudit));
            //console.log("despues de insertar")
            //console.log("oRow",oRow)
            return oRow;
        } catch (error) {
            console.log("error",error)
            return error;
        }
    });

    this.on ('error', async (err, req) => {
        const db = await cds.connect.to ('db')
        const { AUDITORIA } = db.entities ('mif_admin.hdi')
        // modify the message
        //err.message = 'Oh no! ' + err.message
        // attach some custom data
        //err['@myCustomProperty'] = 'Hello, World!'
        try {
            console.log("error !!! ");
            console.log(req.data);
            console.log(err);
            const oData = req.data ? JSON.stringify(req.data) : null;
            const aAudit = [];
            const oAudit = {};
            var oBrowser = browser(req.headers['user-agent']);
            oAudit.applicationName = 'ADMIN';
            oAudit.timestamp = new Date();
            oAudit.host = req.getUrlObject().host;
            oAudit.port = null;            
            oAudit.serviceName = req.path;
            //oAudit.connectionId = null;          
            oAudit.clientHost = req.headers.host;
            oAudit.clientIp = _xForwardedFor(req.headers["x-forwarded-for"]);
            //oAudit.clientPid = null;//req.headers["x-correlation-id"];
            //oAudit.clientPort = null;
            oAudit.userName = req.user.id;
            oAudit.eventStatus = 'Error';  
            oAudit.eventLevel = err.level ? err.level : null;  
            oAudit.eventAction = req.event ;  
            oAudit.action = req.event;  
            //oAudit.schemaName = null;  
            //oAudit.sKey = null;  
            oAudit.value = oData  ;
            oAudit.statementString = req.target.query ? JSON.stringify(req.target.query) : null;
            //oAudit.sKey = sKey;
            //oAudit.sValue = oData[sKey].toString();
            //oAudit.originDatabaseName = null;
            oAudit.lang = req.locale;
            oAudit.device = oBrowser.mobile ? 'mobile' : 'desktop';
            console.log("device",req.device);
            console.log("browser",browser());
            console.log("user-agent",req.headers['user-agent']);

            oAudit.so = oBrowser.os ? oBrowser.os : null;
            oAudit.soVersion = oBrowser.os ? oBrowser.os : null;

            oAudit.browser = oBrowser.name ? oBrowser.name : null;
            oAudit.browserVersion = oBrowser.version ? oBrowser.version : null;
            oAudit.stackError = err;
            aAudit.push(oAudit);
            const tx = cds.transaction();
            const oRow = await tx.run(INSERT.into(AUDITORIA).entries(aAudit));
            return oRow;
        } catch (error) {
            return error;
        }
    });
})