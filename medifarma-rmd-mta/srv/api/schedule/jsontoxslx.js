const Excel = require('exceljs');
const jsonToxlsx = async (data,days) => {
   try {
    console.log("longitud ==",data.length)
    const filename = 'OP_SIN_RMD.xlsx';
    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet('Orders');
    // let objectKeys = Object.keys(data[0]);
    let aContent = [];
    data.map(data =>{
        let objData  ={};
        objData.Aufnr=data.Aufnr|| "";
        objData.planta=data.planta|| "";
        objData.Matnr=data.Matnr|| "";
        objData.Maktx=data.Maktx|| "";
        objData.Verid=data.Verid|| "";
        objData.Dauat=data.Dauat|| "";
        objData.Dsnam=data.Dsnam || "";
        objData.Atwrt=data.Atwrt || "";
        for (const item in days){
            objData[days[item]] = data[item] ? "SI" : "NO"
        }
        aContent.push(objData)
    })

    worksheet.columns = [
        {header: 'Orden', key: 'Aufnr',width:20},
        {header: 'Planta', key: 'planta',width:20},
        {header: 'Código', key: 'Matnr'},
        {header: 'Descripción', key: 'Maktx',width:100},
        {header: 'Versión', key: 'Verid'},
        {header: 'Etapa', key: 'Dauat'},
        {header: 'Línea', key: 'Dsnam'},
        {header: 'Área', key: 'Atwrt',width:30},
        {header: days["dia1"], key: days["dia1"],width:12},
        {header: days["dia2"], key: days["dia2"],width:12},
        {header: days["dia3"], key: days["dia3"],width:12},
        {header: days["dia4"], key: days["dia4"],width:12},
        {header: days["dia5"], key: days["dia5"],width:12},
        {header: days["dia6"], key: days["dia6"],width:12},
        {header: days["dia7"], key: days["dia7"],width:12},
        {header: days["dia8"], key: days["dia8"],width:12},
        {header: days["dia9"], key: days["dia9"],width:12},
        {header: days["dia10"], key: days["dia10"],width:12},
        {header: days["dia11"], key: days["dia11"],width:12},
        {header: days["dia12"], key: days["dia12"],width:12},
        {header: days["dia13"], key: days["dia13"],width:12},
        {header: days["dia14"], key: days["dia14"],width:12},
        {header: days["dia15"], key: days["dia15"],width:12},
    ];

    // let rows = [...aContent];
    aContent.forEach((e) => {
        worksheet.addRow(e);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    let estado = 200;
    return {buffer,filename,estado};
} catch (error) {
    return {buffer,filename,message:error.toString()};
    
   }
};

module.exports = jsonToxlsx;