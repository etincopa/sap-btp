exports.guardarConfiguracion = async function (db, item) {
  db.findOne({ datastore: "CONFIGURACION" }, function (err, doc) {
    if (!doc) {
      item.datastore = "CONFIGURACION";
      db.insert(item);
    }
  });
};
