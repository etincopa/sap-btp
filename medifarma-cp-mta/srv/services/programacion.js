const cds = require("@sap/cds");
//const { onFormatterDateTime } = require('../helpers/util');

module.exports = {
  async data(req) {
    const db = await cds.connect.to("db");
    const { SALA_PESAJE } = db.entities("mif.cp");
    const aSalaPesaje = await SELECT.from(SALA_PESAJE);
    const message = { message: "", status: 200 };

    if (aSalaPesaje.length === 0) {
      message.message = "No se encontraron datos en Sala.";
      message.status = 412;
      throw message;
    }

    return aSalaPesaje;
  },

  async create(req) {
    try {
      const db = await cds.connect.to("db");
      const { PROGRAMACION, ORDEN } = db.entities("mif.cp");
      const { PRODUCTO } = db.entities("mif.cp");
      const { MIF_ADMIN_HDI_MAESTRA } = db.entities("mif.cp");
      let aProgramacion = req.body;

      var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      for (let index = 0; index < aProgramacion.length; index++) {
        const element = aProgramacion[index];
        var fecha = new Date(element.fecha).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const oEstado = await SELECT.one.from(MIF_ADMIN_HDI_MAESTRA).where({
          contenido: element.estado,
        });
        const { v4: uuidv4 } = require('uuid');
		const uuid =uuidv4();
        const jsonProgramacion = {
            programacionId:uuid,
          oSalaPesaje_salaPesajeId: element.keySala,
          fechaProgramacion: fecha,
          usuarioRegistro : "LROJASAR",
          fechaRegistro : now,
          activo:true
        };

        //Busca programacion a borrar en caso sea la única orden en ella
        let oOrden = await SELECT.from(ORDEN).where({
            numero: element.orden
        });

        if (oOrden[0].programacionId !== null){
            let oAuxOrden = await SELECT.from(ORDEN).where({
                oProgramacion_programacionId: oOrden[0].oProgramacion_programacionId
            });
            if (oAuxOrden.length === 1){
                await DELETE.from(PROGRAMACION).where({
                    programacionId: oAuxOrden[0].oProgramacion_programacionId,
                });
            }
        }
            
        
        


        //Busca programacion
        let aBuscarProgramacion = await SELECT.from(PROGRAMACION).where({
          fechaProgramacion: element.fecha,
        });
        // Crea PROGRAMACION
        let oProgramacion = {},
          oProgramacionInsert = {};
        if (aBuscarProgramacion.length === 0) {
          oProgramacionInsert = await INSERT.into(
            PROGRAMACION,
            jsonProgramacion
          );
          oProgramacion = oProgramacionInsert.req.data;
        } else {
          oProgramacion = aBuscarProgramacion[0];
        }

        // Crea PRODUCTO
        const aProducto = await SELECT.from(PRODUCTO).where({
          codigo: element.keyProducto,
        });
        let oProductoInsert = {},
          oProducto = {};
        if (aProducto.length === 0) {
          let jsonProducto = {
            codigo: element.keyProducto,
            nombre: element.valueProducto,
          usuarioRegistro : "LROJASAR",
          fechaRegistro : now,
          activo:true
          };
          oProductoInsert = await INSERT.into(PRODUCTO, jsonProducto);
          oProducto = oProductoInsert.req.data;
        } else {
          oProducto = aProducto[0];
        }

        // Crea orden y asigna

        const orden = await SELECT.one.from(ORDEN).where({
          numero: element.orden,
        });
        if(orden==undefined){

        const jsonOrden = {
            ordenId:uuidv4(),
          numero: element.orden,
          lote: element.lote,
          oProducto_productoId: oProducto.productoId,
          oEstado_iMaestraId: oEstado.iMaestraId,
          oProgramacion_programacionId: oProgramacion.programacionId,
          usuarioRegistro : "LROJASAR",
          fechaRegistro : now,
          activo:true
        };
        const oOrdenInsert = await INSERT.into(ORDEN, jsonOrden);
        const oOrden = oOrdenInsert.req.data;
        }else{
            await UPDATE(ORDEN).set({
				fechaActualiza: now,
                oProducto_productoId: oProducto.productoId,
                oProgramacion_programacionId:oProgramacion.programacionId
			}).where({
				ordenId: orden.ordenId
			});
        }
      }
      return { message: "Exitoso" };
    } catch (err) {
      return JSON.stringify(err);
    }
  },

  async ordenProgramada(req) {
    const registros = JSON.parse(req.query.registros);
    const db = await cds.connect.to("db");
    const { ORDEN, PROGRAMACION } = db.entities("mif.cp");
    let aFiltroOrden = [];
    let aFiltroProgramacion = [];
    registros.forEach((element) => {
        aFiltroOrden.push(element.orden);
    });
    const aOrden = await SELECT.from(ORDEN).where({ numero: { in: aFiltroOrden } });

    aOrden.forEach((auxOrden) => {
        if (auxOrden.oProgramacion_programacionId !== null){
            aFiltroProgramacion.push(auxOrden.oProgramacion_programacionId);
        }
    });

    const aProgramacion = await SELECT.from(PROGRAMACION).where({ programacionId: { in: aFiltroProgramacion } });
    
   

    let oOrden = {
      orden: [],
      fechasProgramadas: [],
    };
    aOrden.forEach((item) => {
      oOrden.orden.push(item.numero);
    });
    if (aProgramacion.length !== 0){
        aProgramacion.forEach((item) => {
            oOrden.fechasProgramadas.push(item.fechaProgramacion);
        });
    }
    

    const message = { message: "", status: 200 };

    return oOrden;
  },
  async delete(req) {
    const orden = JSON.parse(req.body.registro);
    const db = await cds.connect.to("db");
    const { ORDEN, PROGRAMACION } = db.entities("mif.cp");
    // Eliminar orden
    /*await DELETE.from(ORDEN).where({
      ordenId: orden.ID,
    });*/
    await UPDATE(ORDEN).set({
				activo: false,
			}).where({
				ordenId: orden.ordenId
			})
    const aOrden = await SELECT.from(ORDEN).where({
      oProgramacion_programacionId: orden.oProgramacion_programacionId,
    });
    
    const message = { message: "Exitoso", status: 200 };
    if (aOrden.length === 0) {
      /*await DELETE.from(PROGRAMACION).where({
        programacionId: orden.programacion_ID,
      });*/
        await UPDATE(PROGRAMACION).set({
				activo: false,
			}).where({
				programacionId: orden.oProgramacion_programacionId
			})
    }

    return message;
  },
  async update(req) {
    var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const registro = req.body;
    const db = await cds.connect.to("db");
    const { ORDEN, PROGRAMACION } = db.entities("mif.cp");
    //Busca programacion
    let aBuscarProgramacion = await SELECT.from(PROGRAMACION).where({
      fechaProgramacion: registro.fecha,
      oSalaPesaje_salaPesajeId: registro.keySala,
    });
    // Crea PROGRAMACION
    let oProgramacion = {},
      oProgramacionInsert = {};
    if (aBuscarProgramacion.length !== 0) {
      oProgramacion = aBuscarProgramacion[0];
    } else { 
        const { v4: uuidv4 } = require('uuid');
		const uuid =uuidv4();
        const jsonProgramacion = {
            programacionId:uuid,
            fechaProgramacion: registro.fecha,
            oSalaPesaje_salaPesajeId: registro.keySala,
            usuarioRegistro : "RYEPEGAV",
            fechaRegistro : now,
            activo:true
        };
      oProgramacionInsert = await INSERT.into(PROGRAMACION, jsonProgramacion);
      oProgramacion = oProgramacionInsert.req.data;
    }
    //Actualiza
    let oOrden = await UPDATE(ORDEN).set({
                    fechaActualiza: now,
                    oProgramacion_programacionId: oProgramacion.programacionId
                }).where({
                    numero: registro.orden,
                });
    //Eliminar PROGRAMACION en el caso no tenga registros
    let aProgramacionOrdenes = await SELECT.from(`${PROGRAMACION.name} as P`)
      .join(`${ORDEN.name} as O`)
      .on("P.programacionId", "=", "O.oProgramacion_programacionId")
      .where({
        "P.programacionId": registro.programacionID,
      });
    
    if (aProgramacionOrdenes.length === 0) {
      await DELETE.from(PROGRAMACION).where({
        programacionId: registro.programacionID,
      });
    }
    oOrden.message = "Exitoso";
    oOrden.status = 200;
    
    return oOrden;
  },
};
