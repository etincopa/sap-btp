/* eslint-disable no-undef */
/* eslint-disable camelcase */
const { Router } = require("express");
const compareVersion = require("../controllers/compareVersion");
const groupdocs_comparison_cloud = require("groupdocs-comparison-cloud");
const fs = require("fs");

const router = Router();

module.exports = (app) => {
  app.use("/compareVersion", router);
  // Funciones;
  router.post("/", async (req, res) => {
    try {
        await compareVersion.comparisons(request);
    } catch (error) {
        return res.json(error.message);
      }
    });
  };  