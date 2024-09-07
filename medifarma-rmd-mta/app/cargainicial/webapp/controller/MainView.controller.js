sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "../model/excel",
    "../utils/utils",
    "../services/Service",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    Excel,
    Util,
    Service,
    MessageBox,
    BusyIndicator,
    Filter
  ) {
    "use strict";
    let oThat = null,
        aNivel = [],
        aArea = [],
        changeState = {},
        objTipoDato = {},
        arrTrue = ["X", "x"],
        objEstadoRMD = {},
        objEstructura = {},
        arrMD = [],
        arrMD_EST = [],
        arrMD_ETI = [],
        arrMD_PASO = [],
        arrMD_RECETA = [],
        arrMD_ES_UTEN = [],
        arrMDESPECIF = [],
        arrMD_ES_EQUIPO = [],
        arrMD_PASO_INSUMO_PASO = [],
        arrMD_RE_INSUMO = [],
        arrPaso = [],
        arrMD_Formula_Paso = [],
        arrMD_Trazab = [],
        userName = "",
        oAplicacionConfiguracion,
        constanteArea,
        constanteNivel,
        idEstadoProcesoAutorizado,
        idEstadoProcesoPendiente,
        sIdTipoEquipo,
        sEstadoPermitidoProducto,
        nIdTipoMaestraEstadoRMD;
    const sAppConfiguracion = 'CONFIG';
    return Controller.extend("mif.rmd.cargainicial.controller.MainView", {
      onInit: async function () {
        oThat = this;
        this.mainModelv2 = oThat.getView().getModel("mainModelv2");
        this.mainModelv4 = oThat.getView().getModel("mainModelv4");

        this.localModel = oThat.getView().getModel("localModel");
        this.oModelErpProd = oThat
          .getOwnerComponent()
          .getModel("PRODUCCION_SRV");
        this.oModelErpNec = oThat
          .getOwnerComponent()
          .getModel("NECESIDADESRMD_SRV");

        // Obteniendo el ID de la aplicacion y las constantes
        let aAppConfig = await oThat.onGetAppConfiguration();
        if (aAppConfig.results.length > 0) {
            oAplicacionConfiguracion = aAppConfig.results[0].aplicacionId;
            this.aConstantes = await oThat.onGetConstants();
            if (this.aConstantes.results.length > 0) {
                await oThat.onSetConstans(this.aConstantes);
                sap.ui.core.BusyIndicator.hide();
            } else {
                MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessageNoConstants"));
                sap.ui.core.BusyIndicator.hide();
                return false;
            }
        } else {
            MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessageNoAppFind"));
            sap.ui.core.BusyIndicator.hide();
            return false;
        }

        let aFilters = [];
        aFilters.push(new Filter("AtinnText", "EQ", constanteArea));
        aArea = await Service.onGetDataGeneralFilters(
          oThat.oModelErpNec,
          "CaracteristicasSet",
          aFilters
        );
        aNivel = await Service.onGetDataGeneralFilters(
          oThat.oModelErpNec,
          "CaracteristicasSet",
          [new Filter("AtinnText", "EQ", constanteNivel)]
        );
        this.aClvMo = await Service.onGetDataGeneral(
          this.oModelErpNec,
          "ClaveModeloSet"
        );

        let emailUser = "";
        if (sap.ushell) {
            var user = new sap.ushell.Container.getService("UserInfo").getUser();
            if (user.getFirstName()!== 'Default')
                emailUser = user.getEmail();   
            else 
              emailUser = "gianfranco.romano.paoli.rosas@everis.nttdata.com";
        } else {
                emailUser = "gianfranco.romano.paoli.rosas@everis.nttdata.com";
        }
        var UserFilter = [];
        UserFilter.push(new Filter("correo", 'EQ', emailUser));
        let oUsuarioFilter = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "USUARIO", UserFilter);
        userName = oUsuarioFilter.results[0].usuario;
      },
      _empty: ["", null, undefined, NaN, "NULL","UNDEFINED"],
      handleUploadComplete: function (oEvent) {
        var oFile = oEvent.getParameters("files").files[0];
        Excel.readXLSX(oFile)
          .then(
            function (oData) {
              this.managedData(oData);
            }.bind(this)
          )
          .catch(function (sError) {
            console.log(sError);
            MessageBox.show(sError);
          });
      },
      vCol(column, colDefaul, type) {
        let val;

        val = this._empty.includes(column) ? colDefaul : String(column).trim();

        if (type === "int") {
          val = +val;
        }
        if (type == "date") {
          val = new Date(val);
        }
        return val;
      },
      onGetData: async function (entity, filters, values, campo = "", type = "", dataSource = "") {
        let aFilter = [];
        if (dataSource == "") {
          dataSource = oThat.mainModelv2;
        }
        if (values != "") {
          if (type == "array") {
            for (let i = 0; i < filters.length; i++) {
              aFilter.push(new Filter(filters[i], "EQ", values[i]));
            }
          } else {
            aFilter.push(new Filter(filters, "EQ", values));
          }

          let data = await Service.onGetDataGeneralFilters(dataSource, entity, aFilter).then((payload) => {
              return payload;
            }).catch((error) => {
              console.log(error);
            });

          if (!oThat._empty.includes(data) && data.results.length > 0) {
            if (campo == "") {
              return data.results[0];
            } else {
              return data.results[0][campo];
            }
          } else {
            return null;
          }
        } else {
          return null;
        }
      },
      findInArray: function (arr, arrFilter, arrValue) {
        let aFilter = [];

        if (arrFilter.length >= 1) {
          arr.results.map((items) => {
            for (let i = 0; i < arrFilter.length; i++) {
              if (
                items[arrFilter[i]] == arrValue[i] &&
                items[arrFilter[i]] == arrValue[i]
              ) {
                return items;
              }
            }
          });
        } else {
          return null;
        }
      },
      generateNewCod: async function () {
        // 20200071
        // 2202200112
        let tipo = "2";
        let anho = new Date().getFullYear().toString();
        let arrMD = await Service.onGetDataGeneral(oThat.mainModelv2, "MD");
        let newCorrelativo = 0;
        if (arrMD.results.length === 0) {
          newCorrelativo = "00001";
        } else {
          arrMD.results.sort(function (a, b) {
            return b.codigo - a.codigo;
          });
          var lastCode = arrMD.results[0].codigo;
          var lastCorrelativo = lastCode.substring(
            lastCode.length - 5,
            lastCode.length
          );
          var newValue = parseInt(lastCorrelativo) + 1;
          if (newValue < 10) {
            newCorrelativo = "0000" + newValue.toString();
          } else if (newValue < 100) {
            newCorrelativo = "000" + newValue.toString();
          } else if (newValue < 1000) {
            newCorrelativo = "00" + newValue.toString();
          } else if (newValue < 10000) {
            newCorrelativo = "0" + newValue.toString();
          } else if (newValue < 100000) {
            newCorrelativo = newValue.toString();
          }
          // console.log("newCorrelativo", newCorrelativo);
          return tipo + anho + newCorrelativo;
        }
      },
      managedData: async function (oData) {
        BusyIndicator.show(0);
        // var msg = "";
        var mdId = "";
        try {
          //for MD
          arrMD = [];
          arrPaso = [];
          console.log("arrMD", arrMD);
          console.log("time start", new Date().getTime());
          let _obj = {};
          _obj.usuarioRegistro = userName;
          _obj.activo = true;
          _obj.fechaRegistro = new Date();

          changeState.fechaActualiza = new Date();
          changeState.usuarioActualiza = userName;
          changeState.activo = false;

          let _pasos = oData["PASO"] ? oData["PASO"] : [];
          let arrFiltroCodigo = [];
          let arrFiltroEstructura = [];
          let arrFiltroEtiqueta = [];
          let arrFiltroMotivo = [];
          let arrFiltroMaestra = [];
          let timepasos = new Date().getTime();
          //todos los codigos
          let arrPasosReject = [];
          _pasos.forEach((paso) => {
            arrFiltroCodigo.push(new Filter("codigo", "EQ", paso.codigo || ""));
            arrFiltroEstructura.push(
              new Filter("codigo", "EQ", paso.estructuraId || "")
            );
            if (!oThat._empty.includes(paso.etiquetaId)) {
              arrFiltroEtiqueta.push(
                new Filter("codigo", "EQ", paso.etiquetaId || "")
              );
            }
            if (!oThat._empty.includes(paso.tipoLapsoId)) {
              arrFiltroMotivo.push(
                new Filter("codigo", "EQ", paso.tipoLapsoId || "")
              );
            }
            if (!oThat._empty.includes(paso.tipoCondicionId)) {
              arrFiltroMaestra.push(
                new Filter("codigo", "EQ", paso.tipoCondicionId || "")
              );
            }
          });
          arrFiltroCodigo.push(new Filter("activo", "EQ", true)); //validar a true
          console.log(
            "time end pasos forEach",
            new Date().getTime() - timepasos
          );
          var aRespuestaLog = [];

          let timepasos2 = new Date().getTime();
          let count = 1000;
          let block = Math.ceil(arrFiltroCodigo.length / count);
          console.log("BLoque :", block);
          let ini = 0;
          let end = count;
          // let ind = 1000;
          for (let index = 0; index < block; index++) {
            // const item = array[index];
            let arrPasosSave = [];
            let arrBloque = arrFiltroCodigo.slice(ini, end); //[] 0:1000 | 1001 : 2000| 2001:3000
            let arrBloque2 = arrFiltroEstructura.slice(ini, end); //[] 0:1000 | 1001 : 2000| 2001:3000
            let arrBloque3 = arrFiltroEtiqueta.slice(ini, end); //[] 0:1000 | 1001 : 2000| 2001:3000
            let arrBloque4 = arrFiltroMotivo.slice(ini, end); //[] 0:1000 | 1001 : 2000| 2001:3000
            let arrBloque5 = arrFiltroMaestra.slice(ini, end); //[] 0:1000 | 1001 : 2000| 2001:3000
            let arrPasosTemp = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "PASO",
              arrBloque
            ); // [] bloque 0 - 1000
            let arrPasosTempEst = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "ESTRUCTURA",
              arrBloque2
            ); // [] bloque 0 - 1000
            let arrPasosTempEtiq = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "ETIQUETA",
              arrBloque3
            ); // [] bloque 0 - 1000
            let arrPasosTempMot = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "MOTIVO_LAPSO",
              arrBloque4
            ); // [] bloque 0 - 1000
            let arrPasosTempMaes = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "MAESTRA",
              arrBloque5
            ); // [] bloque 0 - 1000
            let tempBloqPasos = _pasos.slice(ini, end);
            ini = end + 1;
            end += count;

            // let bflag = true;
            // let mdEnabled = true;
            // obj.codigo = oThat.vCol(item["codigo"],null);
            // if(oThat._empty.includes(obj.codigo)){
            //   msg +="Error al ingresar el código"
            //   bflag =false;
            //   mdEnabled = false;
            // }else{
            // let validate_code = arrPasosTemp.filter( arrPaso=> {arrPaso.codigo=== obj.codigo} )  //await oThat.onGetData("PASO",["codigo","activo"],[obj.codigo,true],"pasoId","array")
            tempBloqPasos.forEach((bloq) => {
              // arrPasosSave = [];
              let obj = {};
              let msg = "";
              let bflag = true;
              let mdEnabled = true;
              obj.codigo = oThat.vCol(bloq["codigo"], null);
              if (oThat._empty.includes(obj.codigo)) {
                msg += "Error al ingresar el código \n";
                bflag = false;
                mdEnabled = false;
              }
              let arrFilter = arrPasosTemp.results.filter(
                (aPasoT) =>
                  aPasoT.codigo == bloq.codigo && aPasoT.activo == true
              );
              let validate_code;
              if (arrFilter.length > 0) {
                msg += "Ya existe un código activo";
                bflag = false;
                mdEnabled = false;
              } else {
                obj.codigo = bloq["codigo"];
              }

              obj.descripcion = bloq["descripcion"] || null;
              if (!obj.descripcion) {
                msg += "Error al ingresar descripción \n";
                bflag = false;
                mdEnabled = false;
              }

              let estructuratemp = arrPasosTempEst.results.filter(
                (payload) => payload.codigo === bloq.estructuraId
              );

              obj.estructuraId_estructuraId = estructuratemp;
              //await oThat.onGetData("ESTRUCTURA", "codigo", oThat.vCol(bloq["estructuraId"],  null));
              // if(!obj.estructuraId_estructuraId){
              if (estructuratemp.length == 0) {
                msg += "Error al ingresar la estructura \n";
                bflag = false;
                mdEnabled = false;
              } else {
                obj.estructuraId_estructuraId = estructuratemp[0].estructuraId;
              }

              //Etiqueta

              if (
                estructuratemp[0].tipoEstructuraId_iMaestraId ==
                objEstructura.Procesos
              ) {
                //recibe etiquetas
                // obj.etiquetaId_etiquetaId = await oThat.onGetData("ETIQUETA", "codigo", oThat.vCol(item["etiquetaId"],  null),"etiquetaId");
                let etiquetaTemp = arrPasosTempEtiq.results.filter(
                  (temp) => temp.codigo === bloq.etiquetaId
                );
                if (oThat._empty.includes(etiquetaTemp)) {
                  msg += "Error al ingresar la etiqueta \n";
                  bflag = false;
                  mdEnabled = false;
                } else {
                  if (!etiquetaTemp[0]) {
                    msg += "No existe la etiqueta: " + bloq.etiquetaId + "\n";
                    bflag = false;
                    mdEnabled = false;
                  } else {
                    obj.etiquetaId_etiquetaId = etiquetaTemp[0].etiquetaId;
                  }
                }
              } else {
                if (
                  oThat._empty.includes(oThat.vCol(bloq["etiquetaId"], null))
                ) {
                  obj.etiquetaId_etiquetaId = null;
                } else {
                  msg += "Error al ingresar la etiqueta no existe";
                  bflag = false;
                  mdEnabled = false;
                }
              }

              obj.numeracion = arrTrue.includes(oThat.vCol(bloq["automatico"]))
                ? true
                : false;

              obj.tipoDatoId_iMaestraId =
                objTipoDato[oThat.vCol(bloq["tipoDatoId"], null)];

              if (!obj.tipoDatoId_iMaestraId) {
                bflag = false;
                mdEnabled = false;
                msg += "PASO: El TipoDato no fue encontrado \n";
              }

              obj.estadoId_iMaestraId = 2;
              let tipoLapsoTemp = arrPasosTempMot.results.filter(
                (pay) => pay.codigo == bloq.tipoLapsoId
              );
              if (tipoLapsoTemp.length > 0) {
                obj.tipoLapsoId_motivoLapsoId = tipoLapsoTemp[0].motivoLapsoId;
              }

              let maestraTemp = arrPasosTempMaes.results.filter(
                (pay) => pay.codigo == bloq.tipoCondicionId
              );
              if (maestraTemp.length > 0) {
                obj.tipoCondicionId_iMaestraId = maestraTemp[0].iMaestraId;
              }

              obj.valorInicial = oThat.vCol(bloq["valorInicial"], null);
              obj.valorFinal = oThat.vCol(bloq["valorFinal"], null);
              obj.margen = oThat.vCol(bloq["margen"], null);
              obj.decimales = oThat.vCol(bloq["decimales"], null);
              obj.vistoBueno = arrTrue.includes(oThat.vCol(bloq["vistoBueno"]))
                ? true
                : false;
              obj.automatico = arrTrue.includes(oThat.vCol(bloq["automatico"]))
                ? true
                : false;
              obj.bflag = bflag;
              obj.msg = msg;

              obj = { ...obj, ..._obj };
              obj.pasoId = Util.onGetUUIDV4();

              arrPasosSave.push(obj);
            });

            let allPromiseSave = [];
            let allSave = [];
            // let aDeferredGroup = oThat.mainModelv2.getDeferredGroups().push("batchCreate");
            // oThat.mainModelv2.setDeferredGroups(aDeferredGroup);
            let randomBatch = String(Math.random() * 1000);
            // console.log(randomBatch);
            // oThat.mainModelv2.submitChanges({groupId:randomBatch});
            for (let index = 0; index < arrPasosSave.length; index++) {
              let element = arrPasosSave[index];
              if (element["bflag"]) {
                delete element.bflag;
                delete element.msg;
                allSave.push(element);
              } else {
                element.detail = {
                  code: 400,
                  title: "Error en el código " + element.codigo,
                  message: element.msg,
                };
                arrPasosReject.push(element);
              }
            }

            let aError1 = [];
            arrPasosSave.forEach((item) => {
              if (item.detail && item.detail.code === 400) {
                aError1.push(item);
              }
            });

            var aError2 = [];
            var aRespuestaTmp = [];
            if (allSave.length > 0) {
              await Service.createMultiplePasosFunction(
                oThat.mainModelv2,
                allSave
              ).then(
                function (oRespuesta) {
                  aRespuestaTmp = oRespuesta;
                  console.log(
                    "Se registraron correctamente los Pasos seleccionados."
                  );
                }.bind(oThat),
                function (error) {
                  console.log(
                    "Ocurrió un error al registrar los Pasos seleccionados."
                  );
                }
              );

              allSave.forEach((item) => {
                for (let i = 0; i < aRespuestaTmp.length; i++) {
                  const item2 = aRespuestaTmp[i];
                  if (
                    item2.affectedRows > 0 &&
                    item2.values[0] === item.codigo
                  ) {
                    item.detail = {
                      code: "200",
                      title: "PASO creado exitosamente",
                      message: "Done!",
                    };
                    break;
                  } else {
                    item.detail = {
                      code: 400,
                      title: "Error en el código " + item.codigo,
                      message: "",
                    };
                  }
                }
              });
              aRespuestaLog = aRespuestaLog.concat(allSave.concat(aError2));
            }
          }

          console.log(
            "time end pasos Odata ",
            new Date().getTime() - timepasos2
          );

          let timepasos3 = new Date().getTime();
          console.log("time START RMD Odata ", new Date().getTime());
          let _mdArr = oData["MD"] ? oData["MD"] : [];

          //definimos los arrays

          let arrFiltroMD = [];
          let arrFiltroMaestraEstado = [];
          let arrFiltroMaestraSucursal = [];
          let arrFiltroMotivo2 = [];
          let arrFiltroUsuarioAutoriz = [];
          //maestra =>  estado
          //maestra => sucursal
          //Motivo => motivo
          // let arrMDAll =
          _mdArr.forEach((p) => {
            if (p.codigo) {
              arrFiltroMD.push(new Filter("codigo", "EQ", p.codigo || ""));
            }
            if (p.estadoIdRmd) {
              arrFiltroMaestraEstado.push(
                new Filter("codigo", "EQ", p.estadoIdRmd || "")
              );
            }
            if (p.sucursalId) {
              arrFiltroMaestraSucursal.push(
                new Filter("codigo", "EQ", p.sucursalId || "")
              );
            }
            if (p.motivoId) {
              arrFiltroMotivo2.push(
                new Filter("codigo", "EQ", p.motivoId || "")
              );
            }

            if (p.usuarioAutorizacion) {
              arrFiltroUsuarioAutoriz.push(
                new Filter("usuario", "EQ", p.usuarioAutorizacion || "")
              );
            }
          });

          arrFiltroMaestraEstado.push(
            new Filter("oMaestraTipo_maestraTipoId", "EQ", nIdTipoMaestraEstadoRMD)
          );
          arrFiltroMD.push(new Filter("activo", "EQ", true));

          // let  = 1000; validamos el contador por bloque
          let bMD = Math.ceil(arrFiltroMD.length / count); //block MD
          console.log("BLoque MD :", bMD);
          let init = 0;
          let toEnd = count;
          for (let i = 0; i < bMD; i++) {
            // const element = array[i];
            let arrBloque1 = arrFiltroMD.slice(init, toEnd);
            let arrBloque2 = arrFiltroMaestraEstado.slice(init, toEnd);
            let arrBloque3 = arrFiltroMaestraSucursal.slice(init, toEnd);
            let arrBloque4 = arrFiltroMotivo2.slice(init, toEnd);
            let arrBloque5 = arrFiltroUsuarioAutoriz.slice(init, toEnd);

            let arrBloqRMD = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "MD",
              arrBloque1
            );
            let arrBloqMaestraEstado = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "MAESTRA",
              arrBloque2
            );
            let arrBloqMaestraSucursal = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "MAESTRA",
              arrBloque3
            );
            let arrBloqMaestraMotivo = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "MOTIVO",
              arrBloque4
            );
            let arrBloqUsuarioAutorizad = await Service.onGetDataGeneralFilters(
              oThat.mainModelv2,
              "USUARIO",
              arrBloque5
            );

            let bloqTempRMD = _mdArr.slice(init, toEnd);

            init = toEnd + 1;
            toEnd += count;

            //logica de MD

            for await (const blq of bloqTempRMD) {
              //by one RMD
              let xObj = {};
              let bflag = true;
              let mdEnabled = true;
              let sucursal = "";
              let nivel = "";
              let msg = "";
              mdId = xObj.mdId = Util.onGetUUIDV4();
              console.log("UUID", mdId);
              let rmdStateError = true;
              /* validar columnas sin espacios
              // let obj2 = {}
              for (const property in object) {
                obj2[property.toString().trim()] = object[property]
              }*/


              xObj.codigo = oThat.vCol(blq["codigo"], null); // await oThat.generateNewCod();
              console.log(xObj.codigo);
              if (oThat._empty.includes(xObj.codigo)) {
                bflag = false;
                mdEnabled = false;
                msg += "No existe un código para este RMD\n";
                xObj.detail = {
                  code: "400",
                  title: "No hay código para el RMD",
                  message: msg,
                };
              } else {
                let currentMD = await oThat.onGetData("MD", ["codigo", "activo"], [xObj.codigo, true], "mdId", "array");
                if (oThat._empty.includes(currentMD)) {
                  xObj.descripcion = oThat.vCol(blq["descripcion"] || "", "");
                  xObj.version = oThat.vCol(blq["version"] || "", "int");
                  if (
                    oThat._empty.includes(xObj.version) &&
                    typeof xObj.version == "number"
                  ) {
                    bflag = false;
                    mdEnabled = false;
                    msg += "Error al momento de incliur la versión\n";
                  }

                  let estadoIdRMD = arrBloqMaestraEstado.results.filter((p) => p.codigo == blq["estadoIdRmd"]);
                  if (estadoIdRMD) {
                    xObj.estadoIdRmd_iMaestraId = estadoIdRMD[0].iMaestraId;
                  } else {
                    bflag = false;
                    mdEnabled = false;
                    msg += "Falta el estado\n";
                  }

                  let sucursalId = arrBloqMaestraSucursal.results.filter((p) => p.codigo == blq["sucursalId"]);
                  if (sucursalId) {
                    xObj.sucursalId_iMaestraId = sucursalId[0].iMaestraId;
                    sucursal = blq["sucursalId"];
                  } else {
                    bflag = false;
                    mdEnabled = false;
                    msg += "Falta la sucursal \n";
                  }

                  xObj.fechaSolicitud = oThat.vCol(blq["fechaSolicitud"] || "", null, "date");
                  if (oThat._empty.includes(xObj.fechaSolicitud)) {
                    bflag = false;
                    mdEnabled = false;
                    msg += "Falta la fecha de Solicitud \n";
                  }

                  let motivoId = arrBloqMaestraMotivo.results.filter((p) => p.codigo == blq["motivoId"]);
                  if (motivoId.length > 0) {
                    xObj.motivoId_motivoId = motivoId[0].motivoId;
                  } else {
                    bflag = false;
                    mdEnabled = false;
                    msg += "Falta la información de motivo \n";
                  }

                  xObj.observacion = oThat.vCol(blq["observacion"] || "", "");

                  xObj.estadoIdProceso_iMaestraId = xObj.estadoIdRmd_iMaestraId === objEstadoRMD["I"] ? idEstadoProcesoPendiente : idEstadoProcesoAutorizado;
                  if (xObj.estadoIdRmd_iMaestraId === objEstadoRMD["A"]) {
                    let idUser = arrBloqUsuarioAutorizad.results.filter((p) => p.usuario === blq["usuarioAutorizacion"]);
                    if (idUser == null) {
                      bflag = false;
                      mdEnabled = false;
                      msg += "Usuario no encontrado \n";
                    } else {
                      xObj.usuarioAutorizacion = blq["usuarioAutorizacion"];
                    }
                  } else {
                    xObj.usuarioAutorizacion = null;
                  }

                  xObj.fechaAutorizacion = xObj.estadoIdRmd_iMaestraId === objEstadoRMD["A"] ? oThat.vCol(blq["fechaAutorizacion"] || "", null, "date") : null;
                  if (oThat._empty.includes(xObj.fechaAutorizacion) && xObj.estadoIdRmd_iMaestraId === objEstadoRMD["A"]) {
                    bflag = false;
                    mdEnabled = false;
                    msg += "Fecha de autorización no permitida \n";
                  }
                  xObj.af = "SI";
                  //Error mandante 150
                  let rptaArea = aArea.results.filter((pay) => pay.Atwrt == oThat.vCol(blq["areaRmdTxt"], null));
                  if (oThat._empty.includes(blq.areaRmdTxt) || rptaArea.length === 0) {
                    bflag = false;
                    mdEnabled = false;
                    msg += "Falta el área \n";
                  } else {
                    xObj.areaRmdTxt = rptaArea[0].Atwrt;
                  }
                  xObj.motivoCancelado = xObj.estadoIdRmd_iMaestraId == objEstadoRMD["C"] ? oThat.vCol(blq["motivoCancelado"], null) : null;
                  xObj.masRecetas = arrTrue.includes(oThat.vCol(blq["masRecetas"])) ? true : false;
                  xObj.rptaValidacion = oThat.vCol(blq["rptaValidacion"] || "", null);
                  //Error mandante 150
                  let rptaNivel = aNivel.results.filter((pay) => pay.Atwrt.includes(oThat.vCol(blq["nivelTxt"], null)));
                  if (oThat._empty.includes(blq.nivelTxt) || rptaNivel.length === 0) {
                    bflag = false;
                    msg += "Falta el nivel \n";
                    mdEnabled = false;
                  } else {
                    xObj.nivelTxt = rptaNivel[0].Atwrt;
                    nivel = xObj.nivelTxt;
                  }
                  xObj.codDefectoReceta = oThat.vCol(blq["codDefectoReceta"] || "", "");
                  xObj.codAgrupadorReceta = oThat.vCol(blq["codAgrupadorReceta"] || "", "");
                  xObj.codigoversionprincipal = oThat.vCol(blq["codigoversionprincipal"] || "", "");
                  xObj.rptaValidacionDate = oThat.vCol(blq["rptaValidacionDate"] || "", "", "date");

                  xObj = { ...xObj, ..._obj };

                  if (bflag && mdEnabled) {
                    await Service.onSaveDataGeneral(oThat.mainModelv2, "MD", xObj).then((pay) => {
                        xObj.detail = {
                          code: "200",
                          title: "MD creado exitosamente",
                          message: "Realizado",
                        };
                      }).catch((e) => {
                        xObj.detail = {
                          code: e.statusCode,
                          title: "Error en el código " + xObj.codigo,
                          message: e.responseText,
                        };
                        console.log(e);
                        rmdStateError = false;
                      });
                  } else {
                    xObj.detail = {
                      code: "400",
                      title: "Error al registrar MD  " + xObj.codigo,
                      message: msg,
                    };
                  }

                  xObj.codigo = blq["codigo"];
                  let v0 = arrMD.find((item) => item.codigo == xObj.codigo);
                  if (!v0) {
                    arrMD.push(xObj);
                  }

                  //Definimos las constantes
                  let arrFiltroEstructura = [];
                  let arrFiltroEtiqueta = [];
                  let arrFiltroPaso = [];
                  let arrFiltroMDReceta = [];
                  let arrFiltroMDEquipo = [];
                  let arrFiltroMDESUtensilio = [];
                  let arrFiltroMDESEspecificacion = [];
                  let arrFiltroMDPasoHijo = [];
                  let arrBloqEstructura;
                  let arrBloqPaso;
                  let arrBloqEtiqueta;
                  let arrBloqPasoHijo;

                  //** ================ MD_ESTRUCTURA ================= */
                  let ii = 0;
                  let ee = count;
                  let mdEstructura = oData["MD_ESTRUCTURA"] ? oData["MD_ESTRUCTURA"] : [];
                  let mdEstructuraxMD = mdEstructura.filter((item) => item["mdId"] == xObj.codigo);
                  //Agregamos el filtro a las entidades que vamos a llmar
                  mdEstructuraxMD.forEach((p) => {
                    if (p.estructuraId) {
                      arrFiltroEstructura.push(new Filter("codigo", "EQ", p.estructuraId || ""));
                    }
                  });
                  // validamos el contador por bloques
                  let blen = Math.ceil(mdEstructuraxMD.length / count); //block MD
                  let a = 0;
                  while (a < blen && bflag) {
                    // for (let i = 0; i < blen; i++) {
                    let arrBloque1 = arrFiltroEstructura.slice(ii, ee);
                    // añadimos el filtro activo
                    arrBloque1.push(new Filter("activo", "EQ", true)); //validar a true
    
                    arrBloqEstructura = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "ESTRUCTURA", arrBloque1);
    
                    let bloqTempEstructura = mdEstructuraxMD.slice(ii, ee);
                    ii = ee + 1;
                    ee += count;
                    let b = 0;
                    while (b < bloqTempEstructura.length && bflag) {
                      let blq = bloqTempEstructura[b];
                      let obj = {};
                      rmdStateError = false;
                      obj.mdEstructuraId = Util.onGetUUIDV4();

                      let mdIdFilt = arrMD.filter((p) => p.codigo == blq["mdId"]);
                      if (mdIdFilt) {
                        obj.mdId_mdId = mdIdFilt[0].mdId;
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg +=
                          "MD_ESTRUCTURA: Error al obtener datos de MD_Estructura \n";
                      }

                      let estructuraId = arrBloqEstructura.results.filter((p) => p.codigo == blq["estructuraId"]);
                      if (estructuraId.length > 0) {
                        obj.estructuraId_estructuraId = estructuraId[0].estructuraId;
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg +=
                          "MD_ESTRUCTURA: Error al obtener datos de Estructura \n";
                      }

                      obj.orden = blq["orden"];
                      let aOrders = bloqTempEstructura.filter((pay) => pay.orden == obj.orden);
                      if (aOrders.length > 1) {
                        bflag = false;
                        mdEnabled = false;
                        msg += `MD_ESTRUCTURA: El orden ya existe para esta estructura ${blq["mdEstructuraId"]}\n`;
                      }
    
                      if (oThat._empty.includes(obj.orden)) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "Error al asignar un número de orden \n";
                      }
    
                      obj = { ...obj, ..._obj };

                      if (bflag && mdEnabled) {
                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", obj).then((pay) => {
                            obj.detail = { code: "200", message: "Done!" };
                            // BusyIndicator.hide();
                          }).catch((e) => {
                            obj.detail = {
                              code: e.statusCode,
                              title: "Error in position " + ii,
                              message: e.responseText,
                            };
                            console.log(e);
                            // BusyIndicator.hide();
                          });
                      } else {
                        // obtener el id del MD vinculado
    
                        await oThat.disableCascade(mdId, msg);
                        bflag =false;
                        obj.detail = {
                          code: "400",
                          title: "Error in position " + ii,
                          message: "Información corrupta",
                        };
                        //  return false;
                        //  BusyIndicator.hide();
                      }
                      obj.index = blq["mdEstructuraId"];
                      //buscamos si existe en el array arrMD_EST
                      let v0 = arrMD_EST.find((item) => item.index === obj.index);
                      if (!v0) {
                        arrMD_EST.push(obj);
                      }
                      b++;
                    }
                    a++
                  }

                  //** ================ MD_ES_ETIQUETA ================= */
                  let iii = 0;
                  let eee = count;
                  let mdEtiqueta = oData["MD_ES_ETIQUETA"] ? oData["MD_ES_ETIQUETA"] : [];
                  let mdEtiquetaxMD = mdEtiqueta.filter((item)=> item["mdId"]== xObj.codigo);
                  //mapeamos los servicios que se usan dentro de este bloque
                  mdEtiquetaxMD.forEach(p=>{
                    if(p.etiquetaId){
                      arrFiltroEtiqueta.push(new Filter("codigo","EQ",p.etiquetaId || ""));
                    }
                  });
                  let blen2 = Math.ceil(mdEtiquetaxMD.length / count); //block MD
                  let c = 0;
                  while (c < blen2 && bflag) {
                    let arrBloque1 = arrFiltroEtiqueta.slice(iii, eee);
                    arrBloque1.push(new Filter("activo", "EQ", true));
                    arrBloqEtiqueta = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "ETIQUETA", arrBloque1);
                    let bloqTempEtiqueta = mdEtiquetaxMD.slice(iii, eee);
                    iii = eee + i;
                    eee += count;
                    let d = 0;
                    while (d < bloqTempEtiqueta.length && bflag) {
                      let blq = bloqTempEtiqueta[d];
                      let obj = {};
                      rmdStateError = false;
                      obj.mdEsEtiquetaId = Util.onGetUUIDV4();
                      let payloadEstructura = arrBloqEstructura.results.find(p => p.codigo == blq["estructuraId"]);
                      if (payloadEstructura) {
                        if (payloadEstructura.tipoEstructuraId_iMaestraId == objEstructura.Procesos) {
                          obj.estructuraId_estructuraId = payloadEstructura.estructuraId;
                        } else {
                          bflag = false;
                          mdEnabled = false;
                          msg +=
                            "MD_ES_ETIQUETA: La estructura asociada no es la correcta \n";
                        }
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_ETIQUETA: No se encontró la estructura: " + blq["mdEstructuraId"] + "\n";
                      }
                      
                      let mdEstructuraId = arrMD_EST.filter(p => p.index == blq["mdEstructuraId"]);
                      if (mdEstructuraId.length > 0) {
                        obj.mdEstructuraId_mdEstructuraId = mdEstructuraId[0].mdEstructuraId;
                      } else{
                        bflag = false;
                        mdEnabled = false;
                        msg += `MD_ES_ETIQUETA: El número de MD_Estructura no fue encontrado en la posición ${blq["mdEsEtiquetaId"]}\n`;
                    
                      }

                      let mdIdFilt = arrMD.filter(p => p.codigo == blq["mdId"]);
                      if (mdIdFilt.length > 0) {
                        obj.mdId_mdId = mdIdFilt[0].mdId;
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += `MD_ES_ETIQUETA: El número de MD no fue encontrado en la posición ${blq["mdEsEtiquetaId"]}\n`;
                    
                      }

                      let etiquetaId = arrBloqEtiqueta.results.filter(p => p.codigo == blq["etiquetaId"]);
                      if (etiquetaId.length > 0) {
                        obj.etiquetaId_etiquetaId = etiquetaId[0].etiquetaId;
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += `MD_ES_ETIQUETA: El número de etiqueta no fue encontrado en la posición ${blq["mdEsEtiquetaId"]}\n`;
                      }

                      obj.orden = oThat.vCol(blq["orden"] || "", "", "int");
                      let aOrders = bloqTempEtiqueta.filter((pay) => pay.orden == obj.orden);
                      if (aOrders.length > 1) {
                        bflag = false;
                        mdEnabled = false;
                        msg += `MD_ES_ETIQUETA: El número de orden no fue encontrado en la posición ${blq["mdEsEtiquetaId"]}\n`;
                      }

                      if (oThat._empty.includes(obj.orden)) {
                        bflag = false;
                        mdEnabled = false;
                      }
                      obj.conforme = arrTrue.includes(oThat.vCol(blq["conforme"])) ? true : false;
                      obj.procesoMenor = arrTrue.includes(oThat.vCol(blq["procesoMenor"])) ? true : false;

                      if (bflag && mdEnabled) {
                        obj = { ...obj, ..._obj };
                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_ETIQUETA", obj).then((pay) => {
                            obj.detail = { code: "200", message: "Done!" };
                          }).catch((e) => {
                            obj.detail = {
                              code: e.statusCode,
                              title: "Error in position " + iii,
                              message: e.responseText,
                            };
                            console.log(e);
                          });
                      } else {
                        //ELIMINAMOS EL MD
                        await oThat.disableCascade(mdId, msg);
                        bflag =false;
                        obj.detail = {
                          code: "400",
                          title: "Error in position " + iii,
                          message: "Información corrupta",
                        };
                      }
                      obj.index = blq["mdEsEtiquetaId"];
                      let v0 = arrMD_ETI.find((item) => item.index === obj.index);
                      if (!v0) {
                        arrMD_ETI.push(obj);
                      }
                      d++;
                    }
                    c++;
                  }

                  //** ================ MD_ES_PASO ================= */
                  let iiii = 0;
                  let eeee = count;
                  let mdEsPaso = oData["MD_ES_PASO"] ? oData["MD_ES_PASO"] : [];
                  //filtramos el mdEsPaso x el codigo
                  let mdEsPasoxMD = mdEsPaso.filter((item) => item["mdId"] == xObj.codigo);
                  mdEsPasoxMD.forEach(p=>{
                    if(p.pasoId){
                      arrFiltroPaso.push(new Filter("codigo","EQ",p.pasoId || ""));
                    }
                  });
                  let blen3 = Math.ceil(mdEsPasoxMD.length / count); //block MD
                  let iteradorBloquePaso = 0;
                  while(iteradorBloquePaso < blen3 && bflag) {
                    let arrBloque = arrFiltroPaso.slice(iiii, eeee);
                    arrBloque.push(new Filter("activo", "EQ", true));
                    arrBloqPaso = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "PASO", arrBloque);
                    let bloqTempPaso = mdEsPasoxMD.slice(iiii, eeee);
                    iiii = eeee + i;
                    eeee += count;
                    let iteradorPaso = 0;
                    while(iteradorPaso < bloqTempPaso.length && bflag){
                      let blq = bloqTempPaso[iteradorPaso];
                      rmdStateError = false;
                      let obj = {};
                      obj.mdEstructuraPasoId = Util.onGetUUIDV4();
                      obj.mdEstructuraPasoIdDepende = obj.mdEstructuraPasoId;

                      obj.mdEsEtiquetaId_mdEsEtiquetaId = oThat.vCol(blq["mdEsEtiquetaId"], null);
                      if (!oThat._empty.includes(obj.mdEsEtiquetaId_mdEsEtiquetaId)) {
                        let id = arrMD_ETI.filter((pay) => pay.index == blq["mdEsEtiquetaId"]).length > 0 ? arrMD_ETI.filter((pay) => pay.index == blq["mdEsEtiquetaId"])[0].mdEsEtiquetaId : null;
                        if (id) {
                          obj.mdEsEtiquetaId_mdEsEtiquetaId = id;
                        } else {
                          obj.mdEsEtiquetaId_mdEsEtiquetaId = null;
                        }
                      }

                      let pasoId = arrBloqPaso.results.filter(p => p.codigo == blq["pasoId"]);
                      if (pasoId.length > 0) {
                        obj.pasoId_pasoId = pasoId[0].pasoId;
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_PASO: El código de paso no fue encontrado  " + blq["mdEstructuraPasoId"] + "\n";
                      }
                      
                      let mdEstructuraId = arrMD_EST.filter(p => p.index == blq["mdEstructuraId"]);
                      if(mdEstructuraId.length > 0){
                        obj.mdEstructuraId_mdEstructuraId = mdEstructuraId[0].mdEstructuraId;
                      }else{
                        bflag = false;
                        mdEnabled = false;
                        msg += `MD_ES_PASO: El número de MD_Estructura no fue encontrado en la posición ${blq["mdEstructuraPasoId"]}\n`;
                    
                      }

                      let payloadEstructura = arrBloqEstructura.results.find(p => p.codigo == blq["estructuraId"]);
                      if (payloadEstructura) {
                        if (payloadEstructura.tipoEstructuraId_iMaestraId == objEstructura.Procesos) {
                          if (oThat._empty.includes(obj.mdEsEtiquetaId_mdEsEtiquetaId)) {
                            bflag = false;
                            mdEnabled = false;
                            msg +="MD_ES_PASO: El paso " + blq["pasoId"] + " debe tener asociado una etiqueta en la posición" + blq["mdEstructuraPasoId"] + "  \n";
                          }
                        } else {
                          obj.mdEsEtiquetaId_mdEsEtiquetaId = null;
                        }
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_PASO: No se encontró la estructura: " + blq["mdEstructuraId"] + "\n";
                      }
                      
                      obj.estructuraId_estructuraId = payloadEstructura.estructuraId;
                      if (!obj.estructuraId_estructuraId) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_PASO: El número de estructura no fue encontrado  " + blq["mdEstructuraPasoId"] + " \n";
                      }

                      obj.mdId_mdId = arrMD.filter((pay) => pay.codigo == blq["mdId"]).length > 0 ? arrMD.filter((pay) => pay.codigo == blq["mdId"])[0].mdId : null;
                      if (!obj.mdId_mdId) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_PASO: El MD no fue encontrado  " + blq["mdEstructuraPasoId"] + " \n";
                      }
                      obj.orden = oThat.vCol(blq["orden"], null, "int");
                      let aOrders = [];
                      if (obj.mdEsEtiquetaId_mdEsEtiquetaId) {
                        aOrders = bloqTempPaso.filter((pay) => pay.orden == obj.orden && pay.mdEstructuraId == blq["mdEstructuraId"] && pay.mdEsEtiquetaId == blq["mdEsEtiquetaId"]);
                      } else {
                        aOrders = bloqTempPaso.filter((pay) => pay.orden == obj.orden && pay.mdEstructuraId == blq["mdEstructuraId"]);
                      }

                      if (aOrders.length > 1) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_PASO: Existe un número de orden duplicados  " + blq["mdEstructuraPasoId"] + " \n";
                      }

                      obj.estadoCC = arrTrue.includes(blq["estadoCC"]) ? true : false;
                      obj.estadoMov = arrTrue.includes(blq["estadoMov"]) ? true : false;
                      obj.pmop = arrTrue.includes(blq["pmop"]) ? true : false;
                      obj.genpp = arrTrue.includes(blq["genpp"]) ? true : false;
                      obj.tab = arrTrue.includes(blq["tab"]) ? true : false;
                      obj.edit = arrTrue.includes(blq["edit"]) ? true : false;
                      obj.rpor = arrTrue.includes(blq["rpor"]) ? true : false;
                      obj.vb = arrTrue.includes(blq["vb"]) ? true : false;
                      obj.formato = arrTrue.includes(blq["formato"]) ? true : false;
                      obj.colorHex = oThat.vCol(blq["colorHex"] || "", null);
                      obj.colorRgb = oThat.vCol(blq["colorRgb"] || "", null);
                      if (!oThat._empty.includes(obj.colorHex) && !oThat._empty.includes(obj.colorRgb)) {
                        obj.formato = true;
                      }

                      obj.tipoDatoId_iMaestraId = objTipoDato[oThat.vCol(blq["tipoDatoId"], null)];
                      obj.tipoDatoIdAnterior_iMaestraId = objTipoDato[oThat.vCol(blq["tipoDatoId"], null)];
                      if (!obj.tipoDatoId_iMaestraId) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_PASO: El TipoDato no fue encontrado   " + blq["mdEstructuraPasoId"] + "\n";
                      }
                      obj.valorFinal = oThat.vCol(blq["valorFinal"], null);
                      obj.valorInicial = oThat.vCol(blq["valorInicial"], null);
                      obj.decimales = oThat.vCol(blq["decimales"], null);
                      obj.margen = oThat.vCol(blq["margen"], null);
                      //SIN TIPO DE DATO
                      if ([
                          objTipoDato.TDD01,
                          objTipoDato.TDD03,
                          objTipoDato.TDD04,
                          objTipoDato.TDD05,
                          objTipoDato.TDD07,
                          objTipoDato.TDD08,
                          objTipoDato.TDD09,
                          objTipoDato.TDD10,
                          objTipoDato.TDD11,
                          objTipoDato.TDD13,
                          objTipoDato.TDD15,
                          objTipoDato.TDD16,
                          objTipoDato.TDD18,
                        ].includes(obj.tipoDatoId_iMaestraId)) {
                        obj.valorFinal = null;
                        obj.valorInicial = null;
                        obj.decimales = null;
                        obj.margen = null;
                      }
                      //DECIMALES
                      else if ([objTipoDato.TDD02, objTipoDato.TDD14, objTipoDato.TDD17, objTipoDato.TDD19].includes(obj.tipoDatoId_iMaestraId)) {
                        if (oThat._empty.includes(obj.decimales)) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_PASO: Los decimales no fueron encontrados  " + blq["mdEstructuraPasoId"] + " \n";
                        }
                      } else if ([objTipoDato.TDD12].includes(obj.tipoDatoId_iMaestraId)) {
                        if (oThat._empty.includes(obj.decimales) && oThat._empty.includes(obj.valorInicial) && oThat._empty.includes(obj.valorFinal) && oThat._empty.includes(obj.margen)) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_PASO: Valor Final y marge no fueron encontrados  " + blq["mdEstructuraPasoId"] + " \n";
                        }
                      }

                      //ERROR mandante 150
                      if (obj.tipoDatoId_iMaestraId == objTipoDato["TDD16"]) {
                        obj.clvModelo = this.aClvMo.results.filter((item) => item.Vlsch == oThat.vCol(blq["clvModelo"], null)).length > 0 ? this.aClvMo.results.filter((item) => item.Vlsch == oThat.vCol(blq["clvModelo"], null))[0].Vlsch : null;
                        if (!obj.clvModelo) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_PASO: Clave modelo no fue encontrado  " + blq["mdEstructuraPasoId"] + " \n";
                        }
                        obj.puestoTrabajo = oThat.vCol(blq["puestoTrabajo"], null);
                        if (oThat._empty.includes(obj.puestoTrabajo)) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_PASO: Puesto de trabajo no fue encontrado " + blq["mdEstructuraPasoId"] + "\n";
                        }
                        obj.automatico = arrTrue.includes(oThat.vCol(blq["automatico"])) ? true : false;
                      } else {
                        obj.automatico = null;
                      }

                      obj.depende = oThat._empty.includes(oThat.vCol(blq["depende"], null)) ? null : blq["depende"];
                      if (!oThat._empty.includes(obj.depende)) {
                        let payloaduuId = arrMD_PASO.filter((y) => y.pasoIndex == obj.depende);
                        if (payloaduuId.length >= 1) {
                          obj.depende = String(payloaduuId[0].pasoIndex);
                        }
                        let dependeMdEstructura = oThat._empty.includes(oThat.vCol(blq["dependeMdEstructuraPasoId"], null)) ? null : blq["dependeMdEstructuraPasoId"];
                        let pasoDepende = arrMD_PASO.find((y) => y.index == dependeMdEstructura);
                        if (pasoDepende) {
                          obj.dependeMdEstructuraPasoId = String(pasoDepende.mdEstructuraPasoId);
                        } else {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_PASO: El campo depende no fue encontrado en la posición" + blq["mdEstructuraPasoId"];
                        }
                      } else {
                        obj.depende = "";
                      }

                      if (bflag && mdEnabled) {
                        obj = { ...obj, ..._obj };
                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_PASO", obj).then(() => {
                            obj.detail = {
                              code: "200",
                              title: "Saved",
                              message: "Done!",
                            };
                          }).catch(async (e) => {
                            obj.detail = {
                              code: e.statusCode,
                              title: "Error in position ",
                              message: e.responseText,
                            };
                            console.log(e);
                            await oThat.disableCascade(mdId, msg);
                            bflag =false;
                          });
                      } else {
                        await oThat.disableCascade(mdId, msg);
                        bflag =false;
                        obj.detail = {
                          code: "400",
                          title: "Error in position " + iiii,
                          message: "Información corrupta",
                        };
                      }
                      obj.index = blq["mdEstructuraPasoId"];
                      obj.pasoIndex = blq["pasoId"];
                      let v0 = arrMD_PASO.find((item) => item.index === obj.index);
                      if (!v0) {
                        arrMD_PASO.push(obj);
                      }
                      iteradorPaso++;
                    }
                    iteradorBloquePaso++;
                  }

                  //** ================ MD_ES_EQUIPO ================= */
                  let iiiii = 0;
                  let eeeee = count;
                  let mdEsEquipo = oData["MD_ES_EQUIPO"] ? oData["MD_ES_EQUIPO"] : [];
                  let mdEsEquipoxMD = mdEsEquipo.filter((item)=> item["mdId"]== xObj.codigo);
                  //mapeamos los servicios que se usan dentro de este bloque
                  mdEsEquipoxMD.forEach(p=>{
                    if(p.equipoId){
                      arrFiltroMDEquipo.push(new Filter("equnr","EQ",p.equipoId || ""));
                    }
                  });
                  let blen4 = Math.ceil(mdEtiquetaxMD.length / count); //block MD
                  let iteradorBloqueEquipo = 0;
                  while(iteradorBloqueEquipo < blen4 && bflag){
                    let arrBloque = arrFiltroMDEquipo.slice(iiiii, eeeee);
                    arrBloque.push(new Filter("activo", "EQ", true));
                    let arrBloqEquipo = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "EQUIPO", arrBloque);
                    let bloqTempEquipo = mdEsEquipoxMD.slice(iiiii, eeeee);
                    iiiii = eeeee + i;
                    eeeee += count;
                    let iteradorEquipo = 0;
                    while (iteradorEquipo < bloqTempEquipo.length && bflag) {
                      let blq = bloqTempEquipo[iteradorEquipo];
                      rmdStateError = false;
                      let obj = {};
                      obj.mdEstructuraEquipoId = Util.onGetUUIDV4();

                      obj.mdEstructuraId_mdEstructuraId = arrMD_EST.filter((item) => item.index == blq["mdEstructuraId"]).length > 0 ? arrMD_EST.filter((item) => item.index == blq["mdEstructuraId"])[0]["mdEstructuraId"] : null;
                      if (oThat._empty.includes(obj.mdEstructuraId_mdEstructuraId)) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_EQUIPO: MD_ESTRUCTURA no fue encontrado \n";
                      }
                      let payloadEstructura = arrBloqEstructura.results.find(p => p.codigo == blq["estructuraId"]);
                      if (payloadEstructura) {
                        if (payloadEstructura.tipoEstructuraId_iMaestraId == objEstructura.Equipos || payloadEstructura.tipoEstructuraId_iMaestraId == objEstructura.Procesos) {
                          obj.estructuraId_estructuraId = payloadEstructura.estructuraId;
                        } else {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_EQUIPO: La estructura asociada no es la correcta \n";
                        }
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_EQUIPO: No se encontró la estructura: " + blq["mdEstructuraId"] + "\n";
                      }

                      obj.mdId_mdId = arrMD.filter((pay) => pay.codigo == blq["mdId"]).length > 0 ? arrMD.filter((pay) => pay.codigo == blq["mdId"])[0].mdId : null;
                      if (oThat._empty.includes(obj.mdId_mdId)) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_EQUIPO: MDID no fue encontrado \n";
                      }

                      obj.orden = oThat.vCol(blq["orden"], null);
                      let aOrders = bloqTempEquipo.filter((pay) => pay.orden == obj.orden);
                      if (aOrders.length > 1) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_EQUIPO: existe un código de orden con el mismo valor \n";
                      }

                      obj.equipoId_equipoId = oThat.vCol(blq["equipoId"], null);
                      if (!oThat._empty.includes(obj.equipoId_equipoId)) {
                        let cod = obj.equipoId_equipoId;
                        let v0 = await oThat.findEquipoOp(cod, sucursal);
                        if (!oThat._empty.includes(v0.responseText) || v0.length == 0) {
                          bflag = false;
                          mdEnabled = false;
                          if (v0.responseText) {
                            console.log("error", v0.responseText);
                            msg += "MD_ES_EQUIPO " + "código de equipo " + cod + " " + JSON.parse(v0.responseText).error.message.value + "\n";
                          }
                        } else {
                          //Existe , buscar y actualizar
                          v0 = v0[0];
                          let o = {};
                          o.aufnr = "";
                          o.werks = v0.Swerk;
                          o.auart = "";
                          o.ktext = "";
                          o.ilart = "";
                          o.sstat = v0.Stat;
                          o.ustat = "";
                          o.ecali = "";
                          o.gstrp = null;
                          o.gltrp = null;
                          o.tplnr = v0.SuperiorFuncloc;
                          o.pltxt = v0.Funclocstrucidentifyingobjdes2;
                          o.equnr = v0.Equipment;
                          o.eqtyp = v0.Eqtyp;
                          o.estat = v0.Txt30;
                          o.eqktx = v0.Denom;
                          o.inbdt = v0.Inbdt;
                          o.ctext = v0.PpWkctr === "00000000" ? "" : v0.PpWkctr;
                          o.abckz = v0.Abcindic;
                          o.denom = v0.Descmarcamodel;
                          // o.codigoGaci= v0.CodigoGaci;
                          o.tipoId_iMaestraId = sIdTipoEquipo;
                          let eq = arrBloqEquipo.results.filter(p => p.equnr == blq["equipoId"]);
                          if (eq.length > 0) {
                            o.equipoId = eq[0].equipoId;
                            await oThat.updateTx(oThat.mainModelv2, "EQUIPO", o.equipoId, o);
                          } else {
                            o = { ...o, ..._obj };
                            o.equipoId = Util.onGetUUIDV4();
                            await oThat.createTx(oThat.mainModelv2, "EQUIPO", o);
                          }
                          obj.equipoId_equipoId = o.equipoId;
                        }
                      } else {
                        bflag = false;
                        mdEnabled = false;
                      }

                      if (bflag && mdEnabled) {
                        obj = { ...obj, ..._obj };
                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_EQUIPO", obj).then((pay) => {
                            obj.detail = {
                              code: "200",
                              title: "Saved ",
                              message: "Done!",
                            };
                          }).catch((e) => {
                            obj.detail = {
                              code: e.statusCode,
                              title: "Error in position ",
                              message: e.responseText,
                            };
                            console.log(e);
                          });
                      } else {
                        //ELIMINAMOS EL MD
                        await oThat.disableCascade(mdId, msg);
                        bflag =false;
                        obj.detail = {
                          code: "400",
                          title: "Error in position " + iiiii,
                          message: "Información corrupta",
                        };
                      }

                      obj.index = blq["mdEstructuraEquipoId"];
                      let v0 = arrMD_ES_EQUIPO.find((item) => item.index === obj.index);
                      if (!v0) {
                        arrMD_ES_EQUIPO.push(obj);
                      }
                      iteradorEquipo++;
                    }
                    iteradorBloqueEquipo++;
                  }

                  //** ================ MD_RECETA ================= */
                  let irece = 0;
                  let erece = count;
                  let mdReceta = oData["MD_RECETA"] ? oData["MD_RECETA"] : [];
                  let mdRecetaxMD = mdReceta.filter((item) => item["mdId"] == xObj.codigo);
                  //mapeamos los servicios que se usan dentro de este bloque
                  mdRecetaxMD.forEach(p=>{
                    if(p.recetaId){
                      arrFiltroMDReceta.push(new Filter("Matnr","EQ",p.recetaId || ""));
                    }
                  });
                  let blen5 = Math.ceil(mdRecetaxMD.length / count); //block MD
                  let iteradorBloqueReceta = 0;
                  while(iteradorBloqueReceta < blen5 && bflag){
                    let arrBloque1 = arrFiltroMDReceta.slice(irece, erece);
                    arrBloque1.push(new Filter("activo", "EQ", true));

                    let arrBloqReceta = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "RECETA", arrBloque1);
                    let bloqTempReceta = mdRecetaxMD.slice(irece, erece);
                    irece = erece + i;
                    erece += count;
                    let iteradorReceta = 0;
                    while(iteradorReceta < bloqTempReceta.length && bflag){
                      let blq = bloqTempReceta[iteradorReceta];
                      rmdStateError = false;
                      let obj = {};
                      obj.mdRecetaId = Util.onGetUUIDV4();
                      obj.mdId_mdId = arrMD.filter((pay) => pay.codigo == blq["mdId"]).length > 0 ? arrMD.filter((pay) => pay.codigo == blq["mdId"])[0].mdId : null;
                      obj.orden = oThat.vCol(blq["orden"], null);
                      let aOrders = bloqTempReceta.filter((pay) => pay.orden == obj.orden);
                      if (aOrders.length > 1) {
                        bflag = false;
                        mdEnabled = false;
                      }
                      obj.recetaId_recetaId = null;
                      //ERROR EN MANDANTE 150
                      var d = {};
                      d.Matnr = oThat.vCol(blq["recetaId"], null);
                      d.Verid = oThat.vCol(blq["version"], null);
                      if (oThat._empty.includes(d.Matnr) || oThat._empty.includes(d.Verid)) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_RECETA: El código receta y versión no fueron encontrados \n";
                      } else if (arrMD_RECETA.filter((pay) => pay.Matnr == d.Matnr && pay.Verid == d.Verid).length > 0) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_RECETA : código de receta " + d.Matnr + " " + d.Verid + "Ya fue asociado ";
                      } else {
                        let oReceta = await oThat.findRecetaOp(d, sucursal, nivel);
                        if (oReceta.responseText) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_RECETA : código de receta " + d.Matnr + " " + JSON.parse(oReceta.responseText).error.message.value + "\n";
                        } else if (oReceta.length > 0) {
                          oReceta = oReceta[0];
                          //Buscamos si existe
                          let idReceta = await oThat.onGetData("RECETA", ["Matnr", "Verid"], [blq["recetaId"], blq["version"]], "recetaId", "array");
                          let o = {};
                          o.Matnr = oReceta["Matnr"];
                          o.Werks = oReceta["Werks"];
                          o.Verid = oReceta["Verid"];
                          o.Bdatu = oReceta["Bdatu"];
                          o.Adatu = oReceta["Adatu"];
                          o.Stlal = oReceta["Stlal"];
                          o.Plnnr = oReceta["Plnnr"];
                          o.Alnal = oReceta["Alnal"];
                          o.Text1 = oReceta["Text1"];
                          o.Bstmi = oReceta["Bstmi"];
                          o.Bstma = oReceta["Bstma"];
                          o.PrfgF = oReceta["PrfgF"];
                          o.Mksp = oReceta["Mksp"];
                          o.Atwrt = oReceta["Atwrt"];
                          o.Matkl = oReceta["Matkl"];
                          o.Meins = oReceta["Meins"];
                          o.flagEnsayosap = false;
                          o.Dispo = oReceta["Dispo"];
                          o.Dsnam = oReceta["Dsnam"];
                          o.Caract = oReceta["Caract"];
                          o.Frtme = oReceta["Frtme"];
                          o.Menge = oReceta["Menge"];
                          o.Atwrt2 = oReceta["Atwrt2"];
                          o.Caract2 = oReceta["Caract2"];
                          o.TextoCab = oReceta["TextoCab"];
                          o.Mdv01 = oReceta["Mdv01"];
                          o.Atwrt3 = oReceta["Atwrt3"];
                          o = { ...o, ..._obj };
                          if (!oThat._empty.includes(idReceta)) {
                            //UPDATE
                            o.recetaId = idReceta;
                            await oThat.updateTx(oThat.mainModelv2, "RECETA", idReceta, o);
                          } else {
                            o.recetaId = Util.onGetUUIDV4();
                            await oThat.createTx(oThat.mainModelv2, "RECETA", o);
                          }
                          obj.recetaId_recetaId = o.recetaId;

                          let sFilter = [];
                          sFilter.push(new Filter("Matnr", "EQ", o.Matnr));
                          sFilter.push(new Filter("Werks", "EQ", sucursal));
                          sFilter.push(
                            new Filter("Stlal", "EQ", parseInt(o.Stlal).toString())
                          );
                          let aListInsumos = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "MaterialSet", sFilter);
                          console.log(aListInsumos);
                          let f = [];
                          f.push(new Filter("mdId_mdId", "EQ", obj.mdId_mdId));
                          let sExpand = "estructuraId";
                          let aMdEstructura = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ESTRUCTURA", f, sExpand);
                          let sMdIdEstructura = "";
                          let sIdEstructura = "";
                          //Buscamos la estructura con el tip ode dato insumo
                          for await (const item of aMdEstructura.results) {
                            if (item.estructuraId.tipoEstructuraId_iMaestraId === objEstructura.Formula) {
                              sMdIdEstructura = item.mdEstructuraId;
                              sIdEstructura = item.estructuraId_estructuraId;
                            }
                          }

                          if (sMdIdEstructura === "") {
                            let aEstructura = await oThat.onGetData("ESTRUCTURA", "tipoEstructuraId_iMaestraId", objEstructura.Formula);
                            let mdEstrucuturaId = Util.onGetUUIDV4();
                            let dDate = new Date();
                            let oMdEstructuraSave = {
                              terminal: null,
                              fechaRegistro: dDate,
                              usuarioRegistro: userName,
                              activo: true,
                              mdEstructuraId: mdEstrucuturaId,
                              mdId_mdId: obj.mdId_mdId,
                              estructuraId_estructuraId: aEstructura.estructuraId,
                              orden: Number(obj.orden) + 1,
                            };

                            sIdEstructura = oMdEstructuraSave.estructuraId_estructuraId;
                            sMdIdEstructura = mdEstrucuturaId;

                            await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", oMdEstructuraSave);
                          }
                          let arrPromiseAll = [];
                          for await (const itemI of aListInsumos.results) {
                            let o = {};
                            o.mdId_mdId = obj.mdId_mdId;
                            o.mdRecetaId_mdRecetaId = obj.mdRecetaId;
                            o.mdEstructuraId_mdEstructuraId = sMdIdEstructura;
                            o.estructuraId_estructuraId = sIdEstructura;
                            o.cantidadRm = 0;
                            o.Matnr = itemI.Matnr;
                            o.Werks = itemI.Werks;
                            o.Maktx = itemI.Maktx;
                            o.ItemCateg = itemI.ItemCateg;
                            o.ItemNo = itemI.ItemNo;
                            o.Component = itemI.Component;
                            o.CompQty = itemI.CompQty;
                            o.CompUnit = itemI.CompUnit;
                            o.ItemText1 = itemI.ItemText1;
                            o.ItemText2 = itemI.ItemText2;
                            o.Txtadic = itemI.Txtadic;
                            o.AiPrio = itemI.AiPrio;
                            //on Get data
                            // let id = await oThat.onGetData("MD_ES_RE_INSUMO","Component", o.Component,"estructuraRecetaInsumoId");
                            o = { ...o, ..._obj };
                            // if (!oThat._empty.includes(id)) {
                            //   await oThat.updateTx(oThat.mainModelv2, "MD_ES_RE_INSUMO", id,o);
                            // } else{
                            o.estructuraRecetaInsumoId = Util.onGetUUIDV4();
                            await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_RE_INSUMO", o);
                            // }
                            let insum = arrMD_RE_INSUMO.find((pay) => pay.Component == o.Component);
                            arrPromiseAll.push(o);
                            if (!insum) {
                              arrMD_RE_INSUMO.push(o);
                            }
                          }
                        }
                      }
                      if (oThat._empty.includes(obj.recetaId_recetaId)) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_RECETA: Verificar si existe versión, receta y lista de materiales. \n";
                      }

                      if (bflag && mdEnabled) {
                        obj = { ...obj, ..._obj };
                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_RECETA", obj).then((pay) => {
                            obj.Matnr = d.Matnr;
                            obj.Verid = d.Verid;
                            obj.detail = {
                              code: "200",
                              title: "Saved ",
                              message: "Done!",
                            };
                          }).catch((e) => {
                            obj.detail = {
                              code: e.statusCode,
                              title: "Error in position " + irece,
                              message: e.responseText,
                            };
                            console.log(e);
                          });
                      } else {
                        await oThat.disableCascade(mdId, msg);
                        bflag =false;
                      }
                      obj.index = blq["mdRecetaId"];
                      let v0 = arrMD_RECETA.find((item) => item.index === obj.index);
                      if (!v0) {
                        arrMD_RECETA.push(obj);
                      }
                      iteradorReceta++;
                    }
                    iteradorBloqueReceta++;  
                  }

                  //** ================ MD_ES_UTENSILIO ================= */
                  let iiiiiii = 0;
                  let eeeeeee = count;
                  let mdEsUtensilio = oData["MD_ES_UTENSILIO"] ? oData["MD_ES_UTENSILIO"] : [];
                  let mdEsUtensilioxMD = mdEsUtensilio.filter((item)=> item["mdId"]== xObj.codigo);
                  //mapeamos los servicios que se usan dentro de este bloque
                  mdEsUtensilioxMD.forEach(p=>{
                    if(p.utensilioId){
                      arrFiltroMDESUtensilio.push(new Filter("codigo","EQ", p.utensilioId || ""));
                      arrFiltroMDESUtensilio.push(new Filter("estadoId_iMaestraId","EQ", 2));
                    }
                  });
                  let blen6 = Math.ceil(mdEsUtensilioxMD.length / count); //block MD
                  let iteradorBloqueUtensilio = 0;
                  while (iteradorBloqueUtensilio < blen6 && bflag) {
                    let arrBloque = arrFiltroMDESUtensilio.slice(iiiiiii, eeeeeee);
                    arrBloque.push(new Filter("activo", "EQ", true));
                    let arrBloqUtensilio = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "UTENSILIO", arrBloque);
                    let bloqTempUtensilio = mdEsUtensilioxMD.slice(iiiiiii, eeeeeee);
                    iiiiiii = eeeeeee+i;
                    eeeeeee += count;
                    let iteradorUtensilio = 0;
                    while (iteradorUtensilio < bloqTempUtensilio.length && bflag) {
                      let blq = bloqTempUtensilio[iteradorUtensilio];
                      rmdStateError = false;
                      let obj = {};
                      obj.mdEstructuraUtensilioId = Util.onGetUUIDV4();
                      obj.mdEstructuraId_mdEstructuraId = arrMD_EST.filter((item) => item.index == blq["mdEstructuraId"]).length > 0 ? arrMD_EST.filter((item) => item.index == blq["mdEstructuraId"])[0]["mdEstructuraId"] : null;
                      if (oThat._empty.includes(obj.mdEstructuraId_mdEstructuraId)) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_UTENSILIO falta asociar MD_ESTRUCTURA\n";
                      }
                      let payloadEstructura = arrBloqEstructura.results.filter(p => p.codigo == blq["estructuraId"]);
                      if (payloadEstructura) {
                        obj.estructuraId_estructuraId = payloadEstructura[0].estructuraId;
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_UTENSILIO: No se encontró la estructura: " + blq["mdEstructuraId"] + "\n";
                      }
                      obj.mdId_mdId = arrMD.filter((pay) => pay.codigo == blq["mdId"]).length > 0 ? arrMD.filter((pay) => pay.codigo == blq["mdId"])[0].mdId : null;
                      if (oThat._empty.includes(obj.mdId_mdId)) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_UTENSILIO falta asociar MD\n";
                      }

                      let utensilioId = arrBloqUtensilio.results.filter(p => p.codigo == blq["utensilioId"]);
                      if (utensilioId.length > 0) {
                        obj.utensilioId_utensilioId = utensilioId[0].utensilioId;
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += "Error al momento de buscar el utensilio " + blq["utensilioId"] + "\n";
                      }
                      obj.orden = oThat.vCol(blq["orden"], null);
                      let aOrders = bloqTempUtensilio.filter((pay) => pay.orden == obj.orden);
                      if (aOrders.length > 1) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_UTENSILIO: Error en el orden de registros";
                      }
                      if (bflag && mdEnabled) {
                        obj = { ...obj, ..._obj };
                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_UTENSILIO", obj).then((pay) => {
                            obj.detail = {
                              code: "200",
                              title: "Saved ",
                              message: "Done!",
                            };
                          }).catch(async (e) => {
                            obj.detail = {
                              code: e.statusCode,
                              title: "Error in position " + iiiiiii,
                              message: e.responseText,
                            };
                            msg += "Error al momento de registrar MD_ES_UTENSILIO " + e.responseText + "\n";
                            await oThat.disableCascade(mdId, msg);
                            bflag =false;
                          });
                      } else {
                        await oThat.disableCascade(mdId, msg);
                        bflag =false;
                      }
                      obj.index = blq["mdEstructuraId"];
                      let v0 = arrMD_ES_UTEN.find((pay) => pay.index == obj.index);
                      if (!v0) {
                        arrMD_ES_UTEN.push(obj);
                      }
                      iteradorUtensilio++;
                    }
                    iteradorBloqueUtensilio++;
                  }

                  //** ================ MD_ES_ESPECIFICACION ================= */
                  let iespe = 0;
                  let eespe = count;
                  let mdEspeficaciones = oData["MD_ES_ESPECIFICACION"] ? oData["MD_ES_ESPECIFICACION"] : [];
                  let mdEspeficacionesxMD = mdEspeficaciones.filter((item)=> item["mdId"]== xObj.codigo);
                  //mapeamos los servicios que se usan dentro de este bloque
                  mdEspeficacionesxMD.forEach(p=>{
                    if(p.ensayoPadreId){
                      arrFiltroMDESEspecificacion.push(new Filter("iMaestraId","EQ", p.ensayoPadreId || ""));
                    }
                  });
                  let blen7 = Math.ceil(mdEspeficacionesxMD.length / count); //block MD
                  let iteradorBloqueEspecificacion = 0;
                  while (iteradorBloqueEspecificacion < blen7 && bflag) {
                    let arrBloque1 = arrFiltroMDESEspecificacion.slice(iespe, eespe);
                    arrBloque1.push(new Filter("activo", "EQ", true));
                    let arrBloqEspecificacion = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MAESTRA", arrBloque1);
                    let bloqTempEspecificacion = mdEspeficacionesxMD.slice(iespe, eespe);
                    iespe = eespe + i;
                    eespe += count;
                    let iteradorEspecificacion = 0;
                    while (iteradorEspecificacion < bloqTempEspecificacion.length && bflag) {
                      let blq = bloqTempEspecificacion[iteradorEspecificacion];
                      rmdStateError = false;
                      let obj = {};
                      obj.mdEstructuraEspecificacionId = Util.onGetUUIDV4();
                      obj.mdEstructuraId_mdEstructuraId = arrMD_EST.filter((item) => item.index == blq["mdEstructuraId"]).length > 0 ? arrMD_EST.filter((item) => item.index == blq["mdEstructuraId"])[0]["mdEstructuraId"] : null;
                      if (oThat._empty.includes(obj.mdEstructuraId_mdEstructuraId)) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_ESPECIFICACION falta asociar MD_ESTRUCTURA\n";
                      }

                      let payloadEstructura = arrBloqEstructura.results.find(p => p.codigo == blq["estructuraId"]);
                      if (payloadEstructura) {
                        if (payloadEstructura.tipoEstructuraId_iMaestraId == objEstructura.Especificacion) {
                          obj.estructuraId_estructuraId = payloadEstructura.estructuraId;
                        } else {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_ESPECIFICACION falta asociar ESTRUCTURA correcta \n";
                        }
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_ESPECIFICACION error al asociar ESTRUCTURA \n";
                      }
                      
                      if (!blq["ensayoPadreSap"]) {
                        let ensayoPadreId = arrBloqEspecificacion.results.filter(p => p.iMaestraId == blq["ensayoPadreId"]);
                        if (ensayoPadreId.length > 0) {
                          obj.ensayoPadreId_iMaestraId = ensayoPadreId[0].iMaestraId;
                        } else {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_ESPECIFICACION falta asociar el ensayoPadre\n";
                        }
                      }
                      
                      obj.mdId_mdId = arrMD.filter((pay) => pay.codigo == blq["mdId"]).length > 0 ? arrMD.filter((pay) => pay.codigo == blq["mdId"])[0].mdId : null;

                      if (oThat._empty.includes(obj.mdId_mdId)) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_ESPECIFICACION falta asociar MD\n";
                      }
                      obj.ensayoPadreSAP = oThat.vCol(blq["ensayoPadreSAP"], null);

                      obj.ensayoHijo = oThat.vCol(blq["ensayoHijo"], null);
                      obj.especificacion = oThat.vCol(blq["especificacion"], null);
                      obj.tipoDatoId_iMaestraId = null;
                      obj.valorInicial = oThat.vCol(blq["valorInicial"], null);
                      obj.valorFinal = oThat.vCol(blq["valorFinal"], null);
                      obj.margen = oThat.vCol(blq["margen"], null);
                      obj.decimales = oThat.vCol(blq["decimales"], null);
                      obj.tipoDatoId_iMaestraId = objTipoDato[oThat.vCol(blq["tipoDatoId"], null)];
                      if ([objTipoDato.TDD01, objTipoDato.TDD15].includes(obj.tipoDatoId_iMaestraId)) {
                        obj.valorFinal = null;
                        obj.valorFinal = null;
                        obj.margen = null;
                        obj.decimales = null;
                      } else if (objTipoDato.TDD06 == obj.tipoDatoId_iMaestraId) {
                        if (oThat._empty.includes(obj.decimales)) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ESPECIFICACION: Falta ingresar decimales \n";
                        }
                      } else if (objTipoDato.TDD12 == obj.tipoDatoId_iMaestraId) {
                        if (oThat._empty.includes(obj.valorInicial) || oThat._empty.includes(obj.valorFinal) || oThat._empty.includes(obj.margen) || oThat._empty.includes(obj.decimales)) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ESPECIFICACION: Falta ingresar los campos \n";
                        }
                      }
                      obj.orden = oThat.vCol(blq["orden"], null);
                      obj.Merknr = oThat.vCol(blq["Merknr"], null);

                      if (bflag && mdEnabled) {
                        obj = { ...obj, ..._obj };
                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_ESPECIFICACION", obj).then((pay) => {
                            obj.detail = { code: "200", message: "Done!" };
                          }).catch(async (e) => {
                            obj.detail = {
                              code: e.statusCode,
                              title: "Error in position " + iespe,
                              message: e.responseText,
                            };
                            msg += "Error al momento de registrar MD_ES_ESPECIFICACION " + e.responseText;
                            await oThat.disableCascade(mdId, msg);
                            bflag = false;
                          });
                      } else {
                        await oThat.disableCascade(mdId, msg);
                        bflag = false;
                      }
                      obj.index = blq["mdEstructuraEspecificacionId"];
                      let v0 = arrMDESPECIF.find((pay) => pay.index == obj.index);
                      if (!v0) {
                        arrMDESPECIF.push(obj);
                      }
                      iteradorEspecificacion++;
                    }
                    iteradorBloqueEspecificacion++;
                  }

                  //** ================ MD_ES_PASO_INSUMO_PASO ================= */
                  let ipasoinsu = 0;
                  let epasoinsu = count;
                  let mdPasoInsumoPaso = oData["MD_ES_PASO_INSUMO_PASO"] ? oData["MD_ES_PASO_INSUMO_PASO"] : [];
                  let mdPasoInsumoPasoxMD = mdPasoInsumoPaso.filter((item) => item["mdId"] == xObj.codigo);
                  let blen8 = Math.ceil(mdPasoInsumoPasoxMD.length / count); //block MD
                  //mapeamos los servicios que se usan dentro de este bloque
                  mdPasoInsumoPasoxMD.forEach(p=>{
                    if(p.pasoHijoId){
                      arrFiltroMDPasoHijo.push(new Filter("codigo","EQ", p.pasoHijoId || ""));
                    }
                  });
                  let iteradorBloquePasoInsumo = 0;
                  while (iteradorBloquePasoInsumo < blen8 && bflag) {
                    let arrBloque = arrFiltroMDPasoHijo.slice(ipasoinsu, epasoinsu);
                    arrBloque.push(new Filter("activo", "EQ", true));
                    arrBloqPasoHijo = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "PASO", arrBloque);
                    let bloqTempPasoInsumo = mdPasoInsumoPasoxMD.slice(ipasoinsu, epasoinsu);
                    ipasoinsu = epasoinsu + i;
                    epasoinsu += count;
                    let iteradorPasoInsumo = 0;
                    while (iteradorPasoInsumo < bloqTempPasoInsumo.length && bflag) {
                      let blq = bloqTempPasoInsumo[iteradorPasoInsumo];
                      rmdStateError = false;
                      let obj = {};
                      obj.mdEstructuraPasoInsumoPasoId = Util.onGetUUIDV4();
                      obj.mdEstructuraPasoInsumoPasoIdAct = obj.mdEstructuraPasoInsumoPasoId;
                      let payloadEstructura = arrBloqEstructura.results.find(p => p.codigo == blq["estructuraId"]);
                      if (payloadEstructura) {
                        obj.estructuraId_estructuraId = payloadEstructura.estructuraId_estructuraId;
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_PASO_INSUMO_PASO: No se encontró la estructura: " + blq["mdEstructuraId"] + "\n";
                      }
                      
                      obj.mdEstructuraId_mdEstructuraId = arrMD_EST.filter((pay) => pay.index == blq["mdEstructuraId"]).length > 0 ? arrMD_EST.filter((pay) => pay.index == blq["mdEstructuraId"])[0].mdEstructuraId : null;
                      if (!obj.mdEstructuraId_mdEstructuraId) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_PASO_INSUMO_PASO: El código de estructura no fue encontrado \n";
                      }
                      let etiqRef = arrMD_ETI.filter((pay) => pay.index == blq["mdEsEtiquetaId"]);

                      if (etiqRef.length > 0) {
                        obj.mdEsEtiquetaId_mdEsEtiquetaId = etiqRef[0].mdEsEtiquetaId;
                        if (oThat._empty.includes(obj.mdEsEtiquetaId_mdEsEtiquetaId)) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_PASO_INSUMO_PASO: La etiqueta " + blq["mdEstructuraPasoInsumoPasoId"] + " no fue encontrado \n";
                        }

                        obj.mdId_mdId = arrMD.filter((pay) => pay.codigo == blq["mdId"]).length > 0 ? arrMD.filter((pay) => pay.codigo == blq["mdId"])[0].mdId : null;
                        if (!obj.mdId_mdId) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_PASO_INSUMO_PASO: El MD no fue encontrado \n";
                        }
                        obj.orden = oThat.vCol(blq["orden"], null, "int");
                        let aOrders = mdPasoInsumoPaso.filter((pay) => pay.orden == obj.orden && pay.mdEstructuraId == blq["mdEstructuraId"] && pay.mdEsEtiquetaId == blq["mdEsEtiquetaId"] && pay.pasoId == blq["pasoId"]);

                        if (aOrders.length > 1) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_PASO_INSUMO_PASO: Existe un número de orden duplicados  " + blq["mdEstructuraPasoInsumoPasoId"] + " \n";
                        }

                        obj.estadoCC = arrTrue.includes(blq["estadoCC"]) ? true : false;

                        obj.estadoMov = arrTrue.includes(blq["estadoMov"]) ? true : false;

                        obj.genpp = arrTrue.includes(blq["genpp"]) ? true : false;
                        obj.tab = arrTrue.includes(blq["tab"]) ? true : false;
                        obj.edit = arrTrue.includes(blq["edit"]) ? true : false;
                        obj.formato = arrTrue.includes(blq["formato"]) ? true : false;
                        obj.colorHex = oThat.vCol(blq["colorHex"] || "", null);
                        obj.colorRgb = oThat.vCol(blq["colorRgb"] || "", null);
                        if (!oThat._empty.includes(obj.colorHex) && !oThat._empty.includes(obj.colorRgb)) {
                          obj.formato = true;
                        }

                        obj.tipoDatoId_iMaestraId = objTipoDato[oThat.vCol(blq["tipoDatoId"], null)];
                        obj.tipoDatoIdAnterior_iMaestraId = objTipoDato[oThat.vCol(blq["tipoDatoId"], null)];
                        if (!obj.tipoDatoId_iMaestraId) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_PASO_INSUMO_PASO: El TipoDato no fue encontrado \n";
                        }
                        obj.valorFinal = oThat.vCol(blq["valorFinal"], null);
                        obj.valorInicial = oThat.vCol(blq["valorInicial"], null);
                        obj.decimales = oThat.vCol(blq["decimales"], null);
                        obj.margen = oThat.vCol(blq["margen"], null);
                        obj.cantidadInsumo = oThat.vCol(blq["cantidadInsumo"], null);

                        obj.pasoId_mdEstructuraPasoId = arrMD_PASO.filter((pay) => pay.index == blq["pasoId"]).length > 0 ? arrMD_PASO.filter((pay) => pay.index == blq["pasoId"])[0].mdEstructuraPasoId : null;
                        if (!obj.pasoId_mdEstructuraPasoId) {
                          bflag = false;
                          mdEnabled = false;
                          msg += `MD_ES_PASO_INSUMO_PASO: El código de md_paso no fue encontrado en la posición ${blq["mdEstructuraPasoInsumoPasoId"]} \n`;
                        }

                        let paso_master = blq["pasoHijoId"];
                        if (!oThat._empty.includes(paso_master) && oThat._empty.includes(blq["cod_insumo"])) {
                          let pasoId = arrBloqPasoHijo.results.filter(p => p.codigo == paso_master);
                          if (pasoId.length > 0) {
                            obj.pasoHijoId_pasoId = pasoId[0].pasoId;
                          } else {
                            bflag = false;
                            mdEnabled = false;
                            msg += `MD_ES_PASO_INSUMO_PASO: El código de PasoHijo en el registro ${blq["mdEstructuraPasoInsumoPasoId"]} no fue encontrado \n`;
                          }
                        }

                        let etiquetaId = arrBloqEtiqueta.results.filter(p => p.codigo == blq["etiquetaId"]);
                        if (etiquetaId.length > 0) {
                          obj.etiquetaId_etiquetaId = etiquetaId[0].etiquetaId;
                        } else {
                          obj.etiquetaId_etiquetaId = null;
                        }

                        //SIN TIPO DE DATO
                        if ([
                            objTipoDato.TDD01,
                            objTipoDato.TDD03,
                            objTipoDato.TDD04,
                            objTipoDato.TDD05,
                            objTipoDato.TDD07,
                            objTipoDato.TDD08,
                            objTipoDato.TDD09,
                            objTipoDato.TDD10,
                            objTipoDato.TDD11,
                            objTipoDato.TDD13,
                            objTipoDato.TDD15,
                            objTipoDato.TDD16,
                            objTipoDato.TDD18,
                          ].includes(obj.tipoDatoId_iMaestraId)) {
                          obj.valorFinal = null;
                          obj.valorInicial = null;
                          obj.decimales = null;
                          obj.margen = null;
                        }
                        //DECIMALES
                        else if ([objTipoDato.TDD02, objTipoDato.TDD14, objTipoDato.TDD17, objTipoDato.TDD19].includes(obj.tipoDatoId_iMaestraId)) {
                          if (oThat._empty.includes(obj.decimales)) {
                            bflag = false;
                            mdEnabled = false;
                            msg += `MD_ES_PASO_INSUMO_PASO: Los decimales no fueron encontrados ${blq["mdEstructuraPasoInsumoPasoId"]} \n`;
                          }
                        } else if ([objTipoDato.TDD12].includes(obj.tipoDatoId_iMaestraId)) {
                          if (oThat._empty.includes(obj.decimales) && oThat._empty.includes(obj.valorInicial) && oThat._empty.includes(obj.valorFinal) && oThat._empty.includes(obj.margen)) {
                            bflag = false;
                            mdEnabled = false;
                            msg += `MD_ES_PASO_INSUMO_PASO: Valor Final y marge no fueron encontrados ${blq["mdEstructuraPasoInsumoPasoId"]} \n`;
                          }
                        }
                        //ERROR mandante 150
                        if (obj.tipoDatoId_iMaestraId == objTipoDato["TDD16"]) {
                          obj.clvModelo = this.aClvMo.results.filter((item) => item.Vlsch == oThat.vCol(blq["clvModelo"], null)).length > 0 ? this.aClvMo.results.filter((item) => item.Vlsch == oThat.vCol(blq["clvModelo"], null))[0].Vlsch : null;
                          if (!obj.clvModelo) {
                            bflag = false;
                            mdEnabled = false;
                            msg += `MD_ES_PASO_INSUMO_PASO: Clave modelo no fue encontrado ${blq["mdEstructuraPasoInsumoPasoId"]} \n`;
                          }
                          obj.puestoTrabajo = oThat.vCol(blq["puestoTrabajo"], null);
                          if (oThat._empty.includes(obj.puestoTrabajo)) {
                            bflag = false;
                            mdEnabled = false;
                            msg += `MD_ES_PASO_INSUMO_PASO: Puesto de trabajo no fue encontrado ${blq["mdEstructuraPasoInsumoPasoId"]} \n`;
                          }
                        }

                        let cod_insumo = oThat.vCol(blq["cod_insumo"], null);
                        if (oThat._empty.includes(obj.pasoHijoId_pasoId) && !oThat._empty.includes(cod_insumo)) {
                          //quiere decir que no hay pasos y es un proceos de insumos
                          let insumoData = await oThat.onGetData("MD_ES_RE_INSUMO", ["Component", "mdId_mdId"], [cod_insumo, obj.mdId_mdId],"", "array");
                          // let insumoData = await oThat.onGetData("MD_ES_RE_INSUMO", "Component", cod_insumo);
                          if (insumoData) {
                            obj.Maktx = insumoData.Maktx;
                            obj.CompUnit = insumoData.CompUnit;
                            obj.Matnr = insumoData.Matnr;
                            obj.Component = cod_insumo;
                            obj.estructuraRecetaInsumoId_estructuraRecetaInsumoId = insumoData.estructuraRecetaInsumoId;
                          } else {
                            bflag = false;
                            mdEnabled = false;
                            msg += `MD_ES_PASO_INSUMO_PASO: El cod_insumo ${cod_insumo} de la posición ${blq["mdEstructuraPasoInsumoPasoId"]} no fue encontrado \n`;
                          }
                        } else {
                          obj.Maktx = "";
                          obj.CompUnit = "";
                          obj.Matnr = "";
                        }

                        if (bflag && mdEnabled) {
                          obj = { ...obj, ..._obj };

                          await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", obj).then(() => {
                              obj.detail = {
                                code: "200",
                                title: "Saved",
                                message: "Done!",
                              };
                            }).catch(async (e) => {
                              obj.detail = {
                                code: e.statusCode,
                                title: "Error in position ",
                                message: e.responseText,
                              };
                              console.log(e);
                              msg += "Error al momento de registrar MD_ES_PASO_INSUMO_PASO " + e.responseText;
                              await oThat.disableCascade(mdId, msg);
                              bflag =false;
                            });
                        } else {
                          //OBTENEMOS EL ULTIMO MD
                          await oThat.disableCascade(mdId, msg);
                          bflag =false;
                          obj.detail = {
                            code: "400",
                            title: "Error in position " + ipasoinsu,
                            message: "Información corrupta",
                          };
                        }
                      } else {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_PASO_INSUMO_PASO: No hay mdEsEtiquetaId asociada " + blq["mdEstructuraPasoInsumoPasoId"] + " no fue encontrado \n";
                      }
                      obj.index = blq["mdEstructuraPasoInsumoPasoId"];
                      let v0 = arrMD_PASO_INSUMO_PASO.find(
                        (item) => item.index === obj.index
                      );
                      if (!v0) {
                        arrMD_PASO_INSUMO_PASO.push(obj);
                      }
                      iteradorPasoInsumo++;
                    }
                    iteradorBloquePasoInsumo++;
                  }

                  //** ================ MD_ES_FORMULA_PASO ================= */
                  let iformu = 0;
                  let eformu = count;
                  let mdPasoFormulaPaso = oData["MD_ES_FORMULA_PASO"] ? oData["MD_ES_FORMULA_PASO"] : [];
                  let mdPasoFormulaPasoxMD = mdPasoFormulaPaso.filter((item) => item["mdId"] == xObj.codigo);
                  let blen9 = Math.ceil(mdPasoFormulaPasoxMD.length / count); //block MD
                  let iteradorBloqueFormulaPaso = 0;
                  while (iteradorBloqueFormulaPaso < blen9 && bflag) {
                    let bloqTempFormulaPaso = mdPasoFormulaPasoxMD.slice(iformu, eformu);
                    iformu = eformu + i;
                    eformu += count;
                    let iteradorFormulaPaso = 0;
                    while (iteradorFormulaPaso < bloqTempFormulaPaso.length && bflag) {
                      let blq = bloqTempFormulaPaso[iteradorFormulaPaso];
                      rmdStateError = false;
                      let obj = {};
                      obj.mdFormulaPaso = Util.onGetUUIDV4();
                      obj.mdId_mdId = arrMD.filter((pay) => pay.codigo == blq["mdId"]).length > 0 ? arrMD.filter((pay) => pay.codigo == blq["mdId"])[0].mdId : {};
                      if (!obj.mdId_mdId) {
                        bflag = false;
                        mdEnabled = false;
                        msg += "MD_ES_FORMULA_PASO: El MD no fue encontrado \n";
                      }
                      obj.esPaso = arrTrue.includes(blq["esPaso"]);
                      if (!oThat._empty.includes(blq["pasoPadreId"])) {
                        let objPasoPadre = arrMD_PASO.filter((pay) => pay.index == blq["pasoPadreId"]).length > 0 ? arrMD_PASO.filter((pay) => pay.index == blq["pasoPadreId"])[0] : {};
                        if (objPasoPadre.tipoDatoId_iMaestraId != objTipoDato["TDD14"]) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_FORMULA_PASO: El pasoPadre no tiene el tipo de dato Fórmula \n";
                        } else {
                          if (!objPasoPadre.mdEstructuraPasoId) {
                            bflag = false;
                            mdEnabled = false;
                            msg += "MD_ES_FORMULA_PASO: El código de md_paso no fue encontrado \n";
                          } else {
                            obj.pasoPadreId_mdEstructuraPasoId = objPasoPadre.mdEstructuraPasoId;
                            obj.mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId = null;
                          }
                        }
                      } else if (!oThat._empty.includes(blq["mdEstructuraPasoInsumoPasoId"])) {
                        let objPasoInsumo = arrMD_PASO_INSUMO_PASO.filter((pay) => pay.index == blq["mdEstructuraPasoInsumoPasoId"]).length > 0 ? arrMD_PASO_INSUMO_PASO.filter((pay) => pay.index == blq["mdEstructuraPasoInsumoPasoId"])[0] : {};
                        // mdEstructuraPasoInsumoPasoId
                        if (objPasoInsumo.tipoDatoId_iMaestraId != objTipoDato["TDD14"]) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_FORMULA_PASO: El mdEstructuraPasoInsumoPasoId no tiene el tipo de dato Fórmula \n";
                        } else {
                          if (!objPasoInsumo.mdEstructuraPasoInsumoPasoId) {
                            bflag = false;
                            mdEnabled = false;
                            msg += "MD_ES_FORMULA_PASO: El código de md_paso no fue encontrado \n";
                          } else {
                            obj.mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId = objPasoInsumo.mdEstructuraPasoInsumoPasoId;
                            obj.pasoPadreId_mdEstructuraPasoId = null; 
                          }
                        }
                      } else {
                        if (oThat._empty(blq["pasoPadreId"])) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_FORMULA_PASO: El código de pasoPadreId no fue encontrado \n";
                        }
                        if (!oThat._empty(blq["mdEstructuraPasoInsumoPasoId"])) {
                          bflag = false;
                          mdEnabled = false;
                          msg += "MD_ES_FORMULA_PASO: El código de mdEstructuraPasoInsumoPasoId no fue encontrado \n";
                        }
                      }
                      if (obj.esPaso) {
                        obj.bFlagPM = arrTrue.includes(blq["bFlagPM"]);
                        if (obj.bFlagPM) {
                          let pasoSelected = arrMD_PASO_INSUMO_PASO.filter((pay) => pay.index == blq["pasoFormulaId"]).length > 0 ? arrMD_PASO_INSUMO_PASO.filter((pay) => pay.index == blq["pasoFormulaId"])[0] : {};
                          obj.pasoFormulaId_mdEstructuraPasoId = pasoSelected.pasoId_mdEstructuraPasoId;
                          if (!obj.pasoFormulaId_mdEstructuraPasoId) {
                            bflag = false;
                            mdEnabled = false;
                            msg += `MD_ES_FORMULA_PASO: El código de pasoFormulaId ${blq["pasoFormulaId"]} no fue encontrado\n`;
                          } else {
                            obj.esPaso = true;
                          }
                        } else {
                          let pasoSelected = arrMD_PASO.filter((pay) => pay.index == blq["pasoFormulaId"]).length > 0 ? arrMD_PASO.filter((pay) => pay.index == blq["pasoFormulaId"])[0] : {};
                          obj.pasoFormulaId_mdEstructuraPasoId = pasoSelected.mdEstructuraPasoId;
                          if (!obj.pasoFormulaId_mdEstructuraPasoId) {
                            bflag = false;
                            mdEnabled = false;
                            msg += `MD_ES_FORMULA_PASO: El código de pasoFormulaId ${blq["pasoFormulaId"]} no fue encontrado\n`;
                          } else {
                            obj.esPaso = true;
                          }
                        }
                      }
                      // obj.esPaso = arrTrue.includes(blq["esPaso"]);
                      // if (obj.esPaso) {
                      //   let pasoFormulaFiltrado = arrMD_PASO.filter((pay) => pay.index == blq["pasoFormulaId"]).length > 0 ? arrMD_PASO.filter((pay) => pay.index == blq["pasoFormulaId"])[0] : {};

                      //   obj.pasoFormulaId_mdEstructuraPasoId = pasoFormulaFiltrado.mdEstructuraPasoId;
                      //   if (!obj.pasoFormulaId_mdEstructuraPasoId) {
                      //     bflag = false;
                      //     mdEnabled = false;
                      //     msg += `MD_ES_FORMULA_PASO: El código de pasoFormulaId ${blq["mdEstructuraPasoInsumoPasoId"]} no fue encontrado\n`;
                      //   } else {
                      //     obj.esPaso = true;
                      //   }
                      // } else {
                      //   obj.pasoFormulaId_mdEstructuraPasoId = null;
                      // }

                      obj.valor = oThat.vCol(blq["valor"], null);
                      obj.orden = oThat.vCol(blq["orden"], null);

                      if (bflag && mdEnabled) {
                        obj = { ...obj, ..._obj };

                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_FORMULA_PASO", obj).then(() => {
                            obj.detail = {
                              code: "200",
                              title: "Saved",
                              message: "Done!",
                            };
                          }).catch(async (e) => {
                            obj.detail = {
                              code: e.statusCode,
                              title: "Error in position ",
                              message: e.responseText,
                            };
                            console.log(e);
                            msg += "Error al momento de registrar MD_ES_FORMULA_PASO " + e.responseText;
                            await oThat.disableCascade(mdId, msg);
                            bflag =false;
                          });
                      } else {
                        //OBTENEMOS EL ULTIMO MD
                        await oThat.disableCascade(mdId, msg);
                        bflag =false;

                        obj.detail = {
                          code: "400",
                          title: "Error in position " + ii,
                          message: "Información corrupta",
                        };
                      }
                      obj.index = blq["mdFormulaPaso"];
                      let v0 = arrMD_Formula_Paso.find((item) => item.index === obj.index);
                      if (!v0) {
                        arrMD_Formula_Paso.push(obj);
                      }
                      iteradorFormulaPaso++;
                    }
                    iteradorBloqueFormulaPaso++;
                  }

                  //** ================ MD_TRAZABILIDAD ================= */
                  if (bflag && mdEnabled) {
                    let obj = {};
                    obj.idTrazabilidad = Util.onGetUUIDV4();
                    obj.mdId_mdId = mdId;
                    obj.estadoTrazab_iMaestraId = objEstadoRMD["I"];

                    obj = { ...obj, ..._obj };

                    await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_TRAZABILIDAD", obj).then(() => {
                        obj.detail = {
                          code: "200",
                          title: "Saved",
                          message: "Done!",
                        };
                      }).catch(async (e) => {
                        obj.detail = {
                          code: e.statusCode,
                          title: "Error in position ",
                          message: e.responseText,
                        };
                        console.log(e);
                        msg += "Error al momento de registrar la trazabilidad " + e.responseText;
                        await oThat.disableCascade(mdId, msg);
                        bflag =false;
                      });

                    let v0 = arrMD_Trazab.find((item) => item.mdId_mdId === mdId);
                    if (!v0) {
                      arrMD_Trazab.push(obj);
                    }
                  }
                } else {
                  xObj.detail = {
                    code: "400",
                    title: "RMD encontrado " + xObj.codigo,
                    message: "Ya existe el RMD",
                  };
                }
              }

              let v0 = arrMD.find((item) => item.codigo == xObj.codigo);
              if (!v0) {
                arrMD.push(xObj);
              }

              if (rmdStateError && !oThat._empty.includes(xObj.detail)) {
                if (xObj.detail.code == 200) {
                  let msg = "RMD vacio";
                  await oThat.disableCascade(mdId, msg);
                  bflag =false;
                }
              }
            }
        }
          console.log("time end START Odata ", new Date().getTime());
          let arrMerge = [...arrMD, ...aRespuestaLog, ...arrPasosReject];
          oThat.localModel.setProperty("/items", arrMerge);
          oThat.localModel.setProperty("/count", arrMerge.length);
          oThat.localModel.refresh();
          oThat.localModel.setSizeLimit(9999999999);
          BusyIndicator.hide();
        } catch (error) {
          BusyIndicator.hide();
          if (mdId) {
            let info = arrMD[arrMD.length - 1];
            await oThat.disableCascade(mdId, "ERROR DE CONEXIÓN.");
            MessageBox.error("Ocurrió un error en la ejecución de la carga del MD: " + info.codigo + "\n" + error.message);
          }
          console.log(error.responseText);
        }
      },
      createMessageLog: function (aMessage, that) {
        aMessage.map(function (oItem) {
          switch (oItem.detail.code) {
            case "200":
              oItem.MessageType = "Success";
              break;
            case "400":
              oItem.MessageType = "Error";
              break;
            default:
          }
        });
        var oMessageTemplate = new sap.m.MessageItem({
          type: "{MessageType}",
          title: "{detail/title} {= ${detail/code} === '200' ? ${codigo} : ''}",
          description: "{detail/message}",
        });

        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aMessage);
        oModel.setSizeLimit(999999);
        console.log(aMessage);

        var oBackButton = new sap.m.Button({
          icon: sap.ui.core.IconPool.getIconURI("nav-back"),
          visible: false,
          press: function () {
            that.oMessageView.navigateBack();
            this.setVisible(false);
          },
        });

        that.oMessageView = new sap.m.MessageView({
          showDetailsPageHeader: false,
          itemSelect: function () {
            oBackButton.setVisible(true);
          },
          items: {
            path: "/",
            template: oMessageTemplate,
          },
        });

        that.oMessageView.setModel(oModel);

        that.oDialog = new sap.m.Dialog({
          resizable: true,
          content: that.oMessageView,
          state: "Information",
          beginButton: new sap.m.Button({
            press: function () {
              this.getParent().close();
            },
            text: "Cerrar",
          }),
          endButton: new sap.m.Button({
            press: function () {
              that.oMessageView.destroyItems();
              oThat.localModel.setProperty("/items", []);
              oThat.localModel.setProperty("/count", "0");
            },
            icon: "sap-icon://delete",
            text: "Borrar",
          }),
          customHeader: new sap.m.Bar({
            contentMiddle: [
              new sap.m.Text({
                text: "Log",
              }),
            ],
            contentLeft: [oBackButton],
          }),
          contentHeight: "300px",
          contentWidth: "500px",
          verticalScrolling: false,
        });
        this.oMessageView.navigateBack();
        this.oDialog.open();
      },
      updateTx: async function (model, entity, id, data) {
        return await Service.onUpdateDataGeneral(model, entity, data, id);
      },
      createTx: async function (model, entity, data) {
        return await Service.onSaveDataGeneral(model, entity, data, null);
      },
      findRecetaOp: async function (data, sucursal, nivel) {
        try {
          let afilters = [];
          afilters.push(new Filter("Matnr", "EQ", data.Matnr));
          afilters.push(new Filter("Werks", "EQ", sucursal));
          afilters.push(new Filter("PrfgF", "EQ", sEstadoPermitidoProducto));
          afilters.push(new Filter("Atwrt", "EQ", nivel));
          afilters.push(new Filter("Verid", "EQ", data.Verid));
          let oDataResult = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "ProduccionVSet", afilters);
          return oDataResult.results;
        } catch (error) {
          return error;
        }
      },
      findEquipoOp: async function (codEq, sucursal) {
        try {
          let aFilters = [];
          aFilters.push(new Filter("Equipment", "EQ", codEq));
          aFilters.push(new Filter("Swerk", "EQ", sucursal));
          aFilters.push(new Filter("Eqtyp", "EQ", ""));
          let aEquipo = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "EquipoSet", aFilters).then((payload) => payload.results).catch((error) => error);
          return aEquipo;
        } catch (error) {
          return error;
        }
      },
      openDetails: function () {
        let info = oThat.localModel.getProperty("/items") || [];
        this.createMessageLog(info, this);
      },
      disableCascade: async function (mdId, msg) {
        //OBTENEMOS EL ULTIMO MD
        //ELIMINAMOS EL MD
        let info = arrMD[arrMD.length - 1];
        arrMD[arrMD.length - 1]["detail"] = {
          code: "400",
          title: "Error al registrar MD " + info.codigo,
          message: msg,
        };
        await oThat.updateTx(oThat.mainModelv2, "MD", mdId, changeState);
        //fitramos el array por MD_ESTRUCTURA Y ELIMINAMOS LOS REGISTROS
        let aMDE = arrMD_EST.filter((pay) => pay.mdId_mdId == mdId);
        for await (let item of aMDE) {
          if (item.mdEstructuraId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_ESTRUCTURA",
              item["mdEstructuraId"],
              changeState
            );
          }
        }

        //FILTRAMOS TODO LO QUE TENEMOS DE ETIQUETA Y ELIMINAMOS
        let aMDETIQ = arrMD_ETI.filter((pay) => pay.mdId_mdId == mdId);
        //ELIMINAMOS EL MD_ES_ETIQUETA
        for await (let item of aMDETIQ) {
          if (item.mdEsEtiquetaId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_ES_ETIQUETA",
              item["mdEsEtiquetaId"],
              changeState
            );
          }
        }

        //FILTRAMOS TODOS LOS PASOS
        let aMDP = arrMD_PASO.filter((pay) => pay.mdId_mdId == mdId);
        for await (let item of aMDP) {
          if (item.mdEstructuraPasoId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_ES_PASO",
              item["mdEstructuraPasoId"],
              changeState
            );
          }
        }

        //FILTRAMOS TODOS LOS EQUIPO
        let aMDEQ = arrMD_ES_EQUIPO.filter((pay) => pay.mdId_mdId == mdId);
        for await (let item of aMDEQ) {
          if (item.mdEstructuraEquipoId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_ES_EQUIPO",
              item["mdEstructuraEquipoId"],
              changeState
            );
          }
        }

        //Filtramos los RECETAS
        let aMDR = arrMD_RECETA.filter((pay) => pay.mdId_mdId == mdId);
        for await (let item of aMDR) {
          if (item.mdRecetaId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_RECETA",
              item["mdRecetaId"],
              changeState
            );
          }
        }

        //FILTRAMOS TODOS LOS UTENSILIOS
        let aMDUT = arrMD_ES_UTEN.filter((pay) => pay.mdId_mdId == mdId);
        for await (let item of aMDUT) {
          if (item.mdEstructuraUtensilioId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_ES_UTENSILIO",
              item["mdEstructuraUtensilioId"],
              changeState
            );
          }
        }
        //  //FILTRAMOS TODAS LAS TRAZABILIDADES
        let aMDINS = arrMD_RE_INSUMO.filter((pay) => pay.mdId_mdId == mdId);
        for await (let item of aMDINS) {
          if (item.estructuraRecetaInsumoId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_ES_RE_INSUMO",
              item["estructuraRecetaInsumoId"],
              changeState
            );
          }
        }
        //Filtramos todas las MD_ES_ESPECIFICACION
        let aMDESP = arrMDESPECIF.filter((pay) => pay.mdId_mdId == mdId);
        for await (let item of aMDESP) {
          if (item.mdEstructuraEspecificacionId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_ES_ESPECIFICACION",
              item["mdEstructuraEspecificacionId"],
              changeState
            );
          }
        }
        //FILTRAMOS TODAS LAS arrMD_PASO_INSUMO_PASO
        let aMDPI = arrMD_PASO_INSUMO_PASO.filter(
          (pay) => pay.mdId_mdId == mdId
        );
        for await (let item of aMDPI) {
          if (item.mdEstructuraPasoInsumoPasoId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_ES_PASO_INSUMO_PASO",
              item["mdEstructuraPasoInsumoPasoId"],
              changeState
            );
          }
        }

        //FILTRAMOS TODAS LAS TRAZABILIDADES
        let aMDTraz = arrMD_Trazab.filter((pay) => pay.mdId_mdId == mdId);
        for await (let item of aMDTraz) {
          if (item.mdId_mdId) {
            await oThat.updateTx(
              oThat.mainModelv2,
              "MD_TRAZABILIDAD",
              aMDTraz["mdId_mdId"],
              changeState
            );
          }
        }
      },

      // Obtener la informacion de la App Configuracion.
      onGetAppConfiguration:async function () {
        return new Promise(async function (resolve, reject) {
            sap.ui.core.BusyIndicator.show(0);
            var afilters = [];
            afilters.push(new Filter("codigo", "EQ", sAppConfiguracion));
            await Service.onGetDataGeneralFilters(oThat.mainModelv2, "APLICACION", afilters).then(async function (oListAppConfig) {
                resolve(oListAppConfig);
            }).catch(function (oError) {
                reject(oError);
            })
        });
      },

      // Obtener la informacion de las Constantes.
      onGetConstants:async function () {
          return new Promise(async function (resolve, reject) {
              sap.ui.core.BusyIndicator.show(0);
              var oFilter = [
                  new Filter({
                      filters: [
                          new Filter("oAplicacion_aplicacionId", "EQ", oAplicacionConfiguracion),
                          new Filter("campo1", "EQ", 'X')
                      ],
                      and: false
                  })
              ];
              await Service.onGetDataGeneralFilters(oThat.mainModelv2, "CONSTANTES", oFilter).then(async function (oListConstantes) {
                  resolve(oListConstantes);
              }).catch(function (oError) {
                  reject(oError);
              })
          });
      },

      //Seteo de constantes
      onSetConstans:async function (aConstants) {
        try {
          for await (const oConstante of aConstants.results) {
            if (oConstante.codigoSap === "IDTIPOESTFORMULA") {
              objEstructura.Formula = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPOESTESPECIFICACIONES") {
              objEstructura.Especificacion = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPOESTPROCESO") {
              objEstructura.Procesos = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPOESTCONDAMBIENTAL") {
              objEstructura.CondAmbientales = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPOESTCUADRO") {
              objEstructura.Cuadro = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPOESTEQUIPO") {
              objEstructura.Equipos = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDESTRMDSOLICITADO") {
              objEstadoRMD["S"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDESTRMDAUTORIZADO") {
              objEstadoRMD["A"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDESTRMDCANCELADO") {
              objEstadoRMD["C"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDESTRMDINICIADO") {
              objEstadoRMD["I"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDESTRMDSUSPENDIDO") {
              objEstadoRMD["SS"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDESTRMDSOLICITUDAPROBADA") {
              objEstadoRMD["SA"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDESTRMDSOLICITUDRECHAZADA") {
              objEstadoRMD["SR"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOCANTIDAD") {
              objTipoDato["TDD02"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOENTREGA") {
              objTipoDato["TDD19"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOFECHA") {
              objTipoDato["TDD03"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOFECHAVENC") {
              objTipoDato["TDD13"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOFECHAHORA") {
              objTipoDato["TDD04"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOFORMULA") {
              objTipoDato["TDD14"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOHORA") {
              objTipoDato["TDD05"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOLOTE") {
              objTipoDato["TDD18"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOMUESTRACC") {
              objTipoDato["TDD17"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOMULTIPLECHECK") {
              objTipoDato["TDD11"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATONOTIFICACION") {
              objTipoDato["TDD16"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATONUMERO") {
              objTipoDato["TDD06"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATORANGO") {
              objTipoDato["TDD12"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOREALIZADOPOR") {
              objTipoDato["TDD07"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOREALIZADOPORVB") {
              objTipoDato["TDD09"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOSINTIPODATO") {
              objTipoDato["TDD15"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOTEXTO") {
              objTipoDato["TDD01"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOVERIFCHECK") {
              objTipoDato["TDD10"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPODATOVISTOBUENO") {
              objTipoDato["TDD08"] = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "CARACTERISTICAAREA") {
              constanteArea = oConstante.contenido;
            }
            if (oConstante.codigoSap === "CARACTERISTICAETAPA") {
              constanteNivel = oConstante.contenido;
            }
            if (oConstante.codigoSap === "IDESTPRCAPROBACIONJEFEDT") {
              idEstadoProcesoAutorizado = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDESTPRCPROCESO") {
              idEstadoProcesoPendiente = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPOEQUIPO") {
              sIdTipoEquipo = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDESTPERMITIDOPRODUCTO") {
              sEstadoPermitidoProducto = parseInt(oConstante.contenido);
            }
            if (oConstante.codigoSap === "IDTIPOMAESTRAESTRMD") {
              nIdTipoMaestraEstadoRMD = parseInt(oConstante.contenido);
            }
          }
        } catch (oError) {
            sap.ui.core.BusyIndicator.hide();
            oThat.onErrorMessage(oError, "errorSave");
        }
      }
    });
  }
);
