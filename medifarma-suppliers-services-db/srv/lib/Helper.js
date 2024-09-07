module.exports = class Helper {
  constructor(options) {
    this.db = options.db;
    this.table = options.table;
    this.namespace = options.namespace;
    this.context = options.context;
    this.field = options.field;
  }

  getNextNumber() {
    return new Promise((resolve, reject) => {
      let nextNumber = 0;
      this.db
        .run(
          `SELECT MAX("${this.field}") as LastKey FROM "${this.namespace}_${this.context}_${this.table}"`
        )
        .then((result) => {
          console.log(result);
          nextNumber = result[0].LASTKEY + 1;
          console.log(nextNumber);
          resolve(nextNumber);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getTextDecoded(conceptEncoded) {
    return new Promise((resolve, reject) => {
      let result = decodeURIComponent(conceptEncoded).replace(/\+/g, " ");
      resolve(result);
    });
  }
};
