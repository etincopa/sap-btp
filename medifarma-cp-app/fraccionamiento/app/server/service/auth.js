const config = require("../config/config");
const fetch = require("node-fetch");
const core = require("./core");
const crypto = require("./crypto");

exports.getOAuth = async function () {
  const _config = config.getConfig();

  const auth =
    "Basic " +
    Buffer.from(
      _config.oauth_clientId + ":" + _config.oauth_clientSecret
    ).toString("base64");
  const headers = {
    Authorization: auth,
  };

  let url =
    _config.oauth_url +
    "?grant_type=password&username=" +
    _config.oauth_usuario +
    "&password=" +
    _config.oauth_password +
    "&client_id=" +
    _config.oauth_clientId +
    "&clientsecret=" +
    _config.oauth_clientSecret +
    "&response_type=token";

  const response = await fetch(url, { headers: headers });
  const oauth = await response.json();

  return oauth;
};

exports.authUsuario = async function (usuario, clave) {
  const o = await core.o();
  let result = {};
  try {
    const response = await o
      .get(
        "/browse/fnLogin(usuario='" +
        encodeURI(usuario) +
          "',clave='" +
          encodeURI(clave) +
          "',app='FRAC')"
      )
      .fetch();
    const data = await response.json();
    result = { iCode: "1", oResult: data };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }

  return result;
};

exports.authUsuarioRol = async function (usuario, clave) {
  const o = await core.o();
  let result = {};
  try {
    const response = await o
      .get(
        "/browse/VIEW_USER_ROL_APP_ACCION(usuario='" +
          usuario +
          "',clave='" +
          clave +
          "')"
      )
      .fetch();
    const data = await response.json();
    result = { iCode: "1", oResult: data };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }

  let url =
    _config.oauth_url +
    "?grant_type=password&username=" +
    _config.oauth_usuario +
    "&password=" +
    _config.oauth_password +
    "&client_id=" +
    _config.oauth_clientId +
    "&clientsecret=" +
    _config.oauth_clientSecret +
    "&response_type=token";

  const response = await fetch(url, { headers: headers });
  const oauth = await response.json();

  return oauth;
};

exports.authConfig = async function (sClave) {
  const _config = config.getConfig();
  let result = {};
  const sEncrypted = await crypto.encrypt(sClave);

  if (sEncrypted == _config.llave_acceso) {
    result = { iCode: "1", oResult: "ok" };
  } else {
    result = { iCode: "-1", oResult: "failed" };
  }

  return result;
};
