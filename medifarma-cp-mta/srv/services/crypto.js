const crypto = require("crypto"),
  algorithm = "aes-256-ctr",
  password = "sCshtwG54DXgp5Qt7hre",
  ENCRYPTION_KEY = "FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs=",
  IV_LENGTH = 16;
/*
 * [DEP0106] DeprecationWarning: crypto.createCipher is deprecated.
 * Warning: Use Cipheriv for counter mode of aes-256-ctr
 * encrypt2
 * decrypt2
 */
exports.encrypt = function (text) {
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};

exports.decrypt = function (text) {
  var decipher = crypto.createDecipher(algorithm, password);
  var dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};

exports.encrypt2 = function (text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    algorithm,
    //Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(ENCRYPTION_KEY, "base64"),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

exports.decrypt2 = function (text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    algorithm,
    //Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(ENCRYPTION_KEY, "base64"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
