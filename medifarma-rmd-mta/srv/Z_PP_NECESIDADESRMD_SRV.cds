using {Z_PP_NECESIDADESRMD_SRV as external} from './external/Z_PP_NECESIDADESRMD_SRV.csn';

/**
 * Con la anotación @protocol:'rest' le decimos a CAP
 * básicamente que omita toda la información específica de
 * OData y use REST
 *
 * - Elimina {d: {results: \[] }} \__metadata:{} Products: { \__deferred_
 *   {} } (asociaciones)
 *
 * <http://localhost:4004/v2/Z_PP_NECESIDADESRMD_SRV/CentroSet>
 */
//@protocol : 'rest'
service Z_PP_NECESIDADESRMD_SRVService @(path : '/Z_PP_NECESIDADESRMD_SRV') {

  //# ------------------------------------------------------------
  //#   PROJECTION ENTITIES
  //# ------------------------------------------------------------

  entity OrdenSet as projection on external.OrdenSet;
  entity ProduccionVSet as projection on external.ProduccionVSet;
  entity CaracteristicasSet as projection on external.CaracteristicasSet;

//# ------------------------------------------------------------
//#   POST: ACTION
//# ------------------------------------------------------------


//# ------------------------------------------------------------
//#   GET: FUNCTION
//# ------------------------------------------------------------


}

/*
1. Navegue a la URL de metadatos en http://s4hdev:8080/sap/opu/odata/sap/Z_PP_NECESIDADESRMD_SRV/$metadata
2. Guarde el archivo de metadatos como .edmx en la carpeta del proyecto, por ejemplo, ./edmx/Z_PP_NECESIDADESRMD_SRV.edmx
3. Ejecute el comando cds import Z_PP_NECESIDADESRMD_SRV.edmx. Este comando hace dos cosas:
4. Convierte el .edmx en un archivo .csn y almacena ambos en la carpeta../srv/external/
Se crea una entrada inicial package.jsoncon la información básica para usar el modelo.

5. Se crea un estructura, modificar la propiedad credential a destination para consumo del destino
5.1 En el Destino se debe de configurar la ruta completa del servicio: http://s4hdev:8080/sap/opu/odata/sap/Z_PP_NECESIDADESRMD_SRV
configurado en SAP BTP
"Z_PP_NECESIDADESRMD_SRV": {
      "kind": "odata",
      //"kind": "odata-v2",
      "model": "srv/external/Z_PP_NECESIDADESRMD_SRV",
      "credentials": {
        //"url": "http://s4hdev:8080/sap/opu/odata/sap/Z_PP_NECESIDADESRMD_SRV"
      "destination": "Z_PP_NECESIDADESRMD_SRV"
      }
    }

o
Ejecucion local: remplazar el objeto credencials por
"credentials": {
  "url": "https://medifarmadevqas-dev-cp-approuter.cfapps.us10.hana.ondemand.com/commedifarmacppesajeimpresionbultosaldo/~201121034741+0000~/saperp/sap/opu/odata/sap/Z_PP_NECESIDADESRMD_SRV"
}

cds import edmx/Z_PP_NECESIDADESRMD_SRV.edmx
//cds compile srv -s Z_PP_NECESIDADESRMD_SRV -2 edmx >./edmx/Z_PP_NECESIDADESRMD_SRV.edmx
*/
