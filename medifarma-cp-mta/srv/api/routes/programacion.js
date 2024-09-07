/* eslint-disable no-undef */
/* eslint-disable camelcase */
const { Router } = require("express");
const programacion = require("../../services/programacion");

const router = Router();

module.exports = (app) => {
  app.use("/programacion", router);
  
  // Funciones;
  router.get("/", async (req, res) => {
    try {
      const oResult = await programacion.data(req);
      return res.json(oResult).status(200);
    } catch (error) {
      return res.json(error.message);
    }
  });

  router.post("/", async (req, res) => {
    try {
      const oResult = await programacion.create(req);
      return res.json(oResult).status(200);
    } catch (error) {
      return res.json(error.message);
    }
  });
  router.delete("/", async (req, res) => {
    try {
      const oResult = await programacion.delete(req);
      return res.json(oResult).status(200);
    } catch (error) {
      return res.json(error.message);
    }
  });
  router.post("/update", async (req, res) => {
    try {
      const oResult = await programacion.update(req);
      return res.json(oResult).status(200);
    } catch (error) {
      return res.json(error.message);
    }
  });
  router.get("/ordenProgramada", async (req, res) => {
    try {
      const oResult = await programacion.ordenProgramada(req);
      return res.json(oResult).status(200);
    } catch (error) {
      return res.json(error.message);
    }
  });
};
