using {Z_PP_CENTRALPESADAS_SRV as external} from './external/Z_PP_CENTRALPESADAS_SRV.csn';

/**
 * Con la anotación @protocol:'rest' le decimos a CAP
 * básicamente que omita toda la información específica de
 * OData y use REST
 *
 * - Elimina {d: {results: \[] }} \__metadata:{} Products: { \__deferred_
 *   {} } (asociaciones)
 *
 * <http://localhost:4004/v2/Z_PP_CENTRALPESADAS_SRV/CentroSet>
 */
//@protocol : 'rest'
service Z_PP_CENTRALPESADAS_SRVService @(path : '/Z_PP_CENTRALPESADAS_SRV') {

  entity SociedadSet        as projection on external.SociedadSet;
  entity CentroSet          as projection on external.CentroSet;
  entity CentroDesSet       as projection on external.CentroDesSet;
  entity AlmacenSet         as projection on external.AlmacenSet;
  entity OrdenSet           as projection on external.OrdenSet;
  entity ReservaSet         as projection on external.ReservaSet;
  entity MaterialSet        as projection on external.MaterialSet;
  entity MaterialCaractSet  as projection on external.MaterialCaractSet;
  entity ListaMaterialSet   as projection on external.ListaMaterialSet;
  entity LoteCaractSet      as projection on external.LoteCaractSet;
  entity SolpedSet          as projection on external.SolpedSet;
  entity SolpedItemSet      as projection on external.SolpedItemSet;
  entity SolpedMensajeSet   as projection on external.SolpedMensajeSet;
  entity TrasladoHeadSet    as projection on external.TrasladoHeadSet;
  entity TrasladoItemSet    as projection on external.TrasladoItemSet;
  entity TrasladoMensajeSet as projection on external.TrasladoMensajeSet;
  entity StockSet           as projection on external.StockSet;
  entity SeccionSet         as projection on external.SeccionSet;
  entity StatusSet          as projection on external.StatusSet;
  entity TrasladoMobileSet  as projection on external.TrasladoMobileSet;

  //# ------------------------------------------------------------
  //#   POST: ACTION
  //# ------------------------------------------------------------

  action acTrasladoHeadSet (data: String) returns String;

  //# ------------------------------------------------------------
  //#   GET: FUNCTION
  //# ------------------------------------------------------------

  function fnTrasladoHeadSet (data: String) returns String;

}

/*
1. Navegue a la URL de metadatos en http://s4hdev:8080/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV/$metadata
2. Guarde el archivo de metadatos como .edmx en la carpeta del proyecto, por ejemplo, ./edmx/Z_PP_CENTRALPESADAS_SRV.edmx
3. Ejecute el comando cds import Z_PP_CENTRALPESADAS_SRV.edmx. Este comando hace dos cosas:
4. Convierte el .edmx en un archivo .csn y almacena ambos en la carpeta../srv/external/
Se crea una entrada inicial package.jsoncon la información básica para usar el modelo.

5. Se crea un estructura, modificar la propiedad credential a destination para consumo del destino
5.1 En el Destino se debe de configurar la ruta completa del servicio: http://s4hdev:8080/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV
configurado en SAP BTP
"Z_PP_CENTRALPESADAS_SRV": {
      "kind": "odata",
      //"kind": "odata-v2",
      "model": "srv/external/Z_PP_CENTRALPESADAS_SRV",
      "credentials": {
        //"url": "http://s4hdev:8080/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV"
      "destination": "Z_PP_CENTRALPESADAS_SRV"
      }
    }

cds import edmx/Z_PP_CENTRALPESADAS_SRV.edmx
//cds compile srv -s Z_PP_CENTRALPESADAS_SRV -2 edmx >./edmx/Z_PP_CENTRALPESADAS_SRV.edmx
*/
