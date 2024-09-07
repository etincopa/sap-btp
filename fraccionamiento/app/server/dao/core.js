const nedb = require("nedb");
const rootPath = require('electron-root-path').rootPath;
exports.getDb = function () {
  const db = new nedb({ filename: rootPath + "/app/server/db/fraccionamiento.db" });

  db.loadDatabase(function (error) {
    if (error) {
      console.log("FATAL: base de datos local cargada. Caused by: " + error);
      throw error;
    }
    console.log("INFO: base de datos local cargada.");
  });

  return db;
};

exports.find = function (db, entity, filter) {
  if (!filter) filter = {};
  filter.datastore = entity;

  return new Promise(function (resolve, reject) {
    db.find(filter, function (error, docs) {
      resolve(docs);
    });
  });
};

exports.findOne = function (db, entity, filter) {
  if (!filter) filter = {};
  filter.datastore = entity;

  return new Promise(function (resolve, reject) {
    db.findOne(filter, function (error, doc) {
      resolve(doc);
    });
  });
};

exports.remove = async function (db, entity) {
  const aEntity = entity.split("?");
  const sEntity = aEntity[0];
  const filter = {};

  filter = {
    datastore: sEntity,
  };

  return new Promise(function (resolve, reject) {
    db.find(filter, function (err, doc) {
      resolve(doc);
    });
  });
};
