const odata = require("odata").o;
const config = require("../config/config");
const auth = require("./auth");
const core = require("./core");

exports.o = function () {
  const _config = config.getConfig();
  //const oauth = await auth.getOAuth();

  const client = odata(_config.odata_url, {
    headers: {
      "Content-Type": "application/json",
      //"Authorization": "Bearer " + oauth.access_token
    },
  });

  return client;
};

exports.remove = async function (db, entity) {
  const aEntity = entity.split("?");
  const sEntity = aEntity[0];
  const filter = {};

  filter = {
    datastore: sEntity,
  };

  return await core.remove(db, sEntity, filter);
};

exports.persistance = async function (o, db, entity) {
  const aEntity = entity.split("?");
  const sEntity = aEntity[0];
  const filter = JSON.parse('{"datastore":"' + sEntity + '"}');

  db.remove(filter, { multi: true }, function (err, numRemoved) {});

  let entities = await o.get(entity).query();
  entities.forEach(function (item) {
    item.datastore = sEntity;
    item.timestamp = new Date();

    for (const key in item) {
      if (typeof item[key] == "object") {
        const childItem = item[key];
        for (const childKey in childItem) {
          item[key + "_" + childKey] = childItem[childKey];
        }
        delete item[key];
      }
    }

    db.insert(item);
  });
};
